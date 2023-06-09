use super::*;

pub(crate) static COOKIE_NAME: &str = "session";

pub(crate) struct AuthRedirect;

impl IntoResponse for AuthRedirect {
  fn into_response(self) -> Response {
    Redirect::temporary("/api/auth/login").into_response()
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

pub(crate) async fn authorized(
  Query(query): Query<AuthRequest>,
  AppState(state): AppState<State>,
) -> Result<impl IntoResponse> {
  debug!("Fetching token from oauth client...");

  let params = [
    ("client_id", &state.oauth_client.client_id().to_string()),
    ("client_secret", &state.client_secret),
    ("code", &query.code),
    (
      "redirect_uri",
      state
        .oauth_client
        .redirect_url()
        .expect("Missing redirect url"),
    ),
  ];

  let response = state
    .request_client
    .post("https://github.com/login/oauth/access_token")
    .form(&params)
    .header("Accept", "application/json")
    .send()
    .await?
    .json::<AccessTokenResponse>()
    .await?;

  let mut session = Session::new();

  session.expire_in(Duration::from_secs(60 * 60 * 24 * 7));

  debug!("Inserting user data into session...");

  session.insert(
    "user",
    state
      .request_client
      .get("https://api.github.com/user")
      .bearer_auth(response.access_token)
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
