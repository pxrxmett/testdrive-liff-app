// store/auth.js - Complete Version with Enhanced Error Debugging
export const state = () => ({
  token: null,
  user: null,
  isAuthenticated: false,
  lineProfile: null,
  lineAccessToken: null,
  lastCheck: null,
  staffCode: null,
  staffInfo: null
})

export const getters = {
  isAuthenticated: state => !!state.token && state.isAuthenticated,
  token: state => state.token,
  user: state => state.user,
  lineProfile: state => state.lineProfile,
  lineAccessToken: state => state.lineAccessToken,
  staffCode: state => state.staffCode,
  staffInfo: state => state.staffInfo
}

export const mutations = {
  setToken(state, token) {
    state.token = token
  },
  setUser(state, user) {
    state.user = user
  },
  setAuth(state, value) {
    state.isAuthenticated = value
  },
  setLineProfile(state, profile) {
    state.lineProfile = profile
  },
  setLineAccessToken(state, token) {
    state.lineAccessToken = token
  },
  setStaffCode(state, code) {
    state.staffCode = code
    console.log('บันทึก staff_code ใน store:', code)
  },
  setStaffInfo(state, info) {
    state.staffInfo = info
    console.log('บันทึกข้อมูลพนักงานใน store:', info)
  },
  clearAuth(state) {
    state.token = null
    state.user = null
    state.isAuthenticated = false
    state.staffCode = null
    state.staffInfo = null
  },
  setLastCheck(state, timestamp) {
    state.lastCheck = timestamp
  }
}

