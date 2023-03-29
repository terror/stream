use super::*;

#[derive(Parser)]
pub(crate) enum Subcommand {
  Serve(Server),
}
