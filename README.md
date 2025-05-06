## stream

**stream** is a lightweight personal micro-blogging platform I use in favour of
services like [X](https://x.com/), where I tend to get distracted easily.

<div align='center'>
  <img width='800px' src="https://github.com/user-attachments/assets/28413e84-7abc-4dd6-b186-fdf80450ded8"/>
</div>

## Development

You'll need [docker](https://www.docker.com/),
[cargo](https://doc.rust-lang.org/cargo/) and [npm](https://www.npmjs.com/)
installed on your machine to spawn the various components the project needs to
run locally.

First, mount a local mongodb instance with docker:

```bash
$ docker compose up -d
```

Spawn the server:

```bash
$ cargo run serve
```

Finally, spawn the react frontend:

```bash
$ npm install
$ npm run dev
```

_n.b._ Refer to `.env.dev.example` and `client/.env.dev.example` for what
environment variables need to be set.

## Prior Art

This was heavily inspired by Linus Lee's
[stream](https://stream.thesephist.com/).
