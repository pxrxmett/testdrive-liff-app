<!-- pages/test-drive/start-form/_id.vue -->
<template>
    <div class="container">
      <!-- Header -->
      <header>
        <div class="header-content">
          <div class="logo">ISUZU</div>
          <div class="user-info">
            <div class="info-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>พนักงาน: {{ staffInfo.display_name || 'Admin' }}</span>
            </div>
            <div class="info-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>สาขา: {{ branchName }}</span>
            </div>
          </div>
        </div>
      </header>
  
      <main>
        <!-- Back Button -->
        <button class="back-btn" @click="goBack">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          <span>กลับ</span>
        </button>
  
        <!-- System Status -->
        <div class="system-status" :class="getSystemStatusClass()">
          <span>สถานะระบบ:</span>
          <div class="status-indicator">
            <div class="status-dot" :class="getStatusDotClass()"></div>
            <span>{{ getSystemStatusText() }}</span>
          </div>
        </div>
  
        <!-- Form Title -->
        <h2 class="form-title">เริ่มทดลองขับ</h2>
  
        <!-- Customer Info Display -->
        <div v-if="testDriveData.customer_name" class="customer-info-card">
          <h3>ข้อมูลลูกค้า</h3>
          <div class="customer-details">
            <div class="detail-row">
              <span class="label">ชื่อ:</span>
              <span class="value">{{ testDriveData.customer_name }}</span>
            </div>
            <div class="detail-row">
              <span class="label">เบอร์โทร:</span>
              <span class="value">{{ testDriveData.customer_phone || 'ไม่ระบุ' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">รุ่นรถ:</span>
              <span class="value">{{ vehicleData.model || 'ไม่ระบุ' }}</span>
            </div>
          </div>
        </div>
  
        <!-- Loading State -->
        <div v-if="isLoading" class="loading">
          <div class="loading-spinner"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
  
        <!-- Form -->
        <form v-else class="test-drive-form" @submit.prevent="submitForm">
          <div class="form-group">
            <label>เวลาเริ่มต้น</label>
            <div class="input-with-icon">
              <input 
                v-model="formData.startTime"
                type="time"
                required
                :class="{ 'error': errors.startTime }"
              >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span v-if="errors.startTime" class="error-message">{{ errors.startTime }}</span>
          </div>
  
          <div class="form-group">
            <label>เลขไมล์เริ่มต้น</label>
            <input 
              v-model="formData.startMileage"
              type="number"
              placeholder="กรุณากรอกเลขไมล์เริ่มต้น"
              min="0"
              step="0.1"
              required
              :class="{ 'error': errors.startMileage }"
            >
            <span v-if="errors.startMileage" class="error-message">{{ errors.startMileage }}</span>
          </div>
  
          <div class="form-group">
            <label>ระดับเชื้อเพลิง/พลังงาน (%)</label>
            <input 
              v-model="formData.fuelLevel"
              type="number"
              placeholder="กรุณากรอกระดับเชื้อเพลิง (0-100)"
              min="0"
              max="100"
              required
              :class="{ 'error': errors.fuelLevel }"
            >
            <span v-if="errors.fuelLevel" class="error-message">{{ errors.fuelLevel }}</span>
          </div>
  
          <div class="form-group">
            <label>เส้นทางทดลองขับ</label>
            <select 
              v-model="formData.testRoute"
              required
              :class="{ 'error': errors.testRoute }"
            >
              <option value="">เลือกเส้นทาง</option>
              <option value="city">เส้นทางในเมือง (5 กม.)</option>
              <option value="highway">เส้นทางทางหลวง (10 กม.)</option>
              <option value="mixed">เส้นทางผสม (15 กม.)</option>
              <option value="custom">กำหนดเส้นทางเอง</option>
            </select>
            <span v-if="errors.testRoute" class="error-message">{{ errors.testRoute }}</span>
          </div>
  
          <div v-if="formData.testRoute === 'custom'" class="form-group">
            <label>ระยะทางโดยประมาณ (กม.)</label>
            <input 
              v-model="formData.customDistance"
              type="number"
              placeholder="กรุณากรอกระยะทาง"
              min="1"
              step="0.1"
              required
            >
          </div>
  
          <div class="form-group">
            <label>ระยะเวลาทดลองขับ (นาที)</label>
            <select 
              v-model="formData.duration"
              required
              :class="{ 'error': errors.duration }"
            >
              <option value="">เลือกระยะเวลา</option>
              <option value="15">15 นาที</option>
              <option value="30">30 นาที</option>
              <option value="45">45 นาที</option>
              <option value="60">1 ชั่วโมง</option>
              <option value="90">1.5 ชั่วโมง</option>
            </select>
            <span v-if="errors.duration" class="error-message">{{ errors.duration }}</span>
          </div>
  
          <div class="form-group">
            <label>บันทึกเพิ่มเติม</label>
            <textarea 
              v-model="formData.notes"
              rows="4"
              placeholder="กรุณากรอกรายละเอียดเพิ่มเติม (เช่น สภาพอากาศ, จุดสังเกต)"
              maxlength="500"
            ></textarea>
            <div class="character-count">{{ formData.notes.length }}/500</div>
          </div>
  
          <!-- Vehicle Condition Checklist -->
          <div class="checklist-section">
            <h3>ตรวจสอบสภาพรถก่อนทดลองขับ</h3>
            <div class="checklist-grid">
              <label class="checkbox-item">
                <input v-model="formData.checks.exteriorCondition" type="checkbox" required>
                <span class="checkmark"></span>
                สภาพภายนอกรถ
              </label>
              <label class="checkbox-item">
                <input v-model="formData.checks.interiorCondition" type="checkbox" required>
                <span class="checkmark"></span>
                สภาพภายในรถ
              </label>
              <label class="checkbox-item">
                <input v-model="formData.checks.tiresCondition" type="checkbox" required>
                <span class="checkmark"></span>
                สภาพยางรถ
              </label>
              <label class="checkbox-item">
                <input v-model="formData.checks.fluidLevels" type="checkbox" required>
                <span class="checkmark"></span>
                ระดับน้ำมันเครื่อง
              </label>
              <label class="checkbox-item">
                <input v-model="formData.checks.lightsFunction" type="checkbox" required>
                <span class="checkmark"></span>
                ระบบไฟส่องสว่าง
              </label>
              <label class="checkbox-item">
                <input v-model="formData.checks.documentsCheck" type="checkbox" required>
                <span class="checkmark"></span>
                เอกสารรถครบถ้วน
              </label>
            </div>
          </div>

          <!-- Submit Button Container -->
          <div class="submit-container">
            <button 
              type="submit" 
              class="submit-btn"
              :disabled="isSubmitting"
              :class="{ 'loading': isSubmitting }"
            >
              <span v-if="isSubmitting">กำลังบันทึก...</span>
              <span v-else>เริ่มทดลองขับ</span>
            </button>
          </div>
        </form>
      </main>
  
      <!-- Confirmation Modal -->
      <div v-if="showConfirmModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h3>ยืนยันการเริ่มทดลองขับ</h3>
          <div class="confirmation-details">
            <p><strong>ลูกค้า:</strong> {{ testDriveData.customer_name }}</p>
            <p><strong>รุ่นรถ:</strong> {{ vehicleData.model }}</p>
            <p><strong>เวลาเริ่ม:</strong> {{ formData.startTime }}</p>
            <p><strong>ระยะเวลา:</strong> {{ formData.duration }} นาที</p>
            <p><strong>เส้นทาง:</strong> {{ getRouteText() }}</p>
          </div>
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="closeModal">ยกเลิก</button>
            <button class="modal-btn confirm" @click="confirmStart" :disabled="isSubmitting">
              {{ isSubmitting ? 'กำลังบันทึก...' : 'ยืนยัน' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TestDriveStartForm',
    data() {
      return {
        isLoading: false,
        isSubmitting: false,
        showConfirmModal: false,
        testDriveData: {},
        vehicleData: {},
        staffInfo: {},
        branchName: 'เชียงราย',
        formData: {
          startTime: '',
          startMileage: '',
          fuelLevel: '',
          testRoute: '',
          customDistance: '',
          duration: '',
          notes: '',
          checks: {
            exteriorCondition: false,
            interiorCondition: false,
            tiresCondition: false,
            fluidLevels: false,
            lightsFunction: false,
            documentsCheck: false
          }
        },
        errors: {},
        routeOptions: {
          'city': { text: 'เส้นทางในเมือง', distance: 5 },
          'highway': { text: 'เส้นทางทางหลวง', distance: 10 },
          'mixed': { text: 'เส้นทางผสม', distance: 15 },
          'custom': { text: 'กำหนดเส้นทางเอง', distance: 0 }
        }
      }
    },
    async mounted() {
      await this.loadData()
      this.initializeForm()
    },
    methods: {
      async loadData() {
        try {
          this.isLoading = true
          const testDriveId = this.$route.params.id
  
          // โหลดข้อมูลการทดลองขับ
          const testDriveResponse = await this.$axios.get(`/test-drives/${testDriveId}`)
          this.testDriveData = testDriveResponse.data
  
          // ตรวจสอบสถานะ
          if (this.testDriveData.status !== 'pending') {
            this.$toast.error('การทดลองขับนี้ไม่สามารถเริ่มได้')
            this.$router.push(`/test-drive/${testDriveId}`)
            return
          }
  
          // โหลดข้อมูลรถ
          if (this.testDriveData.vehicle_id) {
            const vehicleResponse = await this.$axios.get(`/stock/${this.testDriveData.vehicle_id}`)
            this.vehicleData = vehicleResponse.data
          }
  
          // โหลดข้อมูลพนักงาน
          if (this.testDriveData.responsible_staff) {
            const staffResponse = await this.$axios.get(`/staffs/${this.testDriveData.responsible_staff}`)
            this.staffInfo = staffResponse.data
          }
  
        } catch (error) {
          console.error('Error loading data:', error)
          this.$toast.error('ไม่สามารถโหลดข้อมูลได้')
          this.$router.push('/queue')
        } finally {
          this.isLoading = false
        }
      },
      initializeForm() {
        // ✅ FIX: ใช้เวลาที่ลูกค้าจองไว้ แทนเวลาปัจจุบัน
        if (this.testDriveData.start_time) {
          const startDate = new Date(this.testDriveData.start_time)
          this.formData.startTime = startDate.toTimeString().slice(0, 5)
        } else {
          // Fallback: ใช้เวลาปัจจุบันถ้าไม่มีข้อมูลการจอง
          const now = new Date()
          this.formData.startTime = now.toTimeString().slice(0, 5)
        }

        // ตั้งค่าเริ่มต้นจากข้อมูลการจองหากมี
        if (this.testDriveData.duration) {
          this.formData.duration = this.testDriveData.duration.toString()
        }
        if (this.testDriveData.test_route) {
          this.formData.testRoute = this.testDriveData.test_route
        }
      },
      goBack() {
        this.$router.go(-1)
      },
      validateForm() {
        this.errors = {}
        
        if (!this.formData.startTime) {
          this.errors.startTime = 'กรุณาระบุเวลาเริ่มต้น'
        }
        
        if (!this.formData.startMileage || this.formData.startMileage < 0) {
          this.errors.startMileage = 'กรุณาระบุเลขไมล์เริ่มต้นที่ถูกต้อง'
        }
        
        if (!this.formData.fuelLevel || this.formData.fuelLevel < 0 || this.formData.fuelLevel > 100) {
          this.errors.fuelLevel = 'กรุณาระบุระดับเชื้อเพลิง 0-100%'
        }
        
        if (!this.formData.testRoute) {
          this.errors.testRoute = 'กรุณาเลือกเส้นทางทดลองขับ'
        }
        
        if (!this.formData.duration) {
          this.errors.duration = 'กรุณาเลือกระยะเวลาทดลองขับ'
        }
  
        // ตรวจสอบ checklist
        const checks = this.formData.checks
        const allChecked = Object.values(checks).every(check => check === true)
        if (!allChecked) {
          this.$toast.error('กรุณาตรวจสอบสภาพรถให้ครบทุกข้อ')
          return false
        }
  
        return Object.keys(this.errors).length === 0
      },
      submitForm() {
        if (!this.validateForm()) {
          this.$toast.error('กรุณาตรวจสอบข้อมูลและแก้ไขข้อผิดพลาด')
          return
        }
        
        this.showConfirmModal = true
      },
      closeModal() {
        this.showConfirmModal = false
      },
      async confirmStart() {
        try {
          this.isSubmitting = true
          
          const payload = {
            status: 'ongoing',
            start_time: this.calculateStartDateTime(),
            duration: parseInt(this.formData.duration),
            test_route: this.formData.testRoute,
            distance: this.getSelectedDistance(),
            expected_end_time: this.calculateEndDateTime(),
            start_mileage: parseFloat(this.formData.startMileage),
            start_fuel_level: parseFloat(this.formData.fuelLevel),
            start_notes: this.formData.notes,
            vehicle_condition_check: JSON.stringify(this.formData.checks)
          }
  
          // อัพเดทการทดลองขับ
          await this.$axios.patch(`/test-drives/${this.$route.params.id}`, payload)
          
          // อัพเดทสถานะรถ
          if (this.testDriveData.vehicle_id) {
            await this.$axios.patch(`/stock/vehicles/${this.testDriveData.vehicle_id}/status`, {
              status: 'in_test'
            })
          }
          
          this.$toast.success('เริ่มการทดลองขับแล้ว')
          this.$router.push(`/test-drive/${this.$route.params.id}`)
          
        } catch (error) {
          console.error('Error starting test drive:', error)
          this.$toast.error('ไม่สามารถเริ่มการทดลองขับได้')
        } finally {
          this.isSubmitting = false
          this.closeModal()
        }
      },
      calculateStartDateTime() {
        const today = new Date()
        const [hours, minutes] = this.formData.startTime.split(':')
        today.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        return today.toISOString()
      },
      calculateEndDateTime() {
        const startTime = new Date(this.calculateStartDateTime())
        const duration = parseInt(this.formData.duration)
        startTime.setMinutes(startTime.getMinutes() + duration)
        return startTime.toISOString()
      },
      getSelectedDistance() {
        if (this.formData.testRoute === 'custom') {
          return parseFloat(this.formData.customDistance) || 0
        }
        return this.routeOptions[this.formData.testRoute]?.distance || 0
      },
      getRouteText() {
        if (this.formData.testRoute === 'custom') {
          return `กำหนดเอง (${this.formData.customDistance} กม.)`
        }
        return this.routeOptions[this.formData.testRoute]?.text || ''
      },
      getSystemStatusText() {
        return this.testDriveData.status === 'pending' ? 'พร้อมใช้งาน' : 'ไม่พร้อมใช้งาน'
      },
      getSystemStatusClass() {
        return this.testDriveData.status === 'pending' ? 'status-ready' : 'status-not-ready'
      },
      getStatusDotClass() {
        return this.testDriveData.status === 'pending' ? 'dot-green' : 'dot-red'
      }
    }
  }
  </script>
  
  <style scoped>
  /* Base styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .container {
    width: 430px;
    height: auto;
    min-height: 932px;
    margin: 0 auto;
    background: white;
    position: relative;
    font-family: system-ui, -apple-system, sans-serif;
  }
  
  /* Header */
  header {
    background-color: #dc2626;
    color: white;
    padding: 56px 24px 16px;
  }
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .logo {
    font-size: 24px;
    font-weight: bold;
  }
  
  .user-info {
    display: flex;
    gap: 16px;
    font-size: 14px;
  }
  
  .info-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  /* Main Content */
  main {
    padding: 16px 24px 120px; /* เพิ่ม bottom padding เพื่อไม่ให้ทับ nav bar */
  }
  
  /* Loading */
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top: 3px solid #dc2626;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Back Button */
  .back-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #4b5563;
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    margin-bottom: 24px;
  }
  
  .back-btn:hover {
    color: #1f2937;
  }
  
  /* System Status */
  .system-status {
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    font-size: 16px;
  }
  
  .status-ready {
    background-color: #f0fdf4;
    color: #15803d;
  }
  
  .status-not-ready {
    background-color: #fef2f2;
    color: #dc2626;
  }
  
  .status-indicator {
    display: flex;
    align-items: center;
    margin-left: 8px;
  }
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
  }
  
  .dot-green {
    background-color: #22c55e;
  }
  
  .dot-red {
    background-color: #ef4444;
  }
  
  .status-indicator span {
    font-weight: 500;
  }
  
  /* Form Title */
  .form-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 24px;
    text-align: center;
  }
  
  /* Customer Info Card */
  .customer-info-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
  }
  
  .customer-info-card h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #1e293b;
  }
  
  .customer-details {
    display: grid;
    gap: 8px;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .detail-row .label {
    color: #64748b;
    font-size: 14px;
  }
  
  .detail-row .value {
    color: #1e293b;
    font-weight: 500;
    font-size: 14px;
  }
  
  /* Form Styles */
  .test-drive-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .form-group label {
    color: #374151;
    font-weight: 500;
    font-size: 16px;
  }
  
  .input-with-icon {
    position: relative;
  }
  
  .input-with-icon svg {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 16px;
    border: 1px solid #d1d5db;
    border-radius: 12px;
    background: white;
    font-size: 16px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  
  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #dc2626;
    box-shadow: 0 0 0 1px #dc2626;
  }
  
  .form-group input.error,
  .form-group select.error,
  .form-group textarea.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 1px #ef4444;
  }
  
  .form-group textarea {
    resize: vertical;
    min-height: 120px;
  }
  
  .character-count {
    font-size: 12px;
    color: #6b7280;
    text-align: right;
    margin-top: 4px;
  }
  
  .error-message {
    color: #ef4444;
    font-size: 14px;
    margin-top: 4px;
  }
  
  /* Checklist Section */
  .checklist-section {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
  }
  
  .checklist-section h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #1e293b;
  }
  
  .checklist-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  
  .checkbox-item {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    font-size: 14px;
    color: #374151;
  }
  
  .checkbox-item input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin: 0;
  }
  
  .checkmark {
    flex-shrink: 0;
  }
  
  /* Submit Button Container */
  .submit-container {
    margin-top: 32px;
    margin-bottom: 0; /* ลบ margin bottom */
    position: sticky;
    bottom: 0;
    background: white;
    padding: 16px 0;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 12px 12px 0 0;
    z-index: 10;
  }
  
  /* Submit Button */
  .submit-btn {
    width: 100%;
    padding: 16px;
    background-color: #10b981;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .submit-btn:hover {
    background-color: #059669;
  }
  
  .submit-btn:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
  
  .submit-btn.loading {
    background-color: #6b7280;
  }
  
  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 90%;
    width: 380px;
    max-height: 80vh;
    overflow-y: auto;
  }
  
  .modal-content h3 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #111827;
  }
  
  .confirmation-details {
    background: #f8fafc;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
  }
  
  .confirmation-details p {
    margin-bottom: 8px;
    color: #374151;
    font-size: 14px;
  }
  
  .confirmation-details p:last-child {
    margin-bottom: 0;
  }
  
  .modal-actions {
    display: flex;
    gap: 12px;
  }
  
  .modal-btn {
    flex: 1;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .modal-btn.cancel {
    background: none;
    border: 2px solid #d1d5db;
    color: #6b7280;
  }
  
  .modal-btn.cancel:hover {
    background-color: #f9fafb;
  }
  
  .modal-btn.confirm {
    background-color: #10b981;
    border: none;
    color: white;
  }
  
  .modal-btn.confirm:hover {
    background-color: #059669;
  }
  
  .modal-btn.confirm:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
  
  /* Focus States */
  button:focus,
  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
  }
  
  button:focus-visible {
    outline: 2px solid #dc2626;
    outline-offset: 2px;
  }
  
  /* Placeholder Styles */
  ::placeholder {
    color: #9ca3af;
  }
  
  /* Input Autofill Styles */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0px 1000px white inset;
  }
  
  /* Responsive */
  @media screen and (max-width: 430px) {
    .container {
      width: 100%;
    }
    
    .user-info {
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
    }
    
    .checklist-grid {
      grid-template-columns: 1fr;
    }
    
    main {
      padding: 16px 16px 120px; /* เพิ่ม bottom padding สำหรับหน้าจอเล็ก */
    }

    .submit-container {
      margin: 24px -16px 0; /* ขยายเต็มความกว้างในหน้าจอเล็ก */
      padding: 16px;
    }
  }
  
  @media screen and (max-height: 932px) {
    .container {
      min-height: 100vh;
    }
  }

  /* แก้ไขปัญหาการทับซ้อนกับ Bottom Navigation */
  @media screen and (max-height: 800px) {
    main {
      padding-bottom: 140px; /* เพิ่ม padding สำหรับหน้าจอเตี้ย */
    }
  }

  /* สำหรับ iOS Safari */
  @supports (-webkit-touch-callout: none) {
    main {
      padding-bottom: 140px; /* padding เพิ่มเติมสำหรับ iOS */
    }
  }

  /* ปรับแต่งเมื่อมี Safe Area */
  @supports (padding: max(0px)) {
    main {
      padding-bottom: max(120px, env(safe-area-inset-bottom) + 80px);
    }
  }
</style>