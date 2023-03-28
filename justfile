default:
  just --list

all: build clippy fmt-check forbid lint test

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

lint:
  npm run lint

run *args:
  cargo run -- {{args}}

test:
  cargo test

watch +COMMAND='test':
  cargo watch --clear --exec "{{COMMAND}}"
