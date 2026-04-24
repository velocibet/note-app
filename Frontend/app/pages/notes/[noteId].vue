<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count'

const notesApi = useNotesApi()
const authStore = useAuthStore()
const noteStore = useNoteStore()
const router = useRouter()
const route = useRoute()

const noteId = computed(() => route.params.noteId as string)

const noteTitle = ref<string>('')
  
const editor = useEditor({
  extensions: [
    StarterKit,
    CharacterCount
  ],
  content: '',
  onUpdate: () => {
    triggerAutoSave()
  }
})

const isLoading = ref(true)
const isSaving = ref(false)
let saveTimeout: ReturnType<typeof setTimeout> | null = null

const characterCount = computed(() => {
  return editor.value?.storage.characterCount.characters() || 0
})

const setup = async (id: string) => {
  if (!id || !editor.value) return
  isLoading.value = true

  if (saveTimeout) {
    clearTimeout(saveTimeout)
    saveTimeout = null
  }

  try {
    const response = await notesApi.getNote(id)
    if (!response || !response.success) {
      alert(response.message)
      router.push('/notes')
      return
    }

    const targetData = response.data
    const vaultKey = authStore.masterKey

    if (!vaultKey) {
      editor.value.commands.setContent('<p>No master key, please log in again.</p>')
      return
    }

    const decrypted = await decryptNote(vaultKey, targetData)
    const contentObj = JSON.parse(decrypted.content)

    noteTitle.value = decrypted.title || 'Untitled'
    editor.value.commands.setContent(contentObj)

    // console.log("복호화 및 로드 완료")
  } catch (e) {
    // console.error("복호화 중 폭발:", e)
    editor.value.commands.setContent('<p style="color: red;">Decryption failed. Check the key.</p>')
  } finally {
    setTimeout(() => {
      isLoading.value = false
    }, 200)
  }
}

const saveNote = async () => {
  if (!noteId.value || !editor.value) return
  
  isSaving.value = true
  // console.log("자동 저장 시작...")

  // 800ms wait
  const minWait = new Promise(resolve => setTimeout(resolve, 800));

  try {
    const vaultKey = authStore.masterKey
    if (!vaultKey) return

    const jsonContent = editor.value.getJSON()

    const encrypted = await encryptNote(vaultKey, {
      title: noteTitle.value,
      content: JSON.stringify(jsonContent),
      tags: [""]
    })

    await Promise.all([
      notesApi.updateNote(noteId.value, {
        ...encrypted,
        tags: encrypted.tags ?? ''
      }),
      minWait
    ])

    noteStore.updateNoteInList(noteId.value, {
      title: noteTitle.value,
      content: editor.value.getText().substring(0, 100)
    })
    
    // console.log("저장 완료!")
  } catch (e) {
    // console.error("저장 실패:", e)
  } finally {
    isSaving.value = false
  }
}

const triggerAutoSave = () => {
  if (isLoading.value || !editor.value) return
  if (saveTimeout) clearTimeout(saveTimeout)
  
  saveTimeout = setTimeout(() => {
    saveNote()
  }, 1200)
}

onMounted(() => {
  setup(noteId.value)
})

watch(noteTitle, () => {
  if (!isLoading.value) {
    triggerAutoSave()
  }
})

