<script setup lang="ts">
interface NuxtError {
  url: string
  statusCode: number | string
  statusMessage: string
  message: string
  description: string
  data?: any
}

const props = defineProps<{
  error: NuxtError
}>()

const handleError = () => clearError({ redirect: '/' })

const errorTitle = computed(() => {
  if (props.error?.statusCode === 404) return 'Note Not Found'
  if (props.error?.statusCode === 403) return 'Access Denied'
  return 'System Anomaly'
})

const errorMessage = computed(() => {
  if (props.error?.statusCode === 404) {
    return 'The requested data could not be found. It may have been moved or deleted.'
  }
  if (props.error?.statusCode === 403) {
    return 'You do not have permission to access this data. Please verify your Master Key.'
  }
  return 'An unexpected integrity error has occurred. Checking security protocols.'
})
</script>

<template>
  <div class="error-page">
    <div class="error-container">
      
      <div class="error-icon-wrapper">
        <svg v-if="error?.statusCode === 404" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
          <path d="M12 18v-6"/><path d="M12 10V9"/>
        </svg>
        <svg v-else-if="error?.statusCode === 403" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          <line x1="12" y1="15" x2="12" y2="17"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>

      <div class="error-header">
        <h1 class="error-code">{{ error?.statusCode || 'ERR' }}</h1>
        <h2 class="error-title">{{ errorTitle }}</h2>
      </div>

      <p class="error-message">{{ errorMessage }}</p>

      <div class="error-detail-wrapper" v-if="error?.statusMessage && error.statusCode !== 404">
        <details class="error-details">
          <summary>View Debugging Info (Anomaly Trace)</summary>
          <pre class="error-trace">{{ error.statusMessage }}</pre>
        </details>
      </div>

      <div class="error-actions">
        <button @click="handleError" class="btn-home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Return to Secure Home
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.error-page {
  --color-primary: #2563EB;
  --color-black: #000000;
  --color-white: #ffffff;
  --color-gray-100: #f5f5f5;
  --color-gray-200: #eeeeee;
  --color-gray-400: #a3a3a3;
  --color-gray-500: #737373;
  --color-error: #dc2626;

  min-height: 100vh;
  background-color: var(--color-white);
  color: var(--color-black);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  -webkit-font-smoothing: antialiased;
}

.error-container {
  width: 100%;
  max-width: 560px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Icon */
.error-icon-wrapper {
  width: 80px;
  height: 80px;
  background: var(--color-gray-100);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 48px;
  border: 1px solid var(--color-gray-200);
}

.error-icon-wrapper svg {
  width: 36px;
  height: 36px;
  color: var(--color-black);
}

/* Header */
.error-header {
  margin-bottom: 24px;
}

.error-code {
  font-size: 120px;
  font-weight: 900;
  line-height: 0.8;
  letter-spacing: -0.06em;
  color: var(--color-black);
  margin: 0 0 16px;
}

.error-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-black);
  margin: 0;
}

/* Message */
.error-message {
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-gray-500);
  margin: 0 0 56px;
  word-break: keep-all; /* 한국어 줄바꿈 가독성 */
}

/* Details (Trace) */
.error-detail-wrapper {
  width: 100%;
  text-align: left;
  margin-bottom: 56px;
}

.error-details {
  background: var(--color-gray-100);
  border: 1px solid var(--color-gray-200);
  border-radius: 12px;
  padding: 16px;
  font-size: 13px;
  color: var(--color-gray-600);
}

.error-details summary {
  font-weight: 600;
  cursor: pointer;
  outline: none;
  list-style: none; /* 기본 화살표 숨김 */
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-details summary::-webkit-details-marker {
  display: none; /* 사파리 화살표 숨김 */
}

.error-details[open] summary {
  margin-bottom: 12px;
  color: var(--color-black);
}

.error-trace {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 12px;
  line-height: 1.6;
  background: #ffffff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--color-gray-200);
  overflow-x: auto; /* 코드 길면 가로 스크롤 */
  color: var(--color-error); /* 에러 트레이스는 빨간색 */
  margin: 0;
}

/* Button */
.error-actions {
  width: 100%;
}

.btn-home {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 56px;
  background: var(--color-black);
  color: var(--color-white);
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-home:hover {
  background: var(--color-gray-900);
}

.btn-home svg {
  width: 18px;
  height: 18px;
}

/* Responsive */
@media (max-width: 640px) {
  .error-page { padding: 32px 24px; }
  .error-code { font-size: 80px; }
  .error-title { font-size: 20px; }
  .error-message { font-size: 15px; }
}
</style>