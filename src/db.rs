use super::*;

#[derive(Debug, Clone)]
pub(crate) struct Db {
  database: Database,
}

impl Db {
  const POST_COLLECTION: &str = "posts";

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
        .collection(Db::POST_COLLECTION)
        .insert_one(post, None)
        .await?,
    )
  }
}
