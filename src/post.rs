use super::*;

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct Post {
  title: Option<String>,
  timestamp: DateTime<Utc>,
  content: String,
  tags: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub(crate) struct AddPostBody {
  title: Option<String>,
  content: String,
  tags: Vec<String>,
}

pub(crate) async fn add_post(
  AppState(db): AppState<Db>,
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

  db.add_post(Post {
    title,
    timestamp: Utc::now(),
    content,
    tags,
  })
  .await?;

  Ok(())
}
