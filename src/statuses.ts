import config from './config/statuses.json'
import type { Language } from './i18n'

export interface Status {
  /** System ID, used as the storage key. Keep stable once in use. */
  id: string
  label: Record<Language, string>
}

function validate(raw: unknown): Status[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error('statuses.json must be a non-empty array')
  }
  const seen = new Set<string>()
  return raw.map((entry, i) => {
    const { id, label } = (entry ?? {}) as Partial<Status>
    if (typeof id !== 'string' || id === '') {
      throw new Error(`statuses.json[${i}]: "id" must be a non-empty string`)
    }
    if (seen.has(id)) throw new Error(`statuses.json: duplicate id "${id}"`)
    seen.add(id)
    if (typeof label?.fi !== 'string' || typeof label?.sv !== 'string') {
      throw new Error(`statuses.json[${i}] ("${id}"): "label.fi" and "label.sv" are required`)
    }
    return { id, label: { fi: label.fi, sv: label.sv } }
  })
}

export const STATUSES: readonly Status[] = validate(config)

/** Timestamps (epoch ms) per status ID, oldest first. */
export type Timestamps = Record<string, number[]>
