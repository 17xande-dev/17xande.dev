# Options & settings

## Saved settings

Whatever the control page applies is written to `config.json`:

- Windows: `%APPDATA%\web2sdi\config.json`
- Elsewhere: `$XDG_CONFIG_HOME/web2sdi/config.json`, or
  `~/.config/web2sdi/config.json`

It is plain JSON on purpose, so an operator who cannot reach the web UI can
still read and fix it by hand:

```json
{
  "url": "https://example.com",
  "device": 0,
  "mode": "1080p59.94",
  "width": 0,
  "height": 0,
  "fps": 0,
  "audio": false,
  "audio_offset_ms": 0,
  "video_delay_ms": 50,
  "bind": "localhost",
  "port": 8787
}
```

A `width`, `height` or `fps` of `0` follows the SDI mode. `bind` is `localhost`
or `lan`.

## Command-line flags

Flags override the saved settings **for that run only**.

### Source and output

| Flag                           | What it does                                                  |
| ------------------------------ | ------------------------------------------------------------- |
| `--url <url>`                  | The page to render. Default `https://example.com`.            |
| `--sink <decklink\|file>`      | Where frames go. Default `decklink`; `file` writes PNGs.      |
| `--device <n>`                 | DeckLink device index. Default `0`.                           |
| `--mode <mode>`                | SDI mode, e.g. `1080p59.94`, `1080i50`, `720p59.94`.          |
| `--width <n>` / `--height <n>` | Browser render size. Default: match the SDI mode.             |
| `--fps <n>`                    | Browser frame rate. Default: match the SDI mode.              |
| `--pixel-format <bgra\|yuv>`   | The pixel format on the wire.                                 |
| `--seconds <n>`                | Stop after _n_ seconds. `0`, the default, runs until stopped. |

A render smaller than the SDI frame is centred in it rather than scaled up.

Supported modes are `1080p59.94`, `1080p60`, `1080p50`, `1080p30`, `1080p29.97`,
`1080p25`, `1080p24`, `1080i59.94`, `1080i50`, `720p59.94`, `720p50`, `NTSC` and
`PAL`. Which of those a given card will actually take — and in which pixel
format — is what `dltest --probe` reports. A Duo 2, for one, will not take BGRA
at 1080p59.94, so web2sdi converts to YUV there.

### Audio

| Flag                    | What it does                                                  |
| ----------------------- | ------------------------------------------------------------- |
| `--audio`               | Embed the page's audio in the SDI output.                     |
| `--video-delay-ms <n>`  | Hold video back to meet Chromium's audio delay. Default `50`. |
| `--audio-offset-ms <n>` | Trim audio later (+) or earlier (−) against video.            |
| `--audio-continuous`    | A continuous audio stream instead of timestamped scheduling.  |

The default video delay is calibrated for the Chromium version web2sdi ships. It
is worth re-measuring with `dlsync` after an upgrade — see
[How it works](/web2sdi/docs/how-it-works/#measuring-sync).

### Control page and preview

| Flag                                         | What it does                                          |
| -------------------------------------------- | ----------------------------------------------------- |
| `--port <n>`                                 | Control page port. Default `8787`.                    |
| `--lan`                                      | Serve the control page on the network.                |
| `--preview-width <n>` `--preview-height <n>` | The box the preview is scaled into. Default 1280×720. |
| `--preview-fps <n>`                          | Preview frame rate. Default `30`.                     |
| `--preview-quality <n>`                      | Preview JPEG quality. Default `70`.                   |

Encoding the preview is the one part of web2sdi that costs real CPU — about a
quarter of a core at the defaults. The preview slots are sized once at startup,
so changing them needs a restart.

### File sink

For development without a card: `--sink file` writes PNGs instead.

| Flag               | What it does                                  |
| ------------------ | --------------------------------------------- |
| `--out-dir <dir>`  | Where to write. Default `/tmp/frames`.        |
| `--every <n>`      | Write every _n_th frame. Default `30`.        |
| `--max-frames <n>` | Stop after _n_ files. `0` runs until stopped. |

## Other tools

Two small programs ship beside `web2sdi.exe`:

- `dltest --probe` lists every sub-device on the card and the modes and pixel
  formats each will accept. Without `--probe` it plays a test pattern, which is
  the quickest way to prove the card and cabling work on their own.
- `dlsync` measures A/V sync over an SDI loopback cable.
