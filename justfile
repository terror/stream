set dotenv-load

export EDITOR := 'nvim'
export RUST_LOG := 'debug'

alias f := fmt
alias r := run

default:
  just --list

all: build clippy fmt-check forbid lint test

[group: 'dev']
build:
  cargo build

[group: 'dev']
build-container:
  docker build -t stream:latest .

[group: 'dev']
clippy:
  cargo clippy --all-targets --all-features

[group: 'dev']
dev: services
  concurrently \
    --kill-others \
    --names 'SERVER,CLIENT' \
    --prefix-colors 'green.bold,magenta.bold' \
    --prefix '[{name}] ' \
    --prefix-length 2 \
    --success first \
    --handle-input \
    --timestamp-format 'HH:mm:ss' \
    --color \
    -- \
    'just watch run serve --db-name=stream' \
    'npm run dev'

[group: 'format']
fmt:
  cargo fmt
  npm run format

[group: 'check']
fmt-check:
  cargo fmt --all -- --check
  npm run format-check

[group: 'check']
forbid:
  ./bin/forbid

[group: 'check']
lint:
  npm run lint

[group: 'dev']
restart:
  docker-compose down --volumes && just services

[group: 'dev']
run *args:
  cargo run {{ args }}

[group: 'dev']
run-container:
  docker run -d \
    -e GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID \
    -e GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET \
    -e GITHUB_REDIRECT_URL=$GITHUB_REDIRECT_URL \
    -e MONGODB_URL=$MONGODB_URL \
    -e RUST_LOG=trace \
    -p 8080:8080 \
    stream:latest

[group: 'dev']
serve:
  npm run build
  just run serve

[group: 'dev']
services:
  docker-compose up -d

[group: 'test']
test:
  cargo test

[group: 'dev']
watch +COMMAND='test':
  cargo watch --clear --exec "{{COMMAND}}"
