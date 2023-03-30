use super::*;

#[derive(Debug, Clone)]
pub(crate) struct State {
  pub(crate) db: Arc<Db>,
  pub(crate) client_url: String,
  pub(crate) github_oauth_client: BasicClient,
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
      client_url: env::var("CLIENT_URL")
        .unwrap_or("http://127.0.0.1:5173".into())
        .to_string(),
      github_oauth_client: BasicClient::new(
        ClientId::new(env::var("GITHUB_CLIENT_ID")?),
        Some(ClientSecret::new(env::var("GITHUB_CLIENT_SECRET")?)),
        AuthUrl::new("https://github.com/login/oauth/authorize".into())?,
        Some(TokenUrl::new(
          "https://github.com/login/oauth/access_token".into(),
        )?),
      )
      .set_redirect_uri(RedirectUrl::new(
        "http://127.0.0.1:8000/auth/authorized".into(),
      )?),
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
