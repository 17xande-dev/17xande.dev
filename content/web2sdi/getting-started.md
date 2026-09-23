# Getting started

## What you need

- A Windows PC with a **Blackmagic DeckLink** card. Development and verification
  were done on a DeckLink Duo 2.
- Blackmagic **Desktop Video**, the card's driver. This is the only
  prerequisite: web2sdi talks to the card through the driver's COM registration
  and ships no DeckLink DLL of its own.
- Something to plug the SDI output into — a monitor, a switcher, a recorder.

## Install

Run `web2sdi-setup-<version>.exe`. It installs to `C:\Program Files\web2sdi`,
adds Start Menu and Desktop shortcuts, and opens TCP port 8787 in the firewall
for the control page. It warns if Desktop Video is missing.

It also offers a **Startup shortcut**. Take it if this box is going to live in a
rack: after a power cut or a reboot, it comes back on air by itself, on the page
it was last showing.

For an unattended install, `/S` installs silently:

```powershell
web2sdi-setup-0.1.0.exe /S
```

Uninstalling removes everything except your settings in `%APPDATA%\web2sdi`.

## First run

Start web2sdi from the Start Menu. A tray icon appears; it opens the control
page and is the clean way to quit. Only one copy runs at a time — two would
fight over one SDI output.

The control page is at `http://127.0.0.1:8787/`. On first run it shows
`https://example.com` in 1080p59.94 on device 0.

1. Type the page you want on air into **Source → URL** and press **Apply**. The
   preview shows what the browser is rendering.
2. If the page needs a click or a login, switch on **Interact** in the preview's
   header. Your mouse and keyboard go to the page — which is live to air, so the
   preview gets an amber outline while you do it.
3. If the page has a `<video>`, a **Video** card appears with seek, skip, play
   and pause, mute and rate.
4. Open **Settings** to change the SDI mode, device, or turn on embedded audio.

The badge in the top bar says whether the output is running. If it is not, the
**Source** card says why — a card that is missing or busy does not stop the
browser, the preview or the control page from coming up.

## Reaching it from another machine

By default the control page only answers on this machine. To drive it from
elsewhere on the network:

```powershell
web2sdi.exe --lan --port 8787
```

There is no password: anyone who can reach the page can change what goes to air.
Put the box somewhere only operators can reach — its own VLAN, say.

## Pages and video

Chromium's official builds, which web2sdi uses, have **no H.264 or AAC**. An
`.mp4` renders as a black frame, reports a duration of zero and logs nothing.
Use WebM (VP8/VP9 video, Opus/Vorbis audio) for anything you play locally, and
expect the same from any site that only serves H.264.

The control page drives the **first** `<video>` in the page's main frame. A
video inside a cross-origin iframe — a YouTube embed, for instance — is out of
its reach. Dropdowns, date pickers and autocomplete lists do render, both in the
preview and on the wire.
