<!-- components/Header.vue -->
<template>
  <div class="header">
    <div class="header-content">
      <div class="brand">ISUZU</div>
      <div class="user-info">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>{{ user.name }}</span>
        <div class="divider"></div>
        <span>{{ user.branch }}</span>
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
      default: () => ({
        name: 'Guest User',
        branch: 'Head Office'
      })
    }
  }
}
</script>

<style scoped>
.header {
  background-color: #dc2626;
  color: white;
  padding: 1rem 1.25rem;
  position: sticky;
  top: 0;
  z-index: 10;
  font-family: sans-serif;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.brand {
  font-weight: bold;
  font-size: 1.5rem;
  letter-spacing: 0.05em;
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
</style>