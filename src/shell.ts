import {
  GITHUB,
  type NavLink,
  type Project,
  projectHref,
  PROJECTS,
  SITE_NAME,
  SITE_ORIGIN,
  TAGLINE,
} from "./site.ts";

export interface TocEntry {
  depth: number;
  text: string;
  id: string;
}

export interface PageOptions {
  /** Goes in <title> and the OG tags, without the site name suffix. */
  title: string;
  description: string;
  /** Absolute path this page is served at, e.g. "/teleprompter/docs/themes/". */
  path: string;
  /** The section this page belongs to. Absent on the site index and 404. */
  project?: Project;
  body: string;
  /** Present on docs pages: renders the sidebar and the on-page contents. */
  docs?: { activeSlug: string; toc: TocEntry[] };
  /** Extra <head> content, e.g. a page-specific preload. */
  head?: string;
  /** Wide pages (the homepage) manage their own container widths. */
  wide?: boolean;
}

/** HTML-escape a string being interpolated into markup. */
export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Inline, so the site makes no request to anyone. <wa-icon> would have fetched
// these from Font Awesome's CDN at runtime, which is the single thing that
// would have forced a third-party origin into the CSP.
export const icons = {
  github:
    `<svg viewBox="0 0 16 16" aria-hidden="true" width="16" height="16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>`,
  menu:
    `<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`,
  // web2sdi's own mark — a browser window with a BNC connector for a page —
  // redrawn in one colour so it takes the brand accent like the others.
  sdi:
    `<svg viewBox="0 0 64 64" aria-hidden="true" width="20" height="20" fill="currentColor"><path fill-rule="evenodd" d="M14 12h36a6 6 0 0 1 6 6v28a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6zm-2 11v25h40V23z"/><circle cx="32" cy="35.5" r="9.4" fill="none" stroke="currentColor" stroke-width="3.6"/><circle cx="32" cy="35.5" r="2.5"/></svg>`,
  // gostore's default store mark, an abstract carrier bag.
  bag:
    `<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h16l-1.2 12H5.2L4 8Z"/><path d="M9 8V5.5a3 3 0 0 1 6 0V8"/></svg>`,
  tv:
    `<svg viewBox="0 0 640 512" aria-hidden="true" width="20" height="20" fill="currentColor"><path d="M64 64v288h512V64H64zM0 64C0 28.7 28.7 0 64 0h512c35.3 0 64 28.7 64 64v288c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zM128 448h384c17.7 0 32 14.3 32 32s-14.3 32-32 32H128c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/></svg>`,
  arrow:
    `<svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
};

function sidebar(p: Project, activeSlug: string): string {
  const items = p.docs.map((d) => {
    const current = d.slug === activeSlug;
    return `<li><a href="/${p.slug}/docs/${d.slug}/"${
      current ? ' aria-current="page"' : ""
    }>${esc(d.title)}</a></li>`;
  }).join("");

  return `<nav class="docs-nav" aria-label="Documentation">
  <a class="docs-nav-home" href="/${p.slug}/docs/"${
    activeSlug === "index" ? ' aria-current="page"' : ""
  }>Overview</a>
  <ul>${items}</ul>
</nav>`;
}

function contents(toc: TocEntry[]): string {
  // One heading is a heading, not a structure worth advertising.
  if (toc.length < 2) return "";
  const items = toc.map((h) =>
    `<li class="lvl-${h.depth}"><a href="#${esc(h.id)}">${esc(h.text)}</a></li>`
  ).join("");
  return `<nav class="toc" aria-label="On this page">
  <h2>On this page</h2>
  <ul>${items}</ul>
</nav>`;
}

function links(items: NavLink[], p?: Project): string {
  return items.map((l) => {
    // "#demo" is a place on the project's own homepage, not on whichever
    // docs page the header happens to be sitting on.
    const href = p
      ? (l.href.startsWith("#")
        ? `/${p.slug}/${l.href}`
        : projectHref(p, l.href))
      : l.href;
    return `<a${l.primary ? ' class="btn primary nav-app"' : ""} href="${
      esc(href)
    }">${esc(l.label)}</a>`;
  }).join("\n    ");
}

function header(p?: Project): string {
  if (!p) {
    return `<header class="site-header">
  <a class="brand" href="/"><span class="prompt" aria-hidden="true">~/</span><span>${SITE_NAME}</span></a>
  <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Menu">${icons.menu}</button>
  <nav id="site-nav" aria-label="Main">
    ${links(PROJECTS.map((q) => ({ label: q.name, href: `/${q.slug}/` })))}
    <a class="gh" href="${esc(GITHUB)}">${icons.github}<span>GitHub</span></a>
  </nav>
</header>`;
  }

  const nav: NavLink[] = [...p.nav];
  if (p.appOrigin) {
    nav.push({
      label: "Open the app",
      href: `${p.appOrigin}/control`,
      primary: true,
    });
  }
  return `<header class="site-header">
  <a class="brand" href="/"><span class="prompt" aria-hidden="true">~/</span><span>${SITE_NAME}</span></a>
  <span class="crumb" aria-hidden="true">/</span>
  <a class="brand project" href="/${p.slug}/">${icons[p.icon]}<span>${
    esc(p.name)
  }</span></a>
  <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Menu">${icons.menu}</button>
  <nav id="site-nav" aria-label="${esc(p.name)}">
    ${links(nav.filter((l) => !l.primary), p)}
    <a class="gh" href="${esc(p.repo)}">${icons.github}<span>GitHub</span></a>
    ${links(nav.filter((l) => l.primary), p)}
  </nav>
</header>`;
}

function footer(p?: Project): string {
  const lead = p
    ? `<p><strong>${esc(p.name)}</strong> — ${esc(p.tagline)}</p>`
    : `<p><strong>${SITE_NAME}</strong> — ${esc(TAGLINE)}</p>`;
  const items: NavLink[] = p
    ? [{ label: SITE_NAME, href: "/" }, ...p.footer]
    : [
      ...PROJECTS.map((q) => ({ label: q.name, href: `/${q.slug}/` })),
      { label: "GitHub", href: GITHUB },
    ];
  return `<footer class="site-footer">
  ${lead}
  <nav aria-label="Footer">
    ${links(items, p)}
  </nav>
</footer>`;
}

/**
 * Wrap a page body in the site chrome.
 *
 * `scriptUrl` is content-hashed by the bundler and therefore not knowable
 * until build time, which is why it is threaded in rather than written here.
 */
export function renderPage(
  o: PageOptions,
  assets: { scriptUrl: string; styleUrl: string; liveReload: boolean },
): string {
  const p = o.project;
  const home = p ? `/${p.slug}/` : "/";
  const fullTitle = o.path === "/"
    ? `${SITE_NAME} — ${esc(TAGLINE)}`
    : o.path === home
    ? `${esc(p!.name)} — ${esc(p!.tagline)}`
    : `${esc(o.title)} · ${esc(p?.name ?? SITE_NAME)}`;
  const canonical = SITE_ORIGIN + o.path;
  const favicon = p ? `/${p.slug}/favicon.svg` : "/favicon.svg";
  const ogImage = p
    ? `${SITE_ORIGIN}/${p.slug}/screenshots/${p.thumb.file}.webp`
    : `${SITE_ORIGIN}/${PROJECTS[0].slug}/screenshots/${
      PROJECTS[0].thumb.file
    }.webp`;

  const main = o.docs && p
    ? `<div class="docs-layout">
  ${sidebar(p, o.docs.activeSlug)}
  <main class="docs-main" id="content">
    <article class="prose">${o.body}</article>
  </main>
  ${contents(o.docs.toc)}
</div>`
    : `<main id="content"${o.wide ? "" : ' class="page"'}>${o.body}</main>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${fullTitle}</title>
<meta name="description" content="${esc(o.description)}">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="${favicon}" type="image/svg+xml">
<link rel="preload" href="/fonts/fira-code-latin.woff2" as="font" type="font/woff2" crossorigin>
<meta name="theme-color" content="#110d08">
<meta property="og:type" content="website">
<meta property="og:title" content="${fullTitle}">
<meta property="og:description" content="${esc(o.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="${assets.styleUrl}">
<script type="module" src="${assets.scriptUrl}"></script>
${o.head ?? ""}
</head>
<body>
<a class="skip" href="#content">Skip to content</a>
${header(p)}
${main}
${footer(p)}
${
    assets.liveReload
      ? `<script>new EventSource("/__reload").onmessage=()=>location.reload()</script>`
      : ""
  }
</body>
</html>
`;
}
