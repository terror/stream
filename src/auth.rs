use super::*;

pub(crate) static COOKIE_NAME: &str = "SESSION";

#[derive(Debug, Deserialize)]
#[allow(unused)]
pub(crate) struct AuthRequest {
  pub(crate) code: String,
  pub(crate) state: String,
}

pub(crate) struct AuthRedirect;

impl IntoResponse for AuthRedirect {
  fn into_response(self) -> Response {
    Redirect::temporary("/auth/login").into_response()
  }
}

pub(crate) async fn login(
  AppState(state): AppState<State>,
) -> Result<Redirect> {
  Ok(Redirect::to(
    state
      .oauth_client
      .authorize_url(CsrfToken::new_random)
      .url()
      .0
      .as_ref(),
  ))
}

pub(crate) async fn authorized(
  Query(query): Query<AuthRequest>,
  AppState(state): AppState<State>,
) -> Result<(HeaderMap, Redirect)> {
  debug!("Fetching token from oauth client...");

  let token = state
    .oauth_client
    .exchange_code(AuthorizationCode::new(query.code))
    .request_async(async_http_client)
    .await?;

  let mut session = Session::new();

  debug!("Inserting user data into session...");

  session.insert(
    "user",
    state
      .request_client
      .get("https://api.github.com/user")
      .bearer_auth(token.access_token().secret())
      .send()
      .await?
      .json::<User>()
      .await?,
  )?;

  let mut headers = HeaderMap::new();

  headers.insert(
    SET_COOKIE,
    format!(
      "{}={}; SameSite=Lax; Path=/",
      COOKIE_NAME,
      state
        .session_store
        .store_session(session)
        .await?
        .ok_or(anyhow!("Failed to store session"))?
    )
    .parse()?,
  );

  Ok((headers, Redirect::to(CLIENT_URL)))
}

pub(crate) async fn logout(
  AppState(state): AppState<State>,
  TypedHeader(cookies): TypedHeader<Cookie>,
) -> Result<Redirect> {
  let cookie = cookies
    .get(COOKIE_NAME)
    .ok_or(anyhow!("Failed to get cookie"))?;

  let session =
    match state.session_store.load_session(cookie.to_string()).await? {
      Some(session) => session,
      None => return Ok(Redirect::to(CLIENT_URL)),
    };

  debug!("Destroying session...");

  state.session_store.destroy_session(session).await?;

  Ok(Redirect::to(CLIENT_URL))
}
