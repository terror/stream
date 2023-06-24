use tower_http::services::ServeFile;

use super::*;

#[derive(Parser)]
pub(crate) struct Server {
  #[clap(long)]
  assets: Option<PathBuf>,
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

    let assets = self.assets.as_ref().map(|assets| Assets {
      dir: ServeDir::new(assets.clone()),
      index: ServeFile::new(assets.join("index.html")),
      route: "/assets",
    });

    let mut router = Router::new()
      .route("/api/auth/authorized", get(auth::authorized))
      .route("/api/auth/login", get(auth::login))
      .route("/api/auth/logout", get(auth::logout))
      .route(
        "/api/posts",
        post(posts::add_post)
          .get(posts::get_posts)
          .put(posts::update_post)
          .delete(posts::delete_post),
      )
      .route("/api/posts/:id", get(posts::get_post))
      .route("/api/search", get(search::search))
      .route("/api/user", get(user::get_user));

    if let Some(assets) = assets {
      router = router
        .nest_service(assets.route, assets.dir)
        .fallback_service(assets.index)
    }

    axum_server::Server::bind(addr)
      .serve(
        router
          .with_state(State::new(db).await?)
          .layer(CorsLayer::very_permissive())
          .into_make_service(),
      )
      .await?;

    Ok(())
  }
}
