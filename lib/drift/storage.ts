import type { Note, TimerState } from './types'

// Same keys as the original app so existing user data survives.
export const STORAGE_KEY = 'drift_notes_v1'
export const ACTIVE_KEY = 'drift_active_note_v1'
export const PROJECTS_KEY = 'drift_projects_v1'
export const TIMER_KEY = 'drift_focus_timer_v1'

export function seedNotes(): Note[] {
  return [
    {
      id: 'n1',
      title: 'Template',
      project: 'default',
      updatedAt: Date.now(),
      body: `Примеры задач для знакомства.

- [ ] Task 1 #must ~2h
- [ ] Task 2 #should ~1h
- [ ] Task 3 #could ~30m`,
    },
  ]
}

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedNotes()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return seedNotes()
    return parsed
  } catch {
    return seedNotes()
  }
}

export function saveNotes(notes: Note[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch {}
}

export function loadProjects(): string[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((p) => typeof p === 'string') : []
  } catch {
    return []
  }
}

export function saveProjects(projects: string[]) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
  } catch {}
}

export function loadActiveNoteId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY)
  } catch {
    return null
  }
}

export function saveActiveNoteId(id: string | null) {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id)
    else localStorage.removeItem(ACTIVE_KEY)
  } catch {}
}

export function loadTimerState(): TimerState | null {
  try {
    const raw = localStorage.getItem(TIMER_KEY)
    if (!raw) return null
    const s = JSON.parse(raw)
    if (!s || !s.noteId) return null
    return s as TimerState
  } catch {
    return null
  }
}

export function saveTimerState(state: TimerState) {
  try {
    localStorage.setItem(TIMER_KEY, JSON.stringify(state))
  } catch {}
}

export function clearTimerState() {
  try {
    localStorage.removeItem(TIMER_KEY)
  } catch {}
}

export function uid(): string {
  return 'n' + Math.random().toString(36).slice(2, 10)
}
