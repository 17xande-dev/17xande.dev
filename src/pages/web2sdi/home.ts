import { esc, icons } from "../../shell.ts";
import { WEB2SDI } from "../../site.ts";
import { feature, gallery, lightbox, type Shot } from "../parts.ts";

const REPO = WEB2SDI.repo;

/**
 * Captured from the real control page, running on a Linux box against a
 * page playing SMPTE HD colour bars with a burnt-in timecode, at a 1440x900
 * viewport and 2x DPR, then resized to 2048 wide. That box has no DeckLink card, so the badge honestly reads "stopped";
 * everything upstream of the card — the browser, the preview, the video
 * transport — is live.
 */
const SHOT_W = 2048;
const SHOT_H = 1280;

const SHOTS: Shot[] = [
  {
    file: "control",
    alt:
      "The web2sdi control page: a live preview of SMPTE colour bars with a running timecode, a Health panel beside it, and video transport controls below it: seek bar, skip, pause, mute and playback rate.",
    caption:
      "The control page — a live preview of what is going to air, and a transport for the page's video.",
    width: SHOT_W,
    height: SHOT_H,
  },
  {
    file: "interact",
    alt:
      "The colour-bar preview with Interact switched on: an amber outline around the picture and an INTERACTING badge in its corner.",
    caption:
      "Interact forwards your mouse and keyboard to the page. It is live to air, and it looks it.",
    width: SHOT_W,
    height: SHOT_H,
  },
  {
    file: "settings",
    alt:
      "The settings page: SDI mode, device, render size and frame rate; an embedded-audio switch with video delay and audio trim; and cards for access, the preview stream and health.",
    caption: "Settings — mode, device, audio and the A/V trims, saved to disk.",
    width: SHOT_W,
    height: SHOT_H,
  },
];

/**
 * The pipeline, inline so it inherits the page's colours. The thing worth
 * making concrete is which clock is in charge: the card pulls, the browser
 * does not push.
 */
function diagram(): string {
  return `<svg class="topology" viewBox="0 0 640 300" role="img"
     aria-label="Chromium renders the page offscreen into a frame buffer that always holds the newest frame. The DeckLink card, on the SDI clock, pulls from that buffer once per output frame. The control page receives a JPEG preview from the same frames and sends settings, input and video commands back.">
  <defs>
    <marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g class="node">
    <rect x="20" y="40" width="160" height="64" rx="10"/>
    <text x="100" y="67">Chromium</text>
    <text x="100" y="87" class="sub">offscreen, BGRA + audio</text>
  </g>
  <g class="node">
    <rect x="240" y="40" width="160" height="64" rx="10"/>
    <text x="320" y="67">Frame buffer</text>
    <text x="320" y="87" class="sub">newest frame wins</text>
  </g>
  <g class="node server">
    <rect x="460" y="40" width="160" height="64" rx="10"/>
    <text x="540" y="67">DeckLink</text>
    <text x="540" y="87" class="sub">SDI clock is master</text>
  </g>
  <g class="node">
    <rect x="240" y="190" width="160" height="64" rx="10"/>
    <text x="320" y="217">Control page</text>
    <text x="320" y="237" class="sub">any browser, :8787</text>
  </g>
  <g class="edge data">
    <path d="M180 72 L240 72" marker-end="url(#arw)"/>
    <path d="M460 60 C440 60 420 60 400 60" marker-end="url(#arw)"/>
  </g>
  <g class="edge data">
    <path d="M400 84 L460 84" marker-end="url(#arw)"/>
  </g>
  <g class="edge signal">
    <path d="M320 104 L320 190" marker-end="url(#arw)"/>
    <path d="M240 222 C140 222 100 170 100 104" marker-end="url(#arw)"/>
  </g>
  <text class="edge-label" x="430" y="52">pull</text>
  <text class="edge-label" x="330" y="152" text-anchor="start">JPEG preview</text>
  <text class="edge-label" x="110" y="170" text-anchor="start">URL, input, video</text>
  <g class="key">
    <text x="440" y="200"><tspan class="swatch-data">──</tspan> frames, every tick</text>
    <text x="440" y="224"><tspan class="swatch-signal">──</tspan> control and preview</text>
    <text x="440" y="252" class="sub">slow page: last frame repeats</text>
    <text x="440" y="270" class="sub">fast page: extra frames drop</text>
  </g>
</svg>`;
}

