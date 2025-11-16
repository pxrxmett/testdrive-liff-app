<!-- pages/link-account.vue -->
<template>
  <div class="link-account">
    <h1>เชื่อมโยงบัญชี LINE กับบัญชีพนักงาน</h1>
    
    <div v-if="lineProfile">
      <div class="line-profile">
        <img :src="lineProfile.pictureUrl" alt="LINE Profile" v-if="lineProfile.pictureUrl">
        <p>ชื่อ LINE: {{ lineProfile.displayName }}</p>
      </div>
      
      <form @submit.prevent="linkAccount">
        <div class="form-group">
          <label for="staffId">รหัสพนักงาน</label>
          <input 
            type="text" 
            id="staffId" 
            v-model="staffId" 
            placeholder="กรุณากรอกรหัสพนักงาน" 
            required
          >
        </div>
        
        <button type="submit" :disabled="loading">
          {{ loading ? 'กำลังเชื่อมโยง...' : 'เชื่อมโยงบัญชี' }}
        </button>
      </form>
    </div>
    
    <div v-else class="error-message">
      <p>ไม่สามารถดึงข้อมูล LINE ได้ กรุณาลองใหม่อีกครั้ง</p>
      <button @click="relogin">ล็อกอินใหม่</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LinkPage',
  layout: 'blank',

  data() {
    return {
      lineProfile: null,
      staffId: '',
      loading: false,
      error: null
    }
  },
  
  async mounted() {
    try {
      // ดึงข้อมูล LINE จาก localStorage หรือ LIFF
      const lineProfileStr = localStorage.getItem('lineProfile')

      if (lineProfileStr) {
        this.lineProfile = JSON.parse(lineProfileStr)
      }

      // ถ้าไม่มีใน localStorage ให้ดึงจาก LIFF
      if (!this.lineProfile && window.liff && window.liff.isLoggedIn()) {
        const [profile, accessToken] = await Promise.all([
          window.liff.getProfile(),
          window.liff.getAccessToken()
        ])

        this.lineProfile = {
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
          accessToken
        }

        // บันทึกลง localStorage
        localStorage.setItem('lineProfile', JSON.stringify(this.lineProfile))
      }

      if (!this.lineProfile) {
        console.error('ไม่พบข้อมูล LINE Profile')
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล LINE Profile:', error)
    }
  },
  
  methods: {
    async linkAccount() {
      try {
        this.loading = true

        if (!this.lineProfile || !this.lineProfile.userId) {
          throw new Error('ไม่พบข้อมูล LINE ID')
        }

        // ✅ เปลี่ยนเป็น /link-simple (ไม่ต้องส่ง lineAccessToken)
        const response = await this.$axios.$post('/line-integration/link-simple', {
          lineUserId: this.lineProfile.userId,
          staffCode: this.staffId
        })

        if (response.success) {
          // ✅ บันทึก token ที่ได้จาก response
          if (response.token) {
            this.$store.commit('auth/setToken', response.token)
            this.$store.commit('auth/setAuth', true)
            localStorage.setItem('token', response.token)
            console.log('✅ Token saved from link-simple:', response.token.substring(0, 20) + '...')
          }

          // ✅ บันทึก brandCode ที่ได้จาก response
          const brandCode = response.brandCode || response.brand_code || response.brand
          if (brandCode) {
            localStorage.setItem('brandCode', brandCode)
            console.log('✅ brandCode saved from link-simple:', brandCode)
          }

          // ✅ บันทึกข้อมูล staff
          if (response.staff) {
            this.$store.commit('auth/setStaffInfo', response.staff)
            localStorage.setItem('staffInfo', JSON.stringify(response.staff))
          }

          this.$store.dispatch('notifications/add', {
            type: 'success',
            message: 'เชื่อมโยงบัญชีสำเร็จ'
          })

          // ไปที่หน้าหลัก
          this.$router.push('/')
        } else {
          throw new Error(response.message || 'เกิดข้อผิดพลาดในการเชื่อมโยงบัญชี')
        }
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการเชื่อมโยงบัญชี:', error)

        this.$store.dispatch('notifications/add', {
          type: 'error',
          message: error.message || 'เกิดข้อผิดพลาดในการเชื่อมโยงบัญชี กรุณาลองใหม่อีกครั้ง'
        })
      } finally {
        this.loading = false
      }
    },
    
    relogin() {
      if (window.liff) {
        window.liff.logout()
        window.liff.login()
      } else {
        this.$router.push('/login')
      }
    }
  }
}
</script>
<style>
.link-account {
  max-width: 480px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: 'Kanit', sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  font-weight: 600;
}

.line-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f5f5f5;
  border-radius: 12px;
}

.line-profile img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 1rem;
  border: 3px solid #06c755;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.line-profile p {
  color: #333;
  font-weight: 500;
  font-size: 1.1rem;
  margin: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #06c755;
  box-shadow: 0 0 0 2px rgba(6, 199, 85, 0.1);
}

button {
  width: 100%;
  background-color: #06c755;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #05b249;
}

button:disabled {
  background-color: #9fd5b9;
  cursor: not-allowed;
}

.error-message {
  text-align: center;
  padding: 2rem 1rem;
  background-color: #fff8f8;
  border-radius: 12px;
  border: 1px solid #ffebeb;
}

.error-message p {
  color: #e53935;
  margin-bottom: 1.5rem;
}

.error-message button {
  background-color: #f44336;
  max-width: 200px;
  margin: 0 auto;
}

.error-message button:hover {
  background-color: #d32f2f;
}

@media (max-width: 480px) {
  .link-account {
    padding: 1.5rem 1rem;
  }
  
  h1 {
    font-size: 1.3rem;
  }
}
</style>