<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotesStore } from './stores/notes'
import NoteList from './components/NoteList.vue'
import NoteEditor from './components/NoteEditor.vue'

const store = useNotesStore()
const search = ref('')

// Load notes from localStorage on app mount
onMounted(() => {
  store.load()
})

// Filtered notes by search term
const filteredNotes = computed(() => {
  if (!search.value.trim()) return store.notes
  const q = search.value.toLowerCase()
  return store.notes.filter(
    (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
  )
})

// PUBLIC_INTERFACE
function handleCreateNote() {
  /** Creates a new blank note and selects it. */
  store.createNote()
}

// PUBLIC_INTERFACE
function handleDeleteSelected() {
  /** Deletes the currently selected note if confirmed. */
  if (!store.selectedId) return
  const note = store.notes.find((n) => n.id === store.selectedId)
  const title = note?.title?.trim() || 'Untitled'
  if (confirm(`Delete note "${title}"? This cannot be undone.`)) {
    store.deleteNote(store.selectedId)
  }
}
</script>

<template>
  <div class="app-root">
    <!-- Header -->
    <header class="app-header">
      <div class="app-title">
        <div class="brand-badge">N</div>
        <h1>NoteEase</h1>
      </div>
      <div class="header-actions">
        <div class="search-wrap">
          <span class="icon">🔍</span>
          <input
            v-model="search"
            class="search-input"
            placeholder="Search notes..."
            aria-label="Search notes"
          />
        </div>
        <button class="btn btn-primary" @click="handleCreateNote" aria-label="Create new note">
          + New Note
        </button>
        <button
          class="btn btn-danger"
          :disabled="!store.selectedId"
          @click="handleDeleteSelected"
          aria-label="Delete selected note"
          title="Delete selected note"
        >
          Delete
        </button>
      </div>
    </header>

    <!-- Body -->
    <div class="app-body">
      <!-- Sidebar -->
      <aside class="sidebar">
        <NoteList :notes="filteredNotes" :selected-id="store.selectedId" @select="store.select" />
      </aside>

      <!-- Main content -->
      <main class="content">
        <NoteEditor
          v-if="store.selectedId"
          :note="store.currentNote"
          @update="store.updateNote"
        />
        <div v-else class="empty-state">
          <div class="empty-card">
            <div class="empty-icon">📝</div>
            <h2>Welcome to NoteEase</h2>
            <p>Create your first note to get started.</p>
            <button class="btn btn-primary" @click="handleCreateNote">Create a Note</button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Ocean Professional Theme Variables */
:root {
  --primary: #2563eb;
  --secondary: #f59e0b;
  --success: #f59e0b;
  --error: #ef4444;
  --bg: #f9fafb;
  --surface: #ffffff;
  --text: #111827;
  --muted: #6b7280;
  --border: #e5e7eb;
  --ring: rgba(37, 99, 235, 0.4);
}

/* Page base */
.app-root {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), #f9fafb 45%, #f9fafb);
  color: var(--text);
  display: flex;
  flex-direction: column;
}

/* Header */
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: radial-gradient(120px 50px at 10% 10%, rgba(37, 99, 235, 0.15), rgba(37, 99, 235, 0.05));
  border: 1px solid var(--border);
  color: var(--primary);
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 0 1px 0 #fff;
}

h1 {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-wrap {
  position: relative;
}

.icon {
  position: absolute;
  left: 10px;
  top: 50%;
  translate: 0 -50%;
  color: var(--muted);
  pointer-events: none;
}

.search-input {
  width: 240px;
  padding: 0.55rem 0.75rem 0.55rem 2rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  color: var(--text);
  outline: none;
  transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
}
.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--ring);
}

/* Body Layout */
.app-body {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1rem;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
}

/* Sidebar */
.sidebar {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(17, 24, 39, 0.04);
}

/* Main Content */
.content {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 0.75rem;
  min-height: 60vh;
  box-shadow: 0 10px 30px rgba(17, 24, 39, 0.04);
}

/* Buttons */
.btn {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.5rem 0.85rem;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  transition: transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease, border-color 150ms ease;
}
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(17, 24, 39, 0.08);
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-primary {
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.1), rgba(37, 99, 235, 0.06));
  color: var(--primary);
  border-color: #dbeafe;
}
.btn-primary:hover {
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.15), rgba(37, 99, 235, 0.08));
  border-color: #bfdbfe;
}

.btn-danger {
  background: linear-gradient(180deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.06));
  color: var(--error);
  border-color: #fecaca;
}
.btn-danger:hover {
  background: linear-gradient(180deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.08));
  border-color: #fca5a5;
}

/* Empty State */
.empty-state {
  height: 100%;
  display: grid;
  place-items: center;
  padding: 2rem;
}

.empty-card {
  text-align: center;
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.06), rgba(255, 255, 255, 1));
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2rem;
  max-width: 520px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 12px 24px rgba(17, 24, 39, 0.06);
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.empty-card h2 {
  margin-bottom: 0.25rem;
  font-weight: 700;
}

.empty-card p {
  color: var(--muted);
  margin-bottom: 1rem;
}

/* Responsive */
@media (max-width: 940px) {
  .app-body {
    grid-template-columns: 1fr;
  }
  .sidebar {
    order: 2;
  }
  .content {
    order: 1;
  }
  .search-input {
    width: 160px;
  }
}
</style>
