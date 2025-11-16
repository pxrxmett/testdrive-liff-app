<!-- components/Header.vue -->
<template>
  <div class="header">
    <div class="header-content">
      <div class="brand-logo">
        <img
          v-if="brandTheme"
          :src="brandTheme.logoFallback"
          :alt="brandTheme.logoAlt"
          class="logo"
          @error="handleImageError"
        />
        <span class="brand-name">{{ brandTheme ? brandTheme.name : 'ISUZU เชียงราย' }}</span>
      </div>
      <div class="user-info">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>{{ userName }}</span>
        <div class="divider"></div>
        <span>{{ userBranch }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Header',
  props: {
    user: {
      type: Object,
      default: () => null
    }
  },
  computed: {
    brandTheme() {
      return this.$store.getters['auth/brandTheme']
    },
    staffInfo() {
      return this.$store.state.auth?.staffInfo || this.user
    },
    userName() {
      return this.staffInfo?.fullName || this.user?.name || 'Guest User'
    },
    userBranch() {
      return this.staffInfo?.branch || this.user?.branch || 'Head Office'
    }
  },
  methods: {
    handleImageError(event) {
      // Fallback to placeholder if logo fails to load
      if (this.brandTheme?.logoFallback && event.target.src !== this.brandTheme.logoFallback) {
        event.target.src = this.brandTheme.logoFallback
      }
    }
  }
}
</script>

<style scoped>
.header {
  background-color: var(--brand-primary);
  color: white;
  padding: 1rem 1.25rem;
  position: sticky;
  top: 0;
  z-index: 10;
  font-family: sans-serif;
  box-shadow: var(--brand-shadow);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.brand-name {
  font-weight: bold;
  font-size: 1.125rem;
  letter-spacing: 0.025em;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.icon {
  height: 1.25rem;
  width: 1.25rem;
}

.divider {
  height: 1rem;
  width: 1px;
  background-color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 640px) {
  .brand-name {
    font-size: 1rem;
  }

  .user-info {
    font-size: 0.75rem;
  }

  .logo {
    height: 32px;
  }
}
</style>