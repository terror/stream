use super::*;

#[derive(Debug, Clone)]
pub(crate) struct Db {
  database: Database,
}

impl Db {
  const POST_COLLECTION: &str = "posts";
  const USER_COLLECTION: &str = "users";

  pub(crate) async fn connect(db_name: &str) -> Result<Self> {
    let mut client_options =
      ClientOptions::parse(format!("mongodb://localhost:27017/{}", db_name))
        .await?;

    client_options.app_name = Some(db_name.to_string());

    let client = Client::with_options(client_options)?;

    client
      .database(db_name)
      .run_command(doc! {"ping": 1}, None)
      .await?;

    info!("Connected to MongoDB.");

    Ok(Self {
      database: client.database(db_name),
    })
  }

  pub(crate) async fn index(&self) -> Result {
    info!("Building post index...");

    self
      .create_post_index(
        doc! {
          "title": "text",
          "content": "text",
          "tags": "text",
        },
        doc! {
          "title": 2,
          "content": 2,
          "tags": 1,
        },
      )
      .await?;

    info!("Post index complete.");

    Ok(())
  }

  pub(crate) async fn add_post(&self, post: Post) -> Result<InsertOneResult> {
    Ok(
      self
        .database
        .collection::<Post>(Db::POST_COLLECTION)
        .insert_one(post, None)
        .await?,
    )
  }

  pub async fn search(&self, query: &str) -> Result<Vec<Post>> {
    info!("Received query: {query}");

    Ok(
      self
        .database
        .collection::<Post>(Db::POST_COLLECTION)
        .find(
          doc! { "$text" : { "$search": query } },
          FindOptions::builder()
            .sort(doc! { "score": { "$meta" : "textScore" }})
            .build(),
        )
        .await?
        .try_collect::<Vec<Post>>()
        .await?,
    )
  }

  pub(crate) async fn load_user(&self, user: User) -> Result<StoredUser> {
    match self.find_user(&user.login).await? {
      Some(user) => Ok(user),
      None => self.add_user(user).await,
    }
  }

  pub(crate) async fn posts(
    &self,
    limit: Option<i64>,
    offset: Option<u64>,
  ) -> Result<Vec<Post>> {
    Ok(
      self
        .database
        .collection::<Post>(Db::POST_COLLECTION)
        .find(
          None,
          FindOptions::builder()
            .skip(offset)
            .limit(limit)
            .sort(doc! { "timestamp": -1 })
            .build(),
        )
        .await?
        .try_collect::<Vec<Post>>()
        .await?,
    )
  }

  async fn add_user(&self, user: User) -> Result<StoredUser> {
    info!("Inserting user into database...");

    let User {
      login,
      name,
      bio,
      url,
      avatar_url,
      ..
    } = user.clone();

    let user = StoredUser {
      login,
      name,
      bio,
      avatar_url,
      url,
      is_admin: user.is_admin(),
    };

    self
      .database
      .collection::<StoredUser>(Db::USER_COLLECTION)
      .insert_one(&user, None)
      .await?;

    match self.find_user(&user.login).await? {
      Some(user) => Ok(user),
      None => Err(Error(anyhow!("Failed to insert user"))),
    }
  }

  async fn find_user(&self, login: &str) -> Result<Option<StoredUser>> {
    Ok(
      self
        .database
        .collection::<StoredUser>(Db::USER_COLLECTION)
        .find_one(doc! { "login": login }, None)
        .await?,
    )
  }

  async fn create_post_index(
    &self,
    keys: Document,
    weights: Document,
  ) -> Result<CreateIndexResult> {
    Ok(
      self
        .database
        .collection::<Post>(Db::POST_COLLECTION)
        .create_index(
          IndexModel::builder()
            .keys(keys)
            .options(IndexOptions::builder().weights(weights).build())
            .build(),
          None,
        )
        .await?,
    )
  }
}

#[cfg(test)]
mod tests {
  use {super::*, pretty_assertions::assert_eq};

  struct TestContext {
    db: Db,
    db_name: String,
  }

  impl TestContext {
    async fn new() -> Self {
      static TEST_DATABASE_NUMBER: AtomicUsize = AtomicUsize::new(0);

      let test_database_number =
        TEST_DATABASE_NUMBER.fetch_add(1, Ordering::Relaxed);

      let db_name = format!(
        "stream-test-{}-{}",
        std::time::SystemTime::now()
          .duration_since(std::time::SystemTime::UNIX_EPOCH)
          .unwrap()
          .as_millis(),
        test_database_number,
      );

      let db = Db::connect(&db_name).await.unwrap();

      TestContext { db, db_name }
    }
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn on_disk_database_is_persistent() {
    let TestContext { db, db_name } = TestContext::new().await;

    assert_eq!(db.posts(None, None).await.unwrap().len(), 0);

    db.add_post(Post::default()).await.unwrap();

    assert_eq!(db.posts(None, None).await.unwrap().len(), 1);

    drop(db);

    let db = Db::connect(&db_name).await.unwrap();

    assert_eq!(db.posts(None, None).await.unwrap().len(), 1);
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn posts_are_sorted_by_timestamp_descending() {
    let TestContext { db, .. } = TestContext::new().await;

    let now = Utc::now();

    for content in ["foo", "bar"] {
      db.add_post(Post {
        title: None,
        content: content.to_string(),
        timestamp: Utc::now(),
        tags: vec![],
      })
      .await
      .unwrap();
    }

    db.add_post(Post {
      title: None,
      content: "baz".to_string(),
      timestamp: now,
      tags: vec![],
    })
    .await
    .unwrap();

    let posts = db.posts(None, None).await.unwrap();

    assert_eq!(posts.len(), 3);
    assert_eq!(posts.last().unwrap().content, "baz");
  }
}
