import { app } from 'electron'
import { config } from 'dotenv'
import { join } from 'node:path'

// In dev, electron-vite runs with cwd = project root, so dotenv's default lookup (process.cwd())
// already finds .env there. A packaged .app has no project directory at all — electron-builder's
// extraResources config copies .env into Contents/Resources at build time, so a packaged app
// needs to be pointed at process.resourcesPath explicitly instead.
config(app.isPackaged ? { path: join(process.resourcesPath, '.env') } : undefined)
