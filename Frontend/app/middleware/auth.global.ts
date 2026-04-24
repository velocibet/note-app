export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const userApi = useUserApi()

  if (!authStore.isInitialized) {
    await authStore.initAuth(userApi)
  }

  const isPublic = ['/', '/login', '/privacy', '/terms'].includes(to.path)

  if (!authStore.isLoggedIn && !isPublic) {
    return navigateTo('/login')
  }

  if (authStore.isLoggedIn && isPublic) {
    return navigateTo('/notes')
  }
})