use super::*;

#[derive(Parser)]
pub(crate) struct Server {
  #[clap(long, default_value = "client/dist")]
  assets: PathBuf,
  #[clap(long, default_value = "stream")]
  db_name: String,
}

impl Server {
  pub(crate) async fn run(self) -> Result {
    let port = env::var("PORT")
      .ok()
      .map(|val| val.parse::<u16>())
      .unwrap_or(Ok(8080))?;

    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    log::debug!("Listening on port: {}", addr.port());

    let db = Arc::new(Db::connect(&self.db_name).await?);

    let clone = db.clone();

    tokio::spawn(async move {
      if let Err(error) = clone.index().await {
        error!("error: {error}");
      }
    });

    let serve_dir = get_service(ServeDir::new(self.assets));

    axum_server::Server::bind(addr)
      .serve(
        Router::new()
          .route("/auth/authorized", get(auth::authorized))
          .route("/auth/login", get(auth::login))
          .route("/auth/logout", get(auth::logout))
          .route(
            "/posts",
            post(posts::add_post)
              .get(posts::get_posts)
              .put(posts::update_post)
              .delete(posts::delete_post),
          )
          .route("/search", get(search::search))
          .route("/user", get(user::get_user))
          .nest_service("/assets", serve_dir.clone())
          .fallback_service(serve_dir)
          .with_state(State::new(db).await?)
          .layer(CorsLayer::very_permissive())
          .into_make_service(),
      )
      .await?;

    Ok(())
  }
}
