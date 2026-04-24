<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const userApi = useUserApi()
const notesApi = useNotesApi()
const authStore = useAuthStore()
const noteStore = useNoteStore()

const { notes } = storeToRefs(noteStore)
// const notes = ref<Note[]>([])
const isLoading = ref(true)
const currentTab = ref('home')
const searchQuery = ref<string>('')
const currentNoteId = computed(() => route.params.id)
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  selectedId: '' as string
})

const filteredNotes = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return (notes.value as any[])
    .filter((note) => {
      const title = note.displayTitle?.toLowerCase() || ''
      const content = note.displayContent?.toLowerCase() || ''
      const matchesQuery = title.includes(query) || content.includes(query)
      if (!matchesQuery) return false

      if (currentTab.value === 'trash') {
        return note.is_deleted
      } else {
        if (note.is_deleted) return false

        if (currentTab.value === 'star') {
          return note.is_pinned
        } else if (currentTab.value === 'archive') {
          return note.is_archived
        } else {
          return true
        }
      }
    })
    .sort((a, b) => {
      if (a.is_pinned === b.is_pinned) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return a.is_pinned ? -1 : 1
    })
})

const navItems = [
  { icon: 'home', label: 'All Notes', active: true },
  { icon: 'star', label: 'Favorites', active: false },
  { icon: 'archive', label: 'Archive', active: false },
  { icon: 'trash', label: 'Trash', active: false },
]

const changeTab = (tabIcon: string) => {
  currentTab.value = tabIcon
}

const togglePin = async (note: any, event: Event) => {
  event.stopPropagation()

  const previousStatus = note.is_pinned
  const newStatus = !previousStatus

  note.is_pinned = newStatus
  noteStore.updateNoteInList(note.id, { is_pinned: newStatus })
  try {
    await notesApi.updateNote(note.id, { is_pinned: newStatus })
    
    note.is_pinned = newStatus
    noteStore.updateNoteInList(note.id, { is_pinned: newStatus })
  } catch (e) {
    console.error("고정 실패:", e)
    note.is_pinned = previousStatus
    noteStore.updateNoteInList(note.id, { is_pinned: previousStatus })
    alert('Status update failed, please try again.')
  }
}

const openContextMenu = (e: MouseEvent, id: string) => {
  e.preventDefault()
  contextMenu.value = {
    show: true,
    x: e.clientX,
    y: e.clientY,
    selectedId: id
  }
  
  const closeMenu = () => {
    contextMenu.value.show = false
    document.removeEventListener('click', closeMenu)
  }
  document.addEventListener('click', closeMenu)
}

const deleteNote = async () => {
  const id = contextMenu.value.selectedId
  if (!id) return
  
  if (confirm('Are you sure you want to delete this note?')) {
    try {
      await notesApi.deleteNote(id)
      noteStore.setNotes(notes.value.filter(n => n.id !== id))
    } catch (e) {
      console.error("삭제 실패:", e)
    }
  }
}

const fetchNotes = async () => {
  isLoading.value = true
  const response = await notesApi.getNotes()
  
  if (response.success && Array.isArray(response.data)) {
    const vaultKey = authStore.masterKey
    if (!vaultKey) {
      navigateTo('/login')
      return
    }
    const decryptedNotes = await Promise.all(response.data.map(async (note: any) => {
      try {
        const decrypted = await decryptNote(vaultKey, {
          title: note.title,
          content: note.content,
          iv: note.iv,
          tags: note.tags || ''
        })

        let plainTextContent = ''
        try {
          const jsonContent = JSON.parse(decrypted.content)
          plainTextContent = jsonContent.content?.[0]?.content?.[0]?.text || '내용 없음'
        } catch (e) {
          plainTextContent = decrypted.content
        }

        return {
          ...note,
          displayTitle: decrypted.title || 'An untitled note',
          displayContent: plainTextContent || 'No description',
          preview: 'click to encrypt'
        }
      } catch (e) {
        return { ...note, displayTitle: 'Encrypted Note' }
      }
    }))

    noteStore.setNotes(decryptedNotes)
    notes.value = decryptedNotes
    isLoading.value = false
  }
}

