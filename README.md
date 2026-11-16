# 3D Tracking · detection overlay

A standalone rebuild of the UI8 Forge fragment **"3D Tracking"** — churning
detections (signal-red boxes, node dots, `x: 969  y: 1596` callouts in
source-video coordinates, long grey arcs with arrowheads) following an invisible
fragmented body. Each box is filled with churning ASCII.

The scene is 3D: every point takes a depth from the body and a camera orbits it.

## Fly it

- **Drag** — orbit the camera
- **Scroll** — zoom
- **Double-click** — reset the view
- **Move** — pull the body toward the cursor (when *Follow cursor* is on)
- **F** fullscreen, **R** reset the look, **H** toggle the panel

All 21 settings from the original fragment, in the same sections: detections,
churn, frame rate, callouts, ASCII fill, cursor follow, depth, auto-rotate, floor
grid, bloom and the connector curves. Every setting is written to the URL hash.

## Run locally

Open `index.html` in a browser — plain canvas 2D, no dependencies.
`dist/tracking.html` is the same piece as one self-contained file.

## Source

```
index.html  styles.css  app.js       the built piece
src/tracking.ts                     the drawing: strands, detections, camera, bloom
src/app.ts                         clock, orbit camera, panel, URL state
src/story.ts                       the 21 controls and the shipped values
```

Rebuild with `bun build src/app.ts --target browser --outfile app.js`.

## Credits

Inspired by the UI8 Forge fragment **"3D Tracking"**
(`frag_6d944b64-2a9a-40c8-a0be-2628182fe2cf`). Drawing code ported from its canvas
component. Not affiliated with UI8.
