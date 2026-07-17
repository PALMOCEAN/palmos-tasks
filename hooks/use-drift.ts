'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  rewriteLine,
  setDoneOnLine,
  setHoursOnLine,
  setPriorityOnLine,
} from '@/lib/drift/tasks'
import {
  loadActiveNoteId,
  loadNotes,
  loadProjects,
  saveActiveNoteId,
  saveNotes,
  saveProjects,
  uid,
} from '@/lib/drift/storage'
import type { Note, Priority } from '@/lib/drift/types'

export function useDrift() {
  const [loaded, setLoaded] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [extraProjects, setExtraProjects] = useState<string[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [projectFilter, setProjectFilter] = useState<string | null>(null)

  useEffect(() => {
    const n = loadNotes()
    setNotes(n)
    setExtraProjects(loadProjects())
    const saved = loadActiveNoteId()
    setActiveNoteId(saved && n.some((x) => x.id === saved) ? saved : (n[0]?.id ?? null))
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) saveNotes(notes)
  }, [notes, loaded])

  useEffect(() => {
    if (loaded) saveProjects(extraProjects)
  }, [extraProjects, loaded])

  useEffect(() => {
    if (loaded) saveActiveNoteId(activeNoteId)
  }, [activeNoteId, loaded])

  const projects = useMemo(() => {
    const set = new Set<string>(extraProjects)
    notes.forEach((n) => {
      if (n.project) set.add(n.project)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'))
  }, [notes, extraProjects])

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeNoteId) ?? null,
    [notes, activeNoteId]
  )

  const updateNote = useCallback((id: string, patch: Partial<Omit<Note, 'id'>>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n))
    )
  }, [])

  const createNote = useCallback((project?: string) => {
    const n: Note = {
      id: uid(),
      title: '',
      project: project || '',
      body: '',
      updatedAt: Date.now(),
    }
    setNotes((prev) => [...prev, n])
    setActiveNoteId(n.id)
    return n.id
  }, [])

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => {
        const next = prev.filter((n) => n.id !== id)
        if (activeNoteId === id) setActiveNoteId(next[0]?.id ?? null)
        return next
      })
    },
    [activeNoteId]
  )

  const createProject = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return false
    setExtraProjects((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]))
    setProjectFilter(trimmed)
    return true
  }, [])

  const renameProject = useCallback(
    (oldName: string, newName: string) => {
      const trimmed = newName.trim()
      if (!trimmed || trimmed === oldName) return false
      setNotes((prev) =>
        prev.map((n) => (n.project === oldName ? { ...n, project: trimmed } : n))
      )
      setExtraProjects((prev) => {
        const next = prev.filter((p) => p !== oldName)
        return next.includes(trimmed) ? next : [...next, trimmed]
      })
      if (projectFilter === oldName) setProjectFilter(trimmed)
      return true
    },
    [projectFilter]
  )

  const deleteProject = useCallback(
    (name: string) => {
      setNotes((prev) => prev.map((n) => (n.project === name ? { ...n, project: '' } : n)))
      setExtraProjects((prev) => prev.filter((p) => p !== name))
      if (projectFilter === name) setProjectFilter(null)
    },
    [projectFilter]
  )

  const mutateTaskLine = useCallback(
    (noteId: string, lineIdx: number, mutator: (line: string) => string) => {
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id !== noteId) return n
          const newBody = rewriteLine(n.body, lineIdx, mutator)
          if (newBody == null) return n
          return { ...n, body: newBody, updatedAt: Date.now() }
        })
      )
    },
    []
  )

  const setTaskDone = useCallback(
    (noteId: string, lineIdx: number, done: boolean) => {
      mutateTaskLine(noteId, lineIdx, (line) => setDoneOnLine(line, done))
    },
    [mutateTaskLine]
  )

  const setTaskPriority = useCallback(
    (noteId: string, lineIdx: number, priority: Priority) => {
      mutateTaskLine(noteId, lineIdx, (line) => setPriorityOnLine(line, priority))
    },
    [mutateTaskLine]
  )

  const setTaskHours = useCallback(
    (noteId: string, lineIdx: number, hours: number | null) => {
      mutateTaskLine(noteId, lineIdx, (line) => setHoursOnLine(line, hours))
    },
    [mutateTaskLine]
  )

  return {
    loaded,
    notes,
    projects,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    projectFilter,
    setProjectFilter,
    updateNote,
    createNote,
    deleteNote,
    createProject,
    renameProject,
    deleteProject,
    setTaskDone,
    setTaskPriority,
    setTaskHours,
  }
}
