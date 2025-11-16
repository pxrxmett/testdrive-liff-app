<template>
  <div class="link-account-page">
    <h2>เชื่อมโยงบัญชี LINE กับบัญชีพนักงาน</h2>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <form @submit.prevent="handleSubmit" class="link-form">
      <div class="form-group">
        <label>รหัสพนักงาน</label>
        <input 
          v-model="staffId"
          type="text"
          required
          placeholder="กรุณากรอกรหัสพนักงาน"
        >
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'กำลังดำเนินการ...' : 'เชื่อมโยงบัญชี' }}
      </button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      staffId: '',
      error: null,
      isLoading: false
    }
  },

  mounted() {
    // ✅ ตรวจสอบว่า user ล็อกอินและมี token แล้วหรือยัง
    const token = this.$store.state.auth?.token || localStorage.getItem('token')
    const user = this.$store.state.auth?.user
    const lineProfile = this.$store.state.auth?.lineProfile

    console.log('🔍 Link Account Page - Check Auth Status:', {
      hasToken: !!token,
      user: user,
      lineProfile: lineProfile,
      lineUserId: lineProfile?.userId
    })

    // ✅ ถ้ามี token แล้ว → user ล็อกอินสำเร็จแล้ว → redirect ไป dashboard
    if (token) {
      console.log('✅ User already authenticated with token - redirecting to dashboard')
      this.$router.push('/')
      return
    }

    // ✅ ถ้ามี lineUserId แสดงว่าเชื่อมโยงแล้ว → redirect
    if (lineProfile?.userId) {
      console.log('✅ LINE already linked - checking registration...')
      // ลอง check registration อีกครั้ง
      this.$store.dispatch('auth/checkLineRegistration')
        .then(result => {
          if (result.registered) {
            console.log('✅ Registered - redirecting to dashboard')
            this.$router.push('/')
          } else {
            console.log('⏳ Not registered yet - showing link form')
          }
        })
      return
    }

    // ❌ ถ้ายังไม่ link → แสดงฟอร์ม
    console.log('⏳ No authentication found - showing link form')
  },

  methods: {
    async handleSubmit() {
      try {
        this.isLoading = true
        this.error = null

        console.log('🔗 Starting LINE account linking with staffId:', this.staffId)

        // เชื่อมโยง LINE กับ Staff Code
        const linkResult = await this.$store.dispatch('auth/linkLineAccount', { staffId: this.staffId })

        if (!linkResult || !linkResult.success) {
          throw new Error(linkResult?.error || 'การเชื่อมโยงไม่สำเร็จ')
        }

        console.log('✅ LINE account linked successfully')

        // เช็คการเชื่อมโยงอีกครั้งและรับ token
        const checkResult = await this.$store.dispatch('auth/checkLineRegistration')

        console.log('🔍 Check registration result:', checkResult)

        // ✅ Redirect ไป dashboard
        console.log('🔄 Redirecting to dashboard...')
        this.$router.push('/')
      } catch (error) {
        console.error('❌ Link account error:', error)
        this.error = error.message || error.error || 'เกิดข้อผิดพลาดในการเชื่อมโยงบัญชี กรุณาลองใหม่'
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.link-account-page {
  padding: 2rem;
  max-width: 400px;
  margin: 0 auto;
}

.link-form {
  margin-top: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.error-message {
  color: red;
  margin-bottom: 1rem;
}

button {
  width: 100%;
  padding: 0.8rem;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>