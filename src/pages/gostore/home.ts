import { esc, icons } from "../../shell.ts";
import { GOSTORE } from "../../site.ts";
import { feature, gallery, lightbox, type Shot } from "../parts.ts";

const REPO = GOSTORE.repo;

/**
 * Captured from the real store, running locally against a throwaway database
 * seeded with the repo's own demo catalog (testdata/products.json), at a
 * 1440x900 viewport and 2x DPR, then resized to 2048 wide. The product
 * pictures are simple illustrations uploaded through the admin's image form;
 * the store ships with none.
 */
const SHOT_W = 2048;
const SHOT_H = 1280;

const SHOTS: Shot[] = [
  {
    file: "catalog",
    alt:
      "The storefront catalog: a search box, category checkboxes for apparel, books and recordings, and a grid of product cards — a recording, a canvas tote, a book and a t-shirt — each with its price or price range in rand.",
    caption: "The catalog — search, category filters, and a card grid.",
    width: SHOT_W,
    height: SHOT_H,
  },
  {
    file: "product",
    alt:
      "A product page for a book sold in two covers: the cover image on the left, and on the right a table of the hardcover and paperback with their prices and stock, a cover selector, a quantity field and an Add to cart button.",
    caption: "A product with variants, each with its own price and stock.",
    width: SHOT_W,
    height: SHOT_H,
  },
  {
    file: "cart",
    alt:
      "The cart: a hardcover book and a medium black t-shirt, each with a quantity field, Update and Remove buttons and a line total, above a total of ZAR 648.00 and a Checkout link.",
    caption: "The cart, priced live from the catalog on every render.",
    width: SHOT_W,
    height: SHOT_H,
  },
  {
    file: "admin",
    alt:
      "The admin's product list: each product's title, categories, slug, number of variants, total stock and whether it is active, with an Edit link, under navigation for products, categories, orders and users.",
    caption:
      "The admin — products, categories, orders and accounts with roles.",
    width: SHOT_W,
    height: SHOT_H,
  },
];

/**
 * The payment path, inline so it inherits the page's colours. The point it
 * makes is which message the store believes: not the shopper coming back, but
 * the gateway's own notification, checked before anything moves.
 */
function diagram(): string {
  return `<svg class="topology" viewBox="0 0 640 300" role="img"
     aria-label="The shopper's browser browses the catalog and checks out on the store, which creates a pending order and hands the shopper over to PayFast or SnapScan. The gateway then notifies the store's callback directly; only that notification, once verified, marks the order paid, moves stock and sends the emails. Everything is stored in Postgres.">
  <defs>
    <marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g class="node">
    <rect x="20" y="118" width="150" height="64" rx="10"/>
    <text x="95" y="145">Shopper</text>
    <text x="95" y="165" class="sub">any browser</text>
  </g>
  <g class="node server">
    <rect x="245" y="118" width="150" height="64" rx="10"/>
    <text x="320" y="145">gostore</text>
    <text x="320" y="165" class="sub">one Go binary</text>
  </g>
  <g class="node">
    <rect x="470" y="30" width="150" height="58" rx="10"/>
    <text x="545" y="55">PayFast</text>
    <text x="545" y="74" class="sub">or SnapScan</text>
  </g>
  <g class="node">
    <rect x="470" y="212" width="150" height="58" rx="10"/>
    <text x="545" y="237">PostgreSQL</text>
    <text x="545" y="256" class="sub">orders, stock, carts</text>
  </g>
  <g class="edge signal">
    <path d="M170 150 L245 150" marker-end="url(#arw)"/>
    <path d="M95 118 C95 70 300 50 470 55" marker-end="url(#arw)"/>
  </g>
  <g class="edge data">
    <path d="M470 72 C420 80 380 100 360 118" marker-end="url(#arw)"/>
    <path d="M395 165 C430 190 450 220 470 235" marker-end="url(#arw)"/>
  </g>
  <text class="edge-label" x="207" y="172">browse,</text>
  <text class="edge-label" x="207" y="186">check out</text>
  <text class="edge-label" x="200" y="44" text-anchor="start">pay, on the gateway</text>
  <text class="edge-label" x="405" y="110" text-anchor="start">notification</text>
  <g class="key">
    <text x="20" y="226"><tspan class="swatch-signal">──</tspan> the shopper's browser</text>
    <text x="20" y="250"><tspan class="swatch-data">──</tspan> server to server</text>
    <text x="20" y="278" class="sub">only a verified notification marks an order paid</text>
  </g>
</svg>`;
}

