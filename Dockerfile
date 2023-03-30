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
