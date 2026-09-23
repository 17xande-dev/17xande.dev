import { esc } from "../../shell.ts";
import { repoBlob, WEB2SDI as P } from "../../site.ts";
import { docsIndex } from "../parts.ts";

export function docsIndexBody(): string {
  return docsIndex(P, {
    blurb: `How to install it, run it, and point it at a page — and what is
  going on underneath.`,
    intro: `<p>
  New here? <a href="/web2sdi/docs/getting-started/">Getting started</a> goes
  from a fresh Windows box to a page on the wire.
</p>`,
    outro: `The engineering notes these pages are drawn from live in
  <a href="${esc(repoBlob(P))}PLAN.md">PLAN.md</a> in
  <a href="${esc(P.repo)}">the repository</a>.`,
  });
}
