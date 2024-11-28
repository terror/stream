## stream

**stream** is a lightweight personal micro-blogging platform I use in favour of
services like [X](https://x.com/), where I tend to get distracted easily.

<div align='center'>
  <img width='800px' src="https://github.com/user-attachments/assets/6cf9ae84-106b-46c2-9cfa-86be8c3b3e64"/>
</div>

### Development

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

### Prior Art

This was heavily inspired by Linus Lee's
[stream](https://stream.thesephist.com/).
