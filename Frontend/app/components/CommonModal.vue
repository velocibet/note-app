<script setup lang="ts">
defineProps<{
  isOpen: boolean
  title?: string
}>()

const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
        <div class="modal-content">
          <header class="modal-header">
            <h3>{{ title || 'Notification' }}</h3>
            <button class="close-btn" @click="emit('close')">&times;</button>
          </header>
          
          <main class="modal-body">
            <slot /> </main>

          <footer class="modal-footer">
            <button class="confirm-btn" @click="emit('close')">Confirm</button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: #ffffff;
  width: 90%;
  max-width: 450px;
  border-radius: 12px;
  border: 2px solid #000;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 { margin: 0; font-size: 18px; }

.close-btn {
  background: none; border: none; font-size: 24px; cursor: pointer;
}

.modal-body { padding: 20px; line-height: 1.6; }

.modal-footer {
  padding: 16px 20px;
  background: #fafafa;
  text-align: right;
}

.confirm-btn {
  background: #000; color: #fff; border: none;
  padding: 8px 24px; border-radius: 6px; cursor: pointer;
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
</style>