use super::*;

#[derive(Parser)]
pub(crate) struct Server {
  #[clap(long, default_value = "stream")]
  db_name: String,
  #[clap(long, default_value = "8000")]
  port: u16,
}

impl Server {
  pub(crate) async fn run(self) -> Result {
    let addr = SocketAddr::from(([127, 0, 0, 1], self.port));

    log::debug!("Listening on port: {}", addr.port());

    let db = Arc::new(Db::connect(&self.db_name).await?);

    let clone = db.clone();

    tokio::spawn(async move {
      if let Err(error) = clone.index().await {
        error!("error: {error}");
      }
    });

    axum_server::Server::bind(addr)
      .serve(
        Router::new()
          .route("/auth/authorized", get(auth::authorized))
          .route("/auth/login", get(auth::login))
          .route("/auth/logout", get(auth::logout))
          .route("/posts", delete(posts::delete_post))
          .route("/posts", get(posts::get_posts))
          .route("/posts", post(posts::add_post))
          .route("/posts", put(posts::update_post))
          .route("/search", get(search::search))
          .route("/user", get(user::get_user))
          .with_state(State::new(&self.db_name, db).await?)
          .layer(CorsLayer::very_permissive())
          .into_make_service(),
      )
      .await?;

    Ok(())
  }
}
