import { esc } from "../shell.ts";
import { PROJECTS, TELEPROMPTER_APP_ORIGIN } from "../site.ts";

export function notFoundBody(): string {
  const projects = PROJECTS.map((p) =>
    `<a class="btn" href="/${p.slug}/">${esc(p.name)}</a>`
  ).join("\n  ");

  return `<div class="prose">
<h1>Not here</h1>
<p class="page-blurb">That page does not exist on this site.</p>

<p class="cta">
  <a class="btn primary" href="/">Home</a>
  ${projects}
</p>

<p>
  Looking for the teleprompter itself — the control page, or a viewer link
  someone sent you? The application lives at its own address:
  <a href="${esc(TELEPROMPTER_APP_ORIGIN)}/control">${
    esc(new URL(TELEPROMPTER_APP_ORIGIN).host)
  }</a>. A viewer link that has stopped working will have an old host in it;
  the room id is the part after <code>?room=</code>, and pasted onto
  <code>${esc(TELEPROMPTER_APP_ORIGIN)}/viewer?room=…</code> it will connect —
  as long as somebody is still holding that room open.
</p>
</div>`;
}
