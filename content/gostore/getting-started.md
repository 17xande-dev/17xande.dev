# Getting started

## What you need

Docker with Compose, and Go if you want to run the server on the host. Nothing
else: the stack brings its own Postgres, a mail catcher and S3-compatible
storage.

## Start the stack

```bash
git clone https://github.com/17xande-dev/gostore
cd gostore
make up
curl localhost:8080/healthz   # -> ok
```

`make up` starts four containers:

- **Postgres**, where everything lives.
- **mailpit**, which catches every email the store sends, at
  `http://localhost:8025`.
- **MinIO**, S3-compatible object storage, at `http://localhost:9001`.
- **The server**, on `http://localhost:8080`.

Migrations are applied on boot. The stack also mounts `theme/` into the server
with reloading on, so a stylesheet or template dropped in there shows up on the
next refresh. See [Theming](/gostore/docs/theming/).

## Load the demo catalog

```bash
make seed
```

This loads `testdata/products.json`: two books, a t-shirt, a tote and a
downloadable recording, spread over three categories. Between them they show a
single-variant product, variants that differ by one option and by two, a
sold-out combination, and a digital product with files. Everything in it is
fictional sample data.

## Claim the first administrator

There is no default admin password. On a database with no administrator, the
server generates a one-time **setup token** and prints it to its log:

```bash
docker compose logs server | grep setup_token
```

1. Open `/admin`. With no account yet, it sends you to `/admin/setup`.
2. Paste the token, and choose an email address and a password of at least 12
   characters. That account is the store's **owner**.
3. The token is spent, and `/admin/setup` stops existing for good.

From there, `/admin/users/new` creates the rest of the team. Give each person
the least role that covers their job — `manager` is the usual answer for
somebody running the shop.

A deployment where nobody reads the logs can set `SETUP_TOKEN` instead, and
nothing is printed.

## Buy something

The stack is configured with **PayFast's published sandbox credentials**, so a
checkout works straight away and takes no real money:

1. Add something to the cart and go to checkout.
2. Fill in the delivery details. The store creates a pending order and hands you
   over to the PayFast sandbox.
3. Pay there with the sandbox's test details.

To see the order marked paid, PayFast's servers have to reach your callback,
which a laptop's `localhost` is not. That needs a tunnel — see
[Payments](/gostore/docs/payments/#payfast).

## Other useful targets

| Target         | Does                                                         |
| -------------- | ------------------------------------------------------------ |
| `make down`    | Stop the stack (`ARGS=-v` also deletes the data volumes)     |
| `make run`     | Run the server on the host against the compose Postgres      |
| `make test`    | Run every test, including the database-backed ones           |
| `make logs`    | Follow the server logs                                       |
| `make psql`    | Open a `psql` shell on the compose database                  |
| `make hashpw`  | Print a password hash — the lockout-recovery path, not setup |
| `make migrate` | Apply pending migrations without starting the server         |
