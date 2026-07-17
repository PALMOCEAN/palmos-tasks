'use client'

import { useEffect, useRef, useState } from 'react'
import { fmtClock } from '@/lib/drift/tasks'
import { saveTimerState } from '@/lib/drift/storage'
import { PRIO_META, type Priority, type TimerState } from '@/lib/drift/types'
import { CheckIcon, PauseIcon, PlayIcon, XIcon } from './icons'

interface Props {
  initial: TimerState
  minimized: boolean
  onMinimize: (state: TimerState) => void
  onExpand: () => void
  onComplete: (noteId: string, lineIdx: number) => void
  onCancel: () => void
}

const PRIO_STYLES: Record<Priority, string> = {
  must: 'bg-must/15 text-must',
  should: 'bg-should/15 text-should',
  could: 'bg-could/15 text-could',
  wont: 'bg-wont/15 text-wont',
}

const PRIO_DOT: Record<Priority, string> = {
  must: 'bg-must',
  should: 'bg-should',
  could: 'bg-could',
  wont: 'bg-wont',
}

export function FocusTimer({
  initial,
  minimized,
  onMinimize,
  onExpand,
  onComplete,
  onCancel,
}: Props) {
  const [running, setRunning] = useState(initial.running)
  const [elapsedMs, setElapsedMs] = useState(initial.elapsedMs)
  // Holds the latest accurate elapsed value (updated even between renders)
  const elapsedRef = useRef(initial.elapsedMs)
  const lastPersistRef = useRef(0)

  function persist(elapsed: number, isRunning: boolean) {
    lastPersistRef.current = Date.now()
    saveTimerState({
      ...initial,
      elapsedMs: elapsed,
      running: isRunning,
      lastTick: Date.now(),
    })
  }

  // Epoch-based ticking: elapsed is always derived from Date.now() minus a fixed
  // start point, so one second equals exactly one second regardless of interval
  // throttling (background tabs) or render timing.
  useEffect(() => {
    if (!running) return
    const epoch = Date.now() - elapsedRef.current
    const tick = () => {
      const next = Date.now() - epoch
      elapsedRef.current = next
      setElapsedMs(next)
      if (Date.now() - lastPersistRef.current >= 1000) {
        persist(next, true)
      }
    }
    tick()
    const handle = setInterval(tick, 250)
    return () => clearInterval(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  // Persist on unload so the session survives refresh/close
  useEffect(() => {
    const handler = () => persist(elapsedRef.current, running)
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  function togglePause() {
    const next = !running
    persist(elapsedRef.current, next)
    setRunning(next)
  }

  function handleMinimize() {
    // Keep running while minimized — the component stays mounted
    onMinimize({ ...initial, elapsedMs: elapsedRef.current, running, lastTick: Date.now() })
  }

  if (minimized) {
    return (
      <div className="fixed bottom-[76px] right-4 z-[300] flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 shadow-lg md:bottom-5 md:right-5">
        <button
          type="button"
          onClick={onExpand}
          title="Развернуть таймер"
          className="flex min-w-0 items-center gap-2.5 text-left"
        >
          <span
            className={`size-2 flex-shrink-0 rounded-full ${PRIO_DOT[initial.priority]} ${
              running ? 'animate-pulse' : 'opacity-40'
            }`}
            aria-hidden="true"
          />
          <span
            className={`font-mono text-sm font-bold tabular-nums ${
              running ? 'text-foreground' : 'text-faint'
            }`}
          >
            {fmtClock(elapsedMs)}
          </span>
          <span className="max-w-[140px] truncate text-xs text-muted-foreground">
            {initial.text}
          </span>
          <span className="sr-only">Развернуть таймер</span>
        </button>
        <button
          type="button"
          onClick={togglePause}
          title={running ? 'Пауза' : 'Продолжить'}
          className="flex size-7 flex-shrink-0 items-center justify-center rounded-lg text-faint hover:bg-secondary hover:text-foreground"
        >
          {running ? <PauseIcon className="size-3.5" /> : <PlayIcon className="size-3.5" />}
          <span className="sr-only">{running ? 'Пауза' : 'Продолжить'}</span>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-background p-6">
      <button
        type="button"
        onClick={handleMinimize}
        title="Свернуть таймер"
        className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-lg text-faint hover:bg-secondary hover:text-foreground"
      >
        <XIcon className="size-4.5" />
        <span className="sr-only">Свернуть таймер</span>
      </button>

      <div
        className={`mb-4 rounded-md px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${PRIO_STYLES[initial.priority]}`}
      >
        {PRIO_META[initial.priority].label}
      </div>
      <h2 className="m-0 mb-2 max-w-[600px] text-center text-[22px] font-semibold leading-snug text-balance">
        {initial.text}
      </h2>
      {initial.project && (
        <div className="mb-9 font-mono text-[13px] text-faint">{initial.project}</div>
      )}
      <div
        className={`mb-1.5 font-mono text-6xl font-bold tabular-nums tracking-wide ${
          running ? 'text-foreground' : 'text-faint'
        }`}
        aria-live="polite"
      >
        {fmtClock(elapsedMs)}
      </div>
      <div
        className={`mb-11 font-mono text-xs uppercase tracking-wider ${
          running ? 'text-faint' : 'text-should'
        }`}
      >
        {running ? 'В работе' : 'На паузе'}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => onComplete(initial.noteId, initial.lineIdx)}
          title="Выполнено"
          className="flex items-center gap-2 rounded-lg border border-primary bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <CheckIcon className="size-4" strokeWidth={2} />
          Готово
        </button>
        <button
          type="button"
          onClick={togglePause}
          title={running ? 'Пауза' : 'Продолжить'}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold hover:border-muted-foreground"
        >
          {running ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
          {running ? 'Пауза' : 'Продолжить'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          title="Отменить"
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-destructive hover:border-destructive"
        >
          <XIcon className="size-4" />
          Отменить
        </button>
      </div>
    </div>
  )
}
