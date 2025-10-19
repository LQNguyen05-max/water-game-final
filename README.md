# Drip to the Dunes

A small browser game built with HTML/CSS/JS where players catch falling water drops with a bucket, collect water, and deliver it to a village (charity-themed).

This README explains how to run the project locally, where to customize gameplay (difficulty, sounds, footer), and common troubleshooting tips.

---

## Quick Start (open locally)

1. Clone or download the project folder.
2. Open `index.html` in a browser (Chrome, Edge, Firefox recommended).

> Note: for best results serve the folder via a simple static server (recommended). Example using Python 3 in the project root:
>
> ```powershell
> # run in Powershell
> python -m http.server 8000
> # then open http://localhost:8000 in your browser
> ```

## Project structure

- `index.html` — main page and all UI HTML.
- `style.css` — styling for game UI, footer, modals and responsive rules.
- `script.js` — game logic (drop spawning, collision, difficulty, camel finale, sounds).
- `img/` — images used by the game (bucket, camel, village, etc.).
- `sounds/` — audio assets (put `camel-explode.mp3` or `.mp4` here).
- `README.md` — this file.

## Features & Customization

### Difficulty modes
- The start modal includes a `Difficulty` select (`#difficulty-select`): Easy, Medium, Hard.
- Difficulty presets are defined in `script.js` (`difficultySettings`). They control:
	- `dropInterval` — time between spawns
	- `dropSpeed` — how fast drops fall
	- `bucketSpeed` — how fast player moves the bucket
	- `maxWater` — required drops to win
	- `gameDuration` — seconds before timeout

To tweak difficulty, edit the `difficultySettings` object near the top of `script.js`.

### Footer and charity links
- The footer contains a prominent "Visit charity: water" link and a Donate button.
- Footer styles are in `style.css`. To change the background image put a file in `img/footer-bg.jpg` or update the CSS to use another image (e.g., `img/village.jpg`).

### Fonts
- Uses Google Fonts (Poppins for headings/UI and Inter for body) loaded in `index.html` head. Edit the link to change weights or replace fonts.

### Sounds
- Add the camel explosion sound at `sounds/camel-explode.mp4` (or `.mp3`). The HTML includes an `<audio id="camel-explode-sfx">` element and `script.js` calls `playCamelExplosionSfx()` when the camel pops in the finale.
- Browser autoplay rules: audio should work after the player has interacted with the page (Start button). If a sound doesn't play, check the browser console for autoplay policy messages.

## Developer tips
- Collision robustness: the game uses swept-AABB collision detection (inside `animateDrops()` in `script.js`) to avoid "tunneling" when drops move fast.
- Spawning and bounds: drops spawn inside `#drops-area` and are removed when they fall past the bottom of that area.
- Debugging collisions: you can temporarily draw bounding boxes in `animateDrops()` to visualize collisions.

## Troubleshooting
- No sound: confirm the file exists in `sounds/` and the browser console shows no CORS or 404 errors. Convert to `.mp3` if playback fails.
- Drops not collectable at high difficulty: the code uses swept collision to avoid tunneling — if it still feels unfair tweak `bucketSpeed` or reduce `dropSpeed` in `difficultySettings`.
- CSS not applied: ensure `style.css` path is correct and the browser cache is cleared (Ctrl+F5).

## Contribution
- Small changes are welcome: open a PR and test on desktop and mobile.
- Keep assets (images/audio) under permissive licenses.

---

If you'd like, I can:
- Add a small live server `npm` script and a `package.json` with http-server.
- Convert the camel sound to an `mp3` fallback and include a brief visual pop animation synchronized to sound.
- Add tests for key game functions (collision math) as unit tests.

Which would you like next?