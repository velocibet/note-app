<script setup lang="ts">
const router = useRouter();
const userApi = useUserApi();
const authStore = useAuthStore();

const isLogin = ref(true);
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const showSuccess = ref(false);

const errors = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateUsername = (value: string) => {
  if (!value) return 'Username is required'
  if (value.length < 3) return 'Username must be at least 3 characters'
  return ''
}

const validateEmail = (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!value) return 'Email is required'
  if (!emailRegex.test(value)) return 'Please enter a valid email'
  return ''
}

const validatePassword = (value: string) => {
  if (!value) return 'Password is required'
  if (value.length < 8) return 'Password must be at least 8 characters'
  return ''
}

const validateConfirmPassword = (value: string) => {
  if (!isLogin.value) {
    if (!value) return 'Please confirm your password'
    if (value !== password.value) return 'Passwords do not match'
  }
  return ''
}

const isFormValid = computed(() => {
  const usernameValid = !validateUsername(username.value)
  const passwordValid = !validatePassword(password.value)

  if (isLogin.value) {
    return usernameValid && passwordValid
  }

  const emailValid = !validateEmail(email.value)
  const confirmValid = isLogin.value || !validateConfirmPassword(confirmPassword.value)
  return usernameValid && emailValid && passwordValid && confirmValid
})

const handleBlur = (field: 'username' | 'email' | 'password' | 'confirmPassword') => {
  if (field === 'username') {
    errors.value.username = validateUsername(username.value)
  } else if (field === 'email') {
    errors.value.email = validateEmail(email.value)
  } else if (field === 'password') {
    errors.value.password = validatePassword(password.value)
  } else if (field === 'confirmPassword') {
    errors.value.confirmPassword = validateConfirmPassword(confirmPassword.value)
  }
}

const getLogin = async () => {
    const payload: LoginDto = {
        username: username.value,
        password: password.value
    }

    const res = await userApi.getLogin(payload)

    if (!res.success) {
        alert(res.message)
        return false
    }

    // 키 복호화 후 저장
    const decryptedVaultKey = await decryptVaultKey(password.value, res.data.vaultKeys)
    if (!decryptedVaultKey) return false
    
    await saveVaultKeyToIndexedDB(username.value, decryptedVaultKey)
    await authStore.setUsername(username.value)
    await authStore.setMasterKey(decryptedVaultKey)

    router.push('/notes')
    return true
}

const getRegister = async () => {
    // console.log(`아이디: ${username.value} 이메일: ${email.value} 비밀번호: ${password.value}`)

    const keyInfo = await generateAndEncryptVaultKey(password.value)

    const payload: RegisterDto = {
        username: username.value,
        email: email.value, 
        password: password.value,
        keyInfo: keyInfo.vaultKeyInfo
    }

    const reponse = await userApi.getRegister(payload)

    if (!reponse.success) {
        alert(reponse.message)
        return false
    };
    
    return true
}

const handleSubmit = async () => {
  errors.value.username = validateUsername(username.value)
  errors.value.email = validateEmail(email.value)
  errors.value.password = validatePassword(password.value)

  if (!isLogin.value) {
    errors.value.confirmPassword = validateConfirmPassword(confirmPassword.value)
  }

  if (!isFormValid.value) return

  isLoading.value = true

  let success = false

  if (isLogin.value) {
    success = await getLogin()
  } else {
    success = await getRegister()
  }

  isLoading.value = false

  if (!success) return

  showSuccess.value = true

  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  errors.value = { username: '', email: '', password: '', confirmPassword: '' }
  confirmPassword.value = ''
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Left: Branding -->
      <div class="login-branding">
        <NuxtLink to="/" class="login-logo">
          <img src="/favicon.ico" width="35">
          <span>Inkwell</span>
        </NuxtLink>
        
        <div class="login-branding-content">
          <h2 class="login-branding-title">Your thoughts deserve privacy</h2>
          <p class="login-branding-text">
            End-to-end encrypted notes that only you can read. 
            Zero-knowledge architecture ensures your data stays yours.
          </p>
          
          <div class="login-features">
            <div class="login-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>256-bit AES encryption</span>
            </div>
            <div class="login-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Zero-knowledge architecture</span>
            </div>
            <div class="login-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Sync across all devices</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Form -->
      <div class="login-form-section">
        <div class="login-form-container">
          <div class="login-form-header">
            <h1 class="login-title">{{ isLogin ? 'Login' : 'Sign up' }}</h1>
            <p class="login-subtitle">
              {{ isLogin ? 'Welcome back. Enter your credentials to continue.' : 'Create your encrypted account.' }}
            </p>
          </div>

          <!-- Success Message -->
          <div v-if="showSuccess" class="login-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>{{ isLogin ? 'Login successful!' : 'Account created successfully!' }}</span>
          </div>

          <form @submit.prevent="handleSubmit" class="login-form">
            <!-- Username -->
            <div class="form-group">
              <label for="username" class="form-label">Username</label>
              <input
                id="username"
                v-model="username"
                type="text"
                class="form-input"
                :class="{ 'form-input--error': errors.username }"
                placeholder="Enter your username"
                @blur="handleBlur('username')"
              />
              <span v-if="errors.username" class="form-error">{{ errors.username }}</span>
            </div>

            <!-- Email (Sign up only) -->
            <div v-if="!isLogin" class="form-group">
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                v-model="email"
                type="email"
                class="form-input"
                :class="{ 'form-input--error': errors.email }"
                placeholder="you@example.com"
                @blur="handleBlur('email')"
              />
              <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
            </div>

            <!-- Password -->
            <div class="form-group">
              <div class="form-label-row">
                <label for="password" class="form-label">Password</label>
                <a v-if="isLogin" href="#" class="form-link">Forgot password?</a>
              </div>
              <input
                id="password"
                v-model="password"
                type="password"
                class="form-input"
                :class="{ 'form-input--error': errors.password }"
                placeholder="Enter your password"
                @blur="handleBlur('password')"
              />
              <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
            </div>

            <!-- Confirm Password (Sign up only) -->
            <div v-if="!isLogin" class="form-group">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                class="form-input"
                :class="{ 'form-input--error': errors.confirmPassword }"
                placeholder="Confirm your password"
                @blur="handleBlur('confirmPassword')"
              />
              <span v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</span>
            </div>

            <!-- Submit -->
            <button 
              type="submit" 
              class="form-submit"
              :class="{ 'form-submit--loading': isLoading }"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="form-submit-loader"></span>
              <span v-else>{{ isLogin ? 'Sign in' : 'Create account' }}</span>
            </button>
          </form>

          <!-- Toggle -->
          <p class="login-toggle">
            {{ isLogin ? "Don't have an account?" : 'Already have an account?' }}
            <button type="button" @click="toggleMode" class="login-toggle-btn">
              {{ isLogin ? 'Sign up' : 'Sign in' }}
            </button>
          </p>

          <!-- Legal -->
          <p class="login-legal">
            By continuing, you agree to our
            <NuxtLink to="/terms">Terms of Service</NuxtLink>
            and
            <NuxtLink to="/privacy">Privacy Policy</NuxtLink>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  --color-primary: #2563EB;
  --color-primary-hover: #1d4ed8;
  --color-black: #000000;
  --color-white: #ffffff;
  --color-gray-50: #fafafa;
  --color-gray-100: #f5f5f5;
  --color-gray-200: #eeeeee;
  --color-gray-400: #a3a3a3;
  --color-gray-500: #737373;
  --color-gray-600: #525252;
  --color-error: #dc2626;
  --color-success: #16a34a;

  min-height: 100vh;
  background: var(--color-white);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.login-container {
  display: flex;
  min-height: 100vh;
}

/* Branding Side */
.login-branding {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 48px;
  background: var(--color-gray-50);
  border-right: 1px solid var(--color-gray-200);
}

.login-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--color-black);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: 80px;
}

.login-logo svg {
  width: 28px;
  height: 28px;
}

.login-branding-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 400px;
}

.login-branding-title {
  font-size: 40px;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.1;
  color: var(--color-black);
  margin: 0 0 24px;
}

.login-branding-text {
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-gray-500);
  margin: 0 0 48px;
}

.login-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-feature {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray-600);
}

.login-feature svg {
  width: 18px;
  height: 18px;
  color: var(--color-success);
}

/* Form Side */
.login-form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.login-form-container {
  width: 100%;
  max-width: 400px;
}

.login-form-header {
  margin-bottom: 48px;
}

.login-title {
  font-size: 56px;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: var(--color-black);
  margin: 0 0 12px;
}

.login-subtitle {
  font-size: 16px;
  color: var(--color-gray-500);
  margin: 0;
}

/* Success Message */
.login-success {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(22, 163, 74, 0.1);
  border: 1px solid rgba(22, 163, 74, 0.2);
  border-radius: 12px;
  margin-bottom: 32px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-success);
}

.login-success svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-black);
}

.form-link {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.form-link:hover {
  color: var(--color-primary-hover);
}

.form-input {
  width: 100%;
  padding: 16px 20px;
  font-size: 15px;
  font-family: inherit;
  color: var(--color-black);
  background: var(--color-white);
  border: 2px solid var(--color-black);
  border-radius: 12px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input::placeholder {
  color: var(--color-gray-400);
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.form-input--error {
  border-color: var(--color-error);
}

.form-input--error:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
}

.form-error {
  font-size: 13px;
  color: var(--color-error);
}

.form-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  padding: 0 32px;
  margin-top: 8px;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  color: var(--color-white);
  background: var(--color-black);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.form-submit:hover:not(:disabled) {
  background: var(--color-gray-600);
}

.form-submit:disabled {
  cursor: not-allowed;
}

.form-submit--loading {
  background: var(--color-gray-600);
}

.form-submit-loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--color-white);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Toggle */
.login-toggle {
  margin-top: 32px;
  text-align: center;
  font-size: 14px;
  color: var(--color-gray-500);
}

.login-toggle-btn {
  background: none;
  border: none;
  padding: 0;
  margin-left: 4px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  color: var(--color-primary);
  cursor: pointer;
  transition: color 0.2s ease;
}

.login-toggle-btn:hover {
  color: var(--color-primary-hover);
}

/* Legal */
.login-legal {
  margin-top: 48px;
  text-align: center;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-gray-400);
}

.login-legal a {
  color: var(--color-gray-500);
  text-decoration: none;
  transition: color 0.2s ease;
}

.login-legal a:hover {
  color: var(--color-black);
}

/* Responsive */
@media (max-width: 1024px) {
  .login-branding {
    display: none;
  }

  .login-form-section {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .login-title {
    font-size: 44px;
  }

  .form-input {
    padding: 14px 16px;
  }

  .form-submit {
    height: 52px;
  }
}
</style>
