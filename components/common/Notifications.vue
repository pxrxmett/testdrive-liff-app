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
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  min-width: 280px;
}

.notification.success {
  background-color: #4caf50;
  color: white;
}

.notification.error {
  background-color: #f44336;
  color: white;
}

.notification.warning {
  background-color: #ff9800;
  color: white;
}

.notification.info {
  background-color: #2196f3;
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