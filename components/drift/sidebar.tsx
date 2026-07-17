'use client'

import { BoardIcon, DotsIcon, FocusIcon, NoteIcon, PlusIcon } from './icons'
import type { View } from './drift-app'

interface Props {
  view: View
  onViewChange: (view: View) => void
  projects: string[]
  projectFilter: string | null
  onFilterChange: (filter: string | null) => void
  onAddProject: () => void
  onProjectOptions: (project: string) => void
}

const NAV: { view: View; label: string; icon: typeof NoteIcon }[] = [
  { view: 'notes', label: 'Заметки', icon: NoteIcon },
  { view: 'board', label: 'Доска', icon: BoardIcon },
  { view: 'focus', label: 'Фокус', icon: FocusIcon },
]

export function Sidebar({
  view,
  onViewChange,
  projects,
  projectFilter,
  onFilterChange,
  onAddProject,
  onProjectOptions,
}: Props) {
  return (
    <aside className="hidden w-[220px] flex-shrink-0 flex-col border-r border-border bg-card py-5 md:flex">
      <div className="px-5 pb-5 font-mono text-[13px] font-semibold tracking-wide text-primary">
        {"Palmo's tasks"}
      </div>
      <nav aria-label="Разделы">
        {NAV.map(({ view: v, label, icon: Icon }) => (
          <button
            key={v}
            type="button"
            onClick={() => onViewChange(v)}
            className={`flex w-full items-center gap-2.5 border-l-2 px-5 py-2.5 text-left text-sm transition-colors ${
              view === v
                ? 'border-primary bg-secondary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            aria-current={view === v ? 'page' : undefined}
          >
            <Icon className="size-4 opacity-80" />
            {label}
          </button>
        ))}
      </nav>
      <div className="mt-5 flex-1 overflow-y-auto px-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
            Проекты
          </span>
          <button
            type="button"
            onClick={onAddProject}
            title="Новый проект"
            className="flex size-5 items-center justify-center rounded-md text-faint hover:bg-primary/15 hover:text-primary"
          >
            <PlusIcon className="size-3.5" />
            <span className="sr-only">Новый проект</span>
          </button>
        </div>
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => onFilterChange(null)}
            className={`flex items-center rounded-lg px-2 py-1.5 text-left text-[13px] ${
              !projectFilter
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <span className="flex-1 truncate">Все</span>
          </button>
          {projects.map((p) => (
            <div
              key={p}
              className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 text-[13px] ${
                projectFilter === p
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <button
                type="button"
                onClick={() => onFilterChange(p)}
                className="min-w-0 flex-1 truncate text-left"
              >
                {p}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onProjectOptions(p)
                }}
                title={`Настройки проекта ${p}`}
                className="flex size-[18px] flex-shrink-0 items-center justify-center rounded text-faint opacity-0 transition-opacity hover:bg-card hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
              >
                <DotsIcon className="size-3.5" />
                <span className="sr-only">{`Настройки проекта ${p}`}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
