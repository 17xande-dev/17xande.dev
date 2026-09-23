/**
 * Builds the whole site into dist/.
 *
 * Deliberately not `deno bundle` over HTML entrypoints: the bundler writes an
 * HTML entry that has no <script type="module"> to dist/<basename>, so every
 * docs page without its own JS would land on dist/index.html and the last one
 * would win. It also does not process <link rel="stylesheet">. So the
 * TypeScript goes through the bundler and the pages are generated here.
 */
import { copy, ensureDir } from "@std/fs";
import { dirname, fromFileUrl, join, resolve } from "@std/path";
import { encodeHex } from "@std/encoding/hex";
import { esc, renderPage } from "../src/shell.ts";
import {
  type Project,
  PROJECTS,
  SITE_ORIGIN,
  TAGLINE,
  TELEPROMPTER,
  TELEPROMPTER_APP_ORIGIN,
} from "../src/site.ts";
import { homeBody } from "../src/pages/home.ts";
import { notFoundBody } from "../src/pages/notFound.ts";
import * as teleprompter from "../src/pages/teleprompter/home.ts";
import * as teleprompterDocs from "../src/pages/teleprompter/docsIndex.ts";
import { docSource, renderMarkdown, stripLeadingH1 } from "./markdown.ts";

const root = resolve(dirname(fromFileUrl(import.meta.url)), "..");
const dist = join(root, "dist");
const liveReload = Deno.args.includes("--live-reload");

/** Content hash, so /assets/* can be cached forever without a stale copy. */
async function hash(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return encodeHex(new Uint8Array(buf)).slice(0, 8);
}

async function write(path: string, text: string) {
  const full = join(dist, path);
  await ensureDir(dirname(full));
  await Deno.writeTextFile(full, text);
}

async function bundleScript(): Promise<string> {
  const out = join(dist, "assets");
  await ensureDir(out);

  const cmd = new Deno.Command(Deno.execPath(), {
    args: [
      "bundle",
      join(root, "src", "scripts", "site.ts"),
      "--platform",
      "browser",
      "--minify",
      "--outdir",
      out,
    ],
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  });
  const { success } = await cmd.output();
  if (!success) throw new Error("deno bundle failed");

  // The bundler names the output after the entry. Hashing it here rather than
  // asking for --code-splitting keeps one predictable file to find and one
  // name to put in the shell.
  const plain = join(out, "site.js");
  const js = await Deno.readTextFile(plain);
  const name = `site-${await hash(js)}.js`;
  await Deno.rename(plain, join(out, name));
  return `/assets/${name}`;
}

async function bundleStyles(): Promise<string> {
  const parts: string[] = [];
  for (const f of ["site.css", "docs.css", "prism.css"]) {
    parts.push(await Deno.readTextFile(join(root, "src", "styles", f)));
  }
  const css = parts.join("\n");
  const name = `site-${await hash(css)}.css`;
  await ensureDir(join(dist, "assets"));
  await Deno.writeTextFile(join(dist, "assets", name), css);
  return `/assets/${name}`;
}

const scriptUrl = await bundleScript();
const styleUrl = await bundleStyles();
const assets = { scriptUrl, styleUrl, liveReload };

// --- static passthrough -----------------------------------------------------

await copy(join(root, "static"), dist, { overwrite: true });

// --- site pages -------------------------------------------------------------

const urls: string[] = [];

async function page(
  path: string,
  o: Omit<Parameters<typeof renderPage>[0], "path">,
) {
  await write(
    path.endsWith("/") ? `${path.slice(1)}index.html` : path.slice(1),
    renderPage({ ...o, path }, assets),
  );
  if (path !== "/404.html") urls.push(path);
}

await page("/", {
  title: "17xande.dev",
  description: TAGLINE,
  body: homeBody(),
  wide: true,
});

await page("/404.html", {
  title: "Not found",
  description: "That page does not exist.",
  body: notFoundBody(),
});

// --- project sections -------------------------------------------------------

interface Section {
  project: Project;
  description: string;
  home: () => string;
  docsDescription: string;
  docsIndex: () => string;
}

const sections: Section[] = [
  {
    project: TELEPROMPTER,
    description:
      "An open source teleprompter that runs in your browser. A control page holds the script; any screen can be a display. Peer-to-peer, self-hostable, MIT.",
    home: teleprompter.homeBody,
    docsDescription:
      "How to run a service with the teleprompter: operating, shortcuts, themes, architecture and self-hosting.",
    docsIndex: teleprompterDocs.docsIndexBody,
  },
];

// Every project in the registry needs a section, and vice versa; a project
// added to PROJECTS and forgotten here would be a card linking to a 404.
for (const p of PROJECTS) {
  if (!sections.some((s) => s.project === p)) {
    throw new Error(`no section built for project ${p.slug}`);
  }
}

for (const s of sections) {
  const p = s.project;

  await page(`/${p.slug}/`, {
    title: p.name,
    description: s.description,
    body: s.home(),
    project: p,
    wide: true,
  });

  await page(`/${p.slug}/docs/`, {
    title: "Documentation",
    description: s.docsDescription,
    body: s.docsIndex(),
    project: p,
    docs: { activeSlug: "index", toc: [] },
  });

  for (const doc of p.docs) {
    const md = await Deno.readTextFile(docSource(root, p, doc));
    const { toc, html } = renderMarkdown(md, p);

    // The site renders its own H1 from the registry, so the document's own
    // would be a duplicate — and the titles in the sidebar and the heading
    // would be free to drift apart.
    const body = `<h1>${esc(doc.title)}</h1>
<p class="page-blurb">${esc(doc.blurb)}</p>
${stripLeadingH1(html)}`;

    await page(`/${p.slug}/docs/${doc.slug}/`, {
      title: doc.title,
      description: doc.blurb,
      body,
      project: p,
      docs: { activeSlug: doc.slug, toc },
    });
  }
}

// --- sitemap ----------------------------------------------------------------

await write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_ORIGIN}${u}</loc></url>`).join("\n")}
</urlset>
`,
);

// Printed because it is baked into the page and invisible afterwards: a build
// made without TELEPROMPTER_APP_ORIGIN points the demo at production, and on a
// dev machine that looks exactly like "the connection is failing".
console.log(`built ${urls.length + 1} pages -> dist/`);
console.log(`teleprompter demo frames ${TELEPROMPTER_APP_ORIGIN}`);