export function homeBody(): string {
  return `<section class="hero">
  <div class="wrap">
    <p class="eyebrow">Go · htmx · PostgreSQL · PayFast &amp; SnapScan · MIT</p>
    <h1>A small online store,<br>written in Go.</h1>
    <p class="lede">
      <strong>gostore</strong> is a catalog, a cart and a checkout for a shop
      that sells a few things well — books, apparel, digital downloads — in
      rand, paid through <strong>PayFast</strong> or <strong>SnapScan</strong>.
      Server-rendered pages with htmx, Postgres for storage, one static binary,
      and a deliberately tiny set of dependencies.
    </p>
    <p class="cta">
      <a class="btn primary" href="/gostore/docs/getting-started/">Get started ${icons.arrow}</a>
      <a class="btn" href="#screenshots">Screenshots</a>
      <a class="btn ghost" href="${esc(REPO)}">${icons.github} Source</a>
    </p>
    <p class="fineprint">
      Go has no maintained open-source store, and no PayFast integration at
      all. This aims to be good at one thing rather than be a platform.
    </p>
  </div>
</section>

${gallery(GOSTORE, SHOTS)}

<section class="band">
  <div class="wrap">
    <h2>What you get</h2>
    <ul class="features">
      ${
    feature(
      "Two gateways, both careful",
      `PayFast and SnapScan behind one small interface. A payment counts only
       when the gateway's own notification survives every check — signature,
       source, a read-back from the gateway, the amount.`,
    )
  }
      ${
    feature(
      "Variants, stock and downloads",
      `Up to three named options per product, stock per variant, and digital
       products delivered by a per-buyer link from private storage.`,
    )
  }
      ${
    feature(
      "Search that forgives typos",
      `Postgres full-text for word forms and trigram matching for spelling,
       category filters, and pagination — all working without JavaScript.`,
    )
  }
      ${
    feature(
      "An admin with roles",
      `Owner, admin, manager and viewer, a permission on every route, and
       accounts that are disabled rather than deleted. No default password:
       the first owner is claimed with a one-time token.`,
    )
  }
      ${
    feature(
      "Run it from an AI assistant",
      `The admin is also an MCP server: connect Claude, or any MCP client, with
       an API token and manage products, images and orders in plain language —
       as your account, under the same rules as the admin pages.`,
    )
  }
      ${
    feature(
      "Retheme without forking",
      `Every colour and size is a custom property in one stylesheet. Templates
       override by path from a directory, and nothing is rebuilt.`,
    )
  }
      ${
    feature(
      "Embed the catalog anywhere",
      `The catalog is cookie-free HTML fragments, so another site can drop it
       in with one <code>hx-get</code>. Buying stays on the store's own domain.`,
    )
  }
      ${
    feature(
      "Hardened by default",
      `A strict CSP with no <code>'unsafe-inline'</code>, CSRF on every write,
       argon2id passwords, and rate limits on login, checkout and callbacks.`,
    )
  }
      ${
    feature(
      "Runs anywhere a container does",
      `A static binary in a distroless image that reads <code>PORT</code> and
       <code>DATABASE_URL</code>, logs JSON, and migrates itself on boot — with
       two ready-made Compose stacks for a single server.`,
    )
  }
    </ul>
  </div>
</section>

<section id="how" class="band">
  <div class="wrap narrow">
    <h2>How a payment works</h2>
    <p>
      Checkout writes a <strong>pending</strong> order — a snapshot of what is
      being bought, totalled from the catalog inside the transaction — and
      hands the shopper to the gateway. The shopper coming back proves
      nothing, so the page they return to says the payment is being
      confirmed, not that it succeeded.
    </p>
    ${diagram()}
    <p>
      The gateway's notification is what counts, and only once it has been
      verified: then the order is marked paid, stock moves, the cart empties
      and the receipt goes out — in that order, so a mail server having a bad
      afternoon can never lose a sale.
    </p>
    <p><a class="more" href="/gostore/docs/payments/">Setting up payments ${icons.arrow}</a></p>
  </div>
</section>

<section id="run" class="band">
  <div class="wrap narrow">
    <h2>Run it</h2>
    <p>
      <code>make up</code> starts Postgres, a mail catcher and the store, and
      applies the migrations. The stack ships
      PayFast's published <strong>sandbox</strong> credentials, so a checkout
      works on the first try and takes no money.
    </p>
    <wa-tab-group active="local">
      <wa-tab slot="nav" panel="local">Locally</wa-tab>
      <wa-tab slot="nav" panel="deploy">In a deploy</wa-tab>
      <wa-tab-panel name="local">
        <pre class="shell"><code>git clone ${esc(REPO)}
cd gostore
make up
make seed</code></pre>
        <wa-copy-button value="git clone ${
    esc(REPO)
  } &amp;&amp; cd gostore &amp;&amp; make up &amp;&amp; make seed"></wa-copy-button>
      </wa-tab-panel>
      <wa-tab-panel name="deploy">
        <pre class="shell"><code>gostore -check-config &amp;&amp; gostore -migrate &amp;&amp; exec gostore</code></pre>
        <wa-copy-button value="gostore -check-config &amp;&amp; gostore -migrate &amp;&amp; exec gostore"></wa-copy-button>
      </wa-tab-panel>
    </wa-tab-group>
    <p>
      Then open <code>http://localhost:8080</code>. There is no default admin
      password: <code>make up</code> prints a one-time setup token, and
      <code>/admin/setup</code> turns it into the first account.
    </p>
    <p class="notice">
      Replace the sandbox credentials before anyone else can reach a
      deployment, and set <code>PAYFAST_SANDBOX</code> explicitly wherever you
      deploy. The server refuses to take real money with PayFast's published
      sandbox merchant id.
    </p>
    <p><a class="more" href="/gostore/docs/deploying/">Deploying ${icons.arrow}</a></p>
  </div>
</section>

${lightbox}
`;
}