watch(noteId, (newId) => {
  if (newId) {
    setup(newId)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div class="note-container">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-skeleton">
        <div class="skeleton-title"></div>
        <div class="skeleton-toolbar"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>

    <header class="editor-header">
      <div class="status-badge" :class="{ 'is-saving': isSaving }">
        {{ isSaving ? 'Saving...' : 'Saved!' }}
      </div>
      <div class="header-actions">
        <!-- <button class="action-btn" title="공유">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          Share
        </button> -->
        <button class="action-btn primary" @click="saveNote" :disabled="isSaving">
          Save
        </button>
      </div>
    </header>

    <div v-show="!isLoading" class="note-editor-view">
      <div class="title-section">
        <textarea
          v-model="noteTitle"
          class="title-textarea"
          placeholder="Untitled"
          rows="1"
          @input="(e: any) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }"
        ></textarea>
      </div>

      <div v-if="editor" class="editor-toolbar">
        <button 
          @click="editor.chain().focus().toggleBold().run()" 
          :class="{ 'is-active': editor.isActive('bold') }"
          class="toolbar-btn"
          title="Bold"
        >
          <b>B</b>
        </button>
        <button 
          @click="editor.chain().focus().toggleItalic().run()" 
          :class="{ 'is-active': editor.isActive('italic') }"
          class="toolbar-btn"
          title="Tilting"
        >
          <i>I</i>
        </button>
        <button 
          @click="editor.chain().focus().toggleUnderline().run()" 
          :class="{ 'is-active': editor.isActive('underline') }"
          class="toolbar-btn"
          title="Underline"
        >
          <u>U</u>
        </button>
        
        <div class="divider"></div>

        <!-- <button 
          @click="editor.chain().focus().setParagraph().run()" 
          :class="{ 'is-active': editor.isActive('paragraph') }"
          class="toolbar-btn"
          title="문단"
        >
          P
        </button> -->
        <button 
          @click="editor.chain().focus().toggleBulletList().run()" 
          :class="{ 'is-active': editor.isActive('bulletList') }"
          class="toolbar-btn"
          title="A bullet mark"
        >
          • List
        </button>
      </div>

      <div class="content-section">
        <EditorContent :editor="editor" />
      </div>
    </div>

    <footer class="editor-footer">
      <div class="editor-info">
        <span class="count-item"><b>{{ characterCount }}</b> characters</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 100;
  padding: 40px 100px;
  display: flex;
  justify-content: center;
}

.loading-skeleton {
  max-width: 900px;
  width: 100%;
}

.skeleton-title {
  height: 48px;
  width: 60%;
  background: var(--color-gray-50);
  margin-bottom: 32px;
  border-radius: 8px;
}

.skeleton-toolbar {
  height: 40px;
  width: 100%;
  background: var(--color-gray-50);
  margin-bottom: 24px;
  border-radius: 8px;
}

.skeleton-line {
  height: 20px;
  width: 100%;
  background: var(--color-gray-50);
  margin-bottom: 16px;
  border-radius: 4px;
}

.skeleton-line.short {
  width: 40%;
}

.skeleton-title, .skeleton-toolbar, .skeleton-line {
  background: linear-gradient(90deg, #f2f2f2 25%, #fafafa 50%, #f2f2f2 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.note-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
  position: relative;
}

/* 상단바 */
.editor-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--color-gray-100);
}

.status-badge {
  font-size: 13px;
  color: var(--color-gray-400);
  transition: color 0.3s;
}
.status-badge.is-saving {
  color: var(--color-primary);
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--color-gray-200);
  background: #fff;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--color-gray-50);
}

.action-btn.primary {
  background: var(--color-black);
  color: #fff;
  border: none;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

/* 하단바 */
.editor-footer {
  height: 32px;
  border-top: 1px solid var(--color-gray-100);
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: var(--color-gray-50);
}

.editor-info {
  font-size: 12px;
  color: var(--color-gray-500);
}

.note-editor-view {
  flex: 1;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  max-width: 90%;
  margin: 0 auto;
  width: 100%;
  overflow-y: auto;
}

.title-section {
  margin-bottom: 32px;
}

.title-textarea {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 40px;
  font-weight: 800;
  color: var(--color-black);
  resize: none;
  padding: 0;
  line-height: 1.2;
  font-family: inherit;
  display: block;
}

.title-textarea::placeholder {
  color: var(--color-gray-200);
}

.content-section {
  min-height: 400px;
}

:deep(.tiptap) {
  outline: none;
  font-size: 18px;
  line-height: 1.7;
  color: var(--color-gray-700);
}

:deep(.tiptap p.is-editor-empty:first-child::before) {
  content: 'Write something amazing...';
  float: left;
  color: var(--color-gray-300);
  pointer-events: none;
  height: 0;
}

/* 도구 모음 스타일 */
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: var(--color-gray-50);
  border-radius: 8px;
  margin-bottom: 24px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-gray-600);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: var(--color-gray-200);
}

.toolbar-btn.is-active {
  background: var(--color-black);
  color: white;
}

.divider {
  width: 1px;
  height: 18px;
  background: var(--color-gray-200);
  margin: 0 8px;
}

/* 불렛 포인트(둥근 점) 스타일 적용을 위해 추가 */
:deep(.tiptap ul) {
  padding-left: 1.5rem;
  margin: 1rem 0;
  list-style-type: disc;
}

:deep(.tiptap li) {
  margin-bottom: 0.5rem;
}
</style>