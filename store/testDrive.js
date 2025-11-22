// store/testDrive.js
import {
  getTestDriveById,
  getTestDrives,
  updateTestDrive,
  submitPdpaConsent,
  uploadSignature
} from '~/utils/brandApi'

export const state = () => ({
  currentBooking: null,
  bookings: [],
  loading: false,
  error: null
})

export const getters = {
  currentBooking: state => state.currentBooking,
  bookings: state => state.bookings,
  loading: state => state.loading,
  error: state => state.error,

  // Get booking by ID
  getBookingById: state => id => {
    return state.bookings.find(booking => booking.id === id)
  },

  // Check if booking has PDPA consent
  hasPdpaConsent: state => {
    return state.currentBooking?.pdpa_consent === true
  },

  // Check if booking has signature
  hasSignature: state => {
    return !!state.currentBooking?.signature_data
  },

  // Check if booking can be edited
  canEdit: state => {
    if (!state.currentBooking) return false

    // Check canEdit flag
    if (state.currentBooking.can_edit === false) return false

    // ตรวจสอบว่าแก้ไขได้แค่วันเดียวกับที่เซ็น
    if (state.currentBooking.signed_at) {
      const signedDate = new Date(state.currentBooking.signed_at)
      const today = new Date()

      signedDate.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)

      return signedDate.getTime() === today.getTime()
    }

    return true
  }
}

export const mutations = {
  SET_CURRENT_BOOKING(state, booking) {
    state.currentBooking = booking
  },

  SET_BOOKINGS(state, bookings) {
    state.bookings = bookings
  },

  SET_LOADING(state, status) {
    state.loading = status
  },

  SET_ERROR(state, error) {
    state.error = error
  },

  UPDATE_BOOKING(state, updatedBooking) {
    // Update in bookings array
    const index = state.bookings.findIndex(b => b.id === updatedBooking.id)
    if (index !== -1) {
      state.bookings.splice(index, 1, updatedBooking)
    }

    // Update current booking if it's the same
    if (state.currentBooking?.id === updatedBooking.id) {
      state.currentBooking = updatedBooking
    }
  },

  SET_PDPA_CONSENT(state, { id, consent }) {
    if (state.currentBooking?.id === id) {
      state.currentBooking.pdpa_consent = consent
      state.currentBooking.pdpa_consented_at = new Date().toISOString()
    }
  },

  SET_SIGNATURE(state, { id, signatureData }) {
    if (state.currentBooking?.id === id) {
      state.currentBooking.signature_data = signatureData
      state.currentBooking.signed_at = new Date().toISOString()
    }
  },

  CLEAR_CURRENT_BOOKING(state) {
    state.currentBooking = null
  },

  CLEAR_ERROR(state) {
    state.error = null
  }
}

export const actions = {
  // Fetch single booking by ID
  async fetchBooking({ commit }, bookingId) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      // ✅ MIGRATED: ใช้ getTestDriveById helper (brand-scoped)
      const response = await getTestDriveById(this.$axios, bookingId)

      commit('SET_CURRENT_BOOKING', response)
      return response

    } catch (error) {
      console.error('Error fetching booking:', error)
      const errorMessage = error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลการจองได้'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Fetch all bookings
  async fetchBookings({ commit }, params = {}) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      // ✅ MIGRATED: ใช้ getTestDrives helper (brand-scoped)
      const response = await getTestDrives(this.$axios, params)

      const bookings = Array.isArray(response) ? response : (response.data || [])
      commit('SET_BOOKINGS', bookings)

      return bookings

    } catch (error) {
      console.error('Error fetching bookings:', error)
      const errorMessage = error.response?.data?.message || 'ไม่สามารถโหลดรายการจองได้'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Update booking
  async updateBooking({ commit }, { id, data }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      // ✅ MIGRATED: ใช้ updateTestDrive helper (brand-scoped) with PATCH method
      const response = await updateTestDrive(this.$axios, id, data, 'PATCH')

      commit('UPDATE_BOOKING', response)
      return response

    } catch (error) {
      console.error('Error updating booking:', error)
      const errorMessage = error.response?.data?.message || 'ไม่สามารถแก้ไขข้อมูลได้'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Submit PDPA consent
  async submitPdpaConsent({ commit }, { bookingId, consent }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      // ✅ MIGRATED: ใช้ submitPdpaConsent helper (brand-scoped)
      await submitPdpaConsent(this.$axios, bookingId, consent)

      commit('SET_PDPA_CONSENT', { id: bookingId, consent })

      return true

    } catch (error) {
      console.error('Error submitting PDPA consent:', error)
      const errorMessage = error.response?.data?.message || 'ไม่สามารถบันทึกการยอมรับนโยบายได้'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Submit signature
  async submitSignature({ commit }, { bookingId, signatureData }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      // ✅ MIGRATED: ใช้ uploadSignature helper (brand-scoped + auto-compression)
      await uploadSignature(this.$axios, bookingId, signatureData)

      commit('SET_SIGNATURE', { id: bookingId, signatureData })

      return true

    } catch (error) {
      console.error('Error submitting signature:', error)
      const errorMessage = error.response?.data?.message || 'ไม่สามารถบันทึกลายเซ็นได้'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Clear current booking
  clearCurrentBooking({ commit }) {
    commit('CLEAR_CURRENT_BOOKING')
  },

  // Clear error
  clearError({ commit }) {
    commit('CLEAR_ERROR')
  }
}