const selectNote = (id: string) => {
  router.push(`/notes/${id}`)
}


const createNewNote = async () => {
  if (!authStore.masterKey) return

  const initialContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Try writing a new note.'
          }
        ]
      }
    ]
  }

  const encryptedData = await encryptNote(
    authStore.masterKey,
    {
      title: "Please enter the title",
      content: JSON.stringify(initialContent),
      tags: []
    }
  )

  const payload: CreateNoteDto = {
    ...encryptedData,
    tags: encryptedData.tags ?? '',
    is_pinned: false
  }

  const response = await notesApi.createNote(payload);
  if (!response.success) return

  await fetchNotes()

  // const newNote = {
  //   ...response.data,
  //   displayTitle: "제목을 입력하세요",
  //   displayContent: "새로운 노트를 작성해 보세요.",
  //   is_pinned: false,
  //   created_at: new Date().toISOString()
  // }

  // noteStore.setNotes([newNote, ...notes.value])

  router.push(`/notes/${response.data.id}`)
}

const getRemainingDays = (deletedAt: string) => {
  const deletedDate = new Date(deletedAt)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - deletedDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, 14 - diffDays)
}

const permanentlyDelete = async (id: string) => {
  if (confirm('This action is irreversible, do you want to delete it permanently?')) {
    try {
      await notesApi.permanentlyDeleteNote(id)
      noteStore.setNotes(notes.value.filter(n => n.id !== id))
    } catch (e) {
      console.error(e)
    }
  }
}

const toggleArchive = async () => {
  const id = contextMenu.value.selectedId
  const note = notes.value.find(n => String(n.id) === String(id))
  if (!id || !note) return
  
  const newStatus = !note.is_archived
  
  try {
    await notesApi.updateNote(id, { is_archived: newStatus })
    noteStore.updateNoteInList(id, { is_archived: newStatus })
    
    contextMenu.value.show = false
  } catch (e) {
    // console.error("아카이브 처리 실패:", e)
    alert(newStatus ? 'Failed to move to storage box.' : 'Failed to pull from storage box.')
  }
}

const handleLogout = async () => {
  try {
    await userApi.getLogout()
    authStore.logout()

    await clearAllKeysFromIndexedDB()
    await router.push('/login')
  } catch (e) {
    // console.error('로그아웃 실패:', e)
    authStore.logout()
    await router.push('/login')
  }
}

// onMounted(() => {
//   fetchNotes()
// })
onMounted(async () => {
  const authStore = useAuthStore()

  const savedKey = await getVaultKeyFromIndexedDB()
  if (savedKey.masterKey) {
    authStore.setMasterKey(savedKey.masterKey)
  }
  
  fetchNotes()
})
// watch(
//   () => authStore.masterKey,
//   (key) => {
//     if (key) {
      
//     }
//   },
//   { immediate: true }
// )
</script>

