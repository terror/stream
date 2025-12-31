use {
  crate::{
    arguments::Arguments,
    assets::Assets,
    auth::{AuthRedirect, OAuthClient, COOKIE_NAME},
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
  async_session::{Session, SessionStore},
  axum::{
    extract::{
      FromRef, FromRequestParts, OptionalFromRequestParts, Path, Query,
      State as AppState,
    },
    response::{IntoResponse, Redirect, Response},
    routing::Router,
    routing::{get, post},
    Json, RequestPartsExt,
  },
  axum_extra::{
    headers::Cookie, typed_header::TypedHeaderRejectionReason, TypedHeader,
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
    options::{ClientOptions, IndexOptions, UpdateModifications},
    results::{CreateIndexResult, DeleteResult, InsertOneResult, UpdateResult},
    Client, Database, IndexModel,
  },
  oauth2::{
    basic::BasicClient, AuthType, AuthUrl, ClientId, ClientSecret, CsrfToken,
    EndpointNotSet, EndpointSet, RedirectUrl, TokenUrl,
  },
  serde::{Deserialize, Serialize},
  std::{
    env,
    fmt::{self, Display, Formatter},
    net::SocketAddr,
    path::PathBuf,
    process,
    sync::Arc,
    time::Duration,
  },
  tower_http::{
    cors::CorsLayer,
    services::{ServeDir, ServeFile},
  },
  uuid::Uuid,
};

#[cfg(test)]
use std::sync::atomic::{AtomicUsize, Ordering};

mod arguments;
mod assets;
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
