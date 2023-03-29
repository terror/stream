use super::*;

#[derive(Debug, Default, Serialize, Deserialize)]
pub(crate) struct Post {
  pub(crate) title: Option<String>,
  pub(crate) timestamp: DateTime<Utc>,
  pub(crate) content: String,
  pub(crate) tags: Vec<String>,
}

#[derive(Deserialize)]
pub(crate) struct GetPostsParams {
  limit: Option<i64>,
  offset: Option<u64>,
}

pub(crate) async fn get_posts(
  Query(params): Query<GetPostsParams>,
  AppState(db): AppState<Arc<Db>>,
) -> Result<impl IntoResponse> {
  Ok(Json(db.posts(params.limit, params.offset).await?))
}

#[derive(Debug, Deserialize)]
pub(crate) struct AddPostBody {
  title: Option<String>,
  content: String,
  tags: Vec<String>,
}

pub(crate) async fn add_post(
  AppState(db): AppState<Arc<Db>>,
  user: User,
  body: Json<AddPostBody>,
) -> Result<impl IntoResponse> {
  let AddPostBody {
    title,
    content,
    tags,
  } = body.0;

  if !user.is_admin() {
    return Err(Error(anyhow!("Must be admin to add posts")));
  }

  debug!("Adding post to database...");

  db.add_post(Post {
    title,
    timestamp: Utc::now(),
    content,
    tags,
  })
  .await?;

  debug!("Post added successfully.");

  Ok(())
}

pub(crate) async fn update_post(
  AppState(db): AppState<Arc<Db>>,
  user: User,
  body: Json<Post>,
) -> Result<impl IntoResponse> {
  debug!("Updating post...");

  if !user.is_admin() {
    return Err(Error(anyhow!("Must be admin to update posts")));
  }

  db.update_post(body.0).await?;

  debug!("Post updated successfully.");

  Ok(())
}

#[derive(Serialize, Deserialize)]
pub(crate) struct DeletePostParams {
  timestamp: DateTime<Utc>,
}

pub(crate) async fn delete_post(
  Query(params): Query<DeletePostParams>,
  AppState(db): AppState<Arc<Db>>,
  user: User,
) -> Result<impl IntoResponse> {
  debug!("Updating post...");

  if !user.is_admin() {
    return Err(Error(anyhow!("Must be admin to delete posts")));
  }

  db.delete_post(params.timestamp).await?;

  debug!("Post updated successfully.");

  Ok(())
}
