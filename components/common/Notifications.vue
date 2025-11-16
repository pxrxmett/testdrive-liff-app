<template>
  <div class="notifications-container">
    <transition-group name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification', notification.type]"
        @click="removeNotification(notification.id)"
      >
        {{ notification.message }}
      </div>
    </transition-group>
  </div>
</template>
<script>
export default {
  name: 'Notifications',
  
  computed: {
    notifications() {
      return this.$store.state.notifications.notifications
    }
  },
  
  methods: {
    removeNotification(id) {
      this.$store.dispatch('notifications/remove', id)
    }
  }
}
</script>
<style scoped>
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

.notification {
  padding: 15px 20px;
  margin-bottom: 10px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: var(--brand-shadow);
  cursor: pointer;
  min-width: 280px;
  transition: transform 0.2s;
}

.notification:hover {
  transform: translateX(-5px);
}

.notification.success {
  background-color: #10B981;
  color: white;
}

.notification.error {
  background-color: var(--brand-primary);
  color: white;
}

.notification.warning {
  background-color: #F59E0B;
  color: white;
}

.notification.info {
  background-color: #3B82F6;
  color: white;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter,
.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>