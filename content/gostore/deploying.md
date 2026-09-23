# Deploying

The binary is static and the image is distroless, so gostore runs anywhere a
container does — a managed platform or a VM behind a reverse proxy. It reads
`PORT` from the environment, takes a single `DATABASE_URL`, logs JSON to stdout,
and answers `GET /healthz`.

## Migrations

Migrations run on boot, before the server accepts traffic, behind a Postgres
advisory lock so several instances starting at once cannot race.

To migrate as a deploy step of its own, run the same image with `-migrate`
first. It needs only `DATABASE_URL`: a schema change has no reason to be trusted
with the live merchant key.

```bash
gostore -check-config && gostore -migrate && exec gostore
```

`-check-config` validates the whole environment, touches nothing and exits, so a
missing payment key fails the deploy while the database is still untouched.
`-migrate-status` prints which migrations have been applied.

Migrations only go forward in production. Rolling a schema back over live orders
loses money, not just columns.

## Before it takes real money

- Set `BASE_URL` to the store's `https://` origin.
- Set `PAYFAST_SANDBOX` explicitly, and use your own merchant credentials. See
  [Payments](/gostore/docs/payments/#going-live).
- Set `CLIENT_IP_SOURCE` to match whatever is in front of the server. See
  [Configuration](/gostore/docs/configuration/#behind-a-proxy).
- Use object storage for images if more than one instance runs.
- Leave `THEME_RELOAD` off.

## Terraform

[`infra/terraform`](infra/terraform/README.md) has a production stack on a Vultr
instance with Docker Compose, and a staging VM on Proxmox, built on a shared
cloud-init module.

## Images

Images are built on a workstation and pushed to GHCR by hand with
`make publish`, usually from a tagged release. It refuses to publish from a
dirty tree or an untagged commit.

## Logs

JSON to stdout and nothing else — which `docker compose logs`, `make logs` and
Cloud Logging all read with no setup. Every response carries a request id,
echoed as `X-Request-Id`, printed on error pages and attached to every log line
for that request. `LOG_FORMAT=gcp` renames the fields so Google Cloud's severity
filters work.
