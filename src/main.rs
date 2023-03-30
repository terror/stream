use {
  crate::{
    arguments::Arguments,
    auth::{AuthRedirect, COOKIE_NAME},
    db::Db,
    error::Error,
    post::Post,
    server::Server,
    state::State,
    subcommand::Subcommand,
    user::{StoredUser, User},
  },
  anyhow::anyhow,
  async_mongodb_session::MongodbSessionStore,
  async_session::{async_trait, Session, SessionStore},
  axum::{
    extract::{
      rejection::TypedHeaderRejectionReason, FromRef, FromRequestParts, Query,
      State as AppState,
    },
    headers::Cookie,
    response::{IntoResponse, Redirect, Response, TypedHeader},
    routing::Router,
    routing::{delete, get, post, put},
    Json, RequestPartsExt,
  },
  chrono::prelude::*,
  clap::Parser,
  dotenv::dotenv,
  futures::stream::TryStreamExt,
  http::{
    header::{self, SET_COOKIE},
    request::Parts,
    HeaderMap, StatusCode,
  },
  log::{debug, error, info},
  mongodb::{
    bson::{doc, Document},
    options::{ClientOptions, FindOptions, IndexOptions, UpdateModifications},
    results::{CreateIndexResult, DeleteResult, InsertOneResult, UpdateResult},
    Client, Database, IndexModel,
  },
  oauth2::{
    basic::BasicClient, reqwest::async_http_client, AuthUrl, AuthorizationCode,
    ClientId, ClientSecret, CsrfToken, RedirectUrl, TokenResponse, TokenUrl,
  },
  serde::{Deserialize, Serialize},
  std::{
    env,
    fmt::{self, Display, Formatter},
    net::SocketAddr,
    process,
    sync::Arc,
  },
  tower_http::cors::CorsLayer,
  uuid::Uuid,
};

#[cfg(test)]
use std::sync::atomic::{AtomicUsize, Ordering};

mod arguments;
mod auth;
mod db;
mod error;
mod post;
mod posts;
mod search;
mod server;
mod state;
mod subcommand;
mod user;

const CLIENT_URL: &str = "http://127.0.0.1:5173";

type Result<T = (), E = Error> = std::result::Result<T, E>;

#[tokio::main]
async fn main() {
  env_logger::init();

  dotenv().ok();

  if let Err(error) = Arguments::parse().run().await {
    eprintln!("error: {error}");
    process::exit(1);
  }
}
