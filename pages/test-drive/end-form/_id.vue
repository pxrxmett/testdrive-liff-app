<!-- pages/test-drive/end-form/_id.vue -->
<template>
    <div class="container">
      <!-- Header -->
      <header class="header">
        <div class="header-gradient"></div>
        <div class="header-content">
          <div class="logo-section">
            <div class="logo">ISUZU</div>
            <div class="logo-subtitle">Test Drive System</div>
          </div>
          <div class="user-info">
            <div class="info-card">
              <div class="info-item">
                <div class="icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <span>{{ staffInfo.display_name || 'Admin' }}</span>
              </div>
              <div class="info-item">
                <div class="icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <span>{{ branchName }}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="main-content">
        <!-- Back Button -->
        <button class="back-btn" @click="goBack">
          <div class="back-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </div>
          <span>กลับ</span>
        </button>

        <!-- System Status -->
        <div class="status-card" :class="getSystemStatusClass()">
          <div class="status-content">
            <div class="status-indicator">
              <div class="status-dot" :class="getStatusDotClass()"></div>
              <span class="status-text">สถานะระบบ</span>
            </div>
            <div class="status-value">{{ getSystemStatusText() }}</div>
          </div>
        </div>

        <!-- Page Title -->
        <div class="page-header">
          <h1 class="page-title">สิ้นสุดการทดลองขับ</h1>
          <p class="page-subtitle">กรอกข้อมูลเพื่อสิ้นสุดการทดลองขับ</p>
        </div>

        <!-- Customer Info Display -->
        <div v-if="testDriveData.customer_name" class="customer-card">
          <div class="card-header">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3>ข้อมูลลูกค้า</h3>
          </div>
          <div class="customer-details">
            <div class="detail-item">
              <span class="detail-label">ชื่อลูกค้า</span>
              <span class="detail-value">{{ testDriveData.customer_name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">เบอร์โทรศัพท์</span>
              <span class="detail-value">{{ testDriveData.customer_phone || 'ไม่ระบุ' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">รุ่นรถ</span>
              <span class="detail-value">{{ vehicleData.model || 'ไม่ระบุ' }}</span>
            </div>
          </div>
        </div>

        <!-- Start Info Card (ข้อมูลจาก start-form) -->
        <div v-if="testDriveData.start_time" class="info-card-grid">
          <div class="info-item-card">
            <span class="info-label">เวลาเริ่มต้น</span>
            <span class="info-value">{{ formatTime(testDriveData.start_time) }}</span>
          </div>
          <div class="info-item-card">
            <span class="info-label">เลขไมล์เริ่มต้น</span>
            <span class="info-value">{{ testDriveData.start_mileage || 0 }} กม.</span>
          </div>
          <div class="info-item-card">
            <span class="info-label">เชื้อเพลิงเริ่มต้น</span>
            <span class="info-value">{{ testDriveData.start_fuel_level || 0 }}%</span>
          </div>
          <div class="info-item-card">
            <span class="info-label">เส้นทาง</span>
            <span class="info-value">{{ getRouteDisplay(testDriveData.test_route) }}</span>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p class="loading-text">กำลังโหลดข้อมูล...</p>
        </div>

        <!-- Form -->
        <form v-else class="form-container" @submit.prevent="submitForm">
          <!-- End Time Input -->
          <div class="input-group">
            <label class="input-label">
              <span class="label-text">เวลาสิ้นสุด</span>
              <span class="required">*</span>
            </label>
            <div class="input-wrapper" :class="{ 'error': errors.endTime }">
              <input
                v-model="formData.endTime"
                type="time"
                class="form-input"
                required
              >
              <div class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
            </div>
            <span v-if="errors.endTime" class="error-text">{{ errors.endTime }}</span>
          </div>

          <!-- End Mileage Input -->
          <div class="input-group">
            <label class="input-label">
              <span class="label-text">เลขไมล์สิ้นสุด</span>
              <span class="required">*</span>
            </label>
            <div class="input-wrapper" :class="{ 'error': errors.endMileage }">
              <input
                v-model="formData.endMileage"
                type="number"
                class="form-input"
                placeholder="กรอกเลขไมล์สิ้นสุด"
                :min="testDriveData.start_mileage || 0"
                step="0.1"
                required
              >
              <div class="input-unit">กม.</div>
            </div>
            <span v-if="errors.endMileage" class="error-text">{{ errors.endMileage }}</span>
            <div v-if="calculatedDistance > 0" class="distance-info">
              ระยะทางที่ขับ: <strong>{{ calculatedDistance.toFixed(1) }} กม.</strong>
            </div>
          </div>

          <!-- Fuel Level Input -->
          <div class="input-group">
            <label class="input-label">
              <span class="label-text">ระดับเชื้อเพลิง/พลังงานสิ้นสุด</span>
              <span class="required">*</span>
            </label>
            <div class="input-wrapper" :class="{ 'error': errors.endFuelLevel }">
              <input
                v-model="formData.endFuelLevel"
                type="number"
                class="form-input"
                placeholder="0-100"
                min="0"
                max="100"
                required
              >
              <div class="input-unit">%</div>
            </div>
            <span v-if="errors.endFuelLevel" class="error-text">{{ errors.endFuelLevel }}</span>
          </div>

          <!-- Notes -->
          <div class="input-group">
            <label class="input-label">
              <span class="label-text">บันทึกเพิ่มเติม</span>
            </label>
            <div class="textarea-wrapper">
              <textarea
                v-model="formData.notes"
                class="form-textarea"
                rows="4"
                placeholder="กรอกรายละเอียดเพิ่มเติม เช่น ความคิดเห็นลูกค้า, สภาพรถหลังทดลองขับ"
                maxlength="500"
              ></textarea>
              <div class="character-counter">{{ formData.notes.length }}/500</div>
            </div>
          </div>

          <!-- Vehicle Condition Checklist -->
          <div class="checklist-card">
            <div class="card-header">
              <div class="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1"/>
                </svg>
              </div>
              <h3>ตรวจสอบสภาพรถหลังทดลองขับ</h3>
            </div>
            <div class="checklist-grid">
              <label class="checkbox-card">
                <input v-model="formData.checks.exteriorCondition" type="checkbox" required class="checkbox-input">
                <div class="checkbox-content">
                  <div class="checkbox-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <span class="checkbox-text">สภาพภายนอกรถ</span>
                </div>
              </label>

              <label class="checkbox-card">
                <input v-model="formData.checks.interiorCondition" type="checkbox" required class="checkbox-input">
                <div class="checkbox-content">
                  <div class="checkbox-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <span class="checkbox-text">สภาพภายในรถ</span>
                </div>
              </label>

              <label class="checkbox-card">
                <input v-model="formData.checks.tiresCondition" type="checkbox" required class="checkbox-input">
                <div class="checkbox-content">
                  <div class="checkbox-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <span class="checkbox-text">สภาพยางรถ</span>
                </div>
              </label>

              <label class="checkbox-card">
                <input v-model="formData.checks.fluidLevels" type="checkbox" required class="checkbox-input">
                <div class="checkbox-content">
                  <div class="checkbox-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <span class="checkbox-text">ระดับน้ำมันเครื่อง</span>
                </div>
              </label>

              <label class="checkbox-card">
                <input v-model="formData.checks.lightsFunction" type="checkbox" required class="checkbox-input">
                <div class="checkbox-content">
                  <div class="checkbox-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <span class="checkbox-text">ระบบไฟส่องสว่าง</span>
                </div>
              </label>

              <label class="checkbox-card">
                <input v-model="formData.checks.documentsCheck" type="checkbox" required class="checkbox-input">
                <div class="checkbox-content">
                  <div class="checkbox-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <span class="checkbox-text">เอกสารรถครบถ้วน</span>
                </div>
              </label>
            </div>
          </div>
        </form>
      </main>

      <!-- Fixed Submit Button -->
      <div class="submit-section">
        <button
          type="submit"
          class="submit-btn"
          :disabled="isSubmitting || isLoading"
          :class="{ 'loading': isSubmitting }"
          @click="submitForm"
        >
          <div v-if="isSubmitting" class="btn-loading">
            <div class="btn-spinner"></div>
            <span>กำลังบันทึก...</span>
          </div>
          <div v-else class="btn-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12l5 5l10-10"/>
            </svg>
            <span>สิ้นสุดการทดลองขับ</span>
          </div>
        </button>
      </div>

      <!-- Confirmation Modal -->
      <transition name="modal">
        <div v-if="showConfirmModal" class="modal-overlay" @click="closeModal">
          <div class="modal-container" @click.stop>
            <div class="modal-header">
              <h3>ยืนยันการสิ้นสุดการทดลองขับ</h3>
              <button class="modal-close" @click="closeModal">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6L6 18"/>
                  <path d="M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="confirmation-card">
                <div class="confirm-item">
                  <span class="confirm-label">ลูกค้า:</span>
                  <span class="confirm-value">{{ testDriveData.customer_name }}</span>
                </div>
                <div class="confirm-item">
                  <span class="confirm-label">รุ่นรถ:</span>
                  <span class="confirm-value">{{ vehicleData.model }}</span>
                </div>
                <div class="confirm-item">
                  <span class="confirm-label">เวลาสิ้นสุด:</span>
                  <span class="confirm-value">{{ formData.endTime }}</span>
                </div>
                <div class="confirm-item">
                  <span class="confirm-label">ระยะทาง:</span>
                  <span class="confirm-value">{{ calculatedDistance.toFixed(1) }} กม.</span>
                </div>
                <div class="confirm-item">
                  <span class="confirm-label">เชื้อเพลิงใช้ไป:</span>
                  <span class="confirm-value">{{ fuelUsed.toFixed(1) }}%</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="modal-btn cancel" @click="closeModal">ยกเลิก</button>
              <button class="modal-btn confirm" @click="confirmEnd" :disabled="isSubmitting">
                <div v-if="isSubmitting" class="btn-loading">
                  <div class="btn-spinner"></div>
                  <span>กำลังบันทึก...</span>
                </div>
                <span v-else>ยืนยัน</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </template>

  <script>
  import { getTestDriveById, endTestDrive, updateVehicleStatus } from '~/utils/brandApi'
  import dayjs from 'dayjs'

  export default {
    name: 'TestDriveEndForm',
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
          endTime: '',
          endMileage: '',
          endFuelLevel: '',
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
          'city': 'เส้นทางในเมือง',
          'highway': 'เส้นทางทางหลวง',
          'mixed': 'เส้นทางผสม',
          'custom': 'กำหนดเอง'
        }
      }
    },
    computed: {
      calculatedDistance() {
        const start = parseFloat(this.testDriveData.start_mileage) || 0
        const end = parseFloat(this.formData.endMileage) || 0
        return Math.max(0, end - start)
      },
      fuelUsed() {
        const start = parseFloat(this.testDriveData.start_fuel_level) || 0
        const end = parseFloat(this.formData.endFuelLevel) || 0
        return Math.max(0, start - end)
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
          this.testDriveData = await getTestDriveById(this.$axios, testDriveId)

          // ตรวจสอบสถานะ - ต้องเป็น ongoing เท่านั้น
          if (this.testDriveData.status !== 'ONGOING' && this.testDriveData.status !== 'ongoing') {
            this.$toast?.error('การทดลองขับนี้ไม่สามารถสิ้นสุดได้')
            this.$router.push(`/test-drive/${testDriveId}`)
            return
          }

          // โหลดข้อมูลรถ
          if (this.testDriveData.vehicle) {
            this.vehicleData = this.testDriveData.vehicle
          }

          // โหลดข้อมูลพนักงาน
          if (this.testDriveData.responsibleStaff || this.testDriveData.responsible_staff) {
            this.staffInfo = this.testDriveData.responsibleStaff || { display_name: 'Staff' }
          }

        } catch (error) {
          console.error('Error loading data:', error)
          this.$toast?.error('ไม่สามารถโหลดข้อมูลได้')
          // ✅ FIX: Redirect กลับหน้าหลักแทน (ไม่ใช่ /queue ที่ไม่มี index)
          this.$router.push('/')
        } finally {
          this.isLoading = false
        }
      },
      initializeForm() {
        // ✅ FIX: ใช้เวลาที่คาดว่าจะจบการทดลองขับ (expected_end_time) ที่ลูกค้าจองไว้
        if (this.testDriveData.expected_end_time) {
          const endDate = new Date(this.testDriveData.expected_end_time)
          this.formData.endTime = endDate.toTimeString().slice(0, 5)
        } else {
          // Fallback: ใช้เวลาปัจจุบันถ้าไม่มีข้อมูล
          const now = new Date()
          this.formData.endTime = now.toTimeString().slice(0, 5)
        }
      },
      formatTime(time) {
        if (!time) return ''
        return dayjs(time).format('HH:mm')
      },
      getRouteDisplay(route) {
        return this.routeOptions[route] || route || 'ไม่ระบุ'
      },
      goBack() {
        this.$router.go(-1)
      },
      validateForm() {
        this.errors = {}

        if (!this.formData.endTime) {
          this.errors.endTime = 'กรุณาระบุเวลาสิ้นสุด'
        }

        if (!this.formData.endMileage || this.formData.endMileage < (this.testDriveData.start_mileage || 0)) {
          this.errors.endMileage = 'กรุณาระบุเลขไมล์สิ้นสุดที่ถูกต้อง (ต้องมากกว่าเลขไมล์เริ่มต้น)'
        }

        if (!this.formData.endFuelLevel || this.formData.endFuelLevel < 0 || this.formData.endFuelLevel > 100) {
          this.errors.endFuelLevel = 'กรุณาระบุระดับเชื้อเพลิง 0-100%'
        }

        // ตรวจสอบ checklist
        const checks = this.formData.checks
        const allChecked = Object.values(checks).every(check => check === true)
        if (!allChecked) {
          this.$toast?.error('กรุณาตรวจสอบสภาพรถให้ครบทุกข้อ')
          return false
        }

        return Object.keys(this.errors).length === 0
      },
      submitForm() {
        if (!this.validateForm()) {
          this.$toast?.error('กรุณาตรวจสอบข้อมูลและแก้ไขข้อผิดพลาด')
          return
        }

        this.showConfirmModal = true
      },
      closeModal() {
        this.showConfirmModal = false
      },
      async confirmEnd() {
        try {
          this.isSubmitting = true

          const payload = {
            end_mileage: parseFloat(this.formData.endMileage),
            end_fuel_level: parseFloat(this.formData.endFuelLevel),
            end_notes: this.formData.notes,
            vehicle_condition_after: JSON.stringify(this.formData.checks)
          }

          // เรียก endTestDrive API
          await endTestDrive(this.$axios, this.$route.params.id, payload)

          // อัพเดทสถานะรถ
          if (this.testDriveData.vehicle_id) {
            await updateVehicleStatus(this.$axios, this.testDriveData.vehicle_id, 'available')
          }

          this.$toast?.success('สิ้นสุดการทดลองขับแล้ว')
          this.$router.push(`/test-drive/${this.$route.params.id}`)

        } catch (error) {
          console.error('Error ending test drive:', error)
          this.$toast?.error('ไม่สามารถสิ้นสุดการทดลองขับได้')
        } finally {
          this.isSubmitting = false
          this.closeModal()
        }
      },
      getSystemStatusText() {
        const status = (this.testDriveData.status || '').toLowerCase()
        return status === 'ongoing' ? 'กำลังทดลองขับ' : 'ไม่พร้อมใช้งาน'
      },
      getSystemStatusClass() {
        const status = (this.testDriveData.status || '').toLowerCase()
        return status === 'ongoing' ? 'status-ready' : 'status-not-ready'
      },
      getStatusDotClass() {
        const status = (this.testDriveData.status || '').toLowerCase()
        return status === 'ongoing' ? 'dot-ready' : 'dot-not-ready'
      }
    }
  }
  </script>

  <style scoped>
  /* ใช้ style เดียวกับ start-form */
  /* Reset & Base */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .container {
    width: 430px;
    max-width: 100vw;
    min-height: 100vh;
    margin: 0 auto;
    background: linear-gradient(135deg, #f8fafc 0%, #e4e7eb 100%);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    position: relative;
  }

  /* Header Styles */
  .header {
    position: relative;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
    color: white;
    padding: 60px 24px 32px;
    overflow: hidden;
  }

  .header-gradient {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
    pointer-events: none;
  }

  .header-content {
    position: relative;
    z-index: 2;
  }

  .logo-section {
    margin-bottom: 20px;
  }

  .logo {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .logo-subtitle {
    font-size: 14px;
    opacity: 0.9;
    margin-top: 4px;
  }

  .info-card {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .info-item:last-child {
    margin-bottom: 0;
  }

  .icon-wrapper {
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Main Content */
  .main-content {
    padding: 24px;
    padding-bottom: 140px;
  }

  /* Back Button */
  .back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    border: none;
    border-radius: 12px;
    padding: 12px 16px;
    color: #374151;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }

  .back-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .back-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Status Card */
  .status-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border-left: 4px solid;
  }

  .status-ready {
    border-left-color: #10b981;
    background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  }

  .status-not-ready {
    border-left-color: #ef4444;
    background: linear-gradient(135deg, #fef2f2 0%, #fefefe 100%);
  }

  .status-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  .dot-ready {
    background: #10b981;
  }

  .dot-not-ready {
    background: #ef4444;
  }

  .status-text {
    font-weight: 500;
    color: #374151;
  }

  .status-value {
    font-weight: 600;
    font-size: 14px;
  }

  .status-ready .status-value {
    color: #065f46;
  }

  .status-not-ready .status-value {
    color: #991b1b;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* Page Header */
  .page-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .page-title {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
  }

  .page-subtitle {
    color: #6b7280;
    font-size: 16px;
  }

  /* Customer Card */
  .customer-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #e5e7eb;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .card-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
  }

  .customer-details {
    display: grid;
    gap: 16px;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
  }

  .detail-item:last-child {
    border-bottom: none;
  }

  .detail-label {
    color: #6b7280;
    font-size: 14px;
    font-weight: 500;
  }

  .detail-value {
    color: #111827;
    font-weight: 600;
    font-size: 14px;
  }

  /* Info Card Grid - แสดงข้อมูลจาก start-form */
  .info-card-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
  }

  .info-item-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #e5e7eb;
  }

  .info-label {
    display: block;
    color: #6b7280;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .info-value {
    display: block;
    color: #111827;
    font-weight: 700;
    font-size: 16px;
  }

  /* Loading State */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
  }

  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #dc2626;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }

  .loading-text {
    color: #6b7280;
    font-size: 16px;
    font-weight: 500;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Form Container */
  .form-container {
    display: grid;
    gap: 24px;
  }

  /* Input Groups */
  .input-group {
    display: grid;
    gap: 8px;
  }

  .input-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 16px;
    font-weight: 500;
    color: #374151;
  }

  .required {
    color: #ef4444;
    font-size: 14px;
  }

  .input-wrapper,
  .select-wrapper,
  .textarea-wrapper {
    position: relative;
    background: white;
    border-radius: 12px;
    border: 2px solid #e5e7eb;
    transition: all 0.2s ease;
    overflow: hidden;
  }

  .input-wrapper:focus-within,
  .select-wrapper:focus-within,
  .textarea-wrapper:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .input-wrapper.error,
  .select-wrapper.error,
  .textarea-wrapper.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    border: none;
    outline: none;
    font-size: 16px;
    color: #111827;
    background: transparent;
  }

  .form-input,
  .form-select {
    height: 56px;
    padding: 0 16px;
  }

  .form-textarea {
    padding: 16px;
    resize: vertical;
    min-height: 120px;
    font-family: inherit;
  }

  .form-input::placeholder,
  .form-textarea::placeholder {
    color: #9ca3af;
  }

  .input-icon,
  .input-unit {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    pointer-events: none;
  }

  .input-unit {
    font-size: 14px;
    font-weight: 500;
    background: #f3f4f6;
    padding: 4px 8px;
    border-radius: 6px;
  }

  .select-wrapper {
    position: relative;
  }

  .form-select {
    appearance: none;
    cursor: pointer;
    padding-right: 48px;
  }

  .select-arrow {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    pointer-events: none;
  }

  .character-counter {
    position: absolute;
    bottom: 12px;
    right: 16px;
    font-size: 12px;
    color: #9ca3af;
    background: rgba(255, 255, 255, 0.9);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .error-text {
    color: #ef4444;
    font-size: 14px;
    font-weight: 500;
    margin-top: 4px;
  }

  .distance-info {
    color: #059669;
    font-size: 14px;
    font-weight: 500;
    margin-top: 8px;
    padding: 8px 12px;
    background: #ecfdf5;
    border-radius: 8px;
    border-left: 3px solid #10b981;
  }

  /* Checklist Card */
  .checklist-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #e5e7eb;
  }

  .checklist-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .checkbox-card {
    display: block;
    cursor: pointer;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    transition: all 0.2s ease;
    position: relative;
  }

  .checkbox-card:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  .checkbox-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .checkbox-input:checked + .checkbox-content {
    color: #065f46;
  }

  .checkbox-input:checked + .checkbox-content .checkbox-icon {
    background: #10b981;
    color: white;
    transform: scale(1.1);
  }

  .checkbox-content {
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.2s ease;
  }

  .checkbox-icon {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    color: transparent;
  }

  .checkbox-text {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    transition: color 0.2s ease;
  }

  /* Submit Section */
  .submit-section {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 430px;
    max-width: 100vw;
    background: white;
    padding: 20px 24px;
    border-top: 1px solid #e5e7eb;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }

  .submit-btn {
    width: 100%;
    height: 56px;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: white;
    border: none;
    border-radius: 14px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
  }

  .submit-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .submit-btn:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    box-shadow: none;
  }

  .btn-content,
  .btn-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-container {
    background: white;
    border-radius: 20px;
    max-width: 400px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 24px 0;
    margin-bottom: 20px;
  }

  .modal-header h3 {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
  }

  .modal-close {
    width: 32px;
    height: 32px;
    border: none;
    background: #f3f4f6;
    border-radius: 8px;
    color: #6b7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .modal-close:hover {
    background: #e5e7eb;
    color: #374151;
  }

  .modal-body {
    padding: 0 24px;
  }

  .confirmation-card {
    background: #f8fafc;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  }

  .confirm-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .confirm-item:last-child {
    border-bottom: none;
  }

  .confirm-label {
    color: #6b7280;
    font-size: 14px;
    font-weight: 500;
  }

  .confirm-value {
    color: #111827;
    font-weight: 600;
    font-size: 14px;
  }

  .modal-footer {
    display: flex;
    gap: 12px;
    padding: 0 24px 24px;
  }

  .modal-btn {
    flex: 1;
    height: 48px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .modal-btn.cancel {
    background: #f3f4f6;
    color: #6b7280;
  }

  .modal-btn.cancel:hover {
    background: #e5e7eb;
    color: #374151;
  }

  .modal-btn.confirm {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: white;
  }

  .modal-btn.confirm:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  }

  .modal-btn.confirm:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  /* Modal Transitions */
  .modal-enter-active,
  .modal-leave-active {
    transition: all 0.3s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  .modal-enter-from .modal-container,
  .modal-leave-to .modal-container {
    transform: scale(0.9) translateY(20px);
  }

  /* Responsive Design */
  @media screen and (max-width: 430px) {
    .container {
      width: 100%;
    }

    .submit-section {
      width: 100%;
    }

    .info-item {
      font-size: 12px;
    }

    .checklist-grid,
    .info-card-grid {
      grid-template-columns: 1fr;
    }

    .main-content {
      padding: 20px 16px 140px;
    }

    .header {
      padding: 60px 16px 32px;
    }

    .submit-section {
      padding: 16px;
    }
  }

  @media screen and (max-height: 800px) {
    .main-content {
      padding-bottom: 160px;
    }
  }

  /* iOS Safari Support */
  @supports (-webkit-touch-callout: none) {
    .submit-section {
      padding-bottom: max(20px, env(safe-area-inset-bottom));
    }
  }
  </style>
