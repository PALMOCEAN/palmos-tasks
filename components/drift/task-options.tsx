'use client'

import { useEffect, useRef, useState } from 'react'
import { fmtHours, parseTimeInput } from '@/lib/drift/tasks'
import {
  PRIO_META,
  PRIORITIES,
  type Priority,
  type Task,
} from '@/lib/drift/types'
import { CheckIcon, ClockIcon, FlagIcon, XIcon } from './icons'

interface Props {
  task: Task | null
  onClose: () => void
  onSetDone: (noteId: string, lineIdx: number, done: boolean) => void
  onSetPriority: (noteId: string, lineIdx: number, priority: Priority) => void
  onSetHours: (noteId: string, lineIdx: number, hours: number | null) => void
}

export function TaskOptions({ task, onClose, onSetDone, onSetPriority, onSetHours }: Props) {
  const [showTime, setShowTime] = useState(false)
  const [showPriority, setShowPriority] = useState(false)
  const [timeValue, setTimeValue] = useState('')
  const timeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!task) return
    setShowTime(false)
    setShowPriority(false)
    setTimeValue(task.hours ? fmtHours(task.hours) || '' : '')
  }, [task])

  useEffect(() => {
    if (showTime) timeInputRef.current?.focus()
  }, [showTime])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (task) {
      document.addEventListener('keydown', onKey)
      return () => document.removeEventListener('keydown', onKey)
    }
  }, [task, onClose])

  if (!task) return null

  function saveTime() {
    if (!task) return
    onSetHours(task.noteId, task.lineIdx, parseTimeInput(timeValue))
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/70 pt-[14vh] backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Опции задачи"
    >
      <div className="mx-4 flex w-full max-w-[380px] flex-col gap-2.5">
        {/* Task preview */}
        <div className="flex flex-col gap-1 rounded-lg border border-primary bg-secondary px-2.5 py-2 text-[13px] shadow-xl">
          <div className="leading-snug text-foreground">{task.text}</div>
          {(task.project || task.hours) && (
            <div className="flex items-center gap-2 font-mono text-[11px] text-faint">
              {task.project && <span>{task.project}</span>}
              {task.hours != null && (
                <span className="rounded bg-card px-1.5 py-px">{fmtHours(task.hours)}</span>
              )}
            </div>
          )}
        </div>

        {/* Menu */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <button
            type="button"
            onClick={() => {
              onSetDone(task.noteId, task.lineIdx, !task.done)
              onClose()
            }}
            className="flex w-full items-center gap-2.5 border-b border-border px-3.5 py-3 text-left text-[13.5px] hover:bg-secondary"
          >
            <CheckIcon className="size-4 opacity-80" />
            {task.done ? 'Вернуть в открытые' : 'Завершить задачу'}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowTime((s) => !s)
              setShowPriority(false)
            }}
            className="flex w-full items-center gap-2.5 border-b border-border px-3.5 py-3 text-left text-[13.5px] hover:bg-secondary"
          >
            <ClockIcon className="size-4 opacity-80" />
            Изменить время
          </button>
          {showTime && (
            <div className="flex items-center gap-2 border-b border-border bg-secondary px-3.5 py-2.5">
              <input
                ref={timeInputRef}
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' &&
                    !e.nativeEvent.isComposing &&
                    e.keyCode !== 229
                  ) {
                    saveTime()
                  }
                }}
                placeholder="напр. 2h, 45m, 1.5h"
                className="flex-1 rounded-md border border-border bg-card px-2.5 py-1.5 font-mono text-[13px] outline-none focus:border-primary"
                aria-label="Оценка времени"
              />
              <button
                type="button"
                onClick={saveTime}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                ОК
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setShowPriority((s) => !s)
              setShowTime(false)
            }}
            className="flex w-full items-center gap-2.5 border-b border-border px-3.5 py-3 text-left text-[13.5px] hover:bg-secondary"
          >
            <FlagIcon className="size-4 opacity-80" />
            Изменить приоритет
          </button>
          {showPriority && (
            <div className="flex flex-wrap gap-1.5 border-b border-border bg-secondary px-3.5 py-2.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    onSetPriority(task.noteId, task.lineIdx, p)
                    onClose()
                  }}
                  className={`rounded-lg border px-2.5 py-1.5 font-mono text-xs ${
                    p === task.priority
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground'
                  }`}
                >
                  {PRIO_META[p].label}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left text-[13.5px] text-destructive hover:bg-secondary"
          >
            <XIcon className="size-4 opacity-80" />
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}
