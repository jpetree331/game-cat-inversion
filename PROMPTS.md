# Nine Lives Above — build and verification prompts

## Master prompt
Build an original, playable 2D room puzzle game starring a small black cat. Spacebar launches the cat rapidly to the opposite surface, like the deliberate surface switching of Geometry Dash's spider mode; pressing it again after landing returns the cat toward the floor. Use A/D or arrow keys for horizontal movement, with no autorun. Create original pixel art with the cozy, playful machinery and readable room composition suggested by CATO: Buttered Cat, without copying its artwork, characters, levels, music, or branding. Teach the rules through eight increasingly involved rooms. Include spikes, elevated surfaces, collectible moon seals, switches and gates, clear completion, quick retries, keyboard and touch controls, and sound that the player can mute. Deliver a dependency-free browser game and a portable offline build.

## Sprint 1 — movement contract
**Build prompt:** Separate deterministic simulation from rendering and input. Implement a grounded black cat, horizontal collision, rapid gravity inversion on one press, first-surface landing, spikes, and explicit playing/dead/complete states. Create a minimal playable canvas room.

**Verification prompt:** Exercise the simulation independently of the browser. Check floor/ceiling round trips, edge-triggered input, no repeated inversion while airborne, wall bounds, collision during fast travel, intermediate platform landing, and frozen dead/complete states. Fix seam failures before adding puzzles. Record build and verification reports.

## Sprint 2 — puzzle contract
**Build prompt:** Add eight authored rooms teaching inversion, collecting moon seals, traversing alternating hazards, latching switches, opening gates, and landing on shelves. All seals are required for the exit. Keep room definitions immutable and restart state fresh. Supply reproducible solution routes separate from player hints.

**Verification prompt:** Replay every intended route through the real simulation without teleporting. Require zero deaths, collected seals, and completion in all eight rooms. Check closed gates, switch-to-gate identity, restart isolation, hazard resets, and frame-rate consistency. Validate every level's geometry and references. Record build and verification reports.

## Sprint 3 — complete experience
**Build prompt:** Give the game a cohesive original pixel-art presentation, expressive animated cat, flip trails, room transitions, particles, optional synthesized audio, room picker, hints, pause/restart, touch controls, and defensive local progress. Package a double-clickable offline build and document controls and architecture.

**Verification prompt:** Re-run simulation/solution tests and the build. Check actual browser input, Space press/release behavior, menu and restart seams, pause/focus changes, completion, mobile layout, and console errors. Inspect a rendered screenshot. Distinguish automated checks from browser checks and unperformed checks. Record final build and verification reports with limitations.

## Expansion sprint 4 — new mechanics
**Build prompt:** Preserve the original eight rooms and their saves. Add real gaps in the floor, gravity-inversion-blocking fields, and pressure plates that summon a moving platform while occupied and release it to return when vacated. Carry cats on both platform faces and handle contact, crushing, restart, and pause safely.

**Verification prompt:** Re-run the original suite. Test pit lips and falling deaths, field entry/exit and in-flight traversal, pressure-plate activation/release, horizontal and vertical riders, side contact/crushing, fresh state, and frame-rate consistency. Record the sprint report before authoring rooms.

## Expansion sprint 5 — four more rooms
**Build prompt:** Append four rooms teaching pits, fields, a floor-button/inverted-platform ferry, and their combination. Make the ferry necessary to reach a new area. Give each mechanic clear original pixel visuals and feedback; update room counts and preserve completed-room indices. Rebuild the same portable artifact.

**Verification prompt:** Replay all twelve rooms through the simulation and app input, including timed waits for pressure plates and rides. Check field feedback and retry/reset seams. Inspect the expanded picker and new rooms in the browser, including a phone viewport. Report actual checks and any unverified device behavior.

## Reference
Visual reference reviewed: https://store.steampowered.com/app/1999520/CATO_Buttered_Cat/ . No third-party art, audio, fonts, or runtime dependencies are included.
