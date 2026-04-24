<script setup lang="ts">
const lastUpdated = 'April 24, 2026'
</script>

<template>
  <div class="legal-page">
    <!-- Header -->
    <header class="legal-header">
      <div class="legal-header-container">
        <NuxtLink to="/" class="legal-logo">
          <!-- <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg> -->
          <img src="/favicon.ico" width="35">
          <span>Inkwell</span>
        </NuxtLink>
        <NuxtLink to="/login" class="legal-header-cta">Get Started</NuxtLink>
      </div>
    </header>

    <!-- Content -->
    <main class="legal-content">
      <article class="legal-document">
        <div class="legal-document-header">
          <h1 class="legal-title">Terms of Service</h1>
          <p class="legal-updated">Last updated: {{ lastUpdated }}</p>
        </div>

        <div class="legal-body">

          <section class="legal-section">
            <h2>1. Introduction</h2>
            <p>
              These Terms of Service ("Terms") govern your use of Inkwell ("we", "us", "our"). By accessing or using the Service, you agree to be bound by these Terms.
            </p>
          </section>

          <section class="legal-section">
            <h2>2. Eligibility</h2>
            <p>
              You must be at least 14 years old to use this Service. By using the Service, you represent that you meet this requirement.
            </p>
          </section>

          <section class="legal-section">
            <h2>3. Accounts</h2>
            <ul>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You are responsible for all activities that occur under your account.</li>
              <li>We reserve the right to suspend or terminate accounts at our discretion.</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Attempt to hack, disrupt, or damage the Service</li>
              <li>Upload or distribute harmful or malicious content</li>
              <li>Abuse or misuse the Service in any way</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>5. User Content</h2>
            <p>
              You retain ownership of all content you create or store using the Service.
            </p>
            <p>
              We do not access or read your content except as required to operate the Service.
            </p>
          </section>

          <section class="legal-section">
            <h2>6. Data Responsibility</h2>
            <p>
              You are responsible for maintaining access to your account and any encryption keys or credentials associated with your data.
            </p>
            <p>
              We are not responsible for any loss of data, including encrypted data that cannot be recovered.
            </p>
          </section>

          <section class="legal-section">
            <h2>7. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service at any time, with or without notice, for any reason.
            </p>
            <p>
              You may stop using the Service at any time.
            </p>
          </section>

          <section class="legal-section">
            <h2>8. Disclaimer</h2>
            <p>
              The Service is provided "as is" and "as available" without warranties of any kind. We do not guarantee that the Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section class="legal-section">
            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section class="legal-section">
            <h2>10. Changes to Terms</h2>
            <p>
              We may update these Terms at any time. Continued use of the Service constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section class="legal-section">
            <h2>11. Governing Law</h2>
            <p>
              These Terms shall be governed by and interpreted in accordance with the laws of the Republic of Korea.
            </p>
          </section>

          <section class="legal-section">
            <h2>12. Contact</h2>
            <ul>
              <li>Email: dev.velocibet@gmail.com</li>
            </ul>
          </section>

        </div>

        <div class="legal-footer-links">
          <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
          <span class="legal-footer-divider">|</span>
          <NuxtLink to="/">Return to Home</NuxtLink>
        </div>
      </article>
    </main>

    <!-- Footer -->
    <footer class="legal-footer">
      <p>© 2026 Inkwell. All rights reserved.</p>
    </footer>
  </div>
</template>

<style scoped>
.legal-page {
  --color-primary: #2563eb;
  --color-black: #0a0a0a;
  --color-white: #ffffff;
  --color-gray-50: #fafafa;
  --color-gray-100: #f4f4f5;
  --color-gray-200: #e4e4e7;
  --color-gray-300: #d4d4d8;
  --color-gray-400: #a1a1aa;
  --color-gray-500: #71717a;
  --color-gray-600: #52525b;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-white);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Header */
.legal-header {
  border-bottom: 1px solid var(--color-gray-200);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
}

.legal-header-container {
  max-width: 860px;
  margin: 0 auto;
  padding: 18px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.legal-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--color-black);
  font-size: 17px;
  font-weight: 600;
}

.legal-logo svg {
  width: 22px;
  height: 22px;
}

.legal-header-cta {
  padding: 9px 18px;
  background: var(--color-black);
  color: var(--color-white);
  font-size: 13px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.legal-header-cta:hover {
  background: #27272a;
}

/* Content */
.legal-content {
  flex: 1;
  padding: 80px 20px 120px;
}

.legal-document {
  max-width: 760px;
  margin: 0 auto;
}

/* Title */
.legal-document-header {
  margin-bottom: 56px;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--color-gray-200);
}

.legal-title {
  font-size: 48px;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: var(--color-black);
  margin-bottom: 12px;
}

.legal-updated {
  font-size: 14px;
  color: var(--color-gray-500);
}

/* Body */
.legal-body {
  line-height: 1.75;
  color: var(--color-gray-600);
}

/* Section */
.legal-section {
  margin-bottom: 44px;
}

.legal-section h2 {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 16px;
  color: var(--color-black);
}

.legal-section h3 {
  font-size: 17px;
  font-weight: 700;
  margin: 28px 0 12px;
  color: var(--color-black);
}

.legal-section p {
  font-size: 15px;
  margin-bottom: 14px;
}

.legal-section ul {
  padding-left: 20px;
  margin-bottom: 14px;
}

.legal-section li {
  font-size: 15px;
  margin-bottom: 6px;
}

.legal-section li strong {
  color: var(--color-black);
}

/* Footer Links */
.legal-footer-links {
  margin-top: 60px;
  padding-top: 28px;
  border-top: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: center;
  gap: 14px;
}

.legal-footer-links a {
  font-size: 13px;
  color: var(--color-primary);
  text-decoration: none;
}

.legal-footer-links a:hover {
  color: var(--color-black);
}

.legal-footer-divider {
  color: var(--color-gray-300);
}

/* Footer */
.legal-footer {
  padding: 20px;
  border-top: 1px solid var(--color-gray-200);
  background: var(--color-gray-50);
  text-align: center;
}

.legal-footer p {
  font-size: 12px;
  color: var(--color-gray-400);
}

/* Responsive */
@media (max-width: 768px) {
  .legal-title {
    font-size: 32px;
  }

  .legal-section h2 {
    font-size: 18px;
  }

  .legal-section h3 {
    font-size: 15px;
  }

  .legal-section p,
  .legal-section li {
    font-size: 14px;
  }

  .legal-header-container {
    padding: 14px 16px;
  }
}
</style>
