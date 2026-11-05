# Installation Guide — BG Remover

This guide covers setup for the **web app** and **Windows desktop build** located in `BG-REMOVER-main/`.

## 1) Prerequisites
- **Node.js**: 20+ recommended (verified with Node 24.x)
- **npm**: comes with Node (verified with npm 11.x)
- **Windows PowerShell/CMD** for desktop packaging commands
- Internet access: first AI background-removal run may download model/runtime assets in the browser/app session

Check versions:
```powershell
node --version
npm --version
```

## 2) Get the project
Project path in this workspace:
```text
BG-REMOVER\BG-REMOVER-main
```

Open terminal in that folder:
```powershell
cd "D:\OneDrive\OneDrive - CINE TV ARTIST WELFARE ASSOCIATION\CTAWA\AAAAAA Management\MK\AAAAAAAAAAAA LAPTOP\Downloads\BG-REMOVER\BG-REMOVER-main"
```

## 3) Install dependencies
```powershell
npm install
```

Notes:
- Install may take a few minutes (Electron/builder and ML assets are large).
- Some packages may show deprecation warnings; they do not necessarily block the app.

## 4) Run the web app (development)
```powershell
npm run dev
```
Default config runs Vite on port `3000` (`--port=3000 --host=0.0.0.0`). Open the printed local URL in your browser.

## 5) Production web build + preview (working demo)
```powershell
npm run build
npm run preview
```
This verifies the production bundle and serves it locally.

## 6) Desktop app (Electron)
### Run desktop shell from built files
```powershell
npm install
npm run desktop:dev
```
This builds the web app and launches Electron.

### Build Windows executables
```powershell
npm install
npm run desktop:build
```
Outputs in `release/`:
- Portable `.exe` (x64)
- NSIS installer (x64)

If packaging fails:
- Ensure dependencies installed completely.
- Retry after deleting `node_modules` and `package-lock.json` only if necessary (prefer keeping lockfile).
- Run PowerShell as a normal user first; elevated permissions usually not required.
- Corporate proxy/firewall can block Electron binary downloads.

## 7) Environment variables
- `.env.example` is included (AI Studio template).
- Core background removal uses `@imgly/background-removal` client-side. Add `.env.local` values only if you enable features that require them.

## 8) Troubleshooting
| Issue | What to check |
|---|---|
| `npm install` slow/fails | Network/proxy, disk space, retry install; Electron download can be large |
| AI removal slow on first run | Model assets may download/initialize; wait for progress UI |
| AI removal unsupported/fails | App has fallback/manual adjustment path; try a modern Chromium/Edge browser |
| Blank desktop window | Confirm `npm run build` created `dist/`; `vite.config.ts` uses `base: './'` |
| Port 3000 in use | Change Vite port or stop conflicting process |

## 9) Quick verification checklist
- [ ] `npm install` completes
- [ ] `npm run build` completes and creates `dist/`
- [ ] `npm run preview` opens UI
- [ ] Upload image → background removed or fallback works
- [ ] Adjust/export produces 227×253 PNG / ZIP
- [ ] `npm run desktop:build` produces `release/` artifacts (Windows packaging environment)
