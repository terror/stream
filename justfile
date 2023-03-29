default:
  just --list

all: build clippy fmt-check forbid lint test

build:
  cargo build

clippy:
  cargo clippy --all-targets --all-features

fmt:
  cargo fmt
  npm run format

fmt-check:
  cargo fmt --all -- --check
  npm run format-check

forbid:
  ./bin/forbid

lint:
  npm run lint

restart:
  docker-compose down --volumes && just services

run *args:
  cargo run -- {{args}}

services:
  docker-compose up -d

test:
  cargo test

watch +COMMAND='test':
  cargo watch --clear --exec "{{COMMAND}}"
