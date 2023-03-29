use super::*;

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct Post {
  title: String,
  timestamp: String,
  content: String,
  tags: Vec<String>,
}
