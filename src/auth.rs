use super::*;

pub(crate) static COOKIE_NAME: &str = "session";

pub(crate) struct AuthRedirect;

impl IntoResponse for AuthRedirect {
  fn into_response(self) -> Response {
    Redirect::temporary("/auth/login").into_response()
  }
}

#[derive(Debug, Deserialize)]
#[allow(unused)]
pub(crate) struct AuthRequest {
  pub(crate) code: String,
  pub(crate) state: String,
}

pub(crate) async fn login(
  AppState(state): AppState<State>,
) -> impl IntoResponse {
  Redirect::to(
    state
      .oauth_client
      .authorize_url(CsrfToken::new_random)
      .url()
      .0
      .as_ref(),
  )
}

#[derive(Debug, Deserialize)]
#[allow(unused)]
struct AccessTokenResponse {
  access_token: String,
  token_type: String,
  scope: String,
}

async fn request_github_access_token(
  client_id: &str,
  client_secret: &str,
  code: &str,
  redirect_url: &str,
) -> Result<String> {
  let client = reqwest::Client::new();

  let params = [
    ("client_id", client_id),
    ("client_secret", client_secret),
    ("code", code),
    ("redirect_uri", redirect_url),
  ];

  let response = client
    .post("https://github.com/login/oauth/access_token")
    .form(&params)
    .header("Accept", "application/json")
    .send()
    .await?;

  let token_response: AccessTokenResponse = response.json().await?;

  Ok(token_response.access_token)
}

pub(crate) async fn authorized(
  Query(query): Query<AuthRequest>,
  AppState(state): AppState<State>,
) -> Result<impl IntoResponse> {
  debug!("Fetching token from oauth client...");

  let token = request_github_access_token(
    state.oauth_client.client_id(),
    &state.client_secret,
    &query.code,
    state.oauth_client.redirect_url().unwrap(),
  )
  .await?;

  let mut session = Session::new();

  debug!("Inserting user data into session...");

  session.insert(
    "user",
    state
      .request_client
      .get("https://api.github.com/user")
      .bearer_auth(token)
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

  debug!("User authorized, redirecting to client...");

  Ok((headers, Redirect::to(&state.client_url)))
}

pub(crate) async fn logout(
  AppState(state): AppState<State>,
  TypedHeader(cookies): TypedHeader<Cookie>,
) -> Result<impl IntoResponse> {
  let cookie = cookies
    .get(COOKIE_NAME)
    .ok_or(anyhow!("Failed to get cookie"))?;

  let session =
    match state.session_store.load_session(cookie.to_string()).await? {
      Some(session) => session,
      None => return Ok(Redirect::to(&state.client_url)),
    };

  debug!("Destroying session...");

  state.session_store.destroy_session(session).await?;

  Ok(Redirect::to(&state.client_url))
}