<template>
  <!-- <ClientOnly> -->
    <div class="dashboard">
      <!-- Sidebar -->
      <aside class="sidebar">
        <NuxtLink to="/notes" class="sidebar-logo">
          <!-- <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg> -->
          <img src="/favicon.ico" width="35">
        </NuxtLink>

        <nav class="sidebar-nav">
          <button
            v-for="item in navItems"
            :key="item.label"
            class="sidebar-nav-item"
            :class="{ 'sidebar-nav-item--active': currentTab === item.icon }"
            :title="item.label"
            @click="changeTab(item.icon)"
          >
            <svg v-if="item.icon === 'home'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <svg v-else-if="item.icon === 'star'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <svg v-else-if="item.icon === 'archive'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="21 8 21 21 3 21 3 8"/>
              <rect x="1" y="3" width="22" height="5"/>
              <line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </nav>

        <div class="sidebar-bottom">
          <NuxtLink to="/settings" class="sidebar-nav-item" title="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </NuxtLink>
          <div @click="handleLogout" class="sidebar-nav-item" title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
        </div>
      </aside>

      <!-- Notes List -->
      <div class="notes-list">
        <div class="notes-list-header">
          <h2 class="notes-list-title">
            <template v-if="currentTab === 'home'">All Notes</template>
            <template v-else-if="currentTab === 'star'">Favorites</template>
            <template v-else-if="currentTab === 'archive'">Archive</template>
            <template v-else-if="currentTab === 'trash'">Trash</template>
          </h2>
          <span class="notes-list-count">{{ notes.length }} notes</span>
        </div>

        <div class="notes-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="notes-search-input"
            placeholder="Search notes..."
          />
        </div>

        <div class="notes-items">
          <template v-if="isLoading">
            <div v-for="i in 5" :key="i" class="note-item skeleton">
              <div class="skeleton-pin"></div>
              <div class="note-item-header">
                <div class="skeleton-title"></div>
              </div>
              <div class="skeleton-preview"></div>
              <div class="skeleton-preview short"></div>
              <div class="skeleton-time"></div>
            </div>
          </template>
          <template v-else>
            <!-- <span v-if="filteredNotes.length === 0">고정된 노트가 없습니다.</span> -->
            <div v-if="filteredNotes.length === 0" class="empty-state">
              <div class="empty-state-icon">
                <svg v-if="currentTab === 'home'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>

                <svg v-else-if="currentTab === 'star'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>

                <svg v-else-if="currentTab === 'archive'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <polyline points="21 8 21 21 3 21 3 8"/>
                  <rect x="1" y="3" width="22" height="5"/>
                  <line x1="10" y1="12" x2="14" y2="12"/>
                </svg>

                <svg v-else-if="currentTab === 'trash'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </div>

              <h3 class="empty-state-title">
                <template v-if="currentTab === 'home'">No notes found</template>
                <template v-else-if="currentTab === 'star'">No favorites yet</template>
                <template v-else-if="currentTab === 'archive'">Archive is empty</template>
                <template v-else-if="currentTab === 'trash'">Trash is empty</template>
              </h3>

              <p class="empty-state-description">
                <template v-if="currentTab === 'home'">Write a new note or check your search term.</template>
                <template v-else-if="currentTab === 'star'">Click an asterisk to secure your important notes.</template>
                <template v-else-if="currentTab === 'archive'">Move notes to the storage box for later viewing.</template>
                <template v-else-if="currentTab === 'trash'">No notes have been deleted. The trash bin is clean!</template>
              </p>
            </div>
            <button
              v-for="note in filteredNotes"
              :key="note.id"
              class="note-item"
              :class="{ 'note-item--active': String(note.id) === String(currentNoteId) }"
              @click="selectNote(note.id)"
              @contextmenu="openContextMenu($event, note.id)" 
            >
              <div class="pin-badge" :class="{ 'is-pinned': note.is_pinned }" @click.stop="togglePin(note, $event)">
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>

              <div class="note-item-header">
                <h3 class="note-item-title">{{ (note as any).displayTitle }}</h3>
              </div>
              <p class="note-item-preview">{{ (note as any).displayContent }}</p>
              <span class="note-item-time">Created at {{ new Date(note.created_at).toLocaleDateString() }}</span>

              <div v-if="currentTab === 'trash'" class="trash-actions">
                <span class="delete-deadline">
                  Delete after {{ getRemainingDays(note.deleted_at) }} days
                </span>
                <button class="immediate-delete-btn" @click.stop="permanentlyDelete(note.id)">
                  Delete now
                </button>
              </div>
            </button>
          </template>
        </div>
      </div>

      <div 
        v-if="contextMenu.show" 
        class="context-menu"
        :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      >
        <button @click="toggleArchive" class="menu-item">
          <template v-if="notes.find(n => String(n.id) === String(contextMenu.selectedId))?.is_archived">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 13 12 10 9 13"></polyline>
              <line x1="12" y1="10" x2="12" y2="16"></line>
              <path d="M21 8v13H3V8"></path>
              <path d="M1 3h22v5H1z"></path>
            </svg>
            Unarchive Note
          </template>
          <template v-else>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="21 8 21 21 3 21 3 8"></polyline>
              <rect x="1" y="3" width="22" height="5"></rect>
              <line x1="10" y1="12" x2="14" y2="12"></line>
            </svg>
            Archive Note
          </template>
        </button>

        <div class="menu-divider"></div>

        <button @click="deleteNote" class="menu-item delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Delete Note
        </button>
      </div>

      <!-- Note Preview -->
      <div class="note-preview">
        <NuxtPage />
      </div>

      <!-- Floating New Note Button -->
      <div @click="createNewNote" class="new-note-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
    </div>
  <!-- </ClientOnly> -->
