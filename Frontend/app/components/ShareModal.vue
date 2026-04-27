<script setup lang="ts">
import { ref } from 'vue';
import { ulid } from 'ulid';

const props = defineProps<{
  show: boolean;
  noteId: string | null;
  noteTitle: string;
  noteContent: string;
}>();

const emit = defineEmits(['close']);
const { shareNote } = useNotesApi();

const retention = ref<'burn' | 'ttl'>('ttl');
const ttlOption = ref<'1h' | '1d' | '7d'>('1d');

const close = () => emit('close');

const createShareLink = async () => {
  if (!props.noteId) return;

  try {
    const { payload, shareKey } = await encryptForShare({
      title: props.noteTitle,
      content: props.noteContent
    });

    const shareUlid = ulid();
    const expiresAt = new Date();
    if (ttlOption.value === '1h') expiresAt.setHours(expiresAt.getHours() + 1);
    else if (ttlOption.value === '1d') expiresAt.setDate(expiresAt.getDate() + 1);
    else if (ttlOption.value === '7d') expiresAt.setDate(expiresAt.getDate() + 7);

    await shareNote(props.noteId, {
      id: shareUlid,
      iv: payload.iv,
      encrypted_title: payload.encrypted_title,
      encrypted_content: payload.encrypted_content,
      is_burn_after_read: retention.value === 'burn',
      expires_at: retention.value === 'ttl' ? expiresAt.toISOString() : null,
    });

    const link = `${window.location.origin}/share/${shareUlid}#${shareKey}`;
    await navigator.clipboard.writeText(link);
    
    alert('Secure share link copied to clipboard!');
    close();
  } catch (error) {
    console.error(error);
    alert('Failed to create share link.');
  }
};
</script>

<template>
  <div v-if="show" class="modal-backdrop" @click.self="close">
    <div class="modal">
      <h2 class="title">Share Note</h2>

      <section class="section">
        <h3>1. Retention Policy</h3>
        <label class="radio-label">
          <input type="radio" value="burn" v-model="retention" />
          <span>Burn on Read (One-time view)</span>
        </label>

        <label class="radio-label">
          <input type="radio" value="ttl" v-model="retention" />
          <span>Time-to-Live</span>
        </label>

        <select v-if="retention === 'ttl'" v-model="ttlOption" class="ttl-select">
          <option value="1h">1 hour</option>
          <option value="1d">1 day</option>
          <option value="7d">7 days</option>
        </select>
      </section>

      <section class="info-section">
        <p class="notice">
          * This link is end-to-end encrypted. Even the server cannot read the content.
        </p>
      </section>

      <div class="actions">
        <button @click="close" class="cancel-btn">Cancel</button>
        <button class="primary-btn" @click="createShareLink">
          Create & Copy Link
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.modal {
  width: 420px;
  background: white;
  border-radius: 14px;
  padding: 20px;
}

.title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
}

.section {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

input, select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

button {
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.primary {
  background: black;
  color: white;
}
</style>