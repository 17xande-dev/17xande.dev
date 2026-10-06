# Theming

A theme is two directories: `STATIC_DIR` for assets and `TEMPLATE_DIR` for
templates. A file in either replaces the bundled one of the same name, and
anything you do not override keeps coming from the binary. Nothing is forked and
nothing is rebuilt.

`make up` and `make run` point both at `theme/` with `THEME_RELOAD=true`, so
writing a theme is editing a file and refreshing the page.

## Restyle with CSS

Most stores never need a template. Every colour, size and spacing value in the
default theme is a custom property in one `:root` block at the top of
`styles.css`, so rebranding is editing a dozen values.

Copy the default and edit its `:root`:

```bash
cp internal/handler/static/styles.css theme/static/styles.css
```

```css
:root {
  --paper: #fffdf8;
  --paper-sunk: #f4efe4;
  --ink: #241f18;
  --ink-soft: #5c5348;
  --ink-faint: #8d8375;
  --rule: #e2d9c8;
  --accent: #7a2e1f; /* buttons, links, prices */
  --accent-ink: #fffdf8;
  --font: "Iowan Old Style", Georgia, serif;
  --radius: 0;
  --page: 1000px;
}
```

Your file replaces the bundled one entirely — there is no cascade between them —
so start from a full copy rather than a file of just the variables.

To change the logo, drop a `logo.svg` into `STATIC_DIR`.

## Web fonts

The default theme uses the system font stack: no download and no third-party
request. To use a web font, either:

- **Self-host it.** Put the `.woff2` in `STATIC_DIR` and reference it from your
  stylesheet with a `/static/...` URL. Nothing else changes.
- **Use a hosted service**, such as Adobe Fonts. Set `FONT_CSS_URL` to the kit's
  stylesheet and `FONT_ORIGINS` to the origins it loads from. Set both or
  neither. This puts a third-party request on every page, the checkout included.

Either way, set `--font` in your stylesheet to apply it.

## Override templates

Templates override **by path**: a file at `pages/product.gohtml` in
`TEMPLATE_DIR` replaces the default `pages/product.gohtml`. Start from a copy:

```bash
mkdir -p theme/templates/pages
cp internal/handler/templates/pages/products.gohtml theme/templates/pages/
```

| Directory   | Holds                                                    |
| ----------- | -------------------------------------------------------- |
| `layouts/`  | The public and admin layouts                             |
| `partials/` | Pieces every page can use, such as the product card grid |
| `pages/`    | The storefront pages                                     |
| `admin/`    | Everything behind the admin login                        |
| `mail/`     | The order emails, which no layout wraps                  |

Each page file defines `content`, and replacing a file replaces only the
definitions it names — so a file can override one fragment and leave the rest of
the page alone.

Four things to know before shipping a theme:

- **Class names are the contract** between templates and stylesheet. Change the
  markup and keep the names, or change both together.
- **Every form needs `{{template "csrf" .CSRFToken}}`**, or it is refused.
- **No inline styles or scripts.** The CSP allows neither, so CSS goes in a
  stylesheet and JavaScript in a `.js` file, both in `STATIC_DIR`.
- **A missing field or template is an error on that page**, not at startup,
  because Go checks them when a template runs. Render every page you have
  touched.

## Keeping a copied file current

A file you copy stops receiving gostore's changes to it, and a new feature that
lives in that file will be missing from your store until you bring it across.
When you upgrade, diff your overrides against the defaults. The ones that have
needed it so far:

- **`layouts/public.gohtml`** — the account menu. A signed-in administrator gets
  a profile icon in the storefront header, fetched into a placeholder the layout
  must keep inside its `<nav>`:

  ```html
  <span class="account-slot" hx-get="/admin/account/menu"
    hx-trigger="load" hx-swap="outerHTML"></span>
  ```

  Its styles are the "Your account in the header" block of the default
  `styles.css`, which a copied stylesheet needs too.
- **`pages/checkout.gohtml`** — the submission key that makes a repeated submit
  return the same order. Keep it inside the form, beside the CSRF field:
  `<input type="hidden" name="checkout_key" value="{{.Form.Key}}">`.

## Using a theme in a deployment

The [ready-made deployments](/gostore/docs/deploying/) always mount a `theme/`
directory next to their `compose.yaml` into the server at `/theme`, read-only.
Put your theme there — `git clone` it, or copy it — and set, in `.env`:

```bash
TEMPLATE_DIR=/theme/templates
STATIC_DIR=/theme/static
```

These are paths **inside the container**, so they always start `/theme/`. Spell
them exactly: a misspelt name is not an error, it is simply never read, and the
store runs with its default templates. Set only the ones your theme has — a
stylesheet-only theme sets just `STATIC_DIR` — since a directory that is set but
missing refuses the boot. Then `docker compose up -d`, which recreates the
server with the new settings.

## Reloading

`THEME_RELOAD=true` re-reads both directories on every request. It is for
writing a theme and nothing else — leave it off in a deployment. Without it, the
theme is read once at startup: a template that does not parse refuses the boot,
and shipping a change is replacing the files and restarting
(`docker compose restart server`).
