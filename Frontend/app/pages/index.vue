<script setup lang="ts">
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const navLinks = [
  { label: 'How it works?', href: '#how' },
  { label: 'Pricing', href: '#pricing' },
]

const features = [
  {
    title: 'True End-to-End Encryption',
    description: 'Encryption happens on your device. Keys never leave it. Not even we can decrypt your notes.',
    icon: 'lock'
  },
  {
    title: 'Zero-Knowledge by Design',
    description: 'We don’t just claim privacy — our architecture makes it impossible to access your data.',
    icon: 'shield'
  },
  {
    title: 'Offline-First Security',
    description: 'Your notes exist securely on your device first, then sync encrypted.',
    icon: 'sync'
  }
]

const insights = [
  { metric: '256-bit', label: 'AES Encryption', trend: 'Military Grade' },
  { metric: '50M+', label: 'Notes Secured', trend: '+18%' },
  { metric: '0', label: 'Data Breaches', trend: 'Ever' },
  { metric: '99.99%', label: 'Uptime SLA', trend: 'Guaranteed' }
]

const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '#' },
      { label: 'Security', to: '#how' },
      { label: 'Pricing', to: '#pricing' },
      // { label: 'Changelog', to: '#' }
    ]
  },
  // {
  //   title: 'Resources',
  //   links: [
  //     { label: 'Documentation', to: '#' },
  //     { label: 'Help Center', to: '#' },
  //     { label: 'Status', to: '#' },
  //     { label: 'Security', to: '#' }
  //   ]
  // },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
    ]
  }
]

const steps = [
  {
    title: 'Write',
    description: 'Create your note locally on your device.',
  },
  {
    title: 'Encrypt',
    description: 'Your note is encrypted before leaving your device.',
  },
  {
    title: 'Sync',
    description: 'Only encrypted data is sent and stored on our servers.',
  },
  {
    title: 'Decrypt',
    description: 'Only you can decrypt and read your notes.',
  }
]
</script>

