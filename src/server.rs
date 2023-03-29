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

    axum_server::Server::bind(addr)
      .serve(
        Router::new()
          .route("/auth/authorized", get(auth::authorized))
          .route("/auth/login", get(auth::login))
          .route("/auth/logout", get(auth::logout))
          .route("/post", post(post::add_post))
          .route("/user", get(user::get_user))
          .with_state(State::new(&self.db_name).await?)
          .layer(CorsLayer::very_permissive())
          .into_make_service(),
      )
      .await?;

    Ok(())
  }
}
