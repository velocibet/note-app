import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<'light' | 'dark'>('light')
  const language = ref<'ko' | 'en'>('ko')

  const isDark = computed(() => theme.value === 'dark')

  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    applyTheme(newTheme)
  }

  const setLanguage = (lang: 'ko' | 'en') => {
    language.value = lang
  }

  const setSettings = (data: { theme?: string; language?: string }) => {
    if (data.theme) {
        setTheme(data.theme === 'dark' ? 'dark' : 'light')
    }

    if (data.language) {
        setLanguage(data.language === 'en' ? 'en' : 'ko')
    }
  }

  const loadSettings = async () => {
    const { getSettings } = useSettingsApi()
    const res = await getSettings()

    if (res.success) {
      setSettings(res.data)
    }
  }

  const saveSettings = async () => {
    const { updateSettings } = useSettingsApi()

    await updateSettings({
      theme: theme.value,
      language: language.value
    })
  }

  const applyTheme = (theme: 'light' | 'dark') => {
    if (process.client) {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }

  return {
    theme,
    language,
    isDark,

    setTheme,
    setLanguage,
    setSettings,

    loadSettings,
    saveSettings
  }
})