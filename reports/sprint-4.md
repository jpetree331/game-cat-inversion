# Sprint 4 — expansion mechanics

## Build report
Added real floor openings, inversion fields, pressure buttons, and moving platforms. Floor pieces now derive from pit intervals. A cat falling below the room dies and uses the existing retry flow. Fields reject new flips whenever the cat overlaps them; they do not change gravity or interrupt a committed flip.

Pressure plates summon their matching platform while occupied. On release the platform returns to its initial dock. Platforms carry grounded cats on the top or underside, support either movement axis, push from the contacted face, and detect crushing against solids. Every restart creates fresh platform positions and pressed-button state. Original room definitions and the existing progress-storage key are preserved.

Deviation: none. The requested floor-button example uses a hold-to-call plate, distinct from the original latching gate switches.

## Verification report
`node --test --test-reporter=spec tests/*.test.cjs`: **40 passed, 0 failed** at this boundary, including all 28 prior checks.

Added 12 checks for floor gaps and lips, death event uniqueness, field contact/exit, field traversal during inversion, pressure activation/release, the inverted ferry across a pit, top/underside and vertical carrying, side push/crushing, reset isolation, and movement consistency at 30/60/120 Hz. A first crush fixture let the cat float out of the platform's path; corrected the fixture to place the cat on the floor in the moving platform's path. The corrected case passes.

Browser checks and new-room replays belong to sprint 5. Verification is self-performed, not an independent audit.
