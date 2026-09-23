import { assert, assertEquals } from "@std/assert";
import { dirname, fromFileUrl, resolve } from "@std/path";
import { PROJECTS, repoBlob, TELEPROMPTER, WEB2SDI } from "../src/site.ts";
import { docSource, rewriteHref } from "./markdown.ts";

const root = resolve(dirname(fromFileUrl(import.meta.url)), "..");

Deno.test("every doc in the registry has a source file", async () => {
  for (const p of PROJECTS) {
    for (const doc of p.docs) {
      const path = docSource(root, p, doc);
      const stat = await Deno.stat(path).catch(() => null);
      assert(
        stat?.isFile,
        `missing source for /${p.slug}/docs/${doc.slug}/: ${path}`,
      );
    }
  }
});

Deno.test("relative links resolve, not 404", () => {
  const T = TELEPROMPTER;
  // A sibling .md that this site publishes becomes a site URL.
  assertEquals(rewriteHref("themes.md", T), "/teleprompter/docs/themes/");
  assertEquals(
    rewriteHref("./operating.md", T),
    "/teleprompter/docs/operating/",
  );
  assertEquals(
    rewriteHref("architecture.md#rooms-links-and-control", T),
    "/teleprompter/docs/architecture/#rooms-links-and-control",
  );
  // The app repo's docs index is this site's /<slug>/docs/.
  assertEquals(rewriteHref("README.md", T), "/teleprompter/docs/");
  assertEquals(rewriteHref("README.md", WEB2SDI), "/web2sdi/docs/");

  // Anything the docs reference that this site does not publish goes to the
  // file on GitHub — the right project's — rather than to a dead link here.
  assertEquals(rewriteHref("../CLAUDE.md", T), `${repoBlob(T)}CLAUDE.md`);
  assertEquals(rewriteHref("../LICENSE", T), `${repoBlob(T)}LICENSE`);
  assertEquals(
    rewriteHref("PLAN.md", WEB2SDI),
    `${repoBlob(WEB2SDI)}PLAN.md`,
  );

  // Absolute and in-page targets are left exactly as written.
  for (
    const href of ["https://deno.com", "#unavailable", "/docs/", "mailto:a@b.c"]
  ) {
    assertEquals(rewriteHref(href, T), href);
  }
});

// The guard that actually catches a rename upstream: if a doc is renamed or
// dropped in the app repo, some other doc's link to it silently starts
// pointing at GitHub instead of at this site. This fails instead.
Deno.test("no doc links to a .md this site should be publishing", async () => {
  for (const p of PROJECTS) {
    const publishing = new Set(
      p.docs.map((d) => d.file).filter((f): f is string => !!f),
    );

    for (const doc of p.docs) {
      const md = await Deno.readTextFile(docSource(root, p, doc));

      for (const m of md.matchAll(/\]\(([^)\s]+\.md)(#[^)\s]*)?\)/g)) {
        const target = m[1].replace(/^\.\//, "");
        if (target.startsWith("../")) continue; // deliberately off-site
        // Site-authored pages may point into the project's repo on purpose.
        if (!doc.file) continue;
        assert(
          publishing.has(target) || target === "README.md",
          `${p.slug}: ${doc.file} links to ${target}, which this site does ` +
            `not publish — add it to the registry or the link will go to GitHub`,
        );
      }
    }
  }
});
