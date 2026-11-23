import { useEffect, useState } from 'react'

/** Persist non-sensitive form drafts locally so accidental refreshes do not erase work. */
export function usePersistentDraft<T>(key: string, initialValue: T): [T, (value: T | ((current: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved === null ? initialValue : JSON.parse(saved) as T
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage may be unavailable or full; the form remains usable in memory.
    }
  }, [key, value])

  return [value, setValue]
}
