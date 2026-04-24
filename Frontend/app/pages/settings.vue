<script setup lang="ts">
const router = useRouter()
const currentTab = ref('general')

const authStore = useAuthStore()
const { modalRef, openPasswordModal } = usePasswordModal()
const { getNotes } = useNotesApi()
const { getSettings, updateSettings } = useSettingsApi()
const { withdraw, changeMasterKey, verifyPassword } = useUserApi()

const tabs = [
  { id: 'general', name: 'General', icon: 'settings' },
  { id: 'security', name: 'Security(Encrypting)', icon: 'lock' },
  { id: 'data', name: 'Account', icon: 'database' },
]

const goBack = () => {
  router.back()
}

const settingsStore = useSettingsStore()
// const settings = ref({
//   theme: 'light',
//   language: 'ko'
// })

const loadSettings = async () => {
  const res = await getSettings()

  if (res.success) {
    settingsStore.setSettings(res.data)
  }
}

const changeTheme = async (theme: 'light' | 'dark') => {
  settingsStore.setTheme(theme)

  await updateSettings({ theme })
}

const changeLanguage = async (e: Event) => {
  const value = (e.target as HTMLSelectElement).value as 'ko' | 'en'

  settingsStore.setLanguage(value)

  await updateSettings({ language: value })
}

const handleWithdraw = async () => {
  const confirmDelete = confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')
  if (!confirmDelete) return

  const res = await withdraw()
  if (res.success) {
    authStore.logout()
    alert('회원탈퇴가 완료되었습니다.')
    router.push('/login')
  }
}

const handleChangeMasterKey = async () => {
  const password = await openPasswordModal()
  if (!password) return

  const isPasswordTrue = await verifyPassword({ password })
  if (!isPasswordTrue.success) {
    alert(isPasswordTrue.message)
    return
  }

  if (!authStore.masterKey) {
    alert('마스터 키가 없습니다. 다시 로그인해주세요.')
    return
  }

  if (!authStore.username) {
    alert('마스터 키가 없습니다. 다시 로그인해주세요.')
    return
  }

  try {
    const currentVaultKeyRaw = authStore.masterKey

    const notesRes = await getNotes()
    if (!notesRes.success) throw new Error('노트를 불러오지 못했습니다.')

    const decryptedNotes = await Promise.all(
      notesRes.data.map(async (note: any) => {
        const decrypted = await decryptNote(currentVaultKeyRaw, {
          title: note.title,
          content: note.content,
          tags: note.tags,
          iv: note.iv ?? undefined
        })

        return {
          id: note.id,
          ...decrypted
        }
      })
    )

    const { vaultKeyInfo } = await generateAndEncryptVaultKey(password)

    const newVaultKeyRaw = await decryptVaultKey(password, {
      encrypted_vault_key: vaultKeyInfo.encryptedKey,
      vault_key_iv: vaultKeyInfo.iv,
      vault_key_salt: vaultKeyInfo.salt
    })

    const reEncryptedNotes = await Promise.all(
      decryptedNotes.map(async (note: any) => {
        const encrypted = await encryptNote(newVaultKeyRaw, {
          title: note.title,
          content: note.content,
          tags: note.tags ?? []
        })

        return {
          id: note.id,
          title: encrypted.title,
          content: encrypted.content,
          iv: encrypted.iv,
          tags: encrypted.tags ?? undefined
        }
      })
    )

    const res = await changeMasterKey({
      vaultKeyInfo: {
        encryptedKey: vaultKeyInfo.encryptedKey,
        iv: vaultKeyInfo.iv,
        salt: vaultKeyInfo.salt
      },
      notes: reEncryptedNotes
    })

    if (res.success) {
      saveVaultKeyToIndexedDB(authStore.username, newVaultKeyRaw);
      authStore.setMasterKey(newVaultKeyRaw)
      alert('마스터 키가 변경되었습니다.')
    }

  } catch (e: any) {
    alert(e.message || '마스터 키 변경 실패')
  }
}

