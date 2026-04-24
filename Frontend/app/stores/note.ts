import { defineStore } from 'pinia'

export const useNoteStore = defineStore('note', () => {
  const notes = ref<any[]>([])
  const isLoading = ref(false)

  const setNotes = (newNotes: any[]) => {
    notes.value = newNotes
  }

  const updateNoteInList = (id: string, updates: any) => {
    const index = notes.value.findIndex(n => String(n.id) === String(id))
    if (index !== -1) {
      notes.value[index] = { 
        ...notes.value[index], 
        ...updates 
      }
    }
  }

  const addNoteToList = (newNote: any) => {
    notes.value.unshift(newNote)
  }

  return {
    notes,
    isLoading,
    setNotes,
    updateNoteInList,
    addNoteToList
  }
})