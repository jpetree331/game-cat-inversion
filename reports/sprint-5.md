# Sprint 5 — four new rooms

## Build report
Appended rooms 9–12: **A gap in the house**, **A change of atmosphere**, **Please mind the gap**, and **The quiet crossing**. They introduce pits, inversion fields, the requested floor-button/inverted-platform ferry, and a combined crossing. A ceiling barrier prevents simply bypassing the ferry, and the destination is an elevated area across a pit. The original eight rooms retain their identifiers, positions, and solution routes.

Added orange pressure-plate/ferry artwork, visible tracks, actual gaps in the floor with dark pit markings, violet field boundaries and NO FLIP labels, field-lock feedback, and ferry arrival instructions. Room counts and completion screens now derive from the twelve-room list. The mobile room picker grows vertically to fit three rows of rooms. Existing completion indices and the progress storage key are preserved.

Updated the same standalone artifact at `dist/Nine-Lives-Above.html` (34,512 bytes). Refresh or reopen that file, then choose Room 9. No extra packages, downloads, account, or external deployment are required.

Deviation: none. Pressure buttons are hold-to-call mechanisms; the original latching gate switches still work as before. Existing saved completion is retained, though an in-progress room restarts on reload as it did in the original game.

## Verification report
`node --test --test-reporter=spec tests/*.test.cjs`: **49 passed, 0 failed**. Syntax checks passed for engine, app, and renderer. `node tools/build.cjs` passed.

All twelve rooms complete without deaths using real simulation inputs, both in the standalone engine replay and through the app's keyboard handlers and frame loop. The routes include waiting on pressure plates and riding the returning ferry. Engine replays also pass at 60 Hz. Added app checks for field entry/exit, blocked keyboard and touch flips, live HUD/aria state, moving-platform pause/restart, and preserved original completion indices. Validated pressure references, pit/field geometry, and unobstructed platform tracks. Verified that the direct ceiling bypass of room 11 is blocked and the pit below is fatal.

### Actual browser checks
- Reloaded the packaged HTML in the existing localhost preview and confirmed twelve rooms in the picker.
- Visually inspected the combined room at desktop size and the expanded picker at 390 × 844.
- Measured mobile document/client widths of 390 pixels: no horizontal overflow.
- Used the on-screen movement control in room 11 to stand on the plate; observed “Hold the plate” change to “Ferry ready” and the platform arrive at the near dock.
- Used the on-screen Flip button to board the underside, then visually confirmed the cat rode to the far dock over the open pit with zero retries.
- In room 12, repeated the pressure-plate ride through the field. Confirmed collection of the in-transit moon, FLIP LOCKED feedback, disabled-state semantics on the touch Flip button, and that pressing Space left the cat attached to the underside inside the field.
- Browser warning/error logs were empty during these checks.
- Reset the viewport override and left the local preview at room 9.

### Limits
Self-performed verification, not an independent audit. All-room completion is automated through the app adapter; it is not a full manual browser playthrough. Physical touchscreen multitouch, audible sound quality, other browser engines, and direct double-click launch were not tested in this expansion. The browser tool's earlier file-URL restriction remains; no attempt was made to bypass it. The packaged artifact was exercised through the existing local preview.
