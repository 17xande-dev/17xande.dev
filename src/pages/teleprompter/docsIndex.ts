import { esc } from "../../shell.ts";
import { TELEPROMPTER as P } from "../../site.ts";
import { docsIndex } from "../parts.ts";

export function docsIndexBody(): string {
  return docsIndex(P, {
    blurb: `How to run a service with this thing, how it works underneath, and
  how to host it yourself.`,
    intro: `<p>
  New here? <a href="/teleprompter/docs/getting-started/">Getting started</a>
  walks through a first show end to end. If you are about to run something
  that matters, <a href="/teleprompter/docs/operating/">Operating</a> is the
  one to read.
</p>`,
    outro: `These pages are mirrored from the project's own documentation,
  which lives in <a href="${esc(P.repo)}/tree/main/docs">the repository</a>.
  Spotted something wrong? <a href="${esc(P.repo)}/issues">Open an issue</a>.`,
  });
}
