use super::*;

#[derive(Debug, Clone)]
pub(crate) struct State {
  pub(crate) db: Arc<Db>,
  pub(crate) oauth_client: BasicClient,
  pub(crate) request_client: reqwest::Client,
  pub(crate) session_store: MongodbSessionStore,
}

impl FromRef<State> for Arc<Db> {
  fn from_ref(state: &State) -> Self {
    state.db.clone()
  }
}
impl FromRef<State> for BasicClient {
  fn from_ref(state: &State) -> Self {
    state.oauth_client.clone()
  }
}

impl FromRef<State> for MongodbSessionStore {
  fn from_ref(state: &State) -> Self {
    state.session_store.clone()
  }
}

impl State {
  pub(crate) async fn new(db: Arc<Db>) -> Result<Self> {
    Ok(Self {
      db: db.clone(),
      oauth_client: BasicClient::new(
        ClientId::new(
          env::var("GITHUB_CLIENT_ID")
            .expect("Missing GITHUB_CLIENT_ID environment variable."),
        ),
        Some(ClientSecret::new(
          env::var("GITHUB_CLIENT_SECRET")
            .expect("Missing GITHUB_CLIENT_SECRET environment variable."),
        )),
        AuthUrl::new(env::var("AUTH_URL").unwrap_or_else(|_| {
          "https://github.com/login/oauth/authorize".into()
        }))?,
        Some(
          TokenUrl::new(env::var("TOKEN_URL").unwrap_or_else(|_| {
            "https://github.com/login/oauth/access_token".into()
          }))
          .expect("Invalid token url."),
        ),
      )
      .set_redirect_uri(
        RedirectUrl::new(
          env::var("GITHUB_REDIRECT_URL")
            .unwrap_or_else(|_| "http://127.0.0.1:8000/auth/authorized".into()),
        )
        .expect("Invalid redirect url."),
      ),
      request_client: reqwest::Client::builder()
        .user_agent(format!(
          "{}/{}",
          env!("CARGO_PKG_NAME"),
          env!("CARGO_PKG_VERSION")
        ))
        .build()?,
      session_store: MongodbSessionStore::new(
        &env::var("MONGODB_URL")
          .unwrap_or_else(|_| "mongodb://localhost:27017".into()),
        db.name(),
        "store",
      )
      .await?,
    })
  }
}
