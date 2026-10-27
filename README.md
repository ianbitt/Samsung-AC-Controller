# AC Controller

A macOS menu bar app that controls a Samsung air conditioner through the SmartThings API — power, temperature, mode, fan speed, swing, special modes (sleep/quiet/windFree/...), self-clean, and live telemetry (humidity, power draw, filter status).

No Dock icon, no normal window — it lives entirely in the menu bar as a small popover.

## Installing it (no coding experience needed)

Someone sent you the app, or you downloaded a `.dmg` of it? Follow these steps exactly — none of
them require knowing how to code, but step 3 does need a few commands typed into the Terminal
app. Just copy-paste them, you don't need to understand them.

**What you need first:**
- A Mac.
- Your Samsung air conditioner already added to **your own** SmartThings app/account (the regular
  Samsung SmartThings phone app — if you control your AC from your phone today, you're set).

### 1. Install the app

Double-click the `.dmg` file, then drag **AC Controller** into Applications, same as any other
Mac app.

### 2. Open it for the first time

macOS will likely refuse to open it with a message like *"Apple could not verify this app..."*
— that's expected, since this isn't an app from the App Store. To open it anyway:

1. Try double-clicking it once (it'll get blocked).
2. Open **System Settings → Privacy & Security**, scroll down, and you'll see a note about
   "AC Controller" being blocked. Click **Open Anyway**.
3. Confirm again if asked. It should now open and show its icon in the menu bar (top-right of
   your screen, near the clock/WiFi icons).

### 3. One-time SmartThings setup

This app needs permission to talk to your SmartThings account, and currently the only way to set
that up is through one short Terminal session. You'll do this once, ever.

1. Open the **Terminal** app: press `Cmd + Space`, type `Terminal`, press `Enter`.
2. Copy and paste this line, then press `Enter` (this installs the tool you need):
   ```
   npm install -g @smartthings/cli
   ```
   - If you see an error like `command not found: npm`, you need Node.js first. Go to
     [nodejs.org](https://nodejs.org), download the installer (the button marked **LTS**), run
     it like any Mac installer, then come back and run the line above again.
3. Now copy and paste this line and press `Enter`:
   ```
   smartthings apps:create
   ```
   It'll open a browser window asking you to log in — use your own SmartThings account (the same
   one your AC is set up under).
4. Back in the Terminal, it'll ask you a series of questions. Answer exactly like this:
   - **What kind of app do you want to create?** → OAuth-In App (likely the only option)
   - **Display Name** → anything, e.g. `My AC Controller`
   - **Description** → anything, or just press Enter to skip
   - **Icon Image URL** → press Enter to skip
   - **Target URL** → press Enter to skip
   - **Select Scopes** → use the arrow keys and Space bar to check exactly these two, then press
     Enter:
     - `r:devices:*`
     - `x:devices:*`
   - **Redirect URIs** → choose **"Add Redirect URI"**, type `https://httpbin.org/get`, press
     Enter, then choose **"Finish editing Redirect URIs"**.
5. It will print a **Client ID** and a **Client Secret** — two long strings of letters/numbers.
   Keep this Terminal window open, or copy both somewhere safe: they're shown only this once.

### 4. Connect the app

Open **AC Controller** from the menu bar. It shows a **Connect your AC** screen:

1. Paste the **Client ID** and **Client Secret** from step 3 into the matching fields.
2. Click **Connect SmartThings account**. A window pops up asking you to log into SmartThings —
   use your own account again.
3. After logging in, pick your air conditioner from the list shown.

That's it — you're done. See **Using it** below for how the app works day to day.

If you ever need to redo this (e.g. picked the wrong device), right-click the menu bar icon and
choose **Settings…**.

## Using it

- **Left-click** the tray icon (or press **⌥⌘A**) to toggle the popover.
- **Right-click** the tray icon for: Refresh status, Open at Login, Settings…, Quit.
- The popover also auto-refreshes every time it opens, and polls every 45s while visible.

---

## For developers

### Requirements

- A Samsung air conditioner already added to your SmartThings account.
- macOS (the tray/menu-bar behavior — `app.dock.hide()`, `setLoginItemSettings`, etc. — is macOS-specific).
- Your own SmartThings OAuth-In app, with its Client ID and Client Secret. The old web-based
  [SmartThings developer workspace](https://smartthings.developer.samsung.com/) is gone, so this
  is created with the [SmartThings CLI](https://github.com/SmartThingsCommunity/smartthings-cli)
  instead:

  ```bash
  npm install -g @smartthings/cli
  smartthings apps:create
  ```

  Follow the prompts:
  - App type: **OAuth-In App**
  - Scopes: **`r:devices:*`** and **`x:devices:*`**
  - Redirect URI: **`https://httpbin.org/get`** (a trick to capture the OAuth code without
    running a server — SmartThings redirects here with `?code=...` and the app intercepts it
    before the request completes)

  It authenticates via a browser prompt, then prints a **Client ID** and **Client Secret** at the
  end — copy both immediately, they're shown only once. Each person using this app needs their
  own app (and their own AC already in their own SmartThings account) — an unpublished OAuth-In
  app only authorizes the SmartThings account that created it, so these can't be shared between
  installs (see the "Installing it" section above for the non-developer version of this step).

### Setup

```bash
npm install
npm run dev
```

The app itself walks you through the rest: on first launch it shows a **Connect your AC** screen
asking for the Client ID / Client Secret from the step above, then a device picker to choose
which SmartThings device is the AC. Once both are set, opening the popover triggers the
SmartThings login window. After signing in once, tokens are cached (OS-encrypted, via Electron's
`safeStorage`) and refreshed automatically — later launches go straight through.

To redo this later (new credentials, different AC), use **Settings…** from the tray's right-click
menu to reopen the same flow.

Dev-only shortcut: if a `.env` file (see `.env.example`) is present, its `ST_CLIENT_ID`,
`ST_CLIENT_SECRET` and `AC_ID` are used until something is saved through the in-app flow, so a
dev checkout can skip onboarding. Packaged builds never include `.env`, so every real install
goes through the in-app Setup screen above.

### Scripts

- `npm run dev` — run in development
- `npm run typecheck` / `npm run lint` — checks
- `npm run build:mac` — build the macOS app bundle

### Building a release for others

`npm run build:mac` produces a `.dmg` under `dist/`. A few things to know before handing it to
someone else:

- It's built for whichever architecture you ran the build on. If the other person is on a
  different chip (Intel vs Apple Silicon), build a universal binary instead:
  `npm run build && npx electron-builder --mac --universal`.
- The app isn't code-signed or notarized, so Gatekeeper will block it on first open — this is
  covered in plain-language terms in the "Installing it" section at the top of this README, which
  is what you should point people to.
- Nobody's credentials are bundled into the build. Each person needs their own AC on their own
  SmartThings account and their own OAuth-In app, which the "Installing it" section walks them
  through creating themselves.