onMounted(async () => {
  const authStore = useAuthStore()

  const savedKey = await getVaultKeyFromIndexedDB()
  if (savedKey.masterKey) {
    authStore.setMasterKey(savedKey.masterKey)
  }
  loadSettings()
})
</script>

<template>
  <div class="settings-page">
    <header class="settings-header">
      <button @click="goBack" class="back-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Back to Notes</span>
      </button>
      <h1 class="header-title">Settings</h1>
    </header>

    <div class="settings-container">
      <aside class="settings-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="nav-item"
          :class="{ active: currentTab === tab.id }"
          @click="currentTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </aside>

      <main class="settings-main">
        <section v-if="currentTab === 'general'" class="settings-section">
          <h2 class="section-title">General Settings</h2>
          
          <div class="setting-card">
            <div class="setting-info">
              <label>Language</label>
              <p>Select the language used in the app.</p>
            </div>
            <select
              class="setting-control"
              :value="settingsStore.language"
              @change="changeLanguage"
            >
              <option value="en">English</option>
            </select>
          </div>

          <!-- <div class="setting-card">
            <div class="setting-info">
              <label>Theme Mode</label>
              <p>Protect your eyes in dark environments.</p>
            </div>
            <div class="theme-toggle">
              <button
                :class="{ active: settingsStore.theme === 'light' }"
                @click="changeTheme('light')"
              >
                Light
              </button>

              <button
                :class="{ active: settingsStore.theme === 'dark' }"
                @click="changeTheme('dark')"
              >
                Dark
              </button>
            </div>
          </div> -->
        </section>

        <section v-if="currentTab === 'security'" class="settings-section">
          <h2 class="section-title">Security & Encryption</h2>
          
          <div class="setting-card danger-zone">
            <div class="setting-info">
              <label>Change Master Key</label>
              <p>Changing the master key will re-encrypt all existing notes with a new key. Proceed with caution.</p>
            </div>
            <button class="action-btn danger" @click="handleChangeMasterKey">Change Key</button>
          </div>
        </section>

        <section v-if="currentTab === 'data'" class="settings-section">
          <h2 class="section-title">Account Management</h2>
          
          <div class="setting-card danger-zone">
            <div class="setting-info">
              <label>Delete Account</label>
              <p>All data stored on the server will be permanently deleted and cannot be recovered.</p>
            </div>
            <button class="action-btn danger" @click="handleWithdraw">Delete All Data</button>
          </div>
        </section>
      </main>
    </div>
  </div>

  <PasswordModal ref="modalRef" />
</template>

<style scoped>
.settings-page {
  height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.settings-header {
  padding: 20px 40px;
  border-bottom: 1px solid #eeeeee;
  display: flex;
  align-items: center;
  gap: 24px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #737373;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.back-btn svg { width: 18px; height: 18px; }
.back-btn:hover { color: #000; }

.header-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.settings-container {
  flex: 1;
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 40px;
  gap: 60px;
}

.settings-nav {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  text-align: left;
  padding: 12px 16px;
  background: none;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #737373;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover { background: #f5f5f5; }
.nav-item.active {
  background: #000;
  color: #fff;
}

.settings-main {
  flex: 1;
  max-width: 700px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 32px;
}

.setting-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  border-bottom: 1px solid #f5f5f5;
}

.setting-info label {
  display: block;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.setting-info p {
  font-size: 14px;
  color: #737373;
  margin: 0;
}

.setting-control {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
  min-width: 120px;
}

.action-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.action-btn.danger {
  border-color: #fee2e2;
  color: #ef4444;
}

.action-btn:hover { background: #fafafa; }
.action-btn.danger:hover { background: #fef2f2; }

.theme-toggle {
  display: flex;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 10px;
}

.theme-toggle button {
  padding: 6px 16px;
  border: none;
  background: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.theme-toggle button.active {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .settings-container {
    flex-direction: column;
    padding: 20px;
    gap: 30px;
  }
  .settings-nav { width: 100%; flex-direction: row; overflow-x: auto; }
  .nav-item { white-space: nowrap; }
}
</style>