import { esc } from "../../shell.ts";
import { GOSTORE as P } from "../../site.ts";
import { docsIndex } from "../parts.ts";

export function docsIndexBody(): string {
  return docsIndex(P, {
    blurb: `Running a store: the local stack, the settings that matter, taking
  payments, making it look like yours, and putting it on a server.`,
    intro: `<p>
  New here? <a href="/gostore/docs/getting-started/">Getting started</a> goes
  from a clone to a working checkout on the sandbox. Before a store takes real
  money, read <a href="/gostore/docs/payments/">Payments</a>.
</p>`,
    outro: `These pages are a guide. The full reference — every setting, and the
  reasoning behind each decision — is the
  <a href="${esc(P.repo)}#readme">README</a> in
  <a href="${esc(P.repo)}">the repository</a>.`,
  });
}
