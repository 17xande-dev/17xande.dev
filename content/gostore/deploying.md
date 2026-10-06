# Deploying

gostore runs as a small Docker Compose stack on one server: the store, Postgres
beside it, and something to let requests in. Two ready-made deployments ship in
the repository's [`deploy/`](deploy/) directory. Copy one to the server, fill in
one `.env`, and start it with `docker compose up -d`.

|                         | [Standard](docs/deploy/standard.md)     | [Tunnel](docs/deploy/tunnel.md)                                                                   |
| ----------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **How requests get in** | Caddy, with a Let's Encrypt certificate | A Cloudflare Tunnel — no open ports at all                                                        |
| **Images and files**    | Separate public and private R2 buckets  | Separate public and private R2 buckets                                                            |
| **Mail**                | Any SMTP provider                       | Microsoft 365, through Microsoft Graph                                                            |
| **Pick it when**        | You have a VPS with a public address    | The server has no public address, or you would rather open no ports; your domain is on Cloudflare |

Each link above is a step-by-step guide, from an empty server to a claimed admin
account and nightly backups.

## The `.env`

Everything a deployment needs, credentials included, goes in the `.env` beside
its `compose.yaml`, readable by you alone:

```bash
cp .env.example .env && chmod 600 .env
```

Each deployment's `.env.example` holds only what it needs, and `compose.yaml`
derives what it can — `BASE_URL` from `DOMAIN`, `DATABASE_URL` from
`POSTGRES_PASSWORD` — so values that must agree cannot disagree. Both require a
generated `EMAIL_QUEUE_KEY`; keep it with your secrets backup. Any other
[setting](/gostore/docs/configuration/) can be added to the same file.

After editing `.env`, run `docker compose up -d` — that recreates the server
with the new values. `docker compose restart` keeps the old ones.

## A theme

Both deployments mount a `theme/` directory beside `compose.yaml` into the
server at `/theme`. Put a theme there and point `TEMPLATE_DIR` and `STATIC_DIR`
at `/theme/templates` and `/theme/static`; see
[Using a theme in a deployment](/gostore/docs/theming/#using-a-theme-in-a-deployment).

## Backups

Both take a nightly database backup to the server's own disk with the
`backup.sh` in their directory. That covers a bad migration or a mistaken
delete, but not losing the server: [Backups](docs/deploy/backups.md) copies them
off it, and covers restoring and testing a restore.

## Before it takes real money

- Set `PAYFAST_SANDBOX` explicitly — the deployments refuse to start without it
  — and use your own merchant credentials. See
  [Payments](/gostore/docs/payments/#going-live).
- Leave `CLIENT_IP_SOURCE` as the deployment sets it — `forwarded` behind Caddy,
  `cloudflare` behind the tunnel. Elsewhere, set it to match whatever is in
  front of the server; see
  [Configuration](/gostore/docs/configuration/#behind-a-proxy).
- Claim the first administrator straight away, before anybody else can reach
  `/admin/setup`.
- Leave `THEME_RELOAD` off.

## Publishing an image

The image is built on a workstation and pushed to GHCR by hand with
`make publish`, usually from a tagged release. It refuses to publish from a
dirty tree or an untagged commit. GHCR makes a new package private, so set it
public after the first publish or the server cannot pull it.

## Running it anywhere else

The binary is static and the image is distroless, so gostore runs anywhere a
container does. It reads `PORT` from the environment, takes a single
`DATABASE_URL`, logs JSON to stdout, and answers `GET /healthz`.

Migrations run on boot, before the server accepts traffic, behind a Postgres
advisory lock so several instances starting at once cannot race. To migrate as a
deploy step of its own, run the same image with `-migrate` first. It needs only
`DATABASE_URL`: a schema change has no reason to be trusted with the live
merchant key.

```bash
gostore -check-config && gostore -migrate && exec gostore
```

`-check-config` validates the whole environment, touches nothing and exits, so a
missing payment key fails the deploy while the database is still untouched.
`-migrate-status` prints which migrations have been applied. Migrations only go
forward in production: rolling a schema back over live orders loses money, not
just columns.

With more than one instance, use object storage for images — two instances do
not share a directory.

## Logs

JSON to stdout and nothing else, which `docker compose logs` and any log
collector read with no setup. Every response carries a request id, echoed as
`X-Request-Id`, printed on error pages and attached to every log line for that
request. `LOG_FORMAT=gcp` renames the fields so Google Cloud's severity filters
work.
