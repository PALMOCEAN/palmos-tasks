'use client'

import { useCallback, useEffect, useState } from 'react'
import { useDrift } from '@/hooks/use-drift'
import { clearTimerState, loadTimerState, saveTimerState } from '@/lib/drift/storage'
import type { Task, TimerState } from '@/lib/drift/types'
import { BoardView } from './board-view'
import { FocusTimer } from './focus-timer'
import { FocusView } from './focus-view'
import { BoardIcon, FocusIcon, NoteIcon } from './icons'
import { NotesView } from './notes-view'
import { ProjectDialog, type ProjectDialogState } from './project-dialog'
import { Sidebar } from './sidebar'
import { TaskOptions } from './task-options'

export type View = 'notes' | 'board' | 'focus'

const TABS: { view: View; label: string; icon: typeof NoteIcon }[] = [
  { view: 'notes', label: 'Заметки', icon: NoteIcon },
  { view: 'board', label: 'Доска', icon: BoardIcon },
  { view: 'focus', label: 'Фокус', icon: FocusIcon },
]

export function DriftApp() {
  const drift = useDrift()
  const [view, setView] = useState<View>('notes')
  const [projectDialog, setProjectDialog] = useState<ProjectDialogState>(null)
  const [optionsTask, setOptionsTask] = useState<Task | null>(null)
  const [savedTimer, setSavedTimer] = useState<TimerState | null>(null)
  const [activeTimer, setActiveTimer] = useState<TimerState | null>(null)
  const [timerMinimized, setTimerMinimized] = useState(false)

  useEffect(() => {
    const s = loadTimerState()
    setSavedTimer(s)
    if (s) {
      setActiveTimer(s)
      setTimerMinimized(true)
    }
  }, [])

  const startTimer = useCallback((task: Task) => {
    const state: TimerState = {
      noteId: task.noteId,
      lineIdx: task.lineIdx,
      priority: task.priority,
      text: task.text,
      project: task.project,
      elapsedMs: 0,
      running: true,
      lastTick: Date.now(),
    }
    saveTimerState(state)
    setSavedTimer(state)
    setActiveTimer(state)
    setTimerMinimized(false)
  }, [])

  const resumeTimer = useCallback(() => {
    // If a timer is already mounted (e.g. minimized), just expand it —
    // remounting would reset its internal elapsed state.
    setActiveTimer((current) => {
      if (current) return current
      const s = loadTimerState()
      if (!s) return null
      const elapsedMs = s.running ? s.elapsedMs + (Date.now() - s.lastTick) : s.elapsedMs
      return { ...s, elapsedMs, lastTick: Date.now() }
    })
    setTimerMinimized(false)
  }, [])

  if (!drift.loaded) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <span className="font-mono text-sm text-faint">загрузка…</span>
      </div>
    )
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <Sidebar
        view={view}
        onViewChange={setView}
        projects={drift.projects}
        projectFilter={drift.projectFilter}
        onFilterChange={drift.setProjectFilter}
        onAddProject={() => setProjectDialog({ mode: 'create' })}
        onProjectOptions={(p) => setProjectDialog({ mode: 'rename', project: p })}
      />

      <main className="flex h-full min-w-0 flex-1 flex-col pb-[60px] md:pb-0">
        {view === 'notes' && (
          <NotesView
            notes={drift.notes}
            activeNote={drift.activeNote}
            projectFilter={drift.projectFilter}
            projects={drift.projects}
            onSelectNote={drift.setActiveNoteId}
            onCreateNote={() => drift.createNote(drift.projectFilter || '')}
            onDeleteNote={drift.deleteNote}
            onUpdateNote={drift.updateNote}
          />
        )}
        {view === 'board' && (
          <BoardView
            notes={drift.notes}
            onOpenTask={setOptionsTask}
            onSetPriority={drift.setTaskPriority}
            onSetDone={drift.setTaskDone}
          />
        )}
        {view === 'focus' && (
          <FocusView
            notes={drift.notes}
            savedTimer={savedTimer}
            onStartTimer={startTimer}
            onResumeTimer={resumeTimer}
          />
        )}
      </main>

      {/* Mobile tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex h-[60px] border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Разделы"
      >
        {TABS.map(({ view: v, label, icon: Icon }) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 font-mono text-[10.5px] ${
              view === v ? 'text-primary' : 'text-faint'
            }`}
            aria-current={view === v ? 'page' : undefined}
          >
            <Icon className="size-[19px]" />
            {label}
          </button>
        ))}
      </nav>

      <ProjectDialog
        state={projectDialog}
        existingProjects={drift.projects}
        onCreate={drift.createProject}
        onRename={drift.renameProject}
        onDelete={drift.deleteProject}
        onClose={() => setProjectDialog(null)}
      />

      <TaskOptions
        task={optionsTask}
        onClose={() => setOptionsTask(null)}
        onSetDone={drift.setTaskDone}
        onSetPriority={drift.setTaskPriority}
        onSetHours={drift.setTaskHours}
      />

      {activeTimer && (
        <FocusTimer
          initial={activeTimer}
          minimized={timerMinimized}
          onComplete={(noteId, lineIdx) => {
            drift.setTaskDone(noteId, lineIdx, true)
            clearTimerState()
            setSavedTimer(null)
            setActiveTimer(null)
            setTimerMinimized(false)
          }}
          onCancel={() => {
            clearTimerState()
            setSavedTimer(null)
            setActiveTimer(null)
            setTimerMinimized(false)
          }}
          onMinimize={(state) => {
            saveTimerState(state)
            setSavedTimer(state)
            setTimerMinimized(true)
          }}
          onExpand={() => setTimerMinimized(false)}
        />
      )}
    </div>
  )
}
