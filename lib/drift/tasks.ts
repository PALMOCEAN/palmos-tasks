import type { Note, Priority, Task } from './types'

// Line format: - [ ] text #must|#should|#could|#wont ~2h|~30m|~1d ^1719999999999
export const TASK_RE = /^(\s*)-\s\[( |x|X)\]\s(.*)$/
export const PRIO_RE = /#(must|should|could|wont)\b/i
export const TIME_RE = /~(\d+(?:\.\d+)?)(h|m|d)\b/i
export const CLOSED_RE = /\^(\d{10,})\b/

export function parseTasksFromNote(note: Note): Task[] {
  const lines = note.body.split('\n')
  const tasks: Task[] = []
  lines.forEach((line, idx) => {
    const m = line.match(TASK_RE)
    if (!m) return
    const done = m[2].toLowerCase() === 'x'
    const rest = m[3]
    const pMatch = rest.match(PRIO_RE)
    const tMatch = rest.match(TIME_RE)
    const cMatch = rest.match(CLOSED_RE)
    const priority = (pMatch ? pMatch[1].toLowerCase() : 'should') as Priority
    let hours: number | null = null
    if (tMatch) {
      const val = Number.parseFloat(tMatch[1])
      const unit = tMatch[2].toLowerCase()
      hours = unit === 'h' ? val : unit === 'm' ? val / 60 : val * 8
    }
    const closedAt = done && cMatch ? Number.parseInt(cMatch[1], 10) : null
    const cleanText = rest
      .replace(PRIO_RE, '')
      .replace(TIME_RE, '')
      .replace(CLOSED_RE, '')
      .trim()
    tasks.push({
      noteId: note.id,
      project: note.project || '',
      lineIdx: idx,
      done,
      priority,
      hours,
      closedAt,
      text: cleanText || rest.trim(),
    })
  })
  return tasks
}

export function allTasks(notes: Note[]): Task[] {
  return notes.flatMap((n) => parseTasksFromNote(n))
}

/** Rewrites one task line inside a note body. Returns the new body or null if not a task line. */
export function rewriteLine(
  body: string,
  lineIdx: number,
  mutator: (line: string) => string
): string | null {
  const lines = body.split('\n')
  const line = lines[lineIdx]
  if (line == null || !TASK_RE.test(line)) return null
  lines[lineIdx] = mutator(line)
  return lines.join('\n')
}

export function setDoneOnLine(line: string, done: boolean): string {
  let newLine = line.replace(/\[( |x|X)\]/, `[${done ? 'x' : ' '}]`)
  newLine = newLine.replace(/\s*\^\d{10,}\b/, '')
  if (done) newLine = newLine.replace(/\s*$/, '') + ` ^${Date.now()}`
  return newLine
}

export function setPriorityOnLine(line: string, priority: Priority): string {
  if (PRIO_RE.test(line)) return line.replace(PRIO_RE, '#' + priority)
  return line.replace(/\s*$/, '') + ` #${priority}`
}

export function setHoursOnLine(line: string, hours: number | null): string {
  const token =
    hours == null
      ? null
      : hours < 1
        ? `~${Math.round(hours * 60)}m`
        : Number.isInteger(hours)
          ? `~${hours}h`
          : `~${hours.toFixed(1)}h`
  let newLine = line
  if (TIME_RE.test(newLine)) {
    newLine = token
      ? newLine.replace(TIME_RE, token)
      : newLine.replace(TIME_RE, '').replace(/[ \t]+/g, ' ')
  } else if (token) {
    newLine = newLine.replace(/\s*$/, '') + ` ${token}`
  }
  return newLine.replace(/[ \t]+$/, '')
}

/* ---------------- Formatting helpers ---------------- */

export function fmtHours(h: number | null): string | null {
  if (h == null) return null
  if (h < 1) return Math.round(h * 60) + 'м'
  if (Number.isInteger(h)) return h + 'ч'
  return h.toFixed(1) + 'ч'
}

export function fmtDate(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
}

export function fmtClosedWhen(ts: number | null): string {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  if (d.toDateString() === now.toDateString()) return 'сегодня, ' + time
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }) + ', ' + time
}

export function parseTimeInput(str: string): number | null {
  const s = (str || '').trim()
  if (!s) return null
  const m = s.match(/^(\d+(?:[.,]\d+)?)\s*(h|m|d|ч|м|д)?$/i)
  if (!m) return null
  const val = Number.parseFloat(m[1].replace(',', '.'))
  const unitRaw = (m[2] || 'h').toLowerCase()
  const unit = unitRaw === 'ч' ? 'h' : unitRaw === 'м' ? 'm' : unitRaw === 'д' ? 'd' : unitRaw
  return unit === 'h' ? val : unit === 'm' ? val / 60 : val * 8
}

export function fmtClock(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}