<template>
  <div class="landing">
    <!-- Navigation -->
    <nav class="nav" :class="{ 'nav--scrolled': isScrolled }">
      <div class="nav-container">
        <NuxtLink to="/" class="nav-logo">
          <!-- <svg class="nav-logo-icon" viewBox="0 0 24 24" fill="none" stroke="url(#logo-gradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <defs>
              <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#8E2DE2" /> <stop offset="100%" style="stop-color:#F000B8" /> </linearGradient>
            </defs>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M13 7l-5 6h4v4l5-6h-4z" fill="url(#logo-gradient)" stroke="none"/>
          </svg> -->
          <img src="/favicon.ico" width="35">
          <span class="nav-logo-text">Inkwell</span>
        </NuxtLink>

        <div class="nav-links">
          <a v-for="link in navLinks" :key="link.label" :href="link.href" class="nav-link">
            {{ link.label }}
          </a>
        </div>

        <div class="nav-actions">
          <NuxtLink to="/login" class="nav-sign-in">Sign in</NuxtLink>
          <NuxtLink to="/login" class="nav-cta">Get Started</NuxtLink>
        </div>

        <button class="nav-mobile-toggle" @click="isMobileMenuOpen = !isMobileMenuOpen" aria-label="Toggle menu">
          <svg v-if="!isMobileMenuOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div v-if="isMobileMenuOpen" class="nav-mobile">
        <a v-for="link in navLinks" :key="link.label" :href="link.href" class="nav-mobile-link">
          {{ link.label }}
        </a>
        <div class="nav-mobile-actions">
          <NuxtLink to="/login" class="nav-mobile-sign-in">Sign in</NuxtLink>
          <NuxtLink to="/login" class="nav-mobile-cta">Get Started</NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-container">
        <div class="hero-badge">
          <span class="hero-badge-dot"></span>
          Public Beta · Try it early
        </div>

        <h1 class="hero-title">
          Your thoughts,<br/>only you can read
        </h1>

        <p class="hero-subtitle">
          The encrypted note-taking app that keeps your ideas safe.<br/>
          Zero-knowledge architecture. No compromises.
        </p>

        <div class="hero-actions">
          <NuxtLink to="/login" class="hero-cta-primary">
            Start Writing Free
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </NuxtLink>
          <a href="#" class="hero-cta-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Learn About Security
          </a>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <div class="features-container">
        <div class="features-header">
          <h2 class="features-title">Privacy by design</h2>
          <p class="features-subtitle">
            Every feature built with your security as the foundation.
          </p>
        </div>

        <div class="features-grid">
          <div v-for="feature in features" :key="feature.title" class="feature-card">
            <div class="feature-icon">
              <svg v-if="feature.icon === 'lock'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <svg v-else-if="feature.icon === 'shield'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <svg v-else-if="feature.icon === 'sync'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="how" class="how">
      <div class="how-container">
        <div class="how-header">
          <h2 class="how-title">How it works</h2>
          <p class="how-subtitle">
            Your data stays private at every step.
          </p>
          <a 
            href="https://github.com/velocibet/Inkwell"
            target="_blank"
            class="how-github-link"
          >
            View on GitHub
          </a>
        </div>

        <div class="how-steps">
          <div 
            v-for="(step, index) in steps" 
            :key="step.title" 
            class="how-step"
          >
            <div class="how-step-number">
              {{ index + 1 }}
            </div>

            <div class="how-step-content">
              <h3 class="how-step-title">{{ step.title }}</h3>
              <p class="how-step-description">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing (Free) -->
    <!-- <section class="pricing">
      <div class="pricing-container">
        <div class="pricing-header">
          <h2 class="pricing-title">Free to use</h2>
          <p class="pricing-subtitle">
            No subscriptions. No hidden fees.
          </p>
        </div>

        <div class="pricing-card">
          <div class="pricing-badge">Free</div>

          <h3 class="pricing-plan">Personal</h3>

          <div class="pricing-price">
            <span class="pricing-amount">$0</span>
            <span class="pricing-period">/ forever</span>
          </div>

          <ul class="pricing-features">
            <li>Unlimited encrypted notes</li>
            <li>End-to-end encryption</li>
            <li>Zero-knowledge architecture</li>
            <li>Sync across devices</li>
          </ul>

          <NuxtLink to="/login" class="pricing-cta">
            Start using for free
          </NuxtLink>

          <p class="pricing-note">
            No credit card required.
          </p>
        </div>
      </div>
    </section> -->

    <!-- Insights -->
    <!-- <section class="insights">
      <div class="insights-container">
        <div class="insights-header">
          <h2 class="insights-title">Security metrics</h2>
          <p class="insights-subtitle">
            Numbers that matter when it comes to protecting your data.
          </p>
        </div>

        <div class="insights-grid">
          <div v-for="insight in insights" :key="insight.label" class="insight-card">
            <div class="insight-metric">{{ insight.metric }}</div>
            <div class="insight-label">{{ insight.label }}</div>
            <div class="insight-trend">{{ insight.trend }}</div>
          </div>
        </div>
      </div>
    </section> -->

    <!-- CTA -->
    <section id="pricing" class="cta">
      <div class="cta-container">

        <div class="cta-badge">Free · No credit card</div>

        <h2 class="cta-title">
          Start writing<br/>privately, for free
        </h2>

        <p class="cta-subtitle">
          Unlimited encrypted notes. Zero-knowledge by design.<br/>
          No subscriptions. No tracking.
        </p>

        <div class="cta-price">
          <span class="cta-amount">$0</span>
          <span class="cta-period">/ forever</span>
        </div>

        <div class="cta-actions">
          <NuxtLink to="/login" class="cta-primary">
            Get started for free
          </NuxtLink>
          <a href="#" class="cta-secondary">
            Learn more
          </a>
        </div>

      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-top">
          <div class="footer-brand">
            <NuxtLink to="/" class="footer-logo">
              <img src="/favicon.ico" width="30">
              <span class="nav-logo-text">Inkwell</span>
            </NuxtLink>
            <p class="footer-tagline">
              Encrypted notes for<br/>those who value privacy.
            </p>
          </div>

          <div class="footer-links">
            <div v-for="section in footerSections" :key="section.title" class="footer-section">
              <h4 class="footer-section-title">{{ section.title }}</h4>
              <ul class="footer-section-links">
                <li v-for="link in section.links" :key="link.label">
                  <NuxtLink v-if="link.to.startsWith('/')" :to="link.to">{{ link.label }}</NuxtLink>
                  <a v-else :href="link.to">{{ link.label }}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="footer-copyright">© 2026 Inkwell. All rights reserved.</p>
          <div class="footer-social">
            <a href="#" class="footer-social-link" aria-label="Twitter">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://github.com/velocibet/Inkwell" class="footer-social-link" aria-label="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  --color-primary: #8E2DE2; 
  --color-primary-hover: #7317c1;
  --color-black: #000000;
  --color-white: #ffffff;
  --color-gray-50: #fafafa;
  --color-gray-100: #f5f5f5;
  --color-gray-200: #eeeeee;
  --color-gray-400: #a3a3a3;
  --color-gray-500: #737373;
  --color-gray-600: #525252;
  --color-gray-900: #171717;

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--color-white);
  color: var(--color-black);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* Navigation */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