</template>

<style scoped>
.dashboard {
  --color-primary: #2563EB;
  --color-primary-hover: #1d4ed8;
  --color-black: #000000;
  --color-white: #ffffff;
  --color-gray-50: #fafafa;
  --color-gray-100: #f5f5f5;
  --color-gray-200: #eeeeee;
  --color-gray-300: #d4d4d4;
  --color-gray-400: #a3a3a3;
  --color-gray-500: #737373;
  --color-gray-600: #525252;

  display: flex;
  height: 100vh;
  background: var(--color-white);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Sidebar */
.sidebar {
  width: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  background: var(--color-gray-50);
  border-right: 1px solid var(--color-gray-200);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: var(--color-black);
  margin-bottom: 32px;
}

.sidebar-logo svg {
  width: 28px;
  height: 28px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  border-radius: 12px;
  color: var(--color-gray-400);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  cursor: pointer;
}

.sidebar-nav-item:hover {
  background: var(--color-gray-200);
  color: var(--color-gray-600);
}

.sidebar-nav-item--active {
  background: var(--color-black);
  color: var(--color-white);
}

.sidebar-nav-item--active:hover {
  background: var(--color-black);
  color: var(--color-white);
}

.sidebar-nav-item svg {
  width: 22px;
  height: 22px;
}

.sidebar-bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Notes List */
.notes-list {
  width: 360px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-gray-200);
  background: var(--color-white);
}

.notes-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 24px 20px;
}

.notes-list-title {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-black);
  margin: 0;
}

.notes-list-count {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-gray-400);
}

.notes-search {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 24px 20px;
  padding: 12px 16px;
  background: var(--color-gray-100);
  border-radius: 12px;
}

.notes-search svg {
  width: 18px;
  height: 18px;
  color: var(--color-gray-400);
  flex-shrink: 0;
}

.notes-search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: inherit;
  color: var(--color-black);
}

.notes-search-input::placeholder {
  color: var(--color-gray-400);
}

.notes-items {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 24px;
}

.note-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 20px;
  margin-bottom: 8px;
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.note-item:hover {
  border-color: var(--color-gray-300);
}

.note-item--active {
  background: var(--color-gray-50);
  border-color: var(--color-black);
}

.note-item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.note-item-title {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-black);
  margin: 0;
  line-height: 1.3;
}

.note-item-lock {
  width: 14px;
  height: 14px;
  color: var(--color-gray-400);
  flex-shrink: 0;
  margin-top: 2px;
}

.note-item-preview {
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-gray-500);
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-item-time {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-gray-400);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Note Preview */
.note-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* New Note Button */
.new-note-btn {
  position: fixed;
  bottom: 32px;
  right: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: var(--color-black);
  color: var(--color-white);
  border-radius: 20px;
  text-decoration: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  cursor: pointer;
}

.new-note-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.new-note-btn svg {
  width: 28px;
  height: 28px;
}

/* Responsive */
@media (max-width: 1024px) {
  .note-preview {
    display: none;
  }

  .notes-list {
    flex: 1;
    width: auto;
    border-right: none;
  }
}

