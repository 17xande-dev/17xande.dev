# Building

Everything is built from Linux, including the Windows binaries and the
installer: no Visual Studio, no Windows CI, no Docker.

## What it is made of

- **Zig 0.16** for the core, and `build.zig` for the build.
- Thin **C++20** shims around the two C++ SDKs: CEF and the DeckLink SDK. Each
  exposes a flat C API that Zig calls directly.
- **Deno + TypeScript + Web Awesome** for the control page. Its built output is
  committed, so building the appliance needs only Zig.

## The builds

```bash
zig build web                                             # only after editing web/
zig build -Dtarget=x86_64-windows-gnu -Doptimize=ReleaseSafe
zig build installer                                       # packages zig-out/bin (needs makensis)
```

`zig build --help` lists the rest, including `web-check`, `web-test` and
`web-watch` for the control page.

`zig build installer` does not rebuild first. Which target and optimise mode
ship is worth deciding on purpose, and a packaging step that quietly rebuilds is
one that quietly ships a Debug binary.

After the Windows build, `zig-out/bin/` holds `web2sdi.exe`, `dltest.exe` and
Chromium's runtime, about 460MB of it. To run without the installer, copy the
whole directory to the target — as one archive, if it is going over the network.

## Chromium

The Windows build uses an official CEF binary distribution (the `minimal` one is
enough), at the same version as the Linux development build so both run
identical Chromium.

`-Dcef-win-dist` points the build at a different distribution. That is also the
way to get **H.264**: official CEF builds leave proprietary codecs out, but a
distribution built with them — as OBS builds its own — can be dropped in without
building Chromium here. Two things to weigh first: the A/V calibration is
specific to a Chromium version, and H.264 is patent-encumbered, with the
obligation falling on whoever distributes the decoder.

```bash
zig build -Dtarget=x86_64-windows-gnu -Doptimize=ReleaseSafe \
  -Dcef-win-dist=/path/to/cef_binary_..._windows64
```

## More

The full engineering record — milestones, measurements, the Windows port's
findings and the known risks — is [PLAN.md](PLAN.md) in the repository.
