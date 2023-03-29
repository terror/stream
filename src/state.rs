use super::*;

#[derive(Debug, Clone)]
pub(crate) struct State {
  pub(crate) db: Db,
  pub(crate) oauth_client: BasicClient,
  pub(crate) request_client: reqwest::Client,
  pub(crate) session_store: MongodbSessionStore,
}

impl FromRef<State> for Db {
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
  pub(crate) async fn new(db_name: &str) -> Result<Self> {
    Ok(Self {
      db: Db::connect(db_name).await?,
      oauth_client: BasicClient::new(
        ClientId::new(env::var("CLIENT_ID")?),
        Some(ClientSecret::new(env::var("CLIENT_SECRET")?)),
        AuthUrl::new(env::var("AUTH_URL").unwrap_or_else(|_| {
          "https://github.com/login/oauth/authorize".into()
        }))?,
        Some(TokenUrl::new(env::var("TOKEN_URL").unwrap_or_else(|_| {
          "https://github.com/login/oauth/access_token".into()
        }))?),
      )
      .set_redirect_uri(RedirectUrl::new(
        env::var("REDIRECT_URL")
          .unwrap_or_else(|_| "http://127.0.0.1:8000/auth/authorized".into()),
      )?),
      request_client: reqwest::Client::new(),
      session_store: MongodbSessionStore::new(
        "mongodb://127.0.0.1:27017",
        db_name,
        "store",
      )
      .await?,
    })
  }
}
