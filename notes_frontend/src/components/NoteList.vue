<script setup lang="ts">
import { computed } from 'vue'

type NoteListItem = {
  id: string
  title: string
  content: string
  updatedAt: number
  createdAt: number
}

const props = defineProps<{
  notes: NoteListItem[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()

const sortedNotes = computed(() => {
  return [...props.notes].sort((a, b) => b.updatedAt - a.updatedAt)
})

// PUBLIC_INTERFACE
function selectNote(id: string) {
  /** Emits select event for given note id. */
  emit('select', id)
}

function preview(content: string) {
  const text = content.replace(/\s+/g, ' ').trim()
  return text.length > 80 ? text.slice(0, 80) + '…' : text
}

function formatTime(ts: number) {
  try {
    const d = new Date(ts)
    return d.toLocaleString()
  } catch {
    return ''
  }
}
</script>

<template>
  <div class="list">
    <div v-if="sortedNotes.length === 0" class="empty">
      <p>No notes yet.</p>
      <small>Create a new note to get started.</small>
    </div>

    <ul v-else class="items">
      <li
        v-for="n in sortedNotes"
        :key="n.id"
        class="item"
        :class="{ active: n.id === selectedId }"
        @click="selectNote(n.id)"
        role="button"
        tabindex="0"
        @keydown.enter="selectNote(n.id)"
      >
        <div class="title-row">
          <h3 class="title">{{ n.title || 'Untitled' }}</h3>
          <span class="time">{{ formatTime(n.updatedAt) }}</span>
        </div>
        <p class="preview">{{ preview(n.content) || 'No content yet' }}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.list {
  height: 100%;
  overflow: auto;
  padding: 0.5rem;
}

.empty {
  text-align: center;
  color: #6b7280;
  padding: 2rem 1rem;
}

.items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.item {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 12px;
  padding: 0.75rem;
  cursor: pointer;
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease, background 150ms ease;
}
.item:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(17, 24, 39, 0.07);
  border-color: #d1d5db;
}
.item.active {
  border-color: #bfdbfe;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.08), rgba(37, 99, 235, 0.02));
  box-shadow: 0 12px 20px rgba(37, 99, 235, 0.08);
}

.title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}
.time {
  font-size: 0.7rem;
  color: #6b7280;
  white-space: nowrap;
}

.preview {
  color: #6b7280;
  font-size: 0.85rem;
}
</style>
