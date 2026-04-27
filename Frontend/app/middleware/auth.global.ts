export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const userApi = useUserApi()

  if (!authStore.isInitialized) {
    await authStore.initAuth(userApi)
  }

  if (!authStore.isInitialized) return

  const publicPaths = ['/', '/login', '/privacy', '/terms']
  const isExactPublic = publicPaths.includes(to.path)

  const isSharePage = to.path.startsWith('/notes/share/')

  const isPublic = isExactPublic || isSharePage

  if (!authStore.isLoggedIn && !isPublic) {
    return navigateTo('/login')
  }

  if (authStore.isLoggedIn && isExactPublic) {
    return navigateTo('/notes')
  }
})