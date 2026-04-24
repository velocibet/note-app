// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  imports: {
    dirs: [
      'composables/**',
      'types/**',
      'utils/**',
      'stores/**'
    ]
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
    }
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['modern-normalize/modern-normalize.css', '~/assets/css/globals.css'],
  modules: ['@pinia/nuxt']
})