import { esc, icons } from "../shell.ts";
import { GITHUB, type Project, PROJECTS, SITE_NAME } from "../site.ts";

function card(p: Project): string {
  const t = p.thumb;
  const app = p.appOrigin
    ? `<a href="${esc(p.appOrigin)}/control">Open the app</a>`
    : "";
  return `<li class="project-card">
  <a class="project-shot" href="/${p.slug}/" tabindex="-1" aria-hidden="true">
    <img src="/${p.slug}/screenshots/${t.file}.webp" alt=""
         width="${t.width}" height="${t.height}" loading="lazy" decoding="async">
  </a>
  <div class="project-body">
    <h2><a href="/${p.slug}/">${icons[p.icon]}<span>${
    esc(p.name)
  }</span></a></h2>
    <p class="project-tagline">${esc(p.tagline)}</p>
    <p>${esc(p.summary)}</p>
    <ul class="tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
    <p class="project-links">
      <a href="/${p.slug}/">About ${icons.arrow}</a>
      <a href="/${p.slug}/docs/">Docs</a>
      <a href="${esc(p.repo)}">Source</a>
      ${app}
    </p>
  </div>
</li>`;
}

export function homeBody(): string {
  return `<section class="hero intro">
  <div class="wrap">
    <h1><span class="prompt" aria-hidden="true">~/</span>${SITE_NAME}</h1>
    <p class="lede">
      Small, focused tools for live production — for the people behind the
      screens. Built in the open, one at a time.
    </p>
  </div>
</section>

<section class="band projects-band">
  <div class="wrap">
    <h2 class="section-label">Projects</h2>
    <ul class="projects">
      ${PROJECTS.map(card).join("\n")}
    </ul>
    <p class="fineprint more-on-gh">
      More, in varying states of finish, on
      <a href="${esc(GITHUB)}">GitHub</a>.
    </p>
  </div>
</section>`;
}
