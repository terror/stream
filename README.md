**stream** bestows a tranquil haven where my thoughts can unfurl, unhampered by
the dissonance of bustling platforms like Twitter.

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

_n.b._ Refer to `.env.example` and `client/.env.example` for what environment
variables need to be set.

### Prior Art

It was the enchanting allure of Linus Lee's
[stream](https://stream.thesephist.com/) that kindled my desire to create this
ethereal sanctuary.
