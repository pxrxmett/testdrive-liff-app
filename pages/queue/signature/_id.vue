<template>
  <div class="signature-page">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div class="header-text">
          <div class="brand">ISUZU</div>
          <div class="subtitle">ลายเซ็นยืนยันการทดลองขับ</div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchBookingData" class="retry-button">ลองใหม่</button>
      </div>

      <!-- Main Form -->
      <div v-else class="signature-form">
        <!-- Booking Information (Read-only) -->
        <div class="info-section">
          <h2 class="section-title">ข้อมูลการจอง</h2>

          <div class="info-grid">
            <div class="info-item">
              <label class="info-label">ชื่อ-นามสกุล</label>
              <div class="info-value">{{ bookingData.customerName }}</div>
            </div>

            <div class="info-item">
              <label class="info-label">เบอร์โทรศัพท์</label>
              <div class="info-value">{{ formatPhone(bookingData.customerPhone) }}</div>
            </div>

            <div class="info-item">
              <label class="info-label">เลขที่ใบขับขี่</label>
              <div class="info-value">{{ bookingData.customerLicenseNumber }}</div>
            </div>

            <div class="info-item">
              <label class="info-label">วันที่ทดลองขับ</label>
              <div class="info-value">{{ formatDate(bookingData.startTime) }}</div>
            </div>

            <div class="info-item">
              <label class="info-label">เวลา</label>
              <div class="info-value">{{ formatTime(bookingData.startTime) }}</div>
            </div>

            <div class="info-item">
              <label class="info-label">รุ่นรถ</label>
              <div class="info-value">{{ bookingData.vehicleModel || 'ไม่ระบุ' }}</div>
            </div>

            <div v-if="bookingData.notes" class="info-item full-width">
              <label class="info-label">หมายเหตุ</label>
              <div class="info-value">{{ bookingData.notes }}</div>
            </div>
          </div>
        </div>

        <!-- PDPA Consent Section -->
        <div class="pdpa-section">
          <h2 class="section-title">นโยบายความเป็นส่วนตัว (PDPA)</h2>

          <div class="pdpa-scroll-box" ref="pdpaScrollBox" @scroll="handlePdpaScroll">
            <div class="pdpa-content">
              <h3>การเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคล</h3>

              <p>บริษัท อีซูซุ จำกัด ("บริษัท") ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของคุณ
              และขอแจ้งให้ท่านทราบถึงการเก็บรวมรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของท่าน ดังนี้</p>

              <h4>1. ข้อมูลส่วนบุคคลที่เก็บรวบรวม</h4>
              <ul>
                <li>ชื่อ-นามสกุล</li>
                <li>หมายเลขโทรศัพท์</li>
                <li>หมายเลขใบอนุญาตขับขี่</li>
                <li>ลายเซ็นดิจิทัล</li>
              </ul>

              <h4>2. วัตถุประสงค์ในการเก็บรวบรวมข้อมูล</h4>
              <ul>
                <li>เพื่อจัดการการจองรถทดลองขับ</li>
                <li>เพื่อติดต่อกลับหากมีความจำเป็น</li>
                <li>เพื่อตรวจสอบคุณสมบัติผู้ขับขี่</li>
                <li>เพื่อการบริหารจัดการภายในของบริษัท</li>
              </ul>

              <h4>3. การเก็บรักษาข้อมูล</h4>
              <p>บริษัทจะเก็บรักษาข้อมูลส่วนบุคคลของท่านตามระยะเวลาที่จำเป็น
              หรือตามที่กฎหมายกำหนด โดยมีมาตรการรักษาความปลอดภัยที่เหมาะสม</p>

              <h4>4. สิทธิของเจ้าของข้อมูล</h4>
              <p>ท่านมีสิทธิในการเข้าถึง แก้ไข ลบ หรือโอนข้อมูลส่วนบุคคลของท่าน
              รวมถึงสิทธิในการคัดค้านหรือจำกัดการประมวลผลข้อมูล</p>

              <h4>5. การติดต่อ</h4>
              <p>หากท่านมีข้อสงสัยเกี่ยวกับการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคล
              กรุณาติดต่อเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคลของบริษัท</p>
            </div>
          </div>

          <div class="pdpa-consent">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="pdpaAccepted"
                :disabled="!pdpaScrolledToBottom"
                class="checkbox-input"
              >
              <span class="checkbox-text">
                ข้าพเจ้ายอมรับนโยบายความเป็นส่วนตัว
                <span v-if="!pdpaScrolledToBottom" class="scroll-hint">
                  (กรุณาเลื่อนอ่านจนจบ)
                </span>
              </span>
            </label>
          </div>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
          <h2 class="section-title">ลายเซ็นยืนยัน</h2>

          <div class="signature-canvas-wrapper">
            <SignaturePad
              v-model="signatureData"
              :width="canvasWidth"
              :height="200"
              :disabled="!pdpaAccepted"
              ref="signaturePad"
            />
          </div>

          <p v-if="!pdpaAccepted" class="signature-hint">
            กรุณายอมรับนโยบายความเป็นส่วนตัวก่อนเซ็นชื่อ
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button
            type="button"
            class="clear-button"
            @click="clearSignature"
            :disabled="!signatureData"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
            </svg>
            ล้างลายเซ็น
          </button>

          <button
            type="button"
            class="submit-button"
            @click="submitSignature"
            :disabled="!canSubmit || isSubmitting"
          >
            <svg v-if="!isSubmitting" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
            <div v-else class="spinner-small"></div>
            {{ isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันและบันทึก' }}
          </button>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="success-toast">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 13l4 4L19 7"></path>
          </svg>
          {{ successMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SignaturePad from '~/components/common/SignaturePad.vue'
import {
  getTestDriveById,
  submitPdpaConsent,
  uploadSignature
} from '~/utils/brandApi'

export default {
  name: 'SignaturePage',

  components: {
    SignaturePad
  },

  data() {
    return {
      loading: true,
      error: null,
      bookingData: {},
      pdpaAccepted: false,
      pdpaScrolledToBottom: false,
      signatureData: null,
      isSubmitting: false,
      successMessage: '',
      canvasWidth: 350
    }
  },

  computed: {
    canSubmit() {
      return this.pdpaAccepted && this.signatureData
    }
  },

  mounted() {
    this.fetchBookingData()
    this.setCanvasWidth()
    window.addEventListener('resize', this.setCanvasWidth)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.setCanvasWidth)
  },

  methods: {
    async fetchBookingData() {
      this.loading = true
      this.error = null

      try {
        const bookingId = this.$route.params.id
        // ✅ MIGRATED: ใช้ getTestDriveById helper (brand-scoped)
        const response = await getTestDriveById(this.$axios, bookingId)

        console.log('Booking data:', response)
        this.bookingData = response

      } catch (err) {
        console.error('Error fetching booking:', err)
        this.error = 'ไม่สามารถโหลดข้อมูลการจองได้ กรุณาลองใหม่'
      } finally {
        this.loading = false
      }
    },

    handlePdpaScroll() {
      const scrollBox = this.$refs.pdpaScrollBox
      if (scrollBox) {
        const isAtBottom = scrollBox.scrollHeight - scrollBox.scrollTop <= scrollBox.clientHeight + 10
        if (isAtBottom && !this.pdpaScrolledToBottom) {
          this.pdpaScrolledToBottom = true
        }
      }
    },

    clearSignature() {
      if (this.$refs.signaturePad) {
        this.$refs.signaturePad.clearSignature()
      }
      this.signatureData = null
    },

    async submitSignature() {
      if (!this.canSubmit || this.isSubmitting) return

      this.isSubmitting = true

      try {
        const bookingId = this.$route.params.id

        // 1. บันทึก PDPA consent
        // ✅ MIGRATED: ใช้ submitPdpaConsent helper (brand-scoped)
        await submitPdpaConsent(this.$axios, bookingId, true)

        // 2. บันทึกลายเซ็น
        // ✅ MIGRATED: ใช้ uploadSignature helper (brand-scoped + AUTO-COMPRESSION!)
        await uploadSignature(this.$axios, bookingId, this.signatureData)

        this.successMessage = 'บันทึกลายเซ็นเรียบร้อยแล้ว!'

        // Redirect after 2 seconds
        setTimeout(() => {
          this.$router.push('/queue')
        }, 2000)

      } catch (err) {
        console.error('Error submitting signature:', err)
        alert('ไม่สามารถบันทึกลายเซ็นได้ กรุณาลองใหม่')
      } finally {
        this.isSubmitting = false
      }
    },

    setCanvasWidth() {
      const container = document.querySelector('.signature-canvas-wrapper')
      if (container) {
        this.canvasWidth = Math.min(container.offsetWidth - 32, 500)
      }
    },

    formatPhone(phone) {
      if (!phone) return ''
      const cleaned = String(phone).replace(/\D/g, '')
      if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
      }
      return phone
    },

    formatDate(dateString) {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch {
        return dateString
      }
    },

    formatTime(dateString) {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        return date.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch {
        return dateString
      }
    }
  }
}
</script>

<style scoped>
/* Isuzu Brand Colors */
.signature-page {
  --isuzu-red: #E30613;
  --isuzu-gray-dark: #2D2D2D;
  --isuzu-gray-light: #F5F5F5;
  --success: #27AE60;
  --warning: #F39C12;
}

/* Base */
.signature-page {
  font-family: system-ui, -apple-system, sans-serif;
  background-color: var(--isuzu-gray-light);
  min-height: 100vh;
  padding-bottom: 2rem;
}

/* Header */
.header {
  background-color: var(--isuzu-red);
  color: white;
  padding: 1.5rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
}

.brand {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  letter-spacing: 2px;
}

.subtitle {
  font-size: 0.875rem;
  opacity: 0.95;
}

/* Main Container */
.main-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

/* Loading & Error */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(227, 6, 19, 0.1);
  border-radius: 50%;
  border-top-color: var(--isuzu-red);
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  color: #991b1b;
}

.retry-button {
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background-color: var(--isuzu-red);
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}

/* Section */
.info-section,
.pdpa-section,
.signature-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--isuzu-gray-dark);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--isuzu-red);
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
}

.info-value {
  font-size: 0.9375rem;
  color: var(--isuzu-gray-dark);
  font-weight: 500;
}

/* PDPA Section */
.pdpa-scroll-box {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: #fafafa;
  margin-bottom: 1rem;
}

.pdpa-content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--isuzu-gray-dark);
  margin-bottom: 0.75rem;
}

.pdpa-content h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--isuzu-gray-dark);
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.pdpa-content p {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: #374151;
  margin-bottom: 0.75rem;
}

.pdpa-content ul {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: #374151;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}

.pdpa-content li {
  margin-bottom: 0.25rem;
}

.pdpa-consent {
  padding: 0.75rem;
  background-color: #fef3c7;
  border-radius: 0.5rem;
  border: 1px solid #fde68a;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  gap: 0.75rem;
}

.checkbox-input {
  margin-top: 0.25rem;
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  flex-shrink: 0;
}

.checkbox-input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.checkbox-text {
  font-size: 0.875rem;
  color: var(--isuzu-gray-dark);
  line-height: 1.5;
}

.scroll-hint {
  display: block;
  font-size: 0.75rem;
  color: var(--warning);
  font-weight: 500;
  margin-top: 0.25rem;
}

/* Signature Section */
.signature-canvas-wrapper {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background-color: #fafafa;
  border-radius: 0.5rem;
  border: 2px dashed #d1d5db;
  margin-bottom: 0.75rem;
}

.signature-hint {
  font-size: 0.8125rem;
  color: #6b7280;
  text-align: center;
  font-style: italic;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.clear-button,
.submit-button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.clear-button {
  background-color: #6b7280;
  color: white;
}

.clear-button:hover:not(:disabled) {
  background-color: #4b5563;
}

.clear-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-button {
  background-color: var(--isuzu-red);
  color: white;
}

.submit-button:hover:not(:disabled) {
  background-color: #c10510;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

/* Success Toast */
.success-toast {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--success);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1000;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-1rem);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .main-container {
    padding: 1rem 0.75rem;
  }

  .info-section,
  .pdpa-section,
  .signature-section {
    padding: 1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .brand {
    font-size: 1.25rem;
  }

  .section-title {
    font-size: 1rem;
  }
}
</style>
