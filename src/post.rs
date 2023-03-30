use super::*;

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub(crate) struct Post {
  #[serde(rename = "_id")]
  pub(crate) id: String,
  pub(crate) title: Option<String>,
  pub(crate) timestamp: DateTime<Utc>,
  pub(crate) content: String,
  pub(crate) tags: Vec<String>,
}
