import 'dotenv/config'
import { app, BrowserWindow, safeStorage } from 'electron'
import { join } from 'node:path'
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'

const { ST_CLIENT_ID, ST_CLIENT_SECRET } = process.env
if (!ST_CLIENT_ID || !ST_CLIENT_SECRET) {
  throw new Error('Missing ST_CLIENT_ID or ST_CLIENT_SECRET in .env')
}

const TOKEN_URL = 'https://api.smartthings.com/oauth/token'
const REDIRECT = 'https://httpbin.org/get'
const REFRESH_MARGIN_MS = 60_000

interface Tokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

let cached: Tokens | null = null

function tokensPath(): string {
  return join(app.getPath('userData'), 'tokens.bin')
}

function readTokensFromDisk(): Tokens | null {
  const path = tokensPath()
  if (!existsSync(path)) return null
  try {
    return JSON.parse(safeStorage.decryptString(readFileSync(path)))
  } catch {
    return null
  }
}

function loadTokens(): Tokens | null {
  if (!cached) cached = readTokensFromDisk()
  return cached
}

function saveTokens(tokens: Tokens): void {
  cached = tokens
  writeFileSync(tokensPath(), safeStorage.encryptString(JSON.stringify(tokens)))
}

function clearTokens(): void {
  cached = null
  const path = tokensPath()
  if (existsSync(path)) unlinkSync(path)
}

async function requestTokens(params: Record<string, string>): Promise<Tokens> {
  const basic = Buffer.from(`${ST_CLIENT_ID}:${ST_CLIENT_SECRET}`).toString('base64')
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({ client_id: ST_CLIENT_ID!, ...params }),
    signal: AbortSignal.timeout(5000)
  })
  if (!res.ok) throw new Error(`OAuth ${res.status}: ${await res.text()}`)
  const j = await res.json()
  return {
    accessToken: j.access_token,
    refreshToken: j.refresh_token ?? params.refresh_token,
    expiresAt: Date.now() + j.expires_in * 1000
  }
}

// Tracked so the tray popover's blur-to-hide behavior can be suspended while this window has
// focus — otherwise opening it steals focus from the popover and immediately hides it.
let loginWindowOpen = false
export function isLoginWindowOpen(): boolean {
  return loginWindowOpen
}

function getAuthCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    loginWindowOpen = true
    const win = new BrowserWindow({ width: 500, height: 700 })
    // Sits above the popover's own 'floating' level so it's always visible in front of it.
    win.setAlwaysOnTop(true, 'screen-saver')
    const url =
      'https://api.smartthings.com/oauth/authorize?' +
      new URLSearchParams({
        client_id: ST_CLIENT_ID!,
        response_type: 'code',
        redirect_uri: REDIRECT,
        scope: 'r:devices:* x:devices:*'
      })
    win.webContents.on('will-redirect', (event, target) => {
      if (!target.startsWith(REDIRECT)) return
      event.preventDefault()
      const code = new URL(target).searchParams.get('code')
      win.close()
      code ? resolve(code) : reject(new Error('No code returned'))
    })
    win.on('closed', () => {
      loginWindowOpen = false
      reject(new Error('Login cancelled'))
    })
    win.loadURL(url)
  })
}

let loggingIn: Promise<Tokens> | null = null

function login(): Promise<Tokens> {
  if (!loggingIn) {
    loggingIn = getAuthCode()
      .then((code) =>
        requestTokens({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT })
      )
      .then((tokens) => {
        saveTokens(tokens)
        return tokens
      })
      .finally(() => {
        loggingIn = null
      })
  }
  return loggingIn
}

let refreshing: Promise<Tokens> | null = null

function refreshTokens(refreshToken: string): Promise<Tokens> {
  if (!refreshing) {
    refreshing = requestTokens({ grant_type: 'refresh_token', refresh_token: refreshToken })
      .then((fresh) => {
        saveTokens(fresh)
        return fresh
      })
      .catch((err) => {
        if (err instanceof Error && err.message.includes('invalid_grant')) {
          clearTokens()
          return login()
        }
        throw err
      })
      .finally(() => {
        refreshing = null
      })
  }
  return refreshing
}

export async function getAccessToken(): Promise<string> {
  const tokens = loadTokens()

  if (!tokens) {
    return (await login()).accessToken
  }

  if (tokens.expiresAt - Date.now() < REFRESH_MARGIN_MS) {
    return (await refreshTokens(tokens.refreshToken)).accessToken
  }

  return tokens.accessToken
}

export function invalidateAccessToken(): void {
  if (cached) cached.expiresAt = 0
}
