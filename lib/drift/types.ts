export type Priority = 'must' | 'should' | 'could' | 'wont'

export interface Note {
  id: string
  title: string
  project: string
  body: string
  updatedAt: number
}

export interface Task {
  noteId: string
  project: string
  lineIdx: number
  done: boolean
  priority: Priority
  hours: number | null
  closedAt: number | null
  text: string
}

export interface TimerState {
  noteId: string
  lineIdx: number
  priority: Priority
  text: string
  project: string
  elapsedMs: number
  running: boolean
  lastTick: number
}

export const PRIO_ORDER: Record<Priority, number> = {
  must: 0,
  should: 1,
  could: 2,
  wont: 3,
}

export const PRIO_META: Record<Priority, { label: string }> = {
  must: { label: 'Must' },
  should: { label: 'Should' },
  could: { label: 'Could' },
  wont: { label: "Won't" },
}

export const PRIORITIES: Priority[] = ['must', 'should', 'could', 'wont']
