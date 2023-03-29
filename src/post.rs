use super::*;

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct Post {
  title: String,
  timestamp: DateTime<Utc>,
  content: String,
  tags: Vec<String>,
}