.nav--scrolled {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-gray-200);
}

.nav-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--color-black);
}

.nav-logo-icon {
  width: 28px;
  height: 28px;
}

.nav-logo-text {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 40px;
}

.nav-link {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray-600);
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: var(--color-black);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-sign-in {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray-600);
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-sign-in:hover {
  color: var(--color-black);
}

.nav-cta {
  display: inline-flex;
  padding: 10px 20px;
  background: var(--color-black);
  color: var(--color-white);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.nav-cta:hover {
  background: var(--color-gray-900);
}

.nav-mobile-toggle {
  display: none;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
}

.nav-mobile-toggle svg {
  width: 24px;
  height: 24px;
}

.nav-mobile {
  display: none;
  padding: 24px 48px 32px;
  background: var(--color-white);
  border-bottom: 1px solid var(--color-gray-200);
}

.nav-mobile-link {
  display: block;
  padding: 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-gray-600);
  text-decoration: none;
}

.nav-mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--color-gray-200);
}

.nav-mobile-sign-in,
.nav-mobile-cta {
  display: block;
  padding: 14px 24px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  border-radius: 8px;
}

.nav-mobile-sign-in {
  color: var(--color-black);
  border: 1px solid var(--color-gray-200);
}

.nav-mobile-cta {
  background: var(--color-black);
  color: var(--color-white);
}

@media (max-width: 768px) {
  .nav-container {
    padding: 16px 24px;
  }

  .nav-links,
  .nav-actions {
    display: none;
  }

  .nav-mobile-toggle {
    display: block;
  }

  .nav-mobile {
    display: block;
  }
}

/* Hero */
.hero {
  padding: 220px 48px 180px;
}

.hero-container {
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--color-gray-100);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-gray-600);
  margin-bottom: 48px;
}

.hero-badge-dot {
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
}

.hero-title {
  font-size: 88px;
  font-weight: 900;
  line-height: 0.92;
  letter-spacing: -0.05em;
  color: var(--color-black);
  margin: 0 0 40px;
}

.hero-subtitle {
  font-size: 20px;
  line-height: 1.7;
  color: var(--color-gray-500);
  margin: 0 0 56px;
}

.hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 100px;
}

.hero-cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 18px 36px;
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  border-radius: 12px;
  transition: background 0.2s ease;
}

.hero-cta-primary:hover {
  background: var(--color-primary-hover);
}

.hero-cta-primary svg {
  width: 18px;
  height: 18px;
}

.hero-cta-secondary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 18px 36px;
  background: transparent;
  color: var(--color-black);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid var(--color-gray-200);
  border-radius: 12px;
  transition: border-color 0.2s ease;
}

.hero-cta-secondary:hover {
  border-color: var(--color-gray-400);
}

.hero-cta-secondary svg {
  width: 18px;
  height: 18px;
}

.hero-social-proof {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.hero-social-proof-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-gray-400);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.hero-logos {
  display: flex;
  align-items: center;
  gap: 56px;
}

.hero-logo {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-gray-400);
  letter-spacing: -0.01em;
}

@media (max-width: 768px) {
  .hero {
    padding: 160px 24px 120px;
  }

  .hero-title {
    font-size: 52px;
    line-height: 0.95;
  }

  .hero-subtitle {
    font-size: 17px;
  }

  .hero-subtitle br {
    display: none;
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
  }

  .hero-cta-primary,
  .hero-cta-secondary {
    width: 100%;
    justify-content: center;
  }

  .hero-logos {
    flex-wrap: wrap;
    gap: 24px 32px;
    justify-content: center;
  }
}

