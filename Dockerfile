FROM node:19-alpine AS client

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM rust:1.68-buster as server

WORKDIR /usr/src/app
COPY . .
RUN cargo build --release

FROM debian:buster-slim

RUN apt-get update && apt-get install -y libssl1.1

COPY --from=client /app/client/dist assets
COPY --from=server /usr/src/app/target/release/stream /usr/local/bin

CMD stream serve --assets assets
