export function readLocalValue(key: string): unknown {
  if (typeof window === 'undefined') return undefined
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? 'null')
  } catch {
    return undefined
  }
}

export function writeLocalValue(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}