/* Features */
.features {
  padding: 160px 48px;
  background: var(--color-gray-50);
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
}

.features-header {
  text-align: center;
  margin-bottom: 96px;
}

.features-title {
  font-size: 64px;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: var(--color-black);
  margin: 0 0 20px;
}

.features-subtitle {
  font-size: 18px;
  color: var(--color-gray-500);
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.feature-card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: 24px;
  padding: 56px;
  transition: border-color 0.2s ease;
}

.feature-card:hover {
  border-color: var(--color-gray-400);
}

.feature-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-100);
  border-radius: 14px;
  margin-bottom: 28px;
}

.feature-icon svg {
  width: 26px;
  height: 26px;
  color: var(--color-black);
}

.feature-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-black);
  margin: 0 0 14px;
}

.feature-description {
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-gray-500);
  margin: 0;
}

@media (max-width: 768px) {
  .features {
    padding: 100px 24px;
  }

  .features-title {
    font-size: 40px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .feature-card {
    padding: 40px;
  }
}

/* Insights */
.insights {
  padding: 160px 48px;
}

.insights-container {
  max-width: 1200px;
  margin: 0 auto;
}

.insights-header {
  text-align: center;
  margin-bottom: 96px;
}

.insights-title {
  font-size: 64px;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: var(--color-black);
  margin: 0 0 20px;
}

.insights-subtitle {
  font-size: 18px;
  color: var(--color-gray-500);
  margin: 0;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.insight-card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: 24px;
  padding: 48px 36px;
  text-align: center;
}

.insight-metric {
  font-size: 48px;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: var(--color-black);
  margin-bottom: 8px;
}

.insight-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray-500);
  margin-bottom: 20px;
}

.insight-trend {
  display: inline-block;
  padding: 6px 14px;
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  font-size: 12px;
  font-weight: 600;
  border-radius: 100px;
}

@media (max-width: 1024px) {
  .insights-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .insights {
    padding: 100px 24px;
  }

  .insights-title {
    font-size: 40px;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }

  .insight-metric {
    font-size: 40px;
  }
}

/* CTA */
.cta {
  padding: 180px 48px;
  background: var(--color-black);
}

.cta-container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.cta-title {
  font-size: 72px;
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -0.04em;
  color: var(--color-white);
  margin: 0 0 28px;
}

.cta-subtitle {
  font-size: 18px;
  color: var(--color-gray-400);
  margin: 0 0 56px;
}

.cta-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.cta-primary {
  display: inline-flex;
  padding: 18px 36px;
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  border-radius: 12px;
  transition: background 0.2s ease;
}

.cta-primary:hover {
  background: var(--color-primary-hover);
}

.cta-secondary {
  display: inline-flex;
  padding: 18px 36px;
  background: transparent;
  color: var(--color-white);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  transition: border-color 0.2s ease;
}

.cta-secondary:hover {
  border-color: rgba(255, 255, 255, 0.4);
}

@media (max-width: 768px) {
  .cta {
    padding: 120px 24px;
  }

  .cta-title {
    font-size: 44px;
  }

  .cta-actions {
    flex-direction: column;
    width: 100%;
  }

  .cta-primary,
  .cta-secondary {
    width: 100%;
    justify-content: center;
  }
}

/* Footer */
.footer {
  padding: 100px 48px 56px;
  background: var(--color-gray-50);
  border-top: 1px solid var(--color-gray-200);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 72px;
}

.footer-brand {
  max-width: 280px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--color-black);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: 20px;
}

.footer-logo svg {
  width: 24px;
  height: 24px;
}

.footer-tagline {
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-gray-500);
  margin: 0;
}

.footer-links {
  display: flex;
  gap: 80px;
}

.footer-section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-black);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 24px;
}

.footer-section-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section-links li {
  margin-bottom: 14px;
}

.footer-section-links a {
  font-size: 14px;
  color: var(--color-gray-500);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-section-links a:hover {
  color: var(--color-black);
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 36px;
  border-top: 1px solid var(--color-gray-200);
}

.footer-copyright {
  font-size: 13px;
  color: var(--color-gray-400);
  margin: 0;
}

.footer-social {
  display: flex;
  align-items: center;
  gap: 20px;
}

.footer-social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--color-gray-400);
  transition: color 0.2s ease;
}

