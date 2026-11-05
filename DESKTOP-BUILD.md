# BG Remover Desktop (Windows)

## Run as desktop app (development, uses built web files)
1. `npm install`
2. `npm run desktop:dev`

## Build Windows desktop app (.exe)
1. `npm install`
2. `npm run desktop:build`

Output:
- `release/` contains a **portable .exe** and an **NSIS installer** (x64).

Notes:
- The app is the same React/Vite UI wrapped in Electron.
- Vite `base` is set to `./` so assets load from `dist/` inside Electron.
- Background removal runs client-side via `@imgly/background-removal`; first run may download model assets.
