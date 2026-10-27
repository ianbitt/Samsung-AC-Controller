import { app, safeStorage } from 'electron'
import { join } from 'node:path'
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'

interface StoredConfig {
  clientId?: string
  clientSecret?: string
  acId?: string
}

export type ConfigState = 'unconfigured' | 'needs-device' | 'ready'

let cached: StoredConfig | null = null

function configPath(): string {
  return join(app.getPath('userData'), 'config.bin')
}

function readStored(): StoredConfig {
  if (cached) return cached
  const path = configPath()
  let parsed: StoredConfig = {}
  if (existsSync(path)) {
    try {
      parsed = JSON.parse(safeStorage.decryptString(readFileSync(path)))
    } catch {
      parsed = {}
    }
  }
  cached = parsed
  return parsed
}

function writeStored(config: StoredConfig): void {
  cached = config
  writeFileSync(configPath(), safeStorage.encryptString(JSON.stringify(config)))
}

// Lets a dev checkout with a real .env keep working with zero setup: an install that has
// never gone through onboarding (no config.bin yet) transparently resolves to the author's
// own .env values, while anything saved through the in-app flow takes priority over it.
function envSeed(): StoredConfig {
  return {
    clientId: process.env.ST_CLIENT_ID,
    clientSecret: process.env.ST_CLIENT_SECRET,
    acId: process.env.AC_ID
  }
}

function effective(): StoredConfig {
  const stored = readStored()
  const seed = envSeed()
  return {
    clientId: stored.clientId ?? seed.clientId,
    clientSecret: stored.clientSecret ?? seed.clientSecret,
    acId: stored.acId ?? seed.acId
  }
}

export function getConfigState(): ConfigState {
  const { clientId, clientSecret, acId } = effective()
  if (!clientId || !clientSecret) return 'unconfigured'
  if (!acId) return 'needs-device'
  return 'ready'
}

export function getClientCredentials(): { clientId: string; clientSecret: string } | null {
  const { clientId, clientSecret } = effective()
  return clientId && clientSecret ? { clientId, clientSecret } : null
}

export function getAcId(): string | null {
  return effective().acId ?? null
}

export function saveClientCredentials(clientId: string, clientSecret: string): void {
  // Changing accounts can change which devices exist, so drop any previously selected
  // device - this naturally routes the caller back to the device-picker step.
  writeStored({ clientId, clientSecret })
}

export function saveAcId(acId: string): void {
  writeStored({ ...readStored(), acId })
}

export function resetAll(): void {
  cached = {}
  const path = configPath()
  if (existsSync(path)) unlinkSync(path)
}
