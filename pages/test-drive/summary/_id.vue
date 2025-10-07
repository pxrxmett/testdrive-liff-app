<!-- pages/test-drive/summary/_id.vue -->
<template>
    <div class="container">
      <!-- Header -->
      <header>
        <div class="header-content">
          <div class="logo">ISUZU</div>
          <div class="user-info">
            <div class="info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>พนักงาน: {{ staffInfo.display_name || 'Admin' }}</span>
            </div>
            <div class="info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>สาขา: {{ branchName }}</span>
            </div>
          </div>
        </div>
      </header>
  
      <main>
        <!-- Loading State -->
        <div v-if="isLoading" class="loading">
          <div class="loading-spinner"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
  
        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>{{ error.title }}</h3>
          <p>{{ error.message }}</p>
          <button class="retry-btn" @click="loadData">ลองใหม่</button>
        </div>
  
        <!-- Content -->
        <template v-else>
          <!-- Status Banner -->
          <div class="status-banner" :class="getStatusBannerClass()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>สถานะ: {{ getStatusText() }}</span>
          </div>
  
          <!-- Summary Title -->
          <div class="summary-title">
            <h2>{{ getSummaryTitle() }}</h2>
            <p>{{ getSummarySubtitle() }}</p>
          </div>
  
          <!-- Customer Information -->
          <div v-if="testDriveData.customer_name" class="customer-card">
            <h3>ข้อมูลลูกค้า</h3>
            <div class="customer-details">
              <div class="customer-item">
                <span class="label">ชื่อลูกค้า:</span>
                <span class="value">{{ testDriveData.customer_name }}</span>
              </div>
              <div class="customer-item">
                <span class="label">เบอร์โทร:</span>
                <span class="value">{{ testDriveData.customer_phone || 'ไม่ระบุ' }}</span>
              </div>
              <div class="customer-item">
                <span class="label">รุ่นรถ:</span>
                <span class="value">{{ vehicleData.model || 'ไม่ระบุ' }}</span>
              </div>
            </div>
          </div>
  
          <!-- Test Drive Details -->
          <div class="details-card">
            <h3 class="card-title">รายละเอียดการทดลองขับ</h3>
            <div class="details-grid">
              <div class="detail-item">
                <p class="label">เวลาเริ่มต้น</p>
                <p class="value">{{ formatTime(testDriveData.start_time) }}</p>
              </div>
              <div class="detail-item">
                <p class="label">เวลาสิ้นสุด</p>
                <p class="value">{{ formatTime(testDriveData.actual_end_time) }}</p>
              </div>
              <div class="detail-item">
                <p class="label">เลขไมล์เริ่มต้น</p>
                <p class="value">{{ formatMileage(testDriveData.start_mileage) }}</p>
              </div>
              <div class="detail-item">
                <p class="label">เลขไมล์สิ้นสุด</p>
                <p class="value">{{ formatMileage(testDriveData.end_mileage) }}</p>
              </div>
              <div class="detail-item full-width">
                <p class="label">ระยะทางรวม</p>
                <p class="value highlight">{{ calculateDistance() }} กิโลเมตร</p>
              </div>
              <div class="detail-item">
                <p class="label">ระยะเวลารวม</p>
                <p class="value">{{ calculateDuration() }} นาที</p>
              </div>
              <div class="detail-item">
                <p class="label">เส้นทาง</p>
                <p class="value">{{ getRouteText() }}</p>
              </div>
            </div>
          </div>
  
          <!-- Customer Feedback (if available) -->
          <div v-if="testDriveData.customer_rating" class="feedback-card">
            <h3 class="card-title">ความคิดเห็นของลูกค้า</h3>
            <div class="feedback-details">
              <div class="feedback-item">
                <span class="label">ความพึงพอใจ:</span>
                <div class="rating-display">
                  <span v-for="star in 5" :key="star" class="star" :class="{ 'filled': star <= testDriveData.customer_rating }">
                    ⭐
                  </span>
                  <span class="rating-text">({{ testDriveData.customer_rating }}/5)</span>
                </div>
              </div>
              <div v-if="testDriveData.purchase_interest" class="feedback-item">
                <span class="label">ความสนใจซื้อ:</span>
                <span class="value">{{ getPurchaseInterestText() }}</span>
              </div>
            </div>
          </div>
  
          <!-- Staff Notes -->
          <div v-if="testDriveData.end_notes" class="notes-card">
            <h3 class="card-title">บันทึกเพิ่มเติม</h3>
            <p class="notes-content">{{ testDriveData.end_notes }}</p>
          </div>
  
          <!-- QR Code Section -->
          <div class="qr-section">
            <h3 class="card-title">ประเมินความพึงพอใจ</h3>
            <div class="qr-placeholder">
              <div v-if="qrCodeUrl" class="qr-image">
                <img :src="qrCodeUrl" alt="QR Code" />
              </div>
              <div v-else class="qr-text">QR Code</div>
            </div>
            <p class="qr-caption">สแกนเพื่อประเมินความพึงพอใจ</p>
            <div class="qr-actions">
              <button @click="generateQRCode" class="qr-btn" :disabled="isGeneratingQR">
                {{ isGeneratingQR ? 'กำลังสร้าง...' : 'สร้าง QR Code' }}
              </button>
            </div>
          </div>
  
          <!-- Action Buttons -->
          <div class="action-buttons">
            <button class="btn btn-success" @click="goToHome">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>กลับหน้าหลัก</span>
            </button>
            <button class="btn btn-primary" @click="printReport">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              <span>พิมพ์รายงาน</span>
            </button>
          </div>
  
          <!-- Additional Actions -->
          <div class="additional-actions">
            <button class="action-link" @click="newTestDrive">
              จองทดลองขับใหม่
            </button>
            <button class="action-link" @click="viewHistory">
              ดูประวัติการทดลองขับ
            </button>
          </div>
        </template>
      </main>
  
      <!-- Print Modal -->
      <div v-if="showPrintModal" class="modal-overlay" @click="closePrintModal">
        <div class="modal-content" @click.stop>
          <h3>พิมพ์รายงานการทดลองขับ</h3>
          <div class="print-options">
            <label class="checkbox-option">
              <input v-model="printOptions.includeCustomerInfo" type="checkbox">
              <span>รวมข้อมูลลูกค้า</span>
            </label>
            <label class="checkbox-option">
              <input v-model="printOptions.includeFeedback" type="checkbox">
              <span>รวมความคิดเห็นลูกค้า</span>
            </label>
            <label class="checkbox-option">
              <input v-model="printOptions.includeNotes" type="checkbox">
              <span>รวมบันทึกเพิ่มเติม</span>
            </label>
          </div>
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="closePrintModal">ยกเลิก</button>
            <button class="modal-btn confirm" @click="confirmPrint" :disabled="isPrinting">
              {{ isPrinting ? 'กำลังพิมพ์...' : 'พิมพ์' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TestDriveSummary',
    data() {
      return {
        isLoading: false,
        isGeneratingQR: false,
        isPrinting: false,
        showPrintModal: false,
        error: null,
        testDriveData: {},
        vehicleData: {},
        staffInfo: {},
        branchName: 'เชียงราย',
        qrCodeUrl: '',
        printOptions: {
          includeCustomerInfo: true,
          includeFeedback: true,
          includeNotes: true
        },
        routeOptions: {
          'city': 'เส้นทางในเมือง',
          'highway': 'เส้นทางทางหลวง',
          'mixed': 'เส้นทางผสม',
          'custom': 'กำหนดเอง'
        },
        purchaseInterestOptions: {
          'high': 'สนใจมาก',
          'medium': 'สนใจปานกลาง',
          'low': 'สนใจน้อย',
          'none': 'ไม่สนใจ'
        }
      }
    },
    async mounted() {
      await this.loadData()
    },
    methods: {
      async loadData() {
        try {
          this.isLoading = true
          this.error = null
          const testDriveId = this.$route.params.id
  
          // โหลดข้อมูลการทดลองขับ
          const testDriveResponse = await this.$axios.get(`/api/test-drives/${testDriveId}`)
          this.testDriveData = testDriveResponse.data
  
          // ตรวจสอบสถานะ
          if (this.testDriveData.status !== 'completed') {
            this.error = {
              title: 'ข้อมูลไม่ถูกต้อง',
              message: 'การทดลองขับนี้ยังไม่เสร็จสิ้น'
            }
            return
          }
  
          // โหลดข้อมูลรถ
          if (this.testDriveData.vehicle_id) {
            const vehicleResponse = await this.$axios.get(`/api/stock/${this.testDriveData.vehicle_id}`)
            this.vehicleData = vehicleResponse.data
          }
  
          // โหลดข้อมูลพนักงาน
          if (this.testDriveData.responsible_staff) {
            const staffResponse = await this.$axios.get(`/api/staffs/${this.testDriveData.responsible_staff}`)
            this.staffInfo = staffResponse.data
          }
  
        } catch (error) {
          console.error('Error loading data:', error)
          this.error = {
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่'
          }
        } finally {
          this.isLoading = false
        }
      },
      async generateQRCode() {
        try {
          this.isGeneratingQR = true
          
          // สร้าง URL สำหรับแบบประเมิน
          const feedbackUrl = `${window.location.origin}/feedback/${this.testDriveData.id}`
          
          // เรียก API สร้าง QR Code
          const response = await this.$axios.post('/api/qr-code/generate', {
            data: feedbackUrl,
            size: 200
          })
          
          this.qrCodeUrl = response.data.qrCodeUrl
          this.$toast.success('สร้าง QR Code เรียบร้อย')
          
        } catch (error) {
          console.error('Error generating QR code:', error)
          this.$toast.error('ไม่สามารถสร้าง QR Code ได้')
        } finally {
          this.isGeneratingQR = false
        }
      },
      printReport() {
        this.showPrintModal = true
      },
      closePrintModal() {
        this.showPrintModal = false
      },
      async confirmPrint() {
        try {
          this.isPrinting = true
          
          // สร้างรายงาน PDF
          const reportData = {
            testDriveId: this.testDriveData.id,
            includeCustomerInfo: this.printOptions.includeCustomerInfo,
            includeFeedback: this.printOptions.includeFeedback,
            includeNotes: this.printOptions.includeNotes
          }
          
          const response = await this.$axios.post('/api/reports/test-drive', reportData, {
            responseType: 'blob'
          })
          
          // Download PDF
          const blob = new Blob([response.data], { type: 'application/pdf' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `test-drive-report-${this.testDriveData.id}.pdf`
          link.click()
          window.URL.revokeObjectURL(url)
          
          this.$toast.success('พิมพ์รายงานเรียบร้อย')
          this.closePrintModal()
          
        } catch (error) {
          console.error('Error printing report:', error)
          this.$toast.error('ไม่สามารถพิมพ์รายงานได้')
        } finally {
          this.isPrinting = false
        }
      },
      goToHome() {
        this.$router.push('/')
      },
      newTestDrive() {
        this.$router.push('/booking')
      },
      viewHistory() {
        this.$router.push('/queue')
      },
      calculateDistance() {
        if (!this.testDriveData.end_mileage || !this.testDriveData.start_mileage) return '0'
        return (this.testDriveData.end_mileage - this.testDriveData.start_mileage).toFixed(1)
      },
      calculateDuration() {
        if (!this.testDriveData.start_time || !this.testDriveData.actual_end_time) return '0'
        
        const start = new Date(this.testDriveData.start_time)
        const end = new Date(this.testDriveData.actual_end_time)
        const diffMs = end - start
        const diffMins = Math.round(diffMs / (1000 * 60))
        
        return diffMins > 0 ? diffMins.toString() : '0'
      },
      formatTime(timestamp) {
        if (!timestamp) return '--:--'
        const date = new Date(timestamp)
        return date.toTimeString().slice(0, 5)
      },
      formatMileage(mileage) {
        if (!mileage) return '0 กม.'
        return `${parseFloat(mileage).toLocaleString()} กม.`
      },
      getStatusText() {
        const statusMap = {
          'completed': 'ทดลองขับเสร็จสิ้น',
          'cancelled': 'ยกเลิกแล้ว'
        }
        return statusMap[this.testDriveData.status] || 'ไม่ทราบสถานะ'
      },
      getStatusBannerClass() {
        const classMap = {
          'completed': 'status-completed',
          'cancelled': 'status-cancelled'
        }
        return classMap[this.testDriveData.status] || 'status-completed'
      },
      getSummaryTitle() {
        return this.testDriveData.status === 'completed' 
          ? 'การทดลองขับเสร็จสิ้น' 
          : 'การทดลองขับถูกยกเลิก'
      },
      getSummarySubtitle() {
        return this.testDriveData.status === 'completed' 
          ? 'บันทึกข้อมูลเรียบร้อยแล้ว' 
          : 'การทดลองขับไม่สามารถดำเนินการต่อได้'
      },
      getRouteText() {
        return this.routeOptions[this.testDriveData.test_route] || 'ไม่ระบุ'
      },
      getPurchaseInterestText() {
        return this.purchaseInterestOptions[this.testDriveData.purchase_interest] || 'ไม่ระบุ'
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
    height: 932px;
    background: white;
    position: relative;
    display: flex;
    flex-direction: column;
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
    flex: 1;
    padding: 16px 24px 40px;
    overflow-y: auto;
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
  
  /* Error State */
  .error-state {
    text-align: center;
    padding: 40px 20px;
  }
  
  .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .error-state h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #dc2626;
  }
  
  .error-state p {
    color: #6b7280;
    margin-bottom: 24px;
  }
  
  .retry-btn {
    background: #dc2626;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
  }
  
  /* Status Banner */
  .status-banner {
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }
  
  .status-completed {
    background-color: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #15803d;
  }
  
  .status-cancelled {
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
  }
  
  .status-banner svg {
    color: #16a34a;
    flex-shrink: 0;
  }
  
  /* Summary Title */
  .summary-title {
    text-align: center;
    margin-bottom: 32px;
  }
  
  .summary-title h2 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 4px;
    color: #111827;
  }
  
  .summary-title p {
    color: #6b7280;
    font-size: 14px;
  }
  
  /* Card Styles */
  .customer-card,
  .details-card,
  .feedback-card,
  .notes-card,
  .qr-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #f3f4f6;
  }
  
  .card-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #111827;
  }
  
  /* Customer Card */
  .customer-details {
    display: grid;
    gap: 12px;
  }
  
  .customer-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .customer-item:last-child {
    border-bottom: none;
  }
  
  .customer-item .label {
    color: #6b7280;
    font-size: 14px;
  }
  
  .customer-item .value {
    color: #111827;
    font-weight: 500;
    font-size: 14px;
  }
  
  /* Details Grid */
  .details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  
  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .detail-item.full-width {
    grid-column: span 2;
  }
  
  .detail-item .label {
    color: #6b7280;
    font-size: 14px;
  }
  
  .detail-item .value {
    font-size: 18px;
    font-weight: 500;
    color: #111827;
  }
  
  .detail-item .value.highlight {
    color: #dc2626;
    font-weight: 600;
  }
  
  /* Feedback Card */
  .feedback-details {
    display: grid;
    gap: 16px;
  }
  
  .feedback-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .feedback-item .label {
    color: #6b7280;
    font-size: 14px;
  }
  
  .rating-display {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .star {
    font-size: 16px;
    opacity: 0.3;
  }
  
  .star.filled {
    opacity: 1;
  }
  
  .rating-text {
    color: #6b7280;
    font-size: 14px;
  }
  
  .feedback-item .value {
    color: #111827;
    font-weight: 500;
    font-size: 14px;
  }
  
  /* Notes Card */
  .notes-content {
    color: #374151;
    line-height: 1.6;
    font-size: 14px;
    white-space: pre-wrap;
  }
  
  /* QR Section */
  .qr-section {
    text-align: center;
  }
  
  .qr-placeholder {
    border: 2px dashed #e5e7eb;
    border-radius: 8px;
    padding: 32px;
    margin: 16px 0 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }
  
  .qr-image img {
    max-width: 150px;
    max-height: 150px;
  }
  
  .qr-text {
    color: #9ca3af;
    font-size: 18px;
  }
  
  .qr-caption {
    color: #6b7280;
    font-size: 14px;
    margin-bottom: 16px;
  }
  
  .qr-actions {
    display: flex;
    justify-content: center;
  }
  
  .qr-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
  }
  
  .qr-btn:hover {
    background: #2563eb;
  }
  
  .qr-btn:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
  
  /* Action Buttons */
  .action-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px 24px;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .btn svg {
    flex-shrink: 0;
  }
  
  .btn-success {
    background-color: #10b981;
    color: white;
  }
  
  .btn-success:hover {
    background-color: #059669;
  }
  
  .btn-primary {
    background-color: #3b82f6;
    color: white;
  }
  
  .btn-primary:hover {
    background-color: #2563eb;
  }
  
  /* Additional Actions */
  .additional-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }
  
  .action-link {
    background: none;
    border: none;
    color: #3b82f6;
    font-size: 14px;
    cursor: pointer;
    text-decoration: underline;
    padding: 8px;
  }
  
  .action-link:hover {
    color: #1d4ed8;
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
    margin-bottom: 20px;
    color: #111827;
  }
  
  .print-options {
    display: grid;
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .checkbox-option {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: background-color 0.2s;
  }
  
  .checkbox-option:hover {
    background-color: #f9fafb;
  }
  
  .checkbox-option input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin: 0;
  }
  
  .checkbox-option span {
    color: #374151;
    font-size: 14px;
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
    background-color: #3b82f6;
    border: none;
    color: white;
  }
  
  .modal-btn.confirm:hover {
    background-color: #2563eb;
  }
  
  .modal-btn.confirm:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
  
  /* Focus States */
  .btn:focus {
    outline: none;
  }
  
  .btn:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }
  
  button:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
  
  /* Scrollbar */
  main::-webkit-scrollbar {
    width: 4px;
  }
  
  main::-webkit-scrollbar-track {
    background: transparent;
  }
  
  main::-webkit-scrollbar-thumb {
    background-color: #e5e7eb;
    border-radius: 4px;
  }
  
  /* Safe Area Support */
  @supports (padding-top: env(safe-area-inset-top)) {
    header {
      padding-top: max(56px, env(safe-area-inset-top));
    }
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
    
    .details-grid {
      grid-template-columns: 1fr;
    }
    
    .action-buttons {
      grid-template-columns: 1fr;
    }
    
    main {
      padding: 16px 16px 40px;
    }
  }
  
  @media screen and (max-height: 932px) {
    .container {
      height: 100vh;
    }
  }
</style>