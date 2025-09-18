import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Note {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'noteease.notes.v1'

// PUBLIC_INTERFACE
export const useNotesStore = defineStore('notes', () => {
  /**
   * Notes state with a selected note id and persistence to localStorage.
   */
  const notes = ref<Note[]>([])
  const selectedId = ref<string | null>(null)

  const currentNote = computed(() => notes.value.find((n) => n.id === selectedId.value) || null)

  function persist() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ notes: notes.value, selectedId: selectedId.value }),
      )
    } catch (e) {
      // Swallow to avoid hard crashes if storage is unavailable
      console.error('Failed to persist notes:', e)
    }
  }

  // PUBLIC_INTERFACE
  function load() {
    /** Loads notes from localStorage if available. */
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        // Seed with a sample note
        const seed = createNoteInternal('Welcome to NoteEase', 'Start typing your notes here...')
        notes.value = [seed]
        selectedId.value = seed.id
        persist()
        return
      }
      const parsed = JSON.parse(raw) as { notes: Note[]; selectedId: string | null }
      notes.value = Array.isArray(parsed.notes) ? parsed.notes : []
      selectedId.value = parsed.selectedId ?? (notes.value[0]?.id ?? null)
    } catch (e) {
      console.warn('Storage parse failed, starting empty.', e)
      notes.value = []
      selectedId.value = null
    }
  }

  function uuid() {
    return (
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (crypto.getRandomValues(new Uint8Array(1))[0] % 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      }) + Date.now().toString(16)
    )
  }

  function createNoteInternal(title = 'Untitled', content = ''): Note {
    const now = Date.now()
    return {
      id: uuid(),
      title,
      content,
      createdAt: now,
      updatedAt: now,
    }
  }

  // PUBLIC_INTERFACE
  function createNote() {
    /** Creates a new blank note and selects it. */
    const note = createNoteInternal()
    notes.value.unshift(note)
    selectedId.value = note.id
    persist()
    return note
  }

  // PUBLIC_INTERFACE
  function updateNote(payload: { id: string; title: string; content: string }) {
    /** Updates a note's title/content and timestamps. */
    const idx = notes.value.findIndex((n) => n.id === payload.id)
    if (idx === -1) return
    notes.value[idx] = {
      ...notes.value[idx],
      title: payload.title,
      content: payload.content,
      updatedAt: Date.now(),
    }
    persist()
  }

  // PUBLIC_INTERFACE
  function deleteNote(id: string) {
    /** Deletes a note by id and adjusts selection. */
    const idx = notes.value.findIndex((n) => n.id === id)
    if (idx === -1) return
    notes.value.splice(idx, 1)
    if (selectedId.value === id) {
      selectedId.value = notes.value[0]?.id ?? null
    }
    persist()
  }

  // PUBLIC_INTERFACE
  function select(id: string) {
    /** Selects a note by id. */
    selectedId.value = id
    persist()
  }

  return {
    notes,
    selectedId,
    currentNote,
    createNote,
    updateNote,
    deleteNote,
    select,
    load,
  }
})
