/**
 * Guarded localStorage access for Companion's saved animation cycles.
 * Pattern taken from the reference engine's own storage module (see
 * THIRD_PARTY_NOTICES.md): touching localStorage can *throw*, not just
 * fail — blocked cookies, third-party iframe, enterprise policy — and if
 * that exception isn't caught, it can take the whole app down for a
 * browser setting that has nothing to do with watching an animation. We
 * lose persistence, never the app.
 */

const PREFIX = 'koink:companion:'

export function storageKey(name: 'cycles' | 'activeCycle'): string {
  return `${PREFIX}${name}`
}

export function readStorage(name: 'cycles' | 'activeCycle'): string | null {
  try {
    return localStorage.getItem(storageKey(name))
  } catch {
    return null
  }
}

export function writeStorage(name: 'cycles' | 'activeCycle', value: string): void {
  try {
    localStorage.setItem(storageKey(name), value)
  } catch {
    // storage refused or full: continue without persisting
  }
}
