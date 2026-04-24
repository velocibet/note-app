export const usePasswordModal = () => {
  const modalRef = ref<any>(null)

  const openPasswordModal = (): Promise<string | null> => {
    return new Promise((resolve) => {
      modalRef.value?.open((value: string | null) => {
        resolve(value)
      })
    })
  }

  return { modalRef, openPasswordModal }
}