# How it works

## The pipeline

web2sdi is three pieces and a buffer between them.

**Chromium** renders the page. It is the Chromium Embedded Framework (CEF),
running offscreen: no window, just a callback with a BGRA frame every time the
page paints, and another with audio.

**The frame buffer** is a triple buffer that only ever keeps the newest frame.
Chromium writes into it whenever it has something; nothing ever waits on it.

**The DeckLink output** runs on the card's clock. Once per output frame, the
card says it has finished with a frame; web2sdi takes whatever is newest in the
buffer, converts it from BGRA to YUV if the mode requires it, and schedules it.

## The SDI clock is the master

That is the same model OBS uses, and it is the whole point of the buffer.
Browsers do not render at a fixed rate — a static page barely paints at all, a
busy one might manage 34fps when the wire wants 59.94. So the browser is never
asked to keep time:

- if the page is **slower** than SDI, the last frame is repeated;
- if it is **faster**, the frames in between are dropped.

Either way the card gets a frame on every tick and the output never starves. On
a Duo 2 at 1080p59.94, a busy page painted 341 frames in ten seconds while the
card scheduled all 601 it needed, with none late, dropped or flushed.

## Audio

With `--audio`, Chromium is asked for 48kHz stereo — what SDI embeds — so
nothing is resampled. Samples go through a lock-free FIFO and are scheduled with
explicit timestamps on the video timeline.

Chromium delivers audio a little behind the picture, and audio cannot be
scheduled earlier than the play head. So the picture waits for the sound: video
is held back by `--video-delay-ms`, 50ms for the Chromium version web2sdi ships.

## Measuring sync

`dlsync` makes A/V sync a measurement rather than a matter of opinion. Loop a
cable from an SDI output to an SDI input, play a page that flashes and beeps
from the same callback, and measure the gap on the input:

```powershell
# terminal 1 — play the marker page out
web2sdi.exe --url file:///.../flashbeep.html --sink decklink --device 0 --audio
# terminal 2 — measure on the input the cable lands in
dlsync.exe --device 1 --seconds 30
```

A positive offset means audio is late. The current build measures −0.03ms mean
over 24 marks, from 89.69ms late before the timestamped scheduling went in. The
spread either side of that — a few tens of milliseconds — is the measurement
floor: the page's flash lands on a 16.7ms compositor frame and its beep on a
~21ms audio quantum before either reaches SDI.

Re-run it after upgrading Chromium; the calibration is version-specific.

## The control page

The control page is served by web2sdi itself, from files embedded in the binary.

- **Preview.** Frames are downscaled on Chromium's paint thread and JPEG-encoded
  on a thread of their own, then streamed over a WebSocket. At the default
  1280×720 and 30fps that is about a quarter of a core.
- **Interact.** Mouse and keyboard events on the preview are mapped back to the
  page's coordinates and forwarded to Chromium.
- **Video.** The page's first `<video>` is read and driven through Chromium's
  DevTools protocol, four times a second; the scrubber interpolates between
  answers so it still moves smoothly.
- **Settings.** URL, render size and frame rate apply live. Device, mode, audio
  and the A/V trims rebuild the card, which briefly drops the SDI output — the
  page warns before you commit to one of those.
