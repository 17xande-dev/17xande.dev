# Payments

Two gateways ship, **PayFast** and **SnapScan**. A store can enable either or
both; with both, the checkout asks the shopper which they would like to use.

They are different shapes. PayFast takes a signed form posted to its site.
SnapScan is a link the shopper opens — on a phone it opens the SnapScan app, and
on a desktop it is shown as a QR code to scan. Everything after the hand-over is
the same for both.

## How an order gets paid

1. **Checkout** creates a **pending** order: a snapshot of the titles, options
   and prices, with the total computed from the catalog inside the same
   transaction. Stock does not move yet. Each checkout form carries a submission
   key, so a double-click or a retried submit returns the same order rather than
   placing a second one.
2. The shopper is **handed over** to the gateway and pays there.
3. The gateway **notifies** the store's callback, server to server. This is the
   only thing that can mark an order paid, and it is checked before anything
   happens.
4. In one transaction, the order is marked **paid**, stock moves, download links
   are issued and the emails are queued. The cart empties too — unless the
   shopper has changed it since checking out, in which case their new basket is
   kept. A worker then sends the emails, retrying any that fail.

The page a shopper comes back to after paying proves nothing — anyone can open
it — so it says the payment is being confirmed rather than that it succeeded.

The callback answers `200` once a notification has been processed, or rejected
for good as forged or broken. If verification cannot finish — the gateway's API
is down, or the database is — it answers `503` with `Retry-After`, so the
gateway tries again rather than the payment being lost.

Stock is taken at payment, not reserved at checkout, so an abandoned checkout
holds no inventory. The cost is that two people can pay for the last item; the
second order is still recorded paid and is flagged **oversold** in the admin and
in the packing email, for a refund.

## PayFast

### Setting it up

1. Get a merchant id and key from the PayFast dashboard. The sandbox's have no
   relationship to a live account's.
2. Set a **salt passphrase** in the dashboard and the same value in
   `PAYFAST_PASSPHRASE`. Set on one side only, every signature fails.
3. Leave `PAYFAST_SANDBOX=true` until a full sandbox payment has worked end to
   end.
4. Make sure PayFast can reach the callback. It is derived from `BASE_URL`,
   which on a laptop is unreachable, so local testing needs a tunnel and its
   address goes in `PAYFAST_NOTIFY_URL`.

Then place an order, pay it on the sandbox, and check that the order is `paid`
and the stock has moved.

### Going live

`PAYFAST_SANDBOX` defaults to `true` so that nobody's first afternoon with the
project charges a real card. The mirror-image mistake is a deployment that never
sets it, takes no money and looks like it works — so **set it explicitly**
wherever you deploy.

Going live is two changes: `PAYFAST_SANDBOX=false`, and your own merchant
credentials. The server refuses to start with the sandbox switched off and
PayFast's published sandbox merchant id.

Behind a proxy or a managed platform, set
[`CLIENT_IP_SOURCE`](/gostore/docs/configuration/#behind-a-proxy) too. Otherwise
PayFast's address check compares its ranges against your load balancer's and
rejects every genuine notification — money taken, nothing recorded.

### What a notification has to pass

1. The **signature** recomputes over the fields exactly as received.
2. The **source address** is one of PayFast's published ranges.
3. **PayFast confirms it** when the exact bytes are posted back to it.
4. The **merchant id** is this store's.

Then the amount is checked against the order's own total, and a replayed
notification cannot move stock twice. None of the four checks is enough alone.

## SnapScan

### Setting it up

1. Ask SnapScan merchant support for a **snap code**, an **API key** and a
   **webhook authentication key**, and give them the webhook address:
   `BASE_URL` + `/payments/snapscan/callback`.
2. Set `SNAPSCAN_SNAP_CODE`, `SNAPSCAN_API_KEY` and `SNAPSCAN_WEBHOOK_AUTH_KEY`.
   The server refuses to start with the first and not the others.
3. Optionally, ask them to enable **Secure QR Payload** and set
   `SNAPSCAN_VALIDATION_KEY`, which signs the amount and order reference in the
   payment link so neither can be edited.

**There is no SnapScan sandbox.** Any configuration takes real money, so the
first test is the smallest payment you are willing to make — and, locally, it
needs a tunnel for the callback.

### What a notification has to pass

The body's **HMAC** must match the webhook key, and then the payment is **read
back from SnapScan's API**. The status and amount the store acts on come from
that response, never from the notification itself, so a leaked webhook key is
not a free order.