@media (max-width: 640px) {
  .sidebar {
    width: 60px;
  }

  .sidebar-logo {
    width: 36px;
    height: 36px;
    margin-bottom: 24px;
  }

  .sidebar-logo svg {
    width: 24px;
    height: 24px;
  }

  .sidebar-nav-item {
    width: 36px;
    height: 36px;
  }

  .sidebar-nav-item svg {
    width: 18px;
    height: 18px;
  }

  .notes-list-header {
    padding: 20px 16px 16px;
  }

  .notes-list-title {
    font-size: 20px;
  }

  .notes-search {
    margin: 0 16px 16px;
  }

  .notes-items {
    padding: 0 8px 24px;
  }

  .note-item {
    padding: 16px;
    border-radius: 12px;
  }

  .new-note-btn {
    width: 56px;
    height: 56px;
    bottom: 24px;
    right: 24px;
    border-radius: 16px;
  }

  .new-note-btn svg {
    width: 24px;
    height: 24px;
  }
}

/* 노트 아이템 내 별 아이콘 위치 */
.note-item {
  position: relative; /* 별 배치를 위해 필요 */
}

.pin-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 20px;
  height: 20px;
  color: var(--color-gray-200); /* 평소에는 연한 회색 */
  transition: all 0.2s;
  z-index: 5;
}

.pin-badge:hover {
  transform: scale(1.2);
  color: var(--color-gray-400);
}

.pin-badge.is-pinned {
  color: #FBBF24; /* 활성화 시 노란색 */
}

/* 우클릭 드롭다운 메뉴 */
.context-menu {
  position: fixed;
  z-index: 1000;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--color-gray-200);
  padding: 4px;
  min-width: 150px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  text-align: left;
}

.menu-item:hover {
  background: var(--color-gray-50);
}

.menu-item.delete {
  color: #EF4444;
}

.menu-item.delete:hover {
  background: #FEF2F2;
}

.menu-item svg {
  width: 14px;
  height: 14px;
}

.skeleton {
  pointer-events: none;
  border-color: var(--color-gray-100) !important;
}

.skeleton-title,
.skeleton-preview,
.skeleton-time,
.skeleton-pin {
  background: linear-gradient(90deg, #f2f2f2 25%, #fafafa 50%, #f2f2f2 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-pin {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.skeleton-title {
  height: 18px;
  width: 70%;
  margin-bottom: 12px;
}

.skeleton-preview {
  height: 14px;
  width: 100%;
  margin-bottom: 8px;
}

.skeleton-preview.short {
  width: 40%;
  margin-bottom: 16px;
}

.skeleton-time {
  height: 11px;
  width: 30%;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty State Styling */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  animation: fadeIn 0.5s ease-out;
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  background: var(--color-gray-100);
  color: var(--color-gray-400);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.empty-state:hover .empty-state-icon {
  transform: translateY(-5px) rotate(5deg);
  color: var(--color-primary);
}

.empty-state-icon svg {
  width: 32px;
  height: 32px;
}

.empty-state-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-black);
  margin: 0 0 8px 0;
}

.empty-state-description {
  font-size: 13px;
  color: var(--color-gray-500);
  line-height: 1.6;
  max-width: 200px;
  margin: 0;
  word-break: keep-all;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sidebar-nav-item--active {
  background: var(--color-black) !important;
  color: var(--color-white) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.sidebar-nav-item--active svg {
  stroke: var(--color-white); 
}

.trash-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--color-gray-200);
}

.delete-deadline {
  font-size: 11px;
  font-weight: 600;
  color: #DC2626;
  background: #FEF2F2;
  padding: 4px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.delete-deadline::before {
  font-size: 10px;
}

.immediate-delete-btn {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-gray-500);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  transition: color 0.2s;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.immediate-delete-btn:hover {
  color: #000000;
}

.context-menu {
  min-width: 180px;
  padding: 6px;
}

.menu-divider {
  height: 1px;
  background-color: var(--color-gray-100);
  margin: 4px 8px;
}

.menu-item {
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.1s ease;
}

.menu-item svg {
  width: 16px;
  height: 16px;
  stroke-width: 1.8;
}
</style>
