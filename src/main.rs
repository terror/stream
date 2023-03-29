use {
  crate::{
    arguments::Arguments, db::Db, server::Server, state::State,
    subcommand::Subcommand,
  },
  axum::{extract::FromRef, routing::Router},
  clap::Parser,
  dotenv::dotenv,
  log::info,
  mongodb::{bson::doc, options::ClientOptions, Client, Database},
  serde::{Deserialize, Serialize},
  std::{net::SocketAddr, process, sync::Arc},
  tower_http::cors::CorsLayer,
};

mod arguments;
mod db;
mod post;
mod server;
mod state;
mod subcommand;

type Result<T = (), E = anyhow::Error> = std::result::Result<T, E>;

#[tokio::main]
async fn main() {
  env_logger::init();

  dotenv().ok();

  if let Err(error) = Arguments::parse().run().await {
    eprintln!("error: {error}");
    process::exit(1);
  }
}