export function homeBody(): string {
  return `<section class="hero">
  <div class="wrap">
    <p class="eyebrow">Windows · Blackmagic DeckLink · Chromium</p>
    <h1>A live webpage,<br>out of an SDI port.</h1>
    <p class="lede">
      <strong>web2sdi</strong> renders any page — graphics, a scoreboard, a
      clock, a playing video with its sound — and plays it out as
      <strong>broadcast SDI</strong> through a DeckLink card. The same trick
      as a browser source and a DeckLink output in OBS, without the rest of
      OBS: a box that boots, goes on air, and takes its orders from a web page.
    </p>
    <p class="cta">
      <a class="btn primary" href="/web2sdi/docs/getting-started/">Get started ${icons.arrow}</a>
      <a class="btn" href="#screenshots">Screenshots</a>
      <a class="btn ghost" href="${esc(REPO)}">${icons.github} Source</a>
    </p>
    <p class="fineprint">
      Verified on a DeckLink Duo 2 at 1080p59.94: 601 frames in 10 seconds,
      none late, none dropped.
    </p>
  </div>
</section>

${gallery(WEB2SDI, SHOTS)}

<section class="band">
  <div class="wrap">
    <h2>What you get</h2>
    <ul class="features">
      ${
    feature(
      "The card keeps time",
      `SDI's clock is the master, as it is in OBS. A page that renders slower
       than the wire repeats its last frame; one that renders faster drops the
       spares. The output never starves.`,
    )
  }
      ${
    feature(
      "Sound, in sync",
      `<code>--audio</code> embeds the page's audio in the SDI signal at 48kHz,
       scheduled on the video timeline. Measured on a loopback cable:
       −0.03ms mean offset.`,
    )
  }
      ${
    feature(
      "See what is going out",
      `The control page streams a live preview of the rendered page. Switch on
       <strong>Interact</strong> to click and type into it — log in, dismiss a
       banner, pick from a dropdown — without a monitor on the box.`,
    )
  }
      ${
    feature(
      "Drive the video",
      `When the page has a <code>&lt;video&gt;</code>, the control page grows a
       transport: seek, skip ten seconds, play, pause, mute and rate.`,
    )
  }
      ${
    feature(
      "Change it live",
      `A new URL, render size or frame rate applies without touching the wire.
       Mode, device and audio rebuild the card, and the page says so before
       you commit.`,
    )
  }
      ${
    feature(
      "An appliance, not an app",
      `Tray icon, one copy at a time, settings saved to disk, and an optional
       startup shortcut so a power cut ends with the box back on air.`,
    )
  }
      ${
    feature(
      "One installer",
      `An NSIS installer carries Chromium and everything else. The only
       prerequisite is Blackmagic's Desktop Video driver, and it warns you if
       that is missing.`,
    )
  }
      ${
    feature(
      "Built from Linux",
      `Zig cross-compiles the Windows build and packages the installer — no
       Visual Studio, no Windows CI, no Docker.`,
    )
  }
    </ul>
  </div>
</section>

<section id="how" class="band">
  <div class="wrap narrow">
    <h2>How it works</h2>
    <p>
      The Chromium Embedded Framework renders the page offscreen and hands over
      every frame it paints. Those land in a small buffer that only ever keeps
      the newest one. Once per output frame, the DeckLink card's completion
      callback takes whatever is newest, converts it to YUV if the mode calls
      for it, and schedules it.
    </p>
    ${diagram()}
    <p>
      That split is the whole design: the browser renders as fast as it can,
      the card plays out exactly as fast as SDI demands, and neither waits for
      the other.
    </p>
    <p><a class="more" href="/web2sdi/docs/how-it-works/">More on the pipeline ${icons.arrow}</a></p>
  </div>
</section>

<section id="run" class="band">
  <div class="wrap narrow">
    <h2>Run it</h2>
    <p>
      Install Blackmagic Desktop Video, run the installer, and start web2sdi
      from the Start Menu. The tray icon opens the control page. From a
      terminal:
    </p>
    <wa-tab-group active="ui">
      <wa-tab slot="nav" panel="ui">With the UI</wa-tab>
      <wa-tab slot="nav" panel="once">One-off</wa-tab>
      <wa-tab-panel name="ui">
        <pre class="shell"><code>web2sdi.exe
web2sdi.exe --lan --port 8787</code></pre>
        <wa-copy-button value="web2sdi.exe --lan --port 8787"></wa-copy-button>
      </wa-tab-panel>
      <wa-tab-panel name="once">
        <pre class="shell"><code>dltest.exe --probe
web2sdi.exe --url https://example.com --device 0 --audio</code></pre>
        <wa-copy-button value="web2sdi.exe --url https://example.com --device 0 --audio"></wa-copy-button>
      </wa-tab-panel>
    </wa-tab-group>
    <p>
      Then open <code>http://127.0.0.1:8787</code>. With <code>--lan</code>
      anyone on the network can reach it — and so change what goes to air.
    </p>
    <p class="notice">
      Chromium's stock builds carry no H.264 or AAC. An <code>.mp4</code>
      renders as a black frame and says nothing; use WebM (VP8/VP9 with
      Opus/Vorbis) for video you play locally.
    </p>
    <p><a class="more" href="/web2sdi/docs/options/">Every option ${icons.arrow}</a></p>
  </div>
</section>

${lightbox}
`;
}
