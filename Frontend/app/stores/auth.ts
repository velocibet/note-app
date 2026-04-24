import { defineStore } from "pinia";

export const useAuthStore = defineStore('auth', () => {
  const username = ref<string | null>(null)
  const masterKey = ref<Uint8Array | null>(null)
  const isInitialized = ref(false)

  const isLoggedIn = computed(() => username.value !== null)
  const isDecrypted = computed(() => masterKey.value !== null)

  const initPromise = ref<Promise<void> | null>(null)

  async function initAuth(userApi: any) {
    if (initPromise.value) return initPromise.value

    initPromise.value = (async () => {
      try {
        const res = await userApi.getMe()
        if (res.success) {
          username.value = res.data.username
        }
      } catch {}

      if (process.client) {
        const savedKey = await getVaultKeyFromIndexedDB()
        if (savedKey.masterKey) {
          masterKey.value = savedKey.masterKey
        }
      }

      isInitialized.value = true
    })()

    return initPromise.value
  }

  function setUsername(name: string) {
    username.value = name
  }

  function setMasterKey(key: Uint8Array) {
    masterKey.value = key
  }

  function logout() {
    username.value = null
    masterKey.value = null
    isInitialized.value = false
    initPromise.value = null
  }

  return {
    username,
    masterKey,
    isInitialized,
    isLoggedIn,
    isDecrypted,
    initAuth,
    setUsername,
    setMasterKey,
    logout
  };
});