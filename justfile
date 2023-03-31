set dotenv-load

export EDITOR := 'nvim'
export RUST_LOG := 'debug'

alias f := fmt
alias r := run

default:
  just --list

all: build clippy fmt-check forbid lint test

build:
  cargo build

build-container:
  docker build -t stream:latest .

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

run-container:
  docker run -d \
    -e GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID \
    -e GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET \
    -e GITHUB_REDIRECT_URL=$GITHUB_REDIRECT_URL \
    -e MONGODB_URL=$MONGODB_URL \
    -e RUST_LOG=trace \
    -p 8000:8000 \
    stream:latest

services:
  docker-compose up -d

test:
  cargo test

watch +COMMAND='test':
  cargo watch --clear --exec "{{COMMAND}}"
