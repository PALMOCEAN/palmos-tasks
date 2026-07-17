'use client'

import { useMemo, useState } from 'react'
import { allTasks, fmtClosedWhen, fmtHours } from '@/lib/drift/tasks'
import {
  PRIO_META,
  PRIORITIES,
  type Note,
  type Priority,
  type Task,
} from '@/lib/drift/types'
import { PriorityBadge } from './priority-badge'

interface Props {
  notes: Note[]
  onOpenTask: (task: Task) => void
  onSetPriority: (noteId: string, lineIdx: number, priority: Priority) => void
  onSetDone: (noteId: string, lineIdx: number, done: boolean) => void
}

interface DragRef {
  noteId: string
  lineIdx: number
  priority: Priority
}

const COL_STYLES: Record<Priority, { name: string; bar: string }> = {
  must: { name: 'text-must', bar: 'bg-must' },
  should: { name: 'text-should', bar: 'bg-should' },
  could: { name: 'text-could', bar: 'bg-could' },
  wont: { name: 'text-wont', bar: 'bg-wont' },
}

export function BoardView({ notes, onOpenTask, onSetPriority, onSetDone }: Props) {
  const [dragRef, setDragRef] = useState<DragRef | null>(null)
  const [dragOver, setDragOver] = useState<Priority | 'closed' | null>(null)

  const tasks = useMemo(() => allTasks(notes), [notes])
  const openTasks = useMemo(() => tasks.filter((t) => !t.done), [tasks])
  const closedTasks = useMemo(
    () => tasks.filter((t) => t.done).sort((a, b) => (b.closedAt || 0) - (a.closedAt || 0)),
    [tasks]
  )

  const maxHours = Math.max(
    1,
    ...PRIORITIES.map((p) =>
      openTasks
        .filter((t) => t.priority === p && t.hours)
        .reduce((s, t) => s + (t.hours || 0), 0)
    )
  )

  function handleDrop(target: Priority | 'closed') {
    if (!dragRef) return
    if (target === 'closed') {
      onSetDone(dragRef.noteId, dragRef.lineIdx, true)
    } else if (dragRef.priority !== target) {
      onSetPriority(dragRef.noteId, dragRef.lineIdx, target)
    }
    setDragRef(null)
    setDragOver(null)
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-10 md:p-6">
      <header className="mb-5">
        <h1 className="m-0 mb-1 text-lg font-semibold">Доска приоритетов</h1>
        <p className="m-0 max-w-3xl text-[13px] leading-relaxed text-muted-foreground text-pretty">
          Все задачи из всех заметок, сгруппированные по MoSCoW. Часы считаются только по
          невыполненным. Перетаскивай карточки между колонками или вниз — в «Закрытые
          задачи», либо кликни задачу для опций.
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PRIORITIES.map((p) => {
          const bucket = openTasks.filter((t) => t.priority === p)
          const openHours = bucket
            .filter((t) => t.hours)
            .reduce((s, t) => s + (t.hours || 0), 0)
          const pct = Math.min(100, Math.round((openHours / maxHours) * 100))
          const styles = COL_STYLES[p]
          return (
            <section
              key={p}
              className="overflow-hidden rounded-xl border border-border bg-card"
              aria-label={`Колонка ${PRIO_META[p].label}`}
            >
              <div className="border-b border-border px-3.5 pb-3 pt-3">
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-semibold uppercase tracking-wide ${styles.name}`}
                  >
                    {PRIO_META[p].label}
                  </span>
                  <span className="font-mono text-[11px] text-faint">{bucket.length}</span>
                </div>
                <div className="h-[5px] overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${styles.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1.5 font-mono text-[11px] text-faint">
                  {openHours > 0 ? `${fmtHours(openHours)} в работе` : 'нет часов'}
                </div>
              </div>
              <div
                className={`flex max-h-[520px] min-h-[48px] flex-col gap-1.5 overflow-y-auto p-2 transition-colors ${
                  dragOver === p ? 'bg-primary/15' : ''
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                  setDragOver(p)
                }}
                onDragLeave={() => setDragOver((cur) => (cur === p ? null : cur))}
                onDrop={(e) => {
                  e.preventDefault()
                  handleDrop(p)
                }}
              >
                {bucket.length === 0 ? (
                  <div className="px-2.5 py-5 text-center text-xs text-faint">Пусто</div>
                ) : (
                  bucket.map((t) => (
                    <div
                      key={`${t.noteId}-${t.lineIdx}`}
                      draggable
                      onDragStart={(e) => {
                        setDragRef({ noteId: t.noteId, lineIdx: t.lineIdx, priority: t.priority })
                        e.dataTransfer.effectAllowed = 'move'
                        e.dataTransfer.setData('text/plain', t.text)
                      }}
                      onDragEnd={() => {
                        setDragRef(null)
                        setDragOver(null)
                      }}
                      onClick={() => onOpenTask(t)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onOpenTask(t)
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className={`flex cursor-pointer select-none flex-col gap-1 rounded-lg border border-transparent bg-secondary px-2.5 py-2 text-[13px] hover:border-border ${
                        dragRef?.noteId === t.noteId && dragRef?.lineIdx === t.lineIdx
                          ? 'opacity-35'
                          : ''
                      }`}
                    >
                      <div className="leading-snug text-foreground">{t.text}</div>
                      {(t.project || t.hours) && (
                        <div className="flex items-center gap-2 font-mono text-[11px] text-faint">
                          {t.project && <span>{t.project}</span>}
                          {t.hours != null && (
                            <span className="rounded bg-card px-1.5 py-px">
                              {fmtHours(t.hours)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          )
        })}
      </div>

      {/* Closed tasks — drop zone to complete */}
      <section
        className={`mt-4 rounded-xl border p-3.5 transition-colors ${
          dragOver === 'closed'
            ? 'border-primary bg-primary/10'
            : dragRef
              ? 'border-dashed border-primary/50 bg-card'
              : 'border-border bg-card'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
          setDragOver('closed')
        }}
        onDragLeave={() => setDragOver((cur) => (cur === 'closed' ? null : cur))}
        onDrop={(e) => {
          e.preventDefault()
          handleDrop('closed')
        }}
        aria-label="Закрытые задачи"
      >
        <div className="mb-2.5 flex items-center gap-2">
          <h2 className="m-0 font-mono text-xs font-semibold uppercase tracking-wide text-faint">
            Закрытые задачи
          </h2>
          <span className="font-mono text-[11px] text-faint">{closedTasks.length}</span>
          {dragRef && (
            <span className="ml-auto font-mono text-[11px] text-primary">
              отпусти здесь, чтобы завершить
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          {closedTasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-2.5 py-4 text-center text-xs text-faint">
              Пока ничего не закрыто. Перетащи задачу сюда, чтобы её завершить.
            </div>
          ) : (
            closedTasks.map((t) => (
              <div
                key={`${t.noteId}-${t.lineIdx}`}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary px-3 py-2 text-[13px]"
              >
                <PriorityBadge priority={t.priority} />
                <span className="min-w-0 flex-1 truncate text-muted-foreground line-through">
                  {t.text}
                </span>
                <span className="hidden flex-shrink-0 whitespace-nowrap font-mono text-[11px] text-faint sm:inline">
                  {fmtClosedWhen(t.closedAt)}
                </span>
                <button
                  type="button"
                  onClick={() => onSetDone(t.noteId, t.lineIdx, false)}
                  className="flex-shrink-0 rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-faint hover:border-primary hover:text-primary"
                >
                  вернуть
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
