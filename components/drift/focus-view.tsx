'use client'

import { useMemo } from 'react'
import { allTasks, fmtHours } from '@/lib/drift/tasks'
import { PRIO_ORDER, type Note, type Task, type TimerState } from '@/lib/drift/types'
import { CheckIcon, PlayIcon } from './icons'
import { PriorityBadge } from './priority-badge'

interface Props {
  notes: Note[]
  savedTimer: TimerState | null
  onStartTimer: (task: Task) => void
  onResumeTimer: () => void
}

export function FocusView({ notes, savedTimer, onStartTimer, onResumeTimer }: Props) {
  const openTasks = useMemo(() => {
    const t = allTasks(notes).filter((x) => !x.done)
    t.sort((a, b) => PRIO_ORDER[a.priority] - PRIO_ORDER[b.priority])
    return t
  }, [notes])

  const top = openTasks.filter((t) => t.priority !== 'wont').slice(0, 6)
  const mustCount = openTasks.filter((t) => t.priority === 'must').length
  const mustHours = openTasks
    .filter((t) => t.priority === 'must' && t.hours)
    .reduce((s, t) => s + (t.hours || 0), 0)

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-10 md:p-7">
      <div className="mx-auto w-full max-w-[520px]">
        <header className="mb-6">
          <h1 className="m-0 mb-1.5 text-xl font-semibold">Фокус на сегодня</h1>
          <p className="m-0 text-[13.5px] leading-relaxed text-muted-foreground text-pretty">
            {'Топ задачи по приоритету: must → should → could. Won\u2019t в фокус не попадает — так и задумано.'}
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-2.5">
          <div className="min-w-[110px] flex-1 rounded-xl border border-border bg-card px-3.5 py-3">
            <div className="font-mono text-xl font-bold text-must">{mustCount}</div>
            <div className="mt-0.5 text-[11px] text-faint">must открыто</div>
          </div>
          <div className="min-w-[110px] flex-1 rounded-xl border border-border bg-card px-3.5 py-3">
            <div className="font-mono text-xl font-bold">{fmtHours(mustHours) || '0ч'}</div>
            <div className="mt-0.5 text-[11px] text-faint">часов на must</div>
          </div>
          <div className="min-w-[110px] flex-1 rounded-xl border border-border bg-card px-3.5 py-3">
            <div className="font-mono text-xl font-bold">{openTasks.length}</div>
            <div className="mt-0.5 text-[11px] text-faint">задач всего</div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {top.length === 0 ? (
            <div className="px-5 py-12 text-center text-faint">
              <CheckIcon className="mx-auto mb-2.5 size-8 opacity-35" />
              <p className="text-[13.5px]">
                Открытых задач нет. Хороший момент решить, что делать дальше.
              </p>
            </div>
          ) : (
            top.map((t) => {
              const isSaved =
                savedTimer != null &&
                savedTimer.noteId === t.noteId &&
                savedTimer.lineIdx === t.lineIdx
              return (
                <div
                  key={`${t.noteId}-${t.lineIdx}`}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3"
                >
                  <button
                    type="button"
                    onClick={() => (isSaved ? onResumeTimer() : onStartTimer(t))}
                    title={isSaved ? 'Продолжить таймер' : 'Начать фокус'}
                    className={`flex size-7 flex-shrink-0 items-center justify-center rounded-lg border transition-colors ${
                      isSaved
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-border bg-card text-primary hover:border-primary hover:bg-primary/15'
                    }`}
                  >
                    <PlayIcon className="ml-0.5 size-3" />
                    <span className="sr-only">
                      {isSaved ? 'Продолжить таймер' : 'Начать фокус'}
                    </span>
                  </button>
                  {/* gap-1.5 fixes the missing spacing between task text and priority row */}
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="truncate text-[14.5px] leading-snug">{t.text}</div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <PriorityBadge priority={t.priority} />
                      {t.project && <span className="truncate text-faint">{t.project}</span>}
                      {t.hours != null && (
                        <span className="ml-auto text-muted-foreground">
                          {fmtHours(t.hours)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
