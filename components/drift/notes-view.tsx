'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { fmtDate, parseTasksFromNote } from '@/lib/drift/tasks'
import type { Note } from '@/lib/drift/types'
import { ChevronLeftIcon, NoteIcon, PlusIcon } from './icons'

interface Props {
  notes: Note[]
  activeNote: Note | null
  projectFilter: string | null
  projects: string[]
  onSelectNote: (id: string) => void
  onCreateNote: () => void
  onDeleteNote: (id: string) => void
  onUpdateNote: (id: string, patch: Partial<Omit<Note, 'id'>>) => void
}

export function NotesView({
  notes,
  activeNote,
  projectFilter,
  projects,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onUpdateNote,
}: Props) {
  // mobile: which pane is visible
  const [mobilePane, setMobilePane] = useState<'list' | 'editor'>('list')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  const sorted = useMemo(() => {
    const filtered = projectFilter
      ? notes.filter((n) => (n.project || '') === projectFilter)
      : notes
    return [...filtered].sort((a, b) => b.updatedAt - a.updatedAt)
  }, [notes, projectFilter])

  useEffect(() => {
    setConfirmDelete(false)
  }, [activeNote?.id])

  function handleSelect(id: string) {
    onSelectNote(id)
    setMobilePane('editor')
  }

  function handleCreate() {
    onCreateNote()
    setMobilePane('editor')
    setTimeout(() => titleRef.current?.focus(), 60)
  }

  return (
    <div className="flex min-h-0 flex-1">
      {/* Notes list */}
      <div
        className={`w-full flex-shrink-0 overflow-y-auto border-border p-4 md:block md:w-[280px] md:border-r ${
          mobilePane === 'editor' ? 'hidden' : 'block'
        }`}
      >
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="m-0 font-mono text-[13px] font-medium uppercase tracking-wider text-faint">
            {projectFilter || 'Все заметки'}
          </h2>
          <button
            type="button"
            onClick={handleCreate}
            title="Новая заметка"
            className="flex size-[26px] items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground hover:border-primary hover:text-primary"
          >
            <PlusIcon className="size-3.5" />
            <span className="sr-only">Новая заметка</span>
          </button>
        </div>
        {sorted.length === 0 && (
          <p className="px-1 py-2.5 text-[13px] text-faint">
            Пока пусто. Нажми + чтобы начать.
          </p>
        )}
        {sorted.map((n) => {
          const openCount = parseTasksFromNote(n).filter((t) => !t.done).length
          const active = activeNote?.id === n.id
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => handleSelect(n.id)}
              className={`mb-1 w-full rounded-lg border px-3 py-2.5 text-left ${
                active
                  ? 'border-border bg-secondary'
                  : 'border-transparent hover:bg-secondary'
              }`}
            >
              <div className="mb-0.5 truncate text-[13.5px] font-medium text-foreground">
                {n.title || 'Без названия'}
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-faint">
                {n.project && (
                  <span className="rounded bg-card px-1.5 py-px">{n.project}</span>
                )}
                <span>{fmtDate(n.updatedAt)}</span>
                {openCount > 0 && <span>{`· ${openCount} задач`}</span>}
              </div>
            </button>
          )
        })}
      </div>

      {/* Editor */}
      <div
        className={`min-w-0 flex-1 flex-col md:flex ${
          mobilePane === 'editor' ? 'flex' : 'hidden'
        }`}
      >
        <button
          type="button"
          onClick={() => setMobilePane('list')}
          className="flex items-center gap-1 px-4 pt-2.5 text-left font-mono text-xs text-muted-foreground md:hidden"
        >
          <ChevronLeftIcon className="size-3.5" />
          все заметки
        </button>
        {!activeNote ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2.5 text-faint">
            <NoteIcon className="size-9 opacity-40" />
            <p className="text-[13.5px]">Выбери заметку слева или создай новую</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 border-b border-border px-4 pb-2.5 pt-3.5 md:px-6 md:pt-4">
              <input
                ref={titleRef}
                value={activeNote.title}
                onChange={(e) => onUpdateNote(activeNote.id, { title: e.target.value })}
                placeholder="Без названия"
                className="w-full border-none bg-transparent py-0.5 text-lg font-semibold outline-none placeholder:text-faint"
                aria-label="Название заметки"
              />
              <div className="flex items-center gap-2.5">
                <input
                  value={activeNote.project}
                  onChange={(e) =>
                    onUpdateNote(activeNote.id, { project: e.target.value.trim() })
                  }
                  placeholder="проект..."
                  list="drift-projects"
                  className="w-[150px] rounded-md border border-border bg-secondary px-2.5 py-1 font-mono text-xs text-muted-foreground outline-none focus:border-primary"
                  aria-label="Проект заметки"
                />
                <datalist id="drift-projects">
                  {projects.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
                <button
                  type="button"
                  onClick={() => {
                    if (!confirmDelete) {
                      setConfirmDelete(true)
                      return
                    }
                    onDeleteNote(activeNote.id)
                    setConfirmDelete(false)
                    setMobilePane('list')
                  }}
                  onBlur={() => setConfirmDelete(false)}
                  className={`ml-auto rounded-md px-2 py-1 font-mono text-xs transition-colors ${
                    confirmDelete
                      ? 'bg-destructive/15 text-destructive'
                      : 'text-faint hover:text-destructive'
                  }`}
                >
                  {confirmDelete ? 'точно удалить?' : 'удалить'}
                </button>
              </div>
            </div>
            <textarea
              value={activeNote.body}
              onChange={(e) => onUpdateNote(activeNote.id, { body: e.target.value })}
              placeholder={`- [ ] Task #must ~2h
- [ ] Another task #should ~30m

Пиши мысли и задачи вперемешку. Формат задачи:
- [ ] текст #must|#should|#could|#wont ~2h|~30m|~1d`}
              className="flex-1 resize-none border-none bg-transparent px-4 pb-24 pt-4 text-[15px] leading-relaxed outline-none placeholder:text-faint md:px-6 md:pt-5"
              aria-label="Текст заметки"
            />
          </>
        )}
      </div>
    </div>
  )
}
