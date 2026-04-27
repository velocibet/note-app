<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const { getSharedNote } = useNotesApi();

const noteId = route.params.noteId as string;
const title = ref('');
const content = ref('');
const isLoading = ref(true);
const errorMsg = ref('');
const isBurned = ref(false);

onMounted(async () => {
  try {
    const hashKey = window.location.hash.replace('#', '');
    if (!hashKey) {
      throw new Error('Invalid or missing decryption key.');
    }

    const response = await getSharedNote(noteId);
    const { data } = response;

    title.value = await decryptSharedData(data.title, data.iv, hashKey);
    content.value = await decryptSharedData(data.content, data.iv, hashKey);
    isBurned.value = data.is_burned;

  } catch (err: any) {
    console.error(err);
    errorMsg.value = err.response?.data?.message || 'This note is unavailable, expired, or has been destroyed.';
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="share-view-container">
    <div v-if="isLoading" class="loading-state">
      <p>Securely decrypting your note...</p>
    </div>

    <div v-else-if="errorMsg" class="error-state">
      <div class="warning-icon">⚠️</div>
      <p>{{ errorMsg }}</p>
      <NuxtLink href="/" class="back-link">Return Home</NuxtLink>
    </div>

    <div v-else class="note-display">
      <header class="note-header">
        <h1>{{ title }}</h1>
        <span v-if="isBurned" class="burn-tag">🔥 Self-destructed after reading</span>
      </header>

      <div class="divider" />

      <main class="note-content">
        <div class="text-wrapper">{{ content }}</div>
      </main>

      <footer class="share-footer">
        <p>Shared securely via <strong>Inkwell</strong></p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.share-view-container {
  max-width: 720px;
  margin: 60px auto;
  padding: 0 24px;
  color: #1a1a1a;
}

.loading-state, .error-state {
  text-align: center;
  padding: 40px;
}

.warning-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.note-header h1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: -0.025em;
}

.burn-tag {
  font-size: 0.875rem;
  background: #fee2e2;
  color: #dc2626;
  padding: 6px 12px;
  border-radius: 9999px;
  font-weight: 500;
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 32px 0;
}

.note-content {
  line-height: 1.75;
  font-size: 1.125rem;
}

.text-wrapper {
  white-space: pre-wrap;
  word-break: break-word;
}

.share-footer {
  margin-top: 80px;
  padding-top: 24px;
  border-top: 1px solid #f3f4f6;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
}

.back-link {
  display: inline-block;
  margin-top: 24px;
  color: #4b5563;
  text-decoration: underline;
}
</style>