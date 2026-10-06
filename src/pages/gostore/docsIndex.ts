import { esc } from "../../shell.ts";
import { GOSTORE as P } from "../../site.ts";
import { docsIndex } from "../parts.ts";

export function docsIndexBody(): string {
  return docsIndex(P, {
    blurb: `Two guides: one for the people who run a store day to day, and one
  for whoever installs and hosts it.`,
    intro: `<p>
  <strong>Running a shop that is already set up?</strong> Start with
  <a href="/gostore/docs/signing-in/">Signing in and your account</a>, then
  <a href="/gostore/docs/products/">Products and variants</a>. No terminal
  needed.
</p>
<p>
  <strong>Installing one?</strong>
  <a href="/gostore/docs/getting-started/">Getting started</a> goes from a clone
  to a working checkout on the sandbox. Before a store takes real money, read
  <a href="/gostore/docs/payments/">Payments</a>.
</p>`,
    outro: `These pages are a guide. The full reference — every setting, and the
  reasoning behind each decision — is the
  <a href="${esc(P.repo)}/tree/${esc(P.branch)}/docs">docs/ directory</a> in
  <a href="${esc(P.repo)}">the repository</a>.`,
  });
}
