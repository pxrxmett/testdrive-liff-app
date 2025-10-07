<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="logo">
          <img src="/logo.png" alt="Logo" class="logo-image" />
        </div>
        <h1>ระบบจองทดลองขับรถ</h1>
        <p>เข้าสู่ระบบผ่าน LINE</p>
      </div>

      <!-- แสดง Error Message -->
      <div v-if="errorMessage" class="error-alert">
        <i class="fas fa-exclamation-triangle"></i>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- แสดงสถานะการเชื่อมต่อ LIFF -->
      <div class="liff-status">
        <div v-if="!liffReady" class="status-loading">
          <div class="spinner"></div>
          <span>กำลังเตรียม LINE...</span>
        </div>
        
        <div v-else-if="!isLoggedIn" class="status-not-logged">
          <i class="fab fa-line" style="color: #00C300;"></i>
          <span>พร้อมเข้าสู่ระบบผ่าน LINE</span>
        </div>
        
        <div v-else-if="lineProfile" class="status-logged">
          <img :src="lineProfile.pictureUrl" :alt="lineProfile.displayName" class="user-avatar" />
          <div class="user-info">
            <span class="user-name">{{ lineProfile.displayName }}</span>
            <span class="user-status">เข้าสู่ระบบ LINE แล้ว</span>
          </div>
        </div>
      </div>

      <!-- แสดงข้อมูลการเชื่อมโยง -->
      <div v-if="checkingConnection" class="connection-status">
        <div class="spinner"></div>
        <span>กำลังตรวจสอบการเชื่อมโยงบัญชี...</span>
      </div>

      <div v-else-if="connectionResult" class="connection-result">
        <div v-if="connectionResult.registered" class="success-message">
          <i class="fas fa-check-circle"></i>
          <span>พบการเชื่อมโยงบัญชีแล้ว กำลังเข้าสู่ระบบ...</span>
        </div>
        
        <div v-else class="warning-message">
          <i class="fas fa-link"></i>
          <span>ยังไม่ได้เชื่อมโยงบัญชี LINE กับพนักงาน</span>
          <p class="help-text">กรุณาติดต่อผู้ดูแลระบบเพื่อเชื่อมโยงบัญชี</p>
        </div>
      </div>

      <!-- ปุ่มล็อกอิน -->
      <div class="login-actions">
        <button 
          v-if="!isLoggedIn && liffReady" 
          @click="loginWithLine" 
          class="btn-line-login"
          :disabled="isLoggingIn"
        >
          <i class="fab fa-line"></i>
          {{ isLoggingIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย LINE' }}
        </button>

        <button 
          v-else-if="isLoggedIn && !connectionResult?.registered" 
          @click="checkConnection" 
          class="btn-check-connection"
          :disabled="checkingConnection"
        >
          <i class="fas fa-search"></i>
          {{ checkingConnection ? 'กำลังตรวจสอบ...' : 'ตรวจสอบการเชื่อมโยง' }}
        </button>

        <button 
          v-if="isLoggedIn" 
          @click="logout" 
          class="btn-logout-line"
        >
          <i class="fas fa-sign-out-alt"></i>
          ออกจาก LINE
        </button>
      </div>

      <!-- Debug Info (Development Only) -->
      <div v-if="$config.isDev && debugInfo" class="debug-info">
        <h4>Debug Information</h4>
        <pre>{{ JSON.stringify(debugInfo, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  layout: false, // ไม่ใช้ layout เพื่อให้เป็นหน้า standalone
  
  data() {
    return {
      liffReady: false,
      isLoggedIn: false,
      isLoggingIn: false,
      checkingConnection: false,
      errorMessage: '',
      lineProfile: null,
      connectionResult: null,
      debugInfo: null
    };
  },

  async mounted() {
    // ตรวจสอบ error message จาก query params
    if (this.$route.query.error) {
      this.errorMessage = decodeURIComponent(this.$route.query.error);
    }

    // เริ่มต้น LIFF และตรวจสอบสถานะ
    await this.initializeLiff();
  },

  methods: {
    async initializeLiff() {
      try {
        console.log('เริ่มต้น LIFF ในหน้า login...');
        
        // รอให้ LIFF พร้อม
        if (window.liff) {
          await window.liff.ready;
          this.liffReady = true;
          
          // ตรวจสอบสถานะการล็อกอิน
          this.isLoggedIn = window.liff.isLoggedIn();
          
          if (this.isLoggedIn) {
            await this.loadLineProfile();
            await this.checkConnection();
          }
          
          console.log('LIFF พร้อมใช้งาน, สถานะการล็อกอิน:', this.isLoggedIn);
        } else {
          // ถ้ายังไม่มี LIFF ให้รอสักครู่
          setTimeout(() => this.initializeLiff(), 1000);
        }
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการเริ่มต้น LIFF:', error);
        this.errorMessage = 'ไม่สามารถเชื่อมต่อกับ LINE ได้ กรุณาลองใหม่';
      }
    },

    async loadLineProfile() {
      try {
        if (window.liff && window.liff.isLoggedIn()) {
          this.lineProfile = await window.liff.getProfile();
          
          // บันทึกข้อมูลใน store ด้วย
          if (this.lineProfile) {
            const accessToken = await window.liff.getAccessToken();
            const lineProfileWithToken = {
              ...this.lineProfile,
              accessToken
            };
            
            this.$store.commit('auth/setLineProfile', lineProfileWithToken);
            this.$store.commit('auth/setLineAccessToken', accessToken);
            localStorage.setItem('lineProfile', JSON.stringify(lineProfileWithToken));
          }
        }
      } catch (error) {
        console.error('ไม่สามารถดึงข้อมูล LINE Profile:', error);
      }
    },

    loginWithLine() {
      if (!window.liff) {
        this.errorMessage = 'LINE LIFF ยังไม่พร้อม กรุณาลองใหม่';
        return;
      }

      try {
        this.isLoggingIn = true;
        this.errorMessage = '';
        
        console.log('เริ่มต้นการล็อกอินด้วย LINE...');
        
        // ล็อกอินผ่าน LIFF
        window.liff.login();
        
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการล็อกอิน LINE:', error);
        this.errorMessage = 'ไม่สามารถเข้าสู่ระบบผ่าน LINE ได้ กรุณาลองใหม่';
        this.isLoggingIn = false;
      }
    },

    async checkConnection() {
      if (!this.lineProfile) {
        this.errorMessage = 'ไม่พบข้อมูล LINE Profile';
        return;
      }

      try {
        this.checkingConnection = true;
        this.errorMessage = '';
        this.connectionResult = null;

        console.log('ตรวจสอบการเชื่อมโยงบัญชี LINE...');

        // เรียกใช้ store action
        const result = await this.$store.dispatch('auth/checkLineRegistration');
        
        this.connectionResult = result;
        
        // ถ้าพบการเชื่อมโยง ให้พยายามล็อกอิน
        if (result.registered) {
          console.log('พบการเชื่อมโยงบัญชี พยายามล็อกอิน...');
          await this.attemptSystemLogin();
        } else {
          console.log('ยังไม่ได้เชื่อมโยงบัญชี');
        }

        // เก็บข้อมูล debug
        if (process.env.NODE_ENV === 'development') {
          this.debugInfo = {
            lineProfile: this.lineProfile,
            connectionResult: result,
            timestamp: new Date().toISOString()
          };
        }

      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการตรวจสอบการเชื่อมโยง:', error);
        this.errorMessage = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการตรวจสอบ';
      } finally {
        this.checkingConnection = false;
      }
    },

    async attemptSystemLogin() {
      try {
        const accessToken = await window.liff.getAccessToken();
        
        const loginResult = await this.$store.dispatch('auth/loginWithLine', {
          lineProfile: this.lineProfile,
          lineAccessToken: accessToken
        });

        if (loginResult.success) {
          console.log('ล็อกอินสำเร็จ!');
          
          // ตรวจสอบ redirect path
          const redirectPath = localStorage.getItem('redirectAfterLogin');
          if (redirectPath && redirectPath !== '/login') {
            localStorage.removeItem('redirectAfterLogin');
            this.$router.push(redirectPath);
          } else {
            this.$router.push('/');
          }
        } else {
          this.errorMessage = loginResult.error || 'การล็อกอินไม่สำเร็จ';
        }
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการล็อกอินระบบ:', error);
        this.errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      }
    },

    logout() {
      try {
        if (window.liff && window.liff.isLoggedIn()) {
          window.liff.logout();
        }
        
        // ล้างข้อมูลใน store และ localStorage
        this.$store.dispatch('auth/logout');
        
        // รีเซ็ตข้อมูลหน้า
        this.isLoggedIn = false;
        this.lineProfile = null;
        this.connectionResult = null;
        this.errorMessage = '';
        
        console.log('ออกจากระบบแล้ว');
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการออกจากระบบ:', error);
      }
    }
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #DA291C, #B8241A);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Sarabun', sans-serif;
}

.login-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.login-header {
  margin-bottom: 30px;
}

.logo {
  margin-bottom: 20px;
}

.logo-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.login-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: bold;
}

.login-header p {
  color: #666;
  margin: 0;
  font-size: 16px;
}

.error-alert {
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #c62828;
  font-size: 14px;
}

.liff-status, .connection-status, .connection-result {
  margin: 20px 0;
  padding: 15px;
  border-radius: 10px;
  border: 2px solid #e0e0e0;
}

.status-loading, .connection-status {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #DA291C;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.status-not-logged {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #00C300;
  font-weight: 600;
}

.status-logged {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  font-weight: 600;
  color: #333;
}

.user-status {
  font-size: 12px;
  color: #00C300;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #28a745;
  font-weight: 600;
}

.warning-message {
  color: #f39c12;
}

.warning-message i {
  margin-bottom: 10px;
  font-size: 24px;
}

.help-text {
  font-size: 12px;
  margin-top: 5px;
  color: #666;
}

.login-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.btn-line-login, .btn-check-connection, .btn-logout-line {
  border: none;
  padding: 14px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-line-login {
  background: linear-gradient(135deg, #00C300, #009900);
  color: white;
}

.btn-line-login:hover:not(:disabled) {
  background: linear-gradient(135deg, #009900, #007700);
  transform: translateY(-2px);
}

.btn-line-login:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.btn-check-connection {
  background: linear-gradient(135deg, #DA291C, #B8241A);
  color: white;
}

.btn-check-connection:hover:not(:disabled) {
  background: linear-gradient(135deg, #B8241A, #A01E16);
  transform: translateY(-2px);
}

.btn-check-connection:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.btn-logout-line {
  background: #6c757d;
  color: white;
  font-size: 14px;
}

.btn-logout-line:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.debug-info {
  margin-top: 30px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: left;
}

.debug-info h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.debug-info pre {
  background: #343a40;
  color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  margin: 0;
}

@media (max-width: 480px) {
  .login-container {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .login-header h1 {
    font-size: 20px;
  }
  
  .logo-image {
    width: 60px;
    height: 60px;
  }
}
</style>