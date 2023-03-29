use super::*;

#[derive(Debug, Clone)]
pub(crate) struct State {
  pub(crate) db: Db,
  pub(crate) request_client: reqwest::Client,
}

impl FromRef<State> for Db {
  fn from_ref(state: &State) -> Self {
    state.db.clone()
  }
}

impl State {
  pub(crate) async fn new(db_name: &str) -> Result<Self> {
    Ok(Self {
      db: Db::connect(db_name).await?,
      request_client: reqwest::Client::new(),
    })
  }
}
