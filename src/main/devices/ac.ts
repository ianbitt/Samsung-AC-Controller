import '../env'
import { getAccessToken, invalidateAccessToken } from '../auth'

const BASE = 'https://api.smartthings.com/v1/devices'
const TIMEOUT_MS = 5000
const { AC_ID } = process.env
if (!AC_ID) throw new Error('Missing AC_ID in .env')

async function authHeaders(): Promise<Record<string, string>> {
  return { Authorization: `Bearer ${await getAccessToken()}`, 'Content-Type': 'application/json' }
}

async function request(url: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: await authHeaders(),
    signal: AbortSignal.timeout(TIMEOUT_MS)
  })
  if (res.status !== 401) return res
  invalidateAccessToken()
  return fetch(url, {
    ...init,
    headers: await authHeaders(),
    signal: AbortSignal.timeout(TIMEOUT_MS)
  })
}

const AC_MODES = ['auto', 'cool', 'dry', 'wind'] as const
export type AcMode = (typeof AC_MODES)[number]
export const isAcMode = (m: unknown): m is AcMode => AC_MODES.includes(m as AcMode)

const AC_FAN_MODES = ['auto', 'low', 'medium', 'high', 'turbo'] as const
export type AcFanMode = (typeof AC_FAN_MODES)[number]
export const isAcFanMode = (m: unknown): m is AcFanMode => AC_FAN_MODES.includes(m as AcFanMode)

const FAN_OSCILLATION_MODES = ['fixed', 'vertical', 'horizontal', 'all'] as const
export type FanOscillationMode = (typeof FAN_OSCILLATION_MODES)[number]
export const isFanOscillationMode = (m: unknown): m is FanOscillationMode =>
  FAN_OSCILLATION_MODES.includes(m as FanOscillationMode)

const AC_OPTIONAL_MODES = ['off', 'sleep', 'quiet', 'speed', 'windFree', 'windFreeSleep'] as const
export type AcOptionalMode = (typeof AC_OPTIONAL_MODES)[number]
export const isAcOptionalMode = (m: unknown): m is AcOptionalMode =>
  AC_OPTIONAL_MODES.includes(m as AcOptionalMode)

const AUTO_CLEANING_MODES = ['on', 'off'] as const
export type AutoCleaningMode = (typeof AUTO_CLEANING_MODES)[number]
export const isAutoCleaningMode = (m: unknown): m is AutoCleaningMode =>
  AUTO_CLEANING_MODES.includes(m as AutoCleaningMode)

export interface AcStatus {
  power: 'on' | 'off'
  mode: string
  targetTemperature: number
  currentTemperature: number
  unit: 'C' | 'F'
  supportedModes: AcMode[]
  fanMode: AcFanMode
  supportedFanModes: AcFanMode[]
  swingMode: FanOscillationMode
  supportedSwingModes: FanOscillationMode[]
  optionalMode: AcOptionalMode
  supportedOptionalModes: AcOptionalMode[]
  humidity: number
  powerWatts: number
  filterStatus: string
  autoCleaningMode: AutoCleaningMode
  autoCleaningState: string
  autoCleaningProgress: number
}

async function sendCommand(
  capability: string,
  command: string,
  args: unknown[] = []
): Promise<void> {
  const res = await request(`${BASE}/${AC_ID}/commands`, {
    method: 'POST',
    body: JSON.stringify({
      commands: [{ component: 'main', capability, command, arguments: args }]
    })
  })
  if (!res.ok) throw new Error(`SmartThings ${res.status}: ${await res.text()}`)
}

async function getStatus(): Promise<AcStatus> {
  const res = await request(`${BASE}/${AC_ID}/components/main/status`)
  if (!res.ok) throw new Error(`SmartThings ${res.status}: ${await res.text()}`)
  const s = await res.json()
  return {
    power: s.switch.switch.value,
    mode: s.airConditionerMode.airConditionerMode.value,
    targetTemperature: s.thermostatCoolingSetpoint.coolingSetpoint.value,
    currentTemperature: s.temperatureMeasurement.temperature.value,
    unit: s.thermostatCoolingSetpoint.coolingSetpoint.unit,
    supportedModes: (s.airConditionerMode.supportedAcModes?.value ?? []).filter(isAcMode),
    fanMode: s.airConditionerFanMode.fanMode.value,
    supportedFanModes: (s.airConditionerFanMode.supportedAcFanModes?.value ?? []).filter(
      isAcFanMode
    ),
    swingMode: s.fanOscillationMode.fanOscillationMode.value,
    supportedSwingModes: (s.fanOscillationMode.supportedFanOscillationModes?.value ?? []).filter(
      isFanOscillationMode
    ),
    optionalMode: s['custom.airConditionerOptionalMode'].acOptionalMode.value,
    supportedOptionalModes: (
      s['custom.airConditionerOptionalMode'].supportedAcOptionalMode?.value ?? []
    ).filter(isAcOptionalMode),
    humidity: s.relativeHumidityMeasurement.humidity.value,
    powerWatts: s.powerConsumptionReport.powerConsumption.value.power,
    filterStatus: s['custom.dustFilter'].dustFilterStatus.value,
    autoCleaningMode: s['custom.autoCleaningMode'].autoCleaningMode.value,
    autoCleaningState: s['custom.autoCleaningMode'].operatingState.value,
    autoCleaningProgress: s['custom.autoCleaningMode'].progress.value
  }
}

export const ac = {
  on: () => sendCommand('switch', 'on'),
  off: () => sendCommand('switch', 'off'),
  setTemperature: (temp: number) =>
    sendCommand('thermostatCoolingSetpoint', 'setCoolingSetpoint', [temp]),
  setMode: (mode: AcMode) => sendCommand('airConditionerMode', 'setAirConditionerMode', [mode]),
  setFanMode: (mode: AcFanMode) => sendCommand('airConditionerFanMode', 'setFanMode', [mode]),
  setSwingMode: (mode: FanOscillationMode) =>
    sendCommand('fanOscillationMode', 'setFanOscillationMode', [mode]),
  setOptionalMode: (mode: AcOptionalMode) =>
    sendCommand('custom.airConditionerOptionalMode', 'setAcOptionalMode', [mode]),
  setAutoCleaningMode: (mode: AutoCleaningMode) =>
    sendCommand('custom.autoCleaningMode', 'setAutoCleaningMode', [mode]),
  getStatus
}
