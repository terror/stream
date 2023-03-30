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

impl FromRef<State> for MongodbSessionStore {
  fn from_ref(state: &State) -> Self {
    state.session_store.clone()
  }
}

impl State {
  pub(crate) async fn new(db_name: &str, db: Arc<Db>) -> Result<Self> {
    Ok(Self {
      db,
      oauth_client: BasicClient::new(
        ClientId::new(
          env::var("CLIENT_ID")
            .expect("Missing CLIENT_ID environment variable."),
        ),
        Some(ClientSecret::new(
          env::var("CLIENT_SECRET")
            .expect("Missing CLIENT_SECRET environment variable."),
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
          env::var("REDIRECT_URL")
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
        "mongodb://localhost:27017",
        db_name,
        "store",
      )
      .await?,
    })
  }
}