export const actions = {
  initAuth({ commit }) {
    console.log('กำลังตรวจสอบการล็อกอิน...')
    
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    const lineProfileStr = localStorage.getItem('lineProfile')
    const staffCode = localStorage.getItem('staffCode')
    const staffInfoStr = localStorage.getItem('staffInfo')
    
    if (token) {
      console.log('พบ token ใน localStorage')
      commit('setToken', token)
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          commit('setUser', user)
          console.log('พบข้อมูลผู้ใช้ใน localStorage')
        } catch (e) {
          console.error('ข้อมูลผู้ใช้ใน localStorage ไม่ถูกต้อง', e)
        }
      }
      
      if (lineProfileStr) {
        try {
          const lineProfile = JSON.parse(lineProfileStr)
          commit('setLineProfile', lineProfile)
          
          if (lineProfile && lineProfile.accessToken) {
            commit('setLineAccessToken', lineProfile.accessToken)
          }
        } catch (e) {
          console.error('ข้อมูล LINE Profile ใน localStorage ไม่ถูกต้อง', e)
        }
      }
      
      if (staffCode) {
        commit('setStaffCode', staffCode)
      }
      
      if (staffInfoStr) {
        try {
          const staffInfo = JSON.parse(staffInfoStr)
          commit('setStaffInfo', staffInfo)
        } catch (e) {
          console.error('ข้อมูลพนักงานใน localStorage ไม่ถูกต้อง', e)
        }
      }
      
      commit('setAuth', true)
      return true
    }
    
    console.log('ไม่พบ token ใน localStorage')
    return false
  },

  async refreshAuth({ commit, state }) {
    const token = state.token || localStorage.getItem('token')
    if (!token) {
      return false
    }

    const now = Date.now()
    if (state.lastCheck && (now - state.lastCheck < 5 * 60 * 1000)) {
      return true
    }

    try {
      const userData = await this.$axios.$get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      commit('setLastCheck', now)
      
      if (userData && userData.staff_code) {
        commit('setStaffCode', userData.staff_code)
        localStorage.setItem('staffCode', userData.staff_code)
      }
      
      return true
    } catch (error) {
      if (error.response?.status === 401) {
        return false
      }
      return true
    }
  },

  // ✅ แก้ไข checkLineRegistration ให้ส่งข้อมูลที่ถูกต้อง
  async checkLineRegistration({ commit, state }, options = {}) {
    try {
      const lineUserId = state.lineProfile?.userId
      if (!lineUserId) {
        console.warn('ไม่พบ LINE User ID')
        return { registered: false, error: 'ไม่พบ LINE User ID' }
      }

      // ✅ ส่งเฉพาะ lineUserId เท่านั้น (ไม่ส่ง staffId)
      const requestData = {
        lineUserId
      }

      console.log('📤 ข้อมูลที่จะส่งไป /api/line-integration/check:', requestData)
      
      const response = await this.$axios.$post('/api/line-integration/check', requestData)
      
      console.log('✅ Response จาก check API:', response)
      
      // ✅ ปรับปรุงการจัดการ response
      if (response) {
        // ตรวจสอบว่า response มีข้อมูลอะไรบ้าง
        const isRegistered = response.registered || response.success || response.isLinked || false
        
        if (isRegistered && response.staff) {
          // บันทึกข้อมูลพนักงาน
          commit('setStaffInfo', response.staff)
          localStorage.setItem('staffInfo', JSON.stringify(response.staff))
          
          if (response.staff.staff_code) {
            commit('setStaffCode', response.staff.staff_code)
            localStorage.setItem('staffCode', response.staff.staff_code)
          }
          
          return { 
            registered: true, 
            staffInfo: response.staff,
            staff_code: response.staff.staff_code
          }
        } else if (isRegistered && response.staffInfo) {
          // กรณีที่ใช้ key เป็น staffInfo
          commit('setStaffInfo', response.staffInfo)
          localStorage.setItem('staffInfo', JSON.stringify(response.staffInfo))
          
          if (response.staffInfo.staff_code) {
            commit('setStaffCode', response.staffInfo.staff_code)
            localStorage.setItem('staffCode', response.staffInfo.staff_code)
          }
          
          return { 
            registered: true, 
            staffInfo: response.staffInfo,
            staff_code: response.staffInfo.staff_code
          }
        } else {
          return { registered: false, message: response.message || 'ยังไม่ได้เชื่อมโยง' }
        }
      }
      
      return { registered: false }
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการตรวจสอบการเชื่อมโยง LINE:', error)
      
      // ✅ เพิ่ม detailed error logging
      if (error.response) {
        const { status, data } = error.response
        
        // 🔍 แสดงรายละเอียด error response ทั้งหมด
        console.error('📋 API Error Details:', {
          status,
          data, // แสดงข้อมูล error ทั้งหมด
          url: error.config?.url,
          method: error.config?.method,
          requestData: error.config?.data
        })
        
        // 🔍 แสดง error message จาก Backend แบบละเอียด
        console.error('🚨 Backend Error Response:', data)
        
        if (status === 404) {
          return { registered: false, message: 'ยังไม่ได้เชื่อมโยงบัญชี' }
        } else if (status === 400) {
          // 🔍 แสดงข้อผิดพลาดแบบละเอียด
          let errorMessage = 'ข้อมูลไม่ถูกต้อง'
          
          // ตรวจสอบ error message หลายรูปแบบ
          if (data?.message) {
            errorMessage = data.message
            console.error('🔍 Error Message:', data.message)
          } else if (data?.error) {
            errorMessage = data.error
            console.error('🔍 Error:', data.error)
          } else if (data?.errors && Array.isArray(data.errors)) {
            errorMessage = data.errors.join(', ')
            console.error('🔍 Errors Array:', data.errors)
          } else if (data?.errors && typeof data.errors === 'object') {
            // กรณี validation errors เป็น object
            const errorList = Object.values(data.errors).flat()
            errorMessage = errorList.join(', ')
            console.error('🔍 Validation Errors:', data.errors)
          }
          
          return { registered: false, error: errorMessage }
        } else if (status === 500) {
          return { registered: false, error: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' }
        }
      }
      
      return { registered: false, error: error.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ' }
    }
  },

  // ✅ ปรับปรุง linkLineAccount ให้ส่งข้อมูลตามที่ Backend ต้องการ
  async linkLineAccount({ commit, state }, { staffId }) {
    try {
      const lineUserId = state.lineProfile?.userId
      const lineAccessToken = state.lineAccessToken || state.lineProfile?.accessToken

      if (!lineUserId || !staffId) {
        throw new Error('ข้อมูลไม่ครบถ้วนสำหรับการเชื่อมโยง')
      }

      if (!lineAccessToken) {
        throw new Error('ไม่พบ LINE Access Token')
      }

      // ✅ หา staffCode จาก staffInfo ที่ได้จาก check API
      let staffCode = null
      if (state.staffInfo && state.staffInfo.staff_code) {
        staffCode = state.staffInfo.staff_code
      } else {
        // ถ้าไม่มี staffCode ให้ดึงจาก API staffs
        try {
          const staffData = await this.$axios.$get(`/api/staffs/${staffId}`)
          staffCode = staffData.staff_code
        } catch (error) {
          throw new Error('ไม่สามารถดึงข้อมูล staff_code ได้')
        }
      }

      if (!staffCode) {
        throw new Error('ไม่พบ staff_code สำหรับการเชื่อมโยง')
      }

      // ✅ ปรับปรุงข้อมูลที่ส่งให้ตรงกับ API specification
      const requestData = {
        lineUserId,
        staffCode,
        lineAccessToken
      }

      // ✅ ตรวจสอบข้อมูลก่อนส่ง
      console.log('📤 ข้อมูลที่จะส่งไป /api/line-integration/link:', requestData)
      
      // ตรวจสอบความถูกต้องของข้อมูล
      const validation = validateLinkDataNew(requestData)
      if (!validation.isValid) {
        console.error('❌ ข้อมูลไม่ถูกต้อง:', validation.errors)
        throw new Error('ข้อมูลไม่ถูกต้อง: ' + validation.errors.join(', '))
      }

      const response = await this.$axios.$post('/api/line-integration/link', requestData)
      
      console.log('✅ Response จาก link API:', response)

      if (response && response.success) {
        // อัปเดตข้อมูลใน store
        if (response.staff) {
          commit('setStaffInfo', response.staff)
          localStorage.setItem('staffInfo', JSON.stringify(response.staff))
        }

        return { success: true, message: 'เชื่อมโยงบัญชีสำเร็จ' }
      }

      throw new Error(response?.message || 'การเชื่อมโยงไม่สำเร็จ')
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการเชื่อมโยงบัญชี LINE:', error)
      
      // ✅ เพิ่ม detailed error logging
      if (error.response) {
        const { status, data } = error.response
        
        // 🔍 แสดงรายละเอียด error response ทั้งหมด
        console.error('📋 Link API Error Details:', {
          status,
          data, // แสดงข้อมูล error ทั้งหมด
          url: error.config?.url,
          method: error.config?.method,
          requestData: error.config?.data
        })
        
        // 🔍 แสดง error message จาก Backend แบบละเอียด
        console.error('🚨 Backend Link Error Response:', data)
        
        // แสดงข้อผิดพลาดที่เป็นประโยชน์
        let errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมโยง'
        
        // ตรวจสอบ error message หลายรูปแบบ
        if (data?.message) {
          errorMessage = data.message
          console.error('🔍 Link Error Message:', data.message)
        } else if (data?.error) {
          errorMessage = data.error
          console.error('🔍 Link Error:', data.error)
        } else if (data?.errors && Array.isArray(data.errors)) {
          errorMessage = 'ข้อมูลไม่ถูกต้อง: ' + data.errors.join(', ')
          console.error('🔍 Link Errors Array:', data.errors)
        } else if (data?.errors && typeof data.errors === 'object') {
          // กรณี validation errors เป็น object
          const errorList = Object.values(data.errors).flat()
          errorMessage = 'ข้อมูลไม่ถูกต้อง: ' + errorList.join(', ')
          console.error('🔍 Link Validation Errors:', data.errors)
        }
        
        return { success: false, error: errorMessage }
      }
      
      return { 
        success: false, 
        error: error.message || 'เกิดข้อผิดพลาดในการเชื่อมโยง' 
      }
    }
  },

  async loginWithLine({ commit, dispatch }, { lineProfile, lineAccessToken }) {
    console.log('กำลังล็อกอินด้วย LINE')
    
    if (!lineProfile || !lineProfile.userId) {
      return { 
        success: false, 
        error: 'ข้อมูล LINE Profile ไม่ถูกต้อง'
      }
    }
    
    const accessToken = lineAccessToken || lineProfile.accessToken
    
    if (!accessToken) {
      return {
        success: false,
        error: 'ไม่พบ LINE Access Token'
      }
    }
    
    commit('setLineProfile', lineProfile)
    commit('setLineAccessToken', accessToken)
    
    try {
      // ตรวจสอบการเชื่อมโยงบัญชี LINE ก่อน
      const checkResult = await dispatch('checkLineRegistration')
      
      if (!checkResult.registered) {
        console.warn('ไม่พบการเชื่อมโยงบัญชี LINE กับพนักงาน')
        return {
          success: false,
          error: checkResult.error || 'ไม่พบการเชื่อมโยงบัญชี LINE กับพนักงาน',
          needRegistration: true
        }
      }
      
      console.log('กำลังเรียก API ล็อกอินด้วย LINE')
      
      const response = await this.$axios.$post('/api/auth/line-login', {
        accessToken,
        lineUserId: lineProfile.userId
      })

      const token = response.access_token || response.token

      if (token) {
        commit('setToken', token)
        
        if (response.user) {
          commit('setUser', response.user)
          localStorage.setItem('user', JSON.stringify(response.user))
          
          if (response.user.staff_code) {
            commit('setStaffCode', response.user.staff_code)
            localStorage.setItem('staffCode', response.user.staff_code)
          }
        }
        
        commit('setAuth', true)
        commit('setLastCheck', Date.now())
        
        localStorage.setItem('token', token)
        localStorage.setItem('lineProfile', JSON.stringify(lineProfile))
        
        return { 
          success: true,
          token,
          user: response.user,
          staff_code: response.user?.staff_code
        }
      }
      
      throw new Error('ไม่พบ token ในการตอบกลับจาก API')
      
    } catch (error) {
      console.error('การล็อกอินผ่าน LINE ไม่สำเร็จ:', error)
      
      if (error.response) {
        const { status, data } = error.response
        
        if (status === 401 || status === 404) {
          return { 
            success: false,
            error: data?.message || 'ไม่พบการเชื่อมโยงบัญชี LINE กับพนักงาน',
            needRegistration: true
          }
        }
        
        if (status === 400) {
          return { 
            success: false,
            error: data?.message || data?.error || 'ข้อมูลไม่ถูกต้อง'
          }
        }
      }
      
      return { 
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการล็อกอิน'
      }
    }
  },

  // ✅ ปรับปรุง fetchStaffData ให้ทำงานได้ดีขึ้น
  async fetchStaffDataById({ commit, state }, staffId) {
    try {
      const token = state.token || localStorage.getItem('token')
      if (!token) {
        return { success: false, error: 'ไม่พบ token' }
      }
      
      const staffResponse = await this.$axios.$get(`/api/staffs/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (staffResponse) {
        commit('setStaffInfo', staffResponse)
        localStorage.setItem('staffInfo', JSON.stringify(staffResponse))
        
        if (staffResponse.staff_code) {
          commit('setStaffCode', staffResponse.staff_code)
          localStorage.setItem('staffCode', staffResponse.staff_code)
        }
        
        return { success: true, staffInfo: staffResponse }
      }
      
      return { success: false, error: 'ไม่พบข้อมูลพนักงาน' }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน:', error)
      return { success: false, error: error.message }
    }
  },

  logout({ commit }) {
    const lineProfileStr = localStorage.getItem('lineProfile')
    let lineProfile = null
    
    if (lineProfileStr) {
      try {
        lineProfile = JSON.parse(lineProfileStr)
      } catch (e) {
        console.error('ไม่สามารถแปลงข้อมูล LINE Profile ได้', e)
      }
    }
    
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('staffCode')
    localStorage.removeItem('staffInfo')
    
    commit('clearAuth')
    
    if (lineProfile) {
      commit('setLineProfile', lineProfile)
      
      if (lineProfile.accessToken) {
        commit('setLineAccessToken', lineProfile.accessToken)
      }
    }
    
    console.log('ล็อกเอาท์สำเร็จ แต่ยังเก็บข้อมูล LINE Profile ไว้')
  }
}

// ✅ Helper function สำหรับตรวจสอบข้อมูล link API
function validateLinkDataNew(data) {
  const errors = []
  
  if (!data.lineUserId || typeof data.lineUserId !== 'string' || data.lineUserId.trim() === '') {
    errors.push('lineUserId ต้องเป็น string และไม่ว่าง')
  }
  
  if (!data.staffCode || typeof data.staffCode !== 'string' || data.staffCode.trim() === '') {
    errors.push('staffCode ต้องเป็น string และไม่ว่าง')
  }
  
  if (!data.lineAccessToken || typeof data.lineAccessToken !== 'string' || data.lineAccessToken.trim() === '') {
    errors.push('lineAccessToken ต้องเป็น string และไม่ว่าง')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}