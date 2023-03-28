default:
  just --list

all: build test clippy fmt-check forbid

build:
  cargo build

clippy:
  cargo clippy --all-targets --all-features

fmt:
  cargo fmt
  prettier --write .

fmt-check:
  cargo fmt --all -- --check
  prettier --check .

forbid:
  ./bin/forbid

run *args:
  cargo run -- {{args}}

test:
  cargo test

watch +COMMAND='test':
  cargo watch --clear --exec "{{COMMAND}}"
