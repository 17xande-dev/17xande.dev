# Configuration

Everything comes from the environment. [`.env.example`](.env.example) lists
every variable with its default; this page covers the ones a store has to think
about.

## What it needs to boot

gostore refuses to start rather than half-work. Five things are required.

**A database.** `DATABASE_URL`, a Postgres connection string.

**Mail.** `EMAIL_FROM`, and either `SMTP_HOST` or Microsoft Graph (see
[Mail](#mail)). This is required because a digital download's link exists only
in the confirmation email — the store keeps just its hash — so a store that
cannot send mail would take money for a file the buyer can never reach.

**An email queue key.** `EMAIL_QUEUE_KEY`, 64 hex characters from
`openssl rand -hex 32`. Receipts and download links are queued in the same
transaction that records the payment, encrypted with this key until they are
sent, and retried until they are — so a mail outage delays an email rather than
losing it. Keep the key with your backups: a restored database's pending emails
need the key they were encrypted with.

**Somewhere for product images.** Exactly one of:

- `IMAGE_DIR`, a directory the server stores images in and serves itself. The
  simplest option: one path, nothing else running.
- `BLOB_ENDPOINT` with `BLOB_BUCKET`, the access keys and
  `BLOB_PUBLIC_BASE_URL`, for S3-compatible object storage — R2, GCS, MinIO. The
  ready-made deployments use R2. Use this when more than one instance runs,
  since two instances do not share a directory. `BLOB_ENDPOINT` is a host, with
  no `https://` in front of it.

**At least one payment gateway.** `PAYFAST_MERCHANT_ID` with its key, or
`SNAPSCAN_SNAP_CODE` with its keys, or both — in which case the checkout asks
the shopper which to use. See [Payments](/gostore/docs/payments/).

## The store

| Variable     | Default                 | Is                                                          |
| ------------ | ----------------------- | ----------------------------------------------------------- |
| `STORE_NAME` | `gostore`               | The name shown in the header, the title and the emails      |
| `BASE_URL`   | `http://localhost:8080` | The public origin, for absolute links and gateway callbacks |
| `PORT`       | `8080`                  | The listen port                                             |
| `CURRENCY`   | `ZAR`                   | Both gateways settle in rand only, so this must stay `ZAR`  |

`BASE_URL` is also how the store knows it is in production: an `https://` origin
turns on `Secure` cookies and HSTS, and hides error detail from visitors.

## Mail

| Variable                          | Default    | Is                                                 |
| --------------------------------- | ---------- | -------------------------------------------------- |
| `SMTP_PORT`                       | `587`      | `465` with `SMTP_TLS=tls`                          |
| `SMTP_TLS`                        | `starttls` | `starttls`, `tls` or `none` (development only)     |
| `SMTP_USERNAME` / `SMTP_PASSWORD` | —          | Leave both out for a relay that trusts the address |
| `EMAIL_REPLY_TO`                  | —          | When replies should not go to `EMAIL_FROM`         |
| `ORDER_NOTIFY_EMAIL`              | —          | Sends whoever packs orders a copy of each paid one |

For Microsoft 365 / Exchange Online, which no longer takes passwords over SMTP,
register an app in Entra ID and use one of:

- **Microsoft Graph** — `GRAPH_TENANT_ID`, `GRAPH_CLIENT_ID` and
  `GRAPH_CLIENT_SECRET`. Sends over HTTPS with no SMTP at all, so `SMTP_HOST`
  can be left out. Wins over SMTP when set.
- **SMTP with XOAUTH2** — `SMTP_OAUTH_TENANT_ID`, `SMTP_OAUTH_CLIENT_ID` and
  `SMTP_OAUTH_CLIENT_SECRET`, alongside `SMTP_HOST`, instead of a password.

Each set is all three or none. A dedicated transactional mail provider is the
lower-risk choice for a shop.

## Secrets as files

Every credential the server takes — the database URL, the setup token, the email
queue key, the payment, mail and storage secrets — can arrive as a file instead:
set `KEY_FILE` to a path and the file's contents are the value
(`PAYFAST_MERCHANT_KEY_FILE`, `EMAIL_QUEUE_KEY_FILE`, …). That keeps it out of
the process environment, which `docker inspect` shows, and suits Compose or
Kubernetes secrets. A trailing newline is ignored; setting both `KEY` and
`KEY_FILE` refuses to boot.

For a single server, a `.env` readable only by its owner is the whole story, and
the ready-made deployments use exactly that.

## Digital downloads

Purchased files need **private** storage, set up separately from images and
never in the same place: `DOWNLOAD_DIR`, or the `DOWNLOAD_*` bucket settings.
The server refuses to boot if the download directory overlaps `IMAGE_DIR`, or if
the download bucket is the image bucket, because either would publish files
somebody paid for. With neither set, the shop sells no digital products and the
admin says so.

## Behind a proxy

`CLIENT_IP_SOURCE` says where the client's address comes from, and it matters
more than it looks — PayFast's notifications are checked against its published
address ranges.

| Value        | Use it when                                             |
| ------------ | ------------------------------------------------------- |
| `remote`     | Nothing sits in front of the server. The default        |
| `forwarded`  | A proxy **replaces** `X-Forwarded-For`                  |
| `cloudflare` | Cloudflare is the only way in; reads `CF-Connecting-IP` |

Behind Cloudflare, `forwarded` is wrong: Cloudflare _appends_ to
`X-Forwarded-For`, so its first entry is whatever the client claimed.

## Everything else

Rate limits — including the [MCP endpoint](/gostore/docs/assistants/)'s,
`RATE_LIMIT_MCP_PER_MINUTE` — session length, cart lifetime, logging format,
embedding the catalog on other sites, web fonts and themes all have settings
too, with sensible defaults. They are all in [`.env.example`](.env.example), and
explained in the repository's [configuration reference](docs/configuration.md).
