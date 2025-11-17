<template>
  <div class="profile-page">
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <div v-else-if="errorMessage" class="error-container">
      <div class="error-icon">
        <i class="fas fa-exclamation-circle"></i>
      </div>
      <p class="error-message">{{ errorMessage }}</p>
      <div class="error-actions">
        <button @click="retryFetch" class="btn-retry" :disabled="isRetrying">
          <i class="fas fa-redo"></i>
          {{ isRetrying ? 'กำลังลองใหม่...' : 'ลองใหม่อีกครั้ง' }}
        </button>
      </div>
    </div>

    <div v-else class="profile-container">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-avatar">
          <img 
            v-if="lineProfile && lineProfile.pictureUrl" 
            :src="lineProfile.pictureUrl" 
            :alt="lineProfile.displayName"
            class="avatar-image"
          />
          <div v-else class="avatar-placeholder">
            <span>{{ getInitials() }}</span>
          </div>
          <div v-if="lineProfile" class="line-badge">
            <i class="fab fa-line"></i>
          </div>
        </div>
        <h1 class="staff-name">{{ getFullName() }}</h1>
        <p class="staff-position">{{ staffData.position || 'ไม่ระบุตำแหน่ง' }}</p>
      </div>

      <!-- Staff Info -->
      <div class="profile-card">
        <h2 class="section-title">ข้อมูลพนักงาน</h2>

        <div class="profile-field">
          <div class="field-label">รหัสพนักงาน</div>
          <div class="field-value">{{ staffData.staff_code || '-' }}</div>
        </div>

        <div class="profile-field">
          <div class="field-label">ชื่อ-นามสกุล</div>
          <div class="field-value">{{ getFullName() || '-' }}</div>
        </div>

        <div class="profile-field">
          <div class="field-label">แผนก</div>
          <div class="field-value">{{ staffData.department || '-' }}</div>
        </div>

        <div class="profile-field">
          <div class="field-label">ตำแหน่ง</div>
          <div class="field-value">{{ staffData.position || '-' }}</div>
        </div>

        <div class="profile-field">
          <div class="field-label">บทบาท</div>
          <div class="field-value">{{ getRoleText(staffData.role) }}</div>
        </div>

        <div class="profile-field">
          <div class="field-label">สถานะเชื่อมโยง LINE</div>
          <div class="field-value status-badge" :class="{ 'status-active': isLineLinked }">
            <i :class="isLineLinked ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
            {{ isLineLinked ? 'เชื่อมโยงแล้ว' : 'ยังไม่ได้เชื่อมโยง' }}
          </div>
        </div>
      </div>

      <!-- LINE Profile -->
      <div class="profile-card" v-if="lineProfile">
        <h2 class="section-title">ข้อมูล LINE</h2>

        <div class="line-profile-info">
          <img 
            v-if="lineProfile.pictureUrl" 
            :src="lineProfile.pictureUrl" 
            alt="LINE Profile" 
            class="line-profile-image" 
          />
          <div class="line-profile-details">
            <div class="line-display-name">{{ lineProfile.displayName }}</div>
            <div class="line-user-id">LINE ID: {{ shortenLineId(lineProfile.userId) }}</div>
          </div>
        </div>

        <!-- ปุ่มเชื่อมโยง LINE หากยังไม่ได้เชื่อมโยง -->
        <div v-if="!isLineLinked && lineProfile && staffData.id" class="line-link-section">
          <button @click="linkLineAccount" class="btn-link-line" :disabled="isLinkingLine">
            <i class="fab fa-line"></i>
            {{ isLinkingLine ? 'กำลังเชื่อมโยง...' : 'เชื่อมโยงบัญชี LINE' }}
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="profile-actions">
        <button @click="refreshData" class="btn-refresh" :disabled="isLoading || isRetrying">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRetrying }"></i> 
          {{ isRetrying ? 'กำลังรีเฟรช...' : 'รีเฟรชข้อมูล' }}
        </button>
        <button @click="logout" class="btn-logout">
          <i class="fas fa-sign-out-alt"></i> ออกจากระบบ
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'default',
  
  data() {
    return {
      isLoading: true,
      isRetrying: false,
      isLinkingLine: false,
      errorMessage: '',
      staffData: {
        id: null,
        staff_code: '',
        first_name: '',
        last_name: '',
        position: '',
        department: '',
        role: 'staff',
        status: 'active'
      }
    };
  },

  computed: {
    // ✅ ดึงข้อมูลจาก store
    lineProfile() {
      return this.$store.getters['auth/lineProfile'];
    },
    
    staffInfo() {
      return this.$store.getters['auth/staffInfo'];
    },
    
    isLineLinked() {
      // ตรวจสอบจากหลายแหล่ง
      return !!(
        this.staffData.is_line_linked || 
        this.staffData.line_user_id || 
        (this.staffInfo && this.staffInfo.line_user_id)
      );
    }
  },

  async mounted() {
    console.log('โหลดหน้าโปรไฟล์...');
    await this.loadProfileData();
  },

  methods: {
    // ✅ ลดความซับซ้อนในการโหลดข้อมูล
    async loadProfileData() {
      try {
        this.isLoading = true;
        this.errorMessage = '';

        // ดึงข้อมูลจาก store ก่อน
        if (this.staffInfo) {
          this.staffData = { ...this.staffData, ...this.staffInfo };
          console.log('ใช้ข้อมูลจาก store:', this.staffInfo);
        }

        // ลองดึงข้อมูลจาก localStorage
        const localStaffInfo = this.getLocalStaffInfo();
        if (localStaffInfo) {
          this.staffData = { ...this.staffData, ...localStaffInfo };
          console.log('ใช้ข้อมูลจาก localStorage:', localStaffInfo);
        }

        // ถ้ามี staffId ให้ดึงข้อมูลล่าสุดจาก API
        if (this.staffData.id) {
          await this.fetchLatestStaffData(this.staffData.id);
        }

        // ตรวจสอบการเชื่อมโยง LINE
        await this.checkLineConnection();

      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', error);
        this.handleError(error);
      } finally {
        this.isLoading = false;
      }
    },

    // ✅ ดึงข้อมูลจาก localStorage
    getLocalStaffInfo() {
      try {
        const userStr = localStorage.getItem('user');
        const staffInfoStr = localStorage.getItem('staffInfo');
        
        if (staffInfoStr) {
          return JSON.parse(staffInfoStr);
        } else if (userStr) {
          return JSON.parse(userStr);
        }
        return null;
      } catch (error) {
        console.warn('ไม่สามารถอ่านข้อมูลจาก localStorage:', error);
        return null;
      }
    },

    // ✅ ดึงข้อมูลล่าสุดจาก API
    async fetchLatestStaffData(staffId) {
      try {
        const result = await this.$store.dispatch('auth/fetchStaffDataById', staffId);
        if (result.success && result.staffInfo) {
          this.staffData = { ...this.staffData, ...result.staffInfo };
          console.log('อัปเดตข้อมูลจาก API สำเร็จ');
        }
      } catch (error) {
        console.warn('ไม่สามารถดึงข้อมูลล่าสุดจาก API:', error);
        // ไม่ throw error เพราะยังมีข้อมูลจาก cache
      }
    },

    // ✅ ตรวจสอบการเชื่อมโยง LINE (แบบง่าย)
    async checkLineConnection() {
      if (!this.lineProfile || !this.staffData.id) {
        console.log('ข้อมูลไม่ครบสำหรับตรวจสอบการเชื่อมโยง LINE');
        return;
      }

      try {
        const result = await this.$store.dispatch('auth/checkLineRegistration', {
          staffId: this.staffData.id
        });

        if (result.registered) {
          console.log('ตรวจสอบการเชื่อมโยง LINE: เชื่อมโยงแล้ว');
          // อัปเดตข้อมูลในกรณีที่ได้ข้อมูลเพิ่มเติมจาก API
          if (result.staffInfo) {
            this.staffData = { ...this.staffData, ...result.staffInfo };
          }
        } else {
          console.log('ตรวจสอบการเชื่อมโยง LINE: ยังไม่ได้เชื่อมโยง');
        }
      } catch (error) {
        console.warn('ไม่สามารถตรวจสอบการเชื่อมโยง LINE:', error);
      }
    },

    // ✅ เชื่อมโยงบัญชี LINE (ใช้ store action)
    async linkLineAccount() {
      if (!this.lineProfile || !this.staffData.id) {
        alert('ข้อมูลไม่ครบถ้วนสำหรับการเชื่อมโยง');
        return;
      }

      try {
        this.isLinkingLine = true;

        const result = await this.$store.dispatch('auth/linkLineAccount', {
          staffId: this.staffData.id
        });

        if (result.success) {
          alert('เชื่อมโยงบัญชี LINE สำเร็จ!');
          await this.loadProfileData(); // รีโหลดข้อมูล
        } else {
          alert(result.error || 'การเชื่อมโยงไม่สำเร็จ');
        }
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการเชื่อมโยง:', error);
        alert('เกิดข้อผิดพลาดในการเชื่อมโยง กรุณาลองใหม่');
      } finally {
        this.isLinkingLine = false;
      }
    },

    // ✅ รีเฟรชข้อมูล
    async refreshData() {
      this.isRetrying = true;
      await this.loadProfileData();
      this.isRetrying = false;
    },

    async retryFetch() {
      await this.refreshData();
    },

    // ✅ จัดการข้อผิดพลาด
    handleError(error) {
      if (error.response) {
        const { status } = error.response;
        
        switch (status) {
          case 401:
            this.errorMessage = 'หมดอายุการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่';
            break;
          case 404:
            this.errorMessage = 'ไม่พบข้อมูลพนักงาน';
            break;
          case 500:
            this.errorMessage = 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์';
            break;
          default:
            this.errorMessage = 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
        }
      } else {
        this.errorMessage = error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      }
    },

    // Helper methods
    getFullName() {
      // ✅ ลำดับความสำคัญ: name (fullname) > first_name + last_name > lineProfile.displayName
      if (this.staffData.name) {
        return this.staffData.name;
      }

      const firstName = this.staffData.first_name || '';
      const lastName = this.staffData.last_name || '';

      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      }

      if (firstName || lastName) {
        return firstName || lastName;
      }

      // Fallback: ใช้ชื่อจาก LINE เป็นทางเลือกสุดท้าย
      if (this.lineProfile && this.lineProfile.displayName) {
        return `${this.lineProfile.displayName} (LINE)`;
      }

      return 'ไม่ระบุชื่อ';
    },

    getInitials() {
      const fullName = this.getFullName();
      if (!fullName || fullName === 'ไม่ระบุชื่อ') return '?';
      
      const names = fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`;
      }
      return fullName.charAt(0);
    },

    shortenLineId(userId) {
      if (!userId) return '';
      return userId.length > 10 
        ? `${userId.substring(0, 6)}...${userId.substring(userId.length - 4)}`
        : userId;
    },

    getRoleText(role) {
      const roles = {
        'admin': 'ผู้ดูแลระบบ',
        'manager': 'ผู้จัดการ',
        'staff': 'พนักงาน',
        'user': 'ผู้ใช้งาน'
      };
      return roles[role] || role || 'ไม่ระบุ';
    },

    logout() {
      console.log('กำลังออกจากระบบ...');
      
      // ล้างข้อมูลใน localStorage
      const itemsToRemove = ['token', 'user', 'staffId', 'staffInfo'];
      itemsToRemove.forEach(item => {
        try {
          localStorage.removeItem(item);
        } catch (error) {
          console.warn(`ไม่สามารถลบ ${item} จาก localStorage:`, error);
        }
      });
      
      // ออกจากระบบ LINE
      if (window.liff && window.liff.isLoggedIn()) {
        try {
          window.liff.logout();
        } catch (error) {
          console.warn('ไม่สามารถออกจากระบบ LINE:', error);
        }
      }
      
      // ล้าง store
      this.$store.dispatch('auth/logout');
      
      // ไปหน้าล็อกอิน
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
/* Base Styles */
.profile-page {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: 'Sarabun', sans-serif;
  padding-bottom: 80px;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f8f9fa;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--brand-primary);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error */
.error-container {
  text-align: center;
  padding: 40px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.error-icon {
  font-size: 48px;
  color: var(--brand-primary);
  margin-bottom: 16px;
}

.error-message {
  color: var(--brand-primary);
  margin-bottom: 20px;
  font-size: 16px;
  line-height: 1.5;
  max-width: 400px;
}

.btn-retry {
  background: var(--brand-primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--brand-shadow);
}

.btn-retry:hover:not(:disabled) {
  opacity: 0.9;
  box-shadow: var(--brand-shadow-hover);
}

.btn-retry:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* Profile Container */
.profile-container {
  min-height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
}

/* Profile Header */
.profile-header {
  background: var(--brand-primary);
  color: white;
  padding: 60px 20px 40px 20px;
  text-align: center;
}

.profile-avatar {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.avatar-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid white;
  object-fit: cover;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 4px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.line-badge {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: #00C300;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  border: 3px solid white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.staff-name {
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.staff-position {
  font-size: 18px;
  margin: 0;
  opacity: 0.9;
  font-weight: 300;
}

/* Profile Cards */
.profile-card {
  padding: 30px 20px;
  border-bottom: 1px solid #e9ecef;
  background: white;
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  color: var(--brand-text);
  margin: 0 0 25px 0;
  padding-bottom: 10px;
  border-bottom: 3px solid var(--brand-primary);
}

/* Profile Fields */
.profile-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f8f9fa;
}

.profile-field:last-child {
  border-bottom: none;
}

.field-label {
  font-weight: 600;
  color: #495057;
  flex: 0 0 45%;
  font-size: 15px;
}

.field-value {
  flex: 1;
  text-align: right;
  color: #212529;
  font-size: 15px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 25px;
  font-size: 13px;
  font-weight: 600;
  background: var(--brand-primary);
  color: white;
}

.status-badge.status-active {
  background: #28a745;
}

/* LINE Profile */
.line-profile-info {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
  padding: 20px;
  background: var(--brand-bg);
  border-radius: 12px;
  border: 2px solid var(--brand-primary);
}

.line-profile-image {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #00C300;
}

.line-display-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
}

.line-user-id {
  font-size: 14px;
  color: #6c757d;
}

.line-link-section {
  text-align: center;
  margin-top: 20px;
}

.btn-link-line {
  background: linear-gradient(135deg, #00C300, #009900);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
}

.btn-link-line:hover:not(:disabled) {
  background: linear-gradient(135deg, #009900, #007700);
  transform: translateY(-2px);
}

.btn-link-line:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

/* Actions */
.profile-actions {
  padding: 30px 20px;
  display: flex;
  gap: 15px;
  justify-content: center;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  margin-top: auto;
}

.btn-refresh, .btn-logout {
  border: none;
  padding: 14px 28px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-refresh {
  background: var(--brand-primary);
  color: white;
  box-shadow: var(--brand-shadow);
}

.btn-refresh:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: var(--brand-shadow-hover);
}

.btn-refresh:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.btn-logout {
  background: linear-gradient(135deg, #6c757d, #5a6268);
  color: white;
}

.btn-logout:hover {
  background: linear-gradient(135deg, #5a6268, #495057);
  transform: translateY(-2px);
}

.fa-spin {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-header {
    padding: 40px 15px 30px 15px;
  }
  
  .staff-name {
    font-size: 26px;
  }
  
  .profile-card {
    padding: 20px 15px;
  }
  
  .profile-field {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .field-value {
    text-align: left;
  }
  
  .profile-actions {
    flex-direction: column;
    padding: 20px 15px;
  }
  
  .btn-refresh, .btn-logout {
    width: 100%;
    justify-content: center;
  }
  
  .line-profile-info {
    flex-direction: column;
    text-align: center;
  }
}
</style>