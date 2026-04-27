export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const userApi = useUserApi()

  const publicPaths = ['/', '/login', '/privacy', '/terms']
  const isExactPublic = publicPaths.includes(to.path)
  const isSharePage = to.path.startsWith('/share/')
  const isPublic = isExactPublic || isSharePage

  if (isSharePage) {
    return
  }

  if (!authStore.isInitialized) {
    try {
      await authStore.initAuth(userApi)
    } catch (error) {
      console.error('Auth initialization failed:', error)
    }
  }

  if (!authStore.isLoggedIn && !isPublic) {
    return navigateTo('/login')
  }

  if (authStore.isLoggedIn && isExactPublic) {
    return navigateTo('/notes')
  }
})