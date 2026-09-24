/**
 * Everything about this site that more than one file needs to agree on: the
 * site itself, and the registry of projects that each get a section under
 * /<slug>/.
 */

export const SITE_ORIGIN = "https://17xande.dev";
export const SITE_NAME = "17xande.dev";
export const TAGLINE = "Small tools for live production, built in the open.";
export const GITHUB = "https://github.com/17xande";

/**
 * Where the teleprompter app is served from. Its demo frames this origin, so
 * it has to match what the app's own `frame-ancestors` admits (see the app
 * repo's docs/deploying.md) — otherwise the iframes come up blank with the
 * refusal reported only in *this* page's console.
 *
 * Overridable at build time so `deno task dev` can point at a local server:
 *
 *   TELEPROMPTER_APP_ORIGIN=http://localhost:8080 deno task dev
 */
export const TELEPROMPTER_APP_ORIGIN = env("TELEPROMPTER_APP_ORIGIN") ??
  "https://teleprompter.17xande.dev";

/**
 * Reading an env var throws when the permission was not granted, and this
 * module is imported by every tool here — including the tests, which are run
 * without one. An override that is absent and an override that could not be
 * read mean the same thing to everything downstream: use the default.
 */
function env(name: string): string | undefined {
  try {
    return Deno.env.get(name);
  } catch {
    return undefined;
  }
}

/**
 * One docs page. `file` is the name in content/<project>/docs (synced
 * verbatim from the project's repo); `slug` is the URL segment. A page with
 * no `file` is written here, as content/<project>/<slug>.md.
 */
export interface DocPage {
  slug: string;
  title: string;
  blurb: string;
  file?: string;
}

export interface NavLink {
  label: string;
  href: string;
  /** Rendered as the header's one call to action. */
  primary?: boolean;
}

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  /** Longer copy for the card on the site index. */
  summary: string;
  repo: string;
  /** The branch the repo's docs and files are linked on. */
  branch: string;
  /** Present when the project has something hosted to open. */
  appOrigin?: string;
  /** Key into `icons` in shell.ts. */
  icon: "tv" | "sdi" | "bag";
  /** The screenshot the site index uses as the card's picture. */
  thumb: { file: string; width: number; height: number };
  /** Tags on the site index card. */
  tags: string[];
  docs: DocPage[];
  /** Header links, besides the brand. Relative to the project root. */
  nav: NavLink[];
  /** Footer links. */
  footer: NavLink[];
}

const TELEPROMPTER_REPO = "https://github.com/17xande-dev/teleprompter";
const WEB2SDI_REPO = "https://github.com/17xande/bmd-decklink";
const GOSTORE_REPO = "https://github.com/17xande-dev/gostore";

export const TELEPROMPTER: Project = {
  slug: "teleprompter",
  name: "Teleprompter",
  tagline: "An open source teleprompter that runs in your browser.",
  summary:
    "A control page holds the script; any screen with a browser can be a display. Scroll, speed, clocks and messages stay in sync, peer-to-peer.",
  repo: TELEPROMPTER_REPO,
  branch: "main",
  appOrigin: TELEPROMPTER_APP_ORIGIN,
  icon: "tv",
  thumb: {
    file: "control",
    width: 2048,
    height: 1280,
  },
  tags: ["Deno", "TypeScript", "Go", "WebRTC", "MIT"],
  docs: [
    {
      slug: "getting-started",
      title: "Getting started",
      blurb:
        "Your first show, from opening the page to text moving on a screen.",
    },
    {
      slug: "operating",
      title: "Operating",
      blurb:
        "The manual: the script, scrolling, screens, clocks, messages, the controller.",
      file: "operating.md",
    },
    {
      slug: "shortcuts",
      title: "Keyboard & controller",
      blurb: "Every command, with its keys and its gamepad button.",
      file: "shortcuts.md",
    },
    {
      slug: "themes",
      title: "Themes",
      blurb: "Writing your own viewer layout in plain CSS.",
      file: "themes.md",
    },
    {
      slug: "architecture",
      title: "Architecture",
      blurb:
        "How the pieces fit: signalling, peer topology, what crosses the wire.",
      file: "architecture.md",
    },
    {
      slug: "deploying",
      title: "Self-hosting",
      blurb: "Docker, TLS, TURN, and why HTTPS is worth having.",
      file: "deploying.md",
    },
    {
      slug: "development",
      title: "Development",
      blurb: "The build, the gates, and how to check a change is real.",
      file: "development.md",
    },
    {
      slug: "roadmap",
      title: "Roadmap",
      blurb: "Open decisions, what is wanted next, ideas.",
      file: "roadmap.md",
    },
  ],
  nav: [
    { label: "Demo", href: "#demo" },
    { label: "Docs", href: "docs/" },
  ],
  footer: [
    { label: "Docs", href: "docs/" },
    { label: "Self-host", href: "docs/deploying/" },
    { label: "Source", href: TELEPROMPTER_REPO },
    { label: "MIT licence", href: `${TELEPROMPTER_REPO}/blob/main/LICENSE` },
  ],
};

export const WEB2SDI: Project = {
  slug: "web2sdi",
  name: "web2sdi",
  tagline: "A live webpage, out of an SDI port.",
  summary:
    "Renders any webpage — video and audio included — and plays it out as broadcast SDI through a Blackmagic DeckLink card. A browser source without the rest of OBS.",
  repo: WEB2SDI_REPO,
  branch: "main",
  icon: "sdi",
  thumb: {
    file: "control",
    width: 2048,
    height: 1280,
  },
  tags: ["Zig", "C++", "CEF", "DeckLink", "Windows"],
  docs: [
    {
      slug: "getting-started",
      title: "Getting started",
      blurb: "Install it, point it at a page, and get it on the wire.",
    },
    {
      slug: "options",
      title: "Options & settings",
      blurb: "Every command-line flag, and where the saved settings live.",
    },
    {
      slug: "how-it-works",
      title: "How it works",
      blurb: "The pipeline: Chromium offscreen, a frame buffer, the SDI clock.",
    },
    {
      slug: "building",
      title: "Building",
      blurb: "Building the Windows binaries and the installer, from Linux.",
    },
  ],
  nav: [
    { label: "Screenshots", href: "#screenshots" },
    { label: "Docs", href: "docs/" },
  ],
  footer: [
    { label: "Docs", href: "docs/" },
    { label: "Getting started", href: "docs/getting-started/" },
    { label: "Source", href: WEB2SDI_REPO },
  ],
};

export const GOSTORE: Project = {
  slug: "gostore",
  name: "gostore",
  tagline: "A small, self-hostable online store, written in Go.",
  summary:
    "A catalog, a cart and a checkout for a shop that sells a few things well — books, apparel, downloads — in rand, paid through PayFast or SnapScan. One binary and Postgres.",
  repo: GOSTORE_REPO,
  branch: "main",
  icon: "bag",
  thumb: {
    file: "catalog",
    width: 2048,
    height: 1280,
  },
  tags: ["Go", "htmx", "PostgreSQL", "PayFast", "MIT"],
  docs: [
    {
      slug: "getting-started",
      title: "Getting started",
      blurb: "The local stack, a demo catalog, and the first administrator.",
    },
    {
      slug: "configuration",
      title: "Configuration",
      blurb: "What it needs to boot, and the settings most stores change.",
    },
    {
      slug: "payments",
      title: "Payments",
      blurb: "Setting up PayFast and SnapScan, and going live safely.",
    },
    {
      slug: "theming",
      title: "Theming",
      blurb: "Restyling with custom properties, and overriding templates.",
    },
    {
      slug: "deploying",
      title: "Deploying",
      blurb: "The container, migrations, and checking config before a deploy.",
    },
  ],
  nav: [
    { label: "Screenshots", href: "#screenshots" },
    { label: "Docs", href: "docs/" },
  ],
  footer: [
    { label: "Docs", href: "docs/" },
    { label: "Getting started", href: "docs/getting-started/" },
    { label: "Source", href: GOSTORE_REPO },
    { label: "MIT licence", href: `${GOSTORE_REPO}/blob/main/LICENSE` },
  ],
};

/** In the order the site index lists them. */
export const PROJECTS: Project[] = [TELEPROMPTER, WEB2SDI, GOSTORE];

/** The absolute path of a link given relative to a project's root. */
export function projectHref(p: Project, href: string): string {
  if (/^([a-z]+:|\/\/|\/)/i.test(href)) return href;
  return `/${p.slug}/${href}`;
}

export function repoBlob(p: Project): string {
  return `${p.repo}/blob/${p.branch}/`;
}

/**
 * Markdown link targets that resolve to a page on this site. Anything else
 * relative is rewritten to the file on GitHub — see tools/markdown.ts.
 */
export function docUrlByFile(p: Project): Map<string, string> {
  const m = new Map<string, string>(
    p.docs.filter((d) => d.file).map((
      d,
    ) => [d.file!, `/${p.slug}/docs/${d.slug}/`]),
  );
  // A project repo's docs/README.md is its own index; ours is /<slug>/docs/.
  m.set("README.md", `/${p.slug}/docs/`);
  return m;
}

/**
 * The title to show when a doc links to another by bare filename, which is
 * how they cross-reference each other in the repo.
 */
export function docTitleByFile(p: Project): Map<string, string> {
  const m = new Map<string, string>(
    p.docs.filter((d) => d.file).map((d) => [d.file!, d.title]),
  );
  m.set("README.md", "the documentation index");
  return m;
}
