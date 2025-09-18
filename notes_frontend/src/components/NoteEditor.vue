<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'

type Note = {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

const props = defineProps<{
  note: Note | null
}>()

const emit = defineEmits<{
  (e: 'update', payload: { id: string; title: string; content: string }): void
}>()

// Local editable state for smooth typing UX
const state = reactive({
  id: '',
  title: '',
  content: '',
})

// Template ref for the title input
const titleInput = ref<HTMLInputElement | null>(null)

// Focus title on mount and when a new note is selected
onMounted(() => {
  if (titleInput.value) {
    titleInput.value.focus()
    titleInput.value.select()
  }
})

// Sync local state when note changes
watch(
  () => props.note,
  (n) => {
    if (!n) return
    state.id = n.id
    state.title = n.title
    state.content = n.content
    // Focus when switching notes
    requestAnimationFrame(() => {
      if (titleInput.value) {
        titleInput.value.focus()
        titleInput.value.select()
      }
    })
  },
  { immediate: true },
)

// Debounced update to avoid excessive writes
let t: number | null = null
function scheduleUpdate() {
  if (!state.id) return
  if (t) window.clearTimeout(t)
  t = window.setTimeout(() => {
    emit('update', { id: state.id, title: state.title.trim(), content: state.content })
  }, 300)
}
</script>

<template>
  <div v-if="note" class="editor">
    <input
      ref="titleInput"
      v-model="state.title"
      class="title-input"
      placeholder="Note title"
      @input="scheduleUpdate"
      :aria-label="`Title for note ${state.id}`"
      :autofocus="true"
    />
    <textarea
      v-model="state.content"
      class="content-area"
      placeholder="Start typing..."
      @input="scheduleUpdate"
      :aria-label="`Content for note ${state.id}`"
    />
  </div>
</template>

<style scoped>
.editor {
  display: grid;
  gap: 0.5rem;
  height: calc(100% - 0.5rem);
}

.title-input {
  padding: 0.85rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  outline: none;
  transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
}
.title-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

.content-area {
  min-height: 50vh;
  flex: 1;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #111827;
  outline: none;
  resize: vertical;
  transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
}
.content-area:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}
</style>
