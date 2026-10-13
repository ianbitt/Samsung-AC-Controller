# AC Controller

A macOS menu bar app that controls a Samsung air conditioner through the SmartThings API — power, temperature, mode, fan speed, swing, special modes (sleep/quiet/windFree/...), self-clean, and live telemetry (humidity, power draw, filter status).

No Dock icon, no normal window — it lives entirely in the menu bar as a small popover.

## Requirements

- A Samsung air conditioner already set up in the SmartThings app, with its device id (`AC_ID`).
- A SmartThings OAuth app, created in the [SmartThings developer workspace](https://smartthings.developer.samsung.com/):
  - Redirect URI: `https://httpbin.org/get`
  - Scopes: `r:devices:*`, `x:devices:*`
  - This gives you `ST_CLIENT_ID` / `ST_CLIENT_SECRET`.
- macOS (the tray/menu-bar behavior — `app.dock.hide()`, `setLoginItemSettings`, etc. — is macOS-specific).

## Setup

```bash
npm install
cp .env.example .env
# fill in ST_CLIENT_ID, ST_CLIENT_SECRET, AC_ID in .env
npm run dev
```

On first launch (no saved tokens yet), opening the popover triggers the SmartThings login window. After signing in once, tokens are cached (OS-encrypted, via Electron's `safeStorage`) and refreshed automatically — later launches go straight through.

## Using it

- **Left-click** the tray icon (or press **⌥⌘A**) to toggle the popover.
- **Right-click** the tray icon for: Refresh status, Open at Login, Quit.
- The popover also auto-refreshes every time it opens, and polls every 45s while visible.

## Scripts

- `npm run dev` — run in development
- `npm run typecheck` / `npm run lint` — checks
- `npm run build:mac` — build the macOS app bundle
