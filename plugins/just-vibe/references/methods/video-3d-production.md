# Blender, Manim, Remotion and video workflows

Use when: blender, manim, remotion, video editing, fal, videodb.

Produce the requested visual sequence with explicit tool availability, asset rights and render bounds.

## Inspect first

- Installed renderer/library versions and target codec/resolution
- Timeline, audio, color space, frame rate and duration
- Source assets, licensing, compute cost and output path

## Method

1. Create a shot/timeline specification with timing, transitions and required assets before rendering.
2. For Blender/Manim, keep scene construction deterministic, separate simulation/cache from rendering, and validate camera/framing/light at representative frames.
3. For Remotion/video editing, verify duration/frame calculations, audio sync, font loading and deterministic asset access; use proxies for expensive preview work.
4. External FAL/VideoDB calls require the actual connected tool/account and requested operation. Preview locally before paid rendering or remote asset publication.

## Failure cases

- A missing font changes line breaks after render.
- A frame-rate mismatch causes audio drift.
- A render job writes over source assets or exceeds an implied budget.

## Verification

- Render representative first/middle/last and transition frames.
- Inspect encoded metadata and play the final output.
- Preserve editable scene/timeline source and document unavailable codecs/services.

## Worked scenario

A 30-second sequence at 30fps should have 900 intended frames; verify end timing and audio tail in the encoded output.

## Version-sensitive primary references

- [docs.blender.org](https://docs.blender.org/manual/en/latest/) — Read the official source for the installed version before relying on a version-sensitive API.
- [docs.manim.community](https://docs.manim.community/en/stable/) — Read the official source for the installed version before relying on a version-sensitive API.
- [www.remotion.dev](https://www.remotion.dev/docs/) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
