# Nine Lives Above

An original, twelve-room puzzle game about a black cat exploring a moonlit house. Space rapidly flips gravity toward the opposite surface; walk, collect all moon seals, and reach the doorway. Switches latch gates open until you restart. Intermediate shelves catch the cat, just like floors and ceilings.

## Play
Double-click **dist/Nine-Lives-Above.html**. It includes everything and works offline, with no installs. Or run `npm start` (Node.js) and open http://127.0.0.1:4173 .

- Left / Right or A / D: walk.
- Space: flip gravity once per press, after landing. Movement commits vertically during a flip.
- R: restart the current room.
- Escape: pause / resume. Leaving the window automatically pauses.
- Touch: use the on-screen movement and flip buttons.
- Collect every moon to open the exit. Pink thorns cause a quick, unlimited retry.
- Dark pits are real holes in the floor. Falling out of the room also causes a retry.
- Violet **NO FLIP** fields block inversion while any part of the cat is inside. Walk out to flip again; existing gravity stays unchanged.
- Orange **STAND HERE** pressure plates call the matching ferry while occupied. Wait for “Ferry ready,” then flip onto its underside and ride its return trip. These plates release when you leave, unlike the original gate switches.
- Rooms: choose any room or revisit completed rooms. Sound: toggle optional effects.

Completion and sound preference are saved on this browser/device when storage is available. Blocked or corrupt storage does not stop play. File-based storage support varies by browser. Reduced-motion system preferences reduce particles, trails, and decorative animation. Keyboard-accessible menus are provided; the visual puzzle canvas is not a fully nonvisual game.

## New rooms
The expansion starts at **Room 9** in the Rooms menu: *A gap in the house*, *A change of atmosphere*, *Please mind the gap*, and *The quiet crossing*. The first eight rooms retain their order and saved completion indices. Refresh or reopen the same standalone HTML file to load the update; saves remain tied to the same browser and file path/origin.

## Build and verification
`npm test` runs the Node built-in tests with no packages to install. `npm run build` produces the standalone HTML file. See [PROMPTS.md](PROMPTS.md) for the master prompt and the short build/verification sequence, and [reports](reports/) for a report after every sprint.

Architecture: `src/engine.js` owns deterministic collision and puzzle state; `src/levels.js` contains frozen room data and developer solution routes; `src/render.js` draws original pixel artwork; `src/app.js` owns keyboard/touch input, fixed-timestep simulation, audio, menus, and feedback; `src/progress.js` handles defensive storage. Renderer and UI consume engine state and events. No runtime dependencies, downloaded assets, analytics, or network calls.

Visual inspiration: [CATO: Buttered Cat](https://store.steampowered.com/app/1999520/CATO_Buttered_Cat/). Surface switching was inspired by Geometry Dash's spider mode. All included artwork, levels, and synthesized sounds were authored for this project. This is a compact browser game, not a Steam executable or a reproduction of either reference game.