.footer-social-link:hover {
  color: var(--color-black);
}

.footer-social-link svg {
  width: 18px;
  height: 18px;
}

@media (max-width: 1024px) {
  .footer-links {
    gap: 48px;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 72px 24px 40px;
  }

  .footer-top {
    flex-direction: column;
    gap: 56px;
  }

  .footer-links {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 28px;
    text-align: center;
  }
}

/* How it works */
.how {
  padding: 160px 48px;
  background: var(--color-white);
}

.how-container {
  max-width: 1000px;
  margin: 0 auto;
}

.how-header {
  text-align: center;
  margin-bottom: 96px;
}

.how-title {
  font-size: 64px;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: var(--color-black);
  margin: 0 0 20px;
}

.how-subtitle {
  font-size: 18px;
  color: var(--color-gray-500);
  margin: 0;
}

/* Steps */
.how-steps {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.how-step {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 32px;
  border: 1px solid var(--color-gray-200);
  border-radius: 20px;
  transition: border-color 0.2s ease;
  background: var(--color-white);
}

.how-step:hover {
  border-color: var(--color-gray-400);
}

/* Number circle */
.how-step-number {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Content */
.how-step-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--color-black);
}

.how-step-description {
  font-size: 15px;
  color: var(--color-gray-500);
  margin: 0;
  line-height: 1.6;
}

/* Mobile */
@media (max-width: 768px) {
  .how {
    padding: 100px 24px;
  }

  .how-title {
    font-size: 40px;
  }

  .how-header {
    margin-bottom: 64px;
  }

  .how-step {
    padding: 24px;
  }

  .how-step-number {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}

/* Pricing */
.pricing {
  padding: 160px 48px;
  background: var(--color-gray-50);
}

.pricing-container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.pricing-header {
  margin-bottom: 72px;
}

.pricing-title {
  font-size: 64px;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: var(--color-black);
  margin: 0 0 20px;
}

.pricing-subtitle {
  font-size: 18px;
  color: var(--color-gray-500);
  margin: 0;
}

/* Card */
.pricing-card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: 24px;
  padding: 64px 48px;
  position: relative;
  transition: border-color 0.2s ease;
}

.pricing-card:hover {
  border-color: var(--color-gray-400);
}

/* Badge */
.pricing-badge {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 999px;
}

/* Plan */
.pricing-plan {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 16px;
}

/* Price */
.pricing-price {
  margin-bottom: 32px;
}

.pricing-amount {
  font-size: 64px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.pricing-period {
  font-size: 16px;
  color: var(--color-gray-500);
  margin-left: 6px;
}

/* Features */
.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 40px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pricing-features li {
  font-size: 15px;
  color: var(--color-gray-600);
}

/* CTA */
.pricing-cta {
  display: inline-flex;
  padding: 16px 32px;
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  border-radius: 12px;
  transition: background 0.2s ease;
}

.pricing-cta:hover {
  background: var(--color-primary-hover);
}

.pricing-note {
  margin-top: 16px;
  font-size: 13px;
  color: var(--color-gray-400);
}

/* Mobile */
@media (max-width: 768px) {
  .pricing {
    padding: 100px 24px;
  }

  .pricing-title {
    font-size: 40px;
  }

  .pricing-card {
    padding: 40px 24px;
  }

  .pricing-amount {
    font-size: 48px;
  }
}

.cta-badge {
  display: inline-block;
  padding: 6px 14px;
  background: rgba(255,255,255,0.1);
  color: var(--color-gray-400);
  font-size: 12px;
  border-radius: 999px;
  margin-bottom: 20px;
}

.cta-price {
  margin: 24px 0 40px;
}

.cta-amount {
  font-size: 64px;
  font-weight: 900;
  color: var(--color-white);
}

.cta-period {
  font-size: 16px;
  color: var(--color-gray-400);
  margin-left: 6px;
}

.how-github-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-black);
  border: 1px solid var(--color-gray-200);
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.how-github-link:hover {
  border-color: var(--color-gray-400);
}
</style>
