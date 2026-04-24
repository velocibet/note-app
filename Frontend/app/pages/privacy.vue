<script setup lang="ts">
const lastUpdated = 'April 24, 2026'
</script>

<template>
  <div class="legal-page">
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

    <main class="legal-content">
      <article class="legal-document">
        <div class="legal-document-header">
          <h1 class="legal-title">Privacy Policy</h1>
          <p class="legal-updated">Last updated: {{ lastUpdated }}</p>
        </div>

        <div class="legal-body">

          <section class="legal-section">
            <h2>1. Introduction</h2>
            <p>
              This Privacy Policy explains how Inkwell ("we", "us", "our") collects, uses, and protects your information when you use our service.
            </p>
            <p>
              This Service is operated in the Republic of Korea and complies with applicable Korean data protection laws.
            </p>
          </section>

          <section class="legal-section">
            <h2>2. Information We Collect</h2>

            <h3>2.1 Personal Data</h3>
            <ul>
              <li>Email address</li>
            </ul>

            <h3>2.2 Usage Data</h3>
            <ul>
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent</li>
              <li>Device information</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>3. Cookies</h2>
            <p>
              We use cookies and similar technologies to operate and improve our service.
            </p>
            <ul>
              <li><strong>Session Cookies:</strong> Used to maintain authentication and session state</li>
              <li><strong>Essential Cookies:</strong> Required for core functionality</li>
            </ul>
            <p>
              You can control cookie usage through your browser settings.
            </p>
          </section>

          <section class="legal-section">
            <h2>4. How We Use Your Information</h2>
            <ul>
              <li>To provide and maintain the service</li>
              <li>To manage user accounts</li>
              <li>To respond to user inquiries</li>
              <li>To improve service performance and security</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>5. Sharing of Information</h2>
            <p>We may share your data in the following cases:</p>
            <ul>
              <li>With service providers (hosting, infrastructure)</li>
              <li>When required by law</li>
              <li>With your consent</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>6. Data Retention</h2>
            <ul>
              <li>Account data: retained while account is active</li>
              <li>Logs and usage data: up to 24 months</li>
            </ul>
            <p>
              Data may be deleted or anonymized earlier when no longer needed.
            </p>
          </section>

          <section class="legal-section">
            <h2>7. Your Rights</h2>
            <ul>
              <li>Access your data</li>
              <li>Correct your data</li>
              <li>Request deletion</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>8. International Transfers</h2>
            <p>
              Your data may be processed in countries outside your jurisdiction. We take reasonable measures to protect your data.
            </p>
          </section>

          <section class="legal-section">
            <h2>9. Children's Privacy</h2>
            <p>
              This service is not intended for users under the age of 14. We do not knowingly collect data from children.
            </p>
          </section>

          <section class="legal-section">
            <h2>10. Security</h2>
            <p>
              We implement reasonable security measures to protect your data, but no system is completely secure.
            </p>
          </section>

          <section class="legal-section">
            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy at any time. Changes will be posted on this page.
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
          <NuxtLink to="/terms">Terms of Service</NuxtLink>
          <span class="legal-footer-divider">|</span>
          <NuxtLink to="/">Return to Home</NuxtLink>
        </div>
      </article>
    </main>

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