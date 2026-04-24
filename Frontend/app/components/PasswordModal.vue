<script setup lang="ts">
const password = ref('')
const visible = ref(false)

const callback = ref<null | ((value: string | null) => void)>(null)

const open = (cb: (value: string | null) => void) => {
  visible.value = true
  password.value = ''
  callback.value = cb
}

const close = () => {
  visible.value = false
  callback.value?.(null)
  callback.value = null
}

const confirm = () => {
  callback.value?.(password.value)
  callback.value = null
  close()
}

defineExpose({ open })
</script>

<template>
  <div v-if="visible" class="modal-backdrop">
    <div class="modal">
      <h2 class="title">Enter Password</h2>
      <p class="subtitle">This action requires authentication</p>

      <input
        v-model="password"
        type="password"
        placeholder="Enter your password"
        class="input"
        @keyup.enter="confirm"
      />

      <div class="actions">
        <button class="btn ghost" @click="close">Cancel</button>
        <button class="btn primary" @click="confirm">Confirm</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
}

.modal {
  width: 360px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  padding: 24px;

  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: pop 0.18s ease-out;
}

@keyframes pop {
  from {
    transform: scale(0.96);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: #111;
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 13px;
  color: #737373;
  margin-bottom: 18px;
}

.input {
  width: 100%;
  padding: 12px 14px;

  border: 1px solid #e5e5e5;
  border-radius: 10px;

  font-size: 14px;
  outline: none;

  transition: all 0.2s ease;
  background: #fafafa;
}

.input:focus {
  border-color: #2563eb;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

.btn {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.btn.ghost {
  background: transparent;
  border-color: #e5e5e5;
  color: #525252;
}

.btn.ghost:hover {
  background: #f5f5f5;
}

.btn.primary {
  background: #111;
  color: #fff;
}

.btn.primary:hover {
  background: #2a2a2a;
}
</style>