use super::*;

const ADMINS: [u64; 1] = [31192478];

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub(crate) struct User {
  pub(crate) id: u64,
  pub(crate) login: String,
  pub(crate) name: String,
  pub(crate) bio: Option<String>,
  pub(crate) avatar_url: Option<String>,
  pub(crate) url: Option<String>,
}

impl User {
  pub(crate) fn is_admin(&self) -> bool {
    ADMINS.contains(&self.id)
  }
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct StoredUser {
  pub(crate) login: String,
  pub(crate) name: String,
  pub(crate) bio: Option<String>,
  pub(crate) avatar_url: Option<String>,
  pub(crate) url: Option<String>,
  pub(crate) is_admin: bool,
}

pub(crate) async fn get_user(
  AppState(db): AppState<Db>,
  user: User,
) -> Result<impl IntoResponse> {
  Ok(Json(serde_json::to_string(&db.load_user(user).await?)?))
}

#[async_trait]
impl<S> FromRequestParts<S> for User
where
  MongodbSessionStore: FromRef<S>,
  S: Send + Sync,
{
  type Rejection = AuthRedirect;

  async fn from_request_parts(
    parts: &mut Parts,
    state: &S,
  ) -> Result<Self, Self::Rejection> {
    let session_store = MongodbSessionStore::from_ref(state);

    let cookies =
      parts.extract::<TypedHeader<Cookie>>().await.map_err(|e| {
        match *e.name() {
          header::COOKIE => match e.reason() {
            TypedHeaderRejectionReason::Missing => AuthRedirect,
            _ => {
              log::error!("Unexpected error getting cookie header(s): {}", e);
              AuthRedirect
            }
          },
          _ => {
            log::error!("Unexpected error getting cookies: {}", e);
            AuthRedirect
          }
        }
      })?;

    Ok(
      session_store
        .load_session(cookies.get(COOKIE_NAME).ok_or(AuthRedirect)?.to_owned())
        .await
        .unwrap()
        .ok_or(AuthRedirect)?
        .get::<User>("user")
        .ok_or(AuthRedirect)?,
    )
  }
}
