use super::*;

#[derive(Debug, Clone)]
pub(crate) struct Db {
  database: Database,
}

impl Db {
  const POST_COLLECTION: &str = "posts";
  const USER_COLLECTION: &str = "users";

  pub(crate) async fn connect(db_name: &str) -> Result<Self> {
    let mut client_options = ClientOptions::parse(format!(
      "{}/{}",
      env::var("MONGODB_URL")
        .unwrap_or_else(|_| "mongodb://localhost:27017".into()),
      db_name
    ))
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

  pub(crate) fn name(&self) -> &str {
    self.database.name()
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

  pub(crate) async fn update_post(&self, post: Post) -> Result<UpdateResult> {
    Ok(
      self
        .database
        .collection::<Post>(Db::POST_COLLECTION)
        .update_one(
          doc! { "_id": post.id },
          UpdateModifications::Document(doc! {
            "$set": {
              "title" : post.title,
              "timestamp": Utc::now().format("%Y-%m-%dT%H:%M:%S%.6fZ").to_string(),
              "content": post.content,
              "tags": post.tags
            }
          }),
          None,
        )
        .await?,
    )
  }

  pub(crate) async fn find_post(&self, id: &str) -> Result<Option<Post>> {
    Ok(
      self
        .database
        .collection::<Post>(Db::POST_COLLECTION)
        .find_one(doc! { "_id": id }, None)
        .await?,
    )
  }

  pub(crate) async fn delete_post(&self, id: String) -> Result<DeleteResult> {
    Ok(
      self
        .database
        .collection::<Post>(Db::POST_COLLECTION)
        .delete_one(
          doc! {
            "_id": id
          },
          None,
        )
        .await?,
    )
  }

  pub(crate) async fn search(&self, query: &str) -> Result<Vec<Post>> {
    info!("Received query: {query}");

    if query.starts_with('#') {
      return Ok(
        self
          .database
          .collection::<Post>(Db::POST_COLLECTION)
          .find(
            doc! { "tags" : { "$in": vec![query] } },
            FindOptions::builder()
              .sort(doc! { "timestamp": -1 })
              .build(),
          )
          .await?
          .try_collect::<Vec<Post>>()
          .await?,
      );
    }

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

  fn id() -> String {
    Uuid::new_v4().to_string()
  }

  fn posts() -> Vec<Post> {
    vec![
      Post {
        id: id(),
        title: None,
        content: "foo".into(),
        timestamp: Utc::now(),
        tags: vec!["#math".into(), "#code".into()],
      },
      Post {
        id: id(),
        title: None,
        content: "bar".into(),
        timestamp: Utc::now(),
        tags: vec!["#math".into(), "#code".into()],
      },
      Post {
        id: id(),
        title: Some("baz".into()),
        content: "math".into(),
        timestamp: Utc::now(),
        tags: vec!["#code".into()],
      },
    ]
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
  async fn posts_are_sorted_by_timestamp_ascending() {
    let TestContext { db, .. } = TestContext::new().await;

    let now = Utc::now();

    for post in posts() {
      db.add_post(post).await.unwrap();
    }

    db.add_post(Post {
      id: id(),
      title: None,
      content: "last".to_string(),
      timestamp: now,
      tags: vec![],
    })
    .await
    .unwrap();

    db.add_post(Post {
      id: id(),
      title: None,
      content: "first".to_string(),
      timestamp: Utc::now(),
      tags: vec![],
    })
    .await
    .unwrap();

    let posts = db.posts(None, None).await.unwrap();

    assert_eq!(posts.len(), 5);

    assert_eq!(posts.first().unwrap().content, "first");
    assert_eq!(posts.last().unwrap().content, "last");
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn delete_post() {
    let TestContext { db, .. } = TestContext::new().await;

    let posts = posts();

    for post in &posts {
      db.add_post(post.clone()).await.unwrap();
    }

    assert_eq!(
      db.delete_post(posts.first().unwrap().id.clone())
        .await
        .unwrap()
        .deleted_count,
      1
    );

    assert_eq!(
      db.delete_post(posts.first().unwrap().id.clone())
        .await
        .unwrap()
        .deleted_count,
      0
    );
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn update_post() {
    let TestContext { db, .. } = TestContext::new().await;

    let posts = posts();

    for post in &posts {
      db.add_post(post.clone()).await.unwrap();
    }

    assert_eq!(
      db.update_post(Post {
        id: posts.first().unwrap().id.clone(),
        title: None,
        content: "updated".into(),
        timestamp: Utc::now(),
        tags: vec![]
      })
      .await
      .unwrap()
      .modified_count,
      1
    );

    let posts = db.posts(None, None).await.unwrap();

    let updated = posts.first().unwrap();

    assert_eq!(updated.content, "updated");
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn search_for_posts_by_content() {
    let TestContext { db, .. } = TestContext::new().await;

    let posts = posts();

    for post in &posts {
      db.add_post(post.clone()).await.unwrap();
    }

    db.create_post_index(
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
    .await
    .unwrap();

    assert_eq!(db.search("foo").await.unwrap().len(), 1);
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn search_for_posts_by_tag() {
    let TestContext { db, .. } = TestContext::new().await;

    let posts = posts();

    for post in &posts {
      db.add_post(post.clone()).await.unwrap();
    }

    assert_eq!(db.search("#math").await.unwrap().len(), 2);
  }
}
