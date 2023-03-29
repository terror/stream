use {
  crate::{
    arguments::Arguments,
    auth::{AuthRedirect, COOKIE_NAME},
    db::Db,
    post::Post,
    server::Server,
    state::State,
    subcommand::Subcommand,
    user::User,
  },
  anyhow::anyhow,
  async_mongodb_session::MongodbSessionStore,
  async_session::{Session, SessionStore},
  async_trait::async_trait,
  axum::{
    extract::{
      rejection::TypedHeaderRejectionReason, FromRef, FromRequest, Query,
      State as AppState,
    },
    headers::Cookie,
    response::{IntoResponse, Json, Redirect, Response},
    routing::get,
    RequestPartsExt, Router, TypedHeader,
  },
  chrono::prelude::*,
  clap::Parser,
  dotenv::dotenv,
  http::{
    header::{self, SET_COOKIE},
    HeaderMap, Request,
  },
  log::{debug, info},
  mongodb::{
    bson::doc, options::ClientOptions, results::InsertOneResult, Client,
    Database,
  },
  oauth2::{
    basic::BasicClient, reqwest::async_http_client, AuthUrl, AuthorizationCode,
    ClientId, ClientSecret, CsrfToken, RedirectUrl, TokenResponse, TokenUrl,
  },
  serde::{Deserialize, Serialize},
  std::{env, net::SocketAddr, process},
  tower_http::cors::CorsLayer,
};

mod arguments;
mod auth;
mod db;
mod post;
mod server;
mod state;
mod subcommand;
mod user;

const CLIENT_URL: &str = "http://localhost:5173";

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
