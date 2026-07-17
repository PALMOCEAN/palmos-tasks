'use client'

import { useEffect, useRef, useState } from 'react'

export type ProjectDialogState =
  | { mode: 'create' }
  | { mode: 'rename'; project: string }
  | null

interface Props {
  state: ProjectDialogState
  existingProjects: string[]
  onCreate: (name: string) => void
  onRename: (oldName: string, newName: string) => void
  onDelete: (name: string) => void
  onClose: () => void
}

export function ProjectDialog({
  state,
  existingProjects,
  onCreate,
  onRename,
  onDelete,
  onClose,
}: Props) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!state) return
    setName(state.mode === 'rename' ? state.project : '')
    setError(null)
    setConfirmDelete(false)
    const t = setTimeout(() => inputRef.current?.select(), 50)
    return () => clearTimeout(t)
  }, [state])

  if (!state) return null

  const isRename = state.mode === 'rename'

  function submit() {
    if (!state) return
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Введи название проекта')
      return
    }
    if (
      existingProjects.includes(trimmed) &&
      !(isRename && state.mode === 'rename' && trimmed === state.project)
    ) {
      setError('Проект с таким названием уже есть')
      return
    }
    if (state.mode === 'rename') {
      onRename(state.project, trimmed)
    } else {
      onCreate(trimmed)
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/60 pt-[18vh] backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={isRename ? 'Переименовать проект' : 'Новый проект'}
    >
      <div className="mx-4 flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-2xl">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {isRename ? 'Переименовать проект' : 'Новый проект'}
        </h2>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.nativeEvent.isComposing &&
                e.keyCode !== 229
              ) {
                submit()
              }
            }}
            placeholder="Название проекта"
            className="w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-primary"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={submit}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {isRename ? 'Сохранить' : 'Создать'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Отмена
          </button>
          {isRename && (
            <button
              type="button"
              onClick={() => {
                if (!confirmDelete) {
                  setConfirmDelete(true)
                  return
                }
                if (state.mode === 'rename') onDelete(state.project)
                onClose()
              }}
              className={`ml-auto rounded-lg border px-3 py-2 font-mono text-xs transition-colors ${
                confirmDelete
                  ? 'border-destructive bg-destructive/15 text-destructive'
                  : 'border-border text-faint hover:border-destructive hover:text-destructive'
              }`}
            >
              {confirmDelete ? 'Точно удалить?' : 'Удалить'}
            </button>
          )}
        </div>
        {isRename && (
          <p className="text-xs leading-relaxed text-faint">
            Удаление проекта не удаляет заметки — они останутся в разделе «Все».
          </p>
        )}
      </div>
    </div>
  )
}
