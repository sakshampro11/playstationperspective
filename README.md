# PlayStation Perspective - The Ultimate XMB Emulator

> Experience the nostalgia of the 2000s handheld king, right in your browser.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Build](https://img.shields.io/badge/build-Vanilla_JS-orange)
![License](https://img.shields.io/badge/license-MIT-green)

---

## The problem

You miss the satisfying *click-clack* of the XMB. You miss the flowing ribbons of the dynamic background. Most emulators are too heavy, or they focus only on running ISOs, ignoring the beautiful interface that made the PSP legendary.

Generic web interfaces are boring. They lack the soul of the 2004 handheld era.

## What PlayStation Perspective does

PlayStation Perspective is a high-fidelity, interactive reconstruction of the PSP's XrossMediaBar (XMB). It doesn't just look like a PSP; it feels like one. From the iconic boot sound to the rhythmic wave of the background, every detail is engineered for nostalgia.

It comes packed with a suite of built-in mini-games that run directly within the virtual screen, mapped to the familiar PSP controls.

**Key Highlights:**
- **Dynamic XMB Navigation**: Fully functional category and item scrolling with original sound effects.
- **Classic Boot Sequence**: The "Sony Computer Entertainment" intro we all know and love.
- **3D Interactive Shell**: A volumetric, rotatable PSP body rendered entirely in CSS 3D transforms.
- **Dynamic Themes**: The background color shifts automatically based on the month, just like the original hardware.

---

## Features

- **Moves with your Mouse** — The entire PSP body is a 3D object that tilts and responds to your cursor.
- **Pure Vanilla Stack** — No React, no Vue, no bloated libraries. Just optimized HTML, CSS, and JS.
- **Integrated Game Engine** — Switch between 6 different mini-games without a single page reload.
- **Web Audio Synthesis** — Chimes and clicks are synthesized in real-time for maximum responsiveness.
- **Authentic Font Rendering** — Uses custom headers to replicate the premium feel of the original UI.

---

## The Mini-Games

No PSP experience is complete without games. We've built 6 signature experiences into the interface:

- **Snake**: The timeless classic, adapted for the PSP screen.
- **Tower Stacker**: A test of timing. How high can you build?
- **Pinball**: Physics-based arcade action with multiple bumpers and high-speed flippers.
- **Click Speed**: A frantic challenge to see how many inputs you can register in 10 seconds.
- **Typing Test**: Challenge your Words Per Minute (WPM) on a specialized track.
- **Simon Says**: Follow the light pattern on the △ ◯ ✕ ▢ buttons to test your memory.

---

## How it works

This project is a masterclass in Vanilla Web Development. 

1. **The 3D Shell**: Built using CSS `transform-style: preserve-3d` and multiple layers to create a volumetric handheld body.
2. **The Wave Engine**: Uses SVG filters and CSS keyframe animations to replicate the floating "ribbon" effect of the XMB background.
3. **The Game Loop**: Each mini-game runs on a dedicated `requestAnimationFrame` loop or localized interval, keeping the logic decoupled from the UI.
4. **Audio Context**: Uses the Web Audio API to synthesize chords and sound effects in real-time for that authentic resonant chime.

---

## Setting up (Local)

Simply clone the repository and open the index:

```bash
git clone https://github.com/xenkzu/playstationperspective.git
cd playstationperspective
# Open index.html in your browser
```

Or use the included scripts if you have Node.js:
```bash
npm install
npm start
```

---

## Project Structure

We follow a clean, industry-standard organization:

- `index.html`: The main entry point.
- `src/`:
  - `css/`: Styling for the XMB, Boot sequence, and Games.
  - `js/`: 
    - `boot.js`: Handles the startup sequence and audio initialization.
    - `games.js`: The central engine for all 6 mini-games.
- `assets/img/`: High-quality vector assets and icons.
- `docs/`: Original drafts and design notes.

---

## Controls

| Action | Keyboard | Virtual Button |
| :--- | :--- | :--- |
| Navigate Up | `W` / `ArrowUp` | D-Pad Up |
| Navigate Down | `S` / `ArrowDown` | D-Pad Down |
| Navigate Left | `A` / `ArrowLeft` | D-Pad Left |
| Navigate Right | `D` / `ArrowRight` | D-Pad Right |
| Confirm / Select | `S` / `Enter` | ✕ Button |
| Back / Cancel | `D` / `Backspace` | ◯ Button |

---

## Privacy & Performance
Everything runs locally on your machine. No data is sent to external servers. The use of Vanilla JS ensures that the application remains lightweight and fast even on older hardware.

## Contributing
Pull requests are welcome. If you'd like to add a new mini-game or improve the 3D CSS model, feel free to fork and submit a PR.

---

## License
MIT © 2026
