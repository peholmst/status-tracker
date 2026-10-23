import { useCallback, useEffect, useState } from 'react'
import type { Timestamps } from './statuses'

const STORAGE_KEY = 'statusTracker.timestamps.v1'

function load(): Timestamps {
  const result: Timestamps = {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return result
    const parsed = JSON.parse(raw) as Partial<Record<string, unknown>>
    for (const [id, list] of Object.entries(parsed)) {
      if (Array.isArray(list)) {
        result[id] = list.filter((t): t is number => typeof t === 'number')
      }
    }
  } catch {
    // Corrupt or unavailable storage: start empty rather than crash.
  }
  return result
}

function save(timestamps: Timestamps) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timestamps))
  } catch {
    // Storage full or blocked; state still lives in memory for this session.
  }
}

export function useTimestamps() {
  const [timestamps, setTimestamps] = useState<Timestamps>(load)

  useEffect(() => save(timestamps), [timestamps])

  // Keep multiple open tabs/windows in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setTimestamps(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const record = useCallback((id: string) => {
    const now = Date.now()
    setTimestamps((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), now] }))
  }, [])

  const clear = useCallback(() => setTimestamps({}), [])

  return { timestamps, record, clear }
}
