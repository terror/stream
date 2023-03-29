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

  pub(crate) async fn add_post(&self, post: Post) -> Result<InsertOneResult> {
    Ok(
      self
        .database
        .collection::<Post>(Db::POST_COLLECTION)
        .insert_one(post, None)
        .await?,
    )
  }

  pub(crate) async fn load_user(&self, user: User) -> Result<StoredUser> {
    match self.find_user(&user.login).await? {
      Some(user) => Ok(user),
      None => self.add_user(user).await,
    }
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
}
