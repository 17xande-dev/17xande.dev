/**
 * Pieces every project homepage is made from, so the sections look alike
 * because they are built alike rather than because they were kept in step.
 */
import { esc } from "../shell.ts";
import type { Project } from "../site.ts";

export interface Shot {
  file: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

export function feature(title: string, body: string): string {
  return `<li class="feature"><h3>${title}</h3><p>${body}</p></li>`;
}

/** Screenshots live at static/<slug>/screenshots/<file>.webp. */
export function gallery(p: Project, shots: Shot[]): string {
  const figures = shots.map((s) => {
    const src = `/${p.slug}/screenshots/${s.file}.webp`;
    return `<figure>
  <button class="shot" data-shot="${src}" aria-label="Enlarge: ${
      esc(s.caption)
    }">
    <img src="${src}" alt="${esc(s.alt)}"
         width="${s.width}" height="${s.height}" loading="lazy" decoding="async">
  </button>
  <figcaption>${s.caption}</figcaption>
</figure>`;
  }).join("\n");

  return `<section id="screenshots" class="band">
  <div class="wrap">
    <h2>What it looks like</h2>
    <div class="gallery">${figures}</div>
  </div>
</section>`;
}

/** The dialog the gallery opens into — see lightbox() in scripts/site.ts. */
export const lightbox =
  `<wa-dialog class="lightbox" data-lightbox label="Screenshot">
  <img alt="" data-lightbox-img>
</wa-dialog>`;

/** /<slug>/docs/ — the cards, with a project-specific intro and outro. */
export function docsIndex(
  p: Project,
  o: { blurb: string; intro: string; outro: string },
): string {
  const cards = p.docs.map((d) =>
    `<li><a href="/${p.slug}/docs/${d.slug}/">
  <h2>${esc(d.title)}</h2>
  <p>${esc(d.blurb)}</p>
</a></li>`
  ).join("\n");

  return `<div class="prose">
<h1>Documentation</h1>
<p class="page-blurb">${o.blurb}</p>

${o.intro}

<ul class="doc-cards">
${cards}
</ul>

<p style="margin-top:2rem">${o.outro}</p>
</div>`;
}
