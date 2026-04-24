<script setup lang="ts">
const settingsStore = useSettingsStore()

watch(
  () => settingsStore.theme,
  (theme) => {
    if (process.client) {
        document.documentElement.classList.toggle('dark', theme === 'dark')
      }
  },
  { immediate: true }
)
</script>

<template>
  <div>
    <slot />
  </div>
</template>
