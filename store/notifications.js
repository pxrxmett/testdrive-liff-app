// store/notifications.js
export const state = () => ({
  notifications: []
})

export const mutations = {
  ADD_NOTIFICATION(state, notification) {
    state.notifications.push({
      ...notification,
      id: Date.now(),
      timeout: notification.timeout || 5000
    })
  },
  REMOVE_NOTIFICATION(state, notificationId) {
    state.notifications = state.notifications.filter(n => n.id !== notificationId)
  }
}

export const actions = {
  add({ commit }, notification) {
    commit('ADD_NOTIFICATION', notification)
    
    // ลบ notification หลังจากเวลาที่กำหนด
    setTimeout(() => {
      commit('REMOVE_NOTIFICATION', notification.id)
    }, notification.timeout || 5000)
  },
  
  remove({ commit }, notificationId) {
    commit('REMOVE_NOTIFICATION', notificationId)
  }
}