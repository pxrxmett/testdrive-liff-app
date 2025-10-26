// store/queue.js
export const state = () => ({
  queues: [],
  loading: false,
  error: null,
  filters: {
    date: null,
    status: null
  }
})

export const getters = {
  allQueues: state => state.queues,
  filteredQueues: (state, getters, rootState) => {
    // ดึง staffCode จาก user ที่ล็อกอิน
    const staffCode = rootState.auth.user?.staffCode

    if (!staffCode) {
      return []
    }

    return state.queues.filter(queue => {
      // กรองเฉพาะคิวของพนักงานที่ล็อกอิน
      return queue.staffCode === staffCode
    })
  },
  loading: state => state.loading,
  error: state => state.error
}

export const mutations = {
  SET_QUEUES(state, queues) {
    state.queues = queues
  },
  SET_LOADING(state, status) {
    state.loading = status
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  UPDATE_QUEUE(state, updatedQueue) {
    const index = state.queues.findIndex(q => q.id === updatedQueue.id)
    if (index !== -1) {
      state.queues.splice(index, 1, updatedQueue)
    }
  },
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters }
  }
}

export const actions = {
  async fetchQueues({ commit, rootState }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      // ดึง staffCode จาก user ที่ล็อกอิน
      const staffCode = rootState.auth.user?.staffCode

      if (!staffCode) {
        throw new Error('ไม่พบข้อมูลพนักงาน กรุณาล็อกอินใหม่')
      }

      // เรียก API โดยส่ง staffCode เพื่อกรองคิว
      const response = await this.$axios.$get(`/test-drives`, {
        params: {
          staffCode,
          ...state.filters
        }
      })

      commit('SET_QUEUES', response.data || [])
    } catch (error) {
      console.error('Error fetching queues:', error)
      commit('SET_ERROR', error.message || 'ไม่สามารถดึงข้อมูลคิวได้')
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateQueue({ commit }, { id, data }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      const response = await this.$axios.$patch(`/test-drives/${id}`, data)
      commit('UPDATE_QUEUE', response.data)

      return response.data
    } catch (error) {
      console.error('Error updating queue:', error)
      commit('SET_ERROR', error.message || 'ไม่สามารถอัปเดตคิวได้')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  setFilters({ commit, dispatch }, filters) {
    commit('SET_FILTERS', filters)
    return dispatch('fetchQueues')
  }
}
