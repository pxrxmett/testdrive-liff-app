<!-- pages/test-drive/[id].vue -->
<template>
    <div class="container">
      <!-- Header -->
      <header>
        <div class="logo">ISUZU</div>
        <div class="user-info">
          <span>พนักงาน: {{ staffInfo.display_name || 'Admin' }}</span>
          <span class="branch">สาขา: {{ branchName }}</span>
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
  
        <!-- Loading State -->
        <div v-if="isLoading" class="loading">
          <div class="loading-spinner"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
  
        <!-- Main Card -->
        <div v-else class="main-card">
          <!-- Customer Header -->
          <div class="customer-header">
            <div class="customer-info">
              <h2>{{ testDriveData.customer_name || 'ไม่ระบุชื่อ' }}</h2>
              <div class="details">
                <div class="detail-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                    <circle cx="7" cy="17" r="2"/>
                    <circle cx="17" cy="17" r="2"/>
                  </svg>
                  <span>{{ vehicleData.model || 'D-MAX' }}</span>
                </div>
                <div class="detail-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  <span>{{ formatTime(testDriveData.start_time) }}</span>
                </div>
              </div>
            </div>
            <div class="status-badge" :class="getStatusBadgeClass()">
              {{ getStatusText() }}
            </div>
          </div>
  
          <!-- System Status -->
          <div class="system-status" :class="getSystemStatusClass()">
            <div class="status-indicator">
              <div class="status-dot" :class="getStatusDotClass()"></div>
              <span>สถานะระบบ: {{ getSystemStatusText() }}</span>
            </div>
          </div>
  
          <!-- Edit Button (แสดงเมื่อสถานะ pending เท่านั้น) -->
          <button 
            v-if="testDriveData.status === 'pending'" 
            class="edit-btn"
            @click="editQueue"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
              <path d="m15 5 4 4"/>
            </svg>
            แก้ไขคิว
          </button>
  
          <!-- Action Buttons -->
          <div class="action-buttons">
            <!-- ปุ่มสำหรับสถานะ pending -->
            <template v-if="testDriveData.status === 'pending'">
              <button class="start-btn" @click="startTestDrive" :disabled="actionLoading">
                {{ actionLoading ? 'กำลังเริ่ม...' : 'เริ่มทดลองขับ' }}
              </button>
              <button class="cancel-btn" @click="cancelTestDrive" :disabled="actionLoading">
                ยกเลิกการทดลองขับ
              </button>
            </template>
  
            <!-- ปุ่มสำหรับสถานะ ongoing -->
            <template v-else-if="testDriveData.status === 'ongoing'">
              <button class="end-btn" @click="endTestDrive" :disabled="actionLoading">
                {{ actionLoading ? 'กำลังสิ้นสุด...' : 'สิ้นสุดการทดลองขับ' }}
              </button>
              <button class="view-progress-btn" @click="viewProgress">
                ดูความคืบหน้า
              </button>
            </template>
  
            <!-- ปุ่มสำหรับสถานะ completed -->
            <template v-else-if="testDriveData.status === 'completed'">
              <button class="view-report-btn" @click="viewReport">
                ดูรายงานการทดลองขับ
              </button>
              <button class="new-booking-btn" @click="newBooking">
                จองคิวใหม่
              </button>
            </template>
  
            <!-- ปุ่มสำหรับสถานะ cancelled -->
            <template v-else-if="testDriveData.status === 'cancelled'">
              <button class="rebooking-btn" @click="rebooking">
                จองคิวใหม่
              </button>
            </template>
          </div>
  
          <!-- Additional Info for ongoing drives -->
          <div v-if="testDriveData.status === 'ongoing'" class="ongoing-info">
            <h3>ข้อมูลการทดลองขับ</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">เวลาเริ่ม:</span>
                <span class="info-value">{{ formatDateTime(testDriveData.start_time) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">ระยะทางคาดการณ์:</span>
                <span class="info-value">{{ testDriveData.distance || 'ไม่ระบุ' }} กม.</span>
              </div>
              <div class="info-item">
                <span class="info-label">เส้นทาง:</span>
                <span class="info-value">{{ testDriveData.test_route || 'ไม่ระบุ' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">พนักงานผู้รับผิดชอบ:</span>
                <span class="info-value">{{ staffInfo.first_name }} {{ staffInfo.last_name }}</span>
              </div>
            </div>
          </div>
  
          <!-- Summary for completed drives -->
          <div v-if="testDriveData.status === 'completed'" class="completion-summary">
            <h3>สรุปการทดลองขับ</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">เวลาเริ่ม:</span>
                <span class="summary-value">{{ formatDateTime(testDriveData.start_time) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">เวลาสิ้นสุด:</span>
                <span class="summary-value">{{ formatDateTime(testDriveData.actual_end_time) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">ระยะทางรวม:</span>
                <span class="summary-value">{{ testDriveData.distance || 0 }} กม.</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">ระยะเวลา:</span>
                <span class="summary-value">{{ calculateDuration() }} นาที</span>
              </div>
            </div>
          </div>
        </div>
      </main>
  
      <!-- Confirmation Modal -->
      <div v-if="showConfirmModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h3>{{ confirmModal.title }}</h3>
          <p>{{ confirmModal.message }}</p>
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="closeModal">ยกเลิก</button>
            <button class="modal-btn confirm" @click="confirmAction" :disabled="actionLoading">
              {{ actionLoading ? 'กำลังดำเนินการ...' : 'ยืนยัน' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TestDrivePage',
    data() {
      return {
        isLoading: true,
        actionLoading: false,
        showConfirmModal: false,
        confirmModal: {
          title: '',
          message: '',
          action: null
        },
        testDriveData: {},
        vehicleData: {},
        staffInfo: {},
        branchName: 'เชียงราย'
      }
    },
    async mounted() {
      await this.loadData()
    },
    methods: {
      async loadData() {
        try {
          this.isLoading = true
          const testDriveId = this.$route.params.id
  
          // โหลดข้อมูลการทดลองขับ
          const testDriveResponse = await this.$axios.get(`/test-drives/${testDriveId}`)
          this.testDriveData = testDriveResponse.data
  
          // โหลดข้อมูลรถ
          if (this.testDriveData.vehicle_id) {
            const vehicleResponse = await this.$axios.get(`/stock/${this.testDriveData.vehicle_id}`)
            this.vehicleData = vehicleResponse.data
          }
  
          // โหลดข้อมูลพนักงาน
          if (this.testDriveData.responsible_staff) {
            // ✅ FIX: Use correct endpoint - /line-integration/staff/{id}
            const { getStaffById } = await import('~/utils/brandApi')
            this.staffInfo = await getStaffById(this.$axios, this.testDriveData.responsible_staff)
          }
  
        } catch (error) {
          console.error('Error loading data:', error)
          this.$toast.error('ไม่สามารถโหลดข้อมูลได้')
        } finally {
          this.isLoading = false
        }
      },
      goBack() {
        this.$router.go(-1)
      },
      editQueue() {
        this.$router.push(`/queue/edit/${this.$route.params.id}`)
      },
      startTestDrive() {
        this.showConfirmModal = true
        this.confirmModal = {
          title: 'เริ่มการทดลองขับ',
          message: 'คุณต้องการเริ่มการทดลองขับหรือไม่?',
          action: 'start'
        }
      },
      endTestDrive() {
        this.$router.push(`/test-drive/end/${this.$route.params.id}`)
      },
      cancelTestDrive() {
        this.showConfirmModal = true
        this.confirmModal = {
          title: 'ยกเลิกการทดลองขับ',
          message: 'คุณต้องการยกเลิกการทดลองขับหรือไม่?',
          action: 'cancel'
        }
      },
      viewProgress() {
        this.$router.push(`/test-drive/progress/${this.$route.params.id}`)
      },
      viewReport() {
        this.$router.push(`/test-drive/report/${this.$route.params.id}`)
      },
      newBooking() {
        this.$router.push('/booking')
      },
      rebooking() {
        this.$router.push(`/booking?rebooking=${this.$route.params.id}`)
      },
      closeModal() {
        this.showConfirmModal = false
        this.confirmModal = { title: '', message: '', action: null }
      },
      async confirmAction() {
        if (!this.confirmModal.action) return
  
        this.actionLoading = true
        try {
          if (this.confirmModal.action === 'start') {
            await this.executeStartTestDrive()
          } else if (this.confirmModal.action === 'cancel') {
            await this.executeCancelTestDrive()
          }
          this.closeModal()
          await this.loadData() // รีโหลดข้อมูล
        } catch (error) {
          console.error('Error executing action:', error)
          this.$toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
          this.actionLoading = false
        }
      },
      async executeStartTestDrive() {
        const payload = {
          status: 'ongoing',
          start_time: new Date().toISOString()
        }
        await this.$axios.patch(`/test-drives/${this.$route.params.id}`, payload)
        
        // อัพเดทสถานะรถเป็น in_test
        if (this.testDriveData.vehicle_id) {
          await this.$axios.patch(`/stock/vehicles/${this.testDriveData.vehicle_id}/status`, {
            status: 'in_test'
          })
        }
        
        this.$toast.success('เริ่มการทดลองขับแล้ว')
      },
      async executeCancelTestDrive() {
        const payload = {
          status: 'cancelled'
        }
        await this.$axios.patch(`/test-drives/${this.$route.params.id}`, payload)
        
        // อัพเดทสถานะรถกลับเป็น available
        if (this.testDriveData.vehicle_id) {
          await this.$axios.patch(`/stock/vehicles/${this.testDriveData.vehicle_id}/status`, {
            status: 'available'
          })
        }
        
        this.$toast.success('ยกเลิกการทดลองขับแล้ว')
      },
      getStatusText() {
        const statusMap = {
          'pending': 'รอดำเนินการ',
          'ongoing': 'กำลังทดลองขับ',
          'completed': 'เสร็จสิ้น',
          'cancelled': 'ยกเลิกแล้ว'
        }
        return statusMap[this.testDriveData.status] || 'ไม่ทราบสถานะ'
      },
      getStatusBadgeClass() {
        const classMap = {
          'pending': 'status-pending',
          'ongoing': 'status-ongoing',
          'completed': 'status-completed',
          'cancelled': 'status-cancelled'
        }
        return classMap[this.testDriveData.status] || 'status-pending'
      },
      getSystemStatusText() {
        const statusMap = {
          'pending': 'พร้อมใช้งาน',
          'ongoing': 'กำลังทดลองขับ',
          'completed': 'เสร็จสิ้นแล้ว',
          'cancelled': 'ยกเลิกแล้ว'
        }
        return statusMap[this.testDriveData.status] || 'พร้อมใช้งาน'
      },
      getSystemStatusClass() {
        const classMap = {
          'pending': 'status-ready',
          'ongoing': 'status-active',
          'completed': 'status-done',
          'cancelled': 'status-cancelled-system'
        }
        return classMap[this.testDriveData.status] || 'status-ready'
      },
      getStatusDotClass() {
        const classMap = {
          'pending': 'dot-green',
          'ongoing': 'dot-blue',
          'completed': 'dot-green',
          'cancelled': 'dot-red'
        }
        return classMap[this.testDriveData.status] || 'dot-green'
      },
      formatTime(timestamp) {
        if (!timestamp) return 'ไม่ระบุ'
        const date = new Date(timestamp)
        return date.toTimeString().slice(0, 5)
      },
      formatDateTime(timestamp) {
        if (!timestamp) return 'ไม่ระบุ'
        const date = new Date(timestamp)
        return `${date.toLocaleDateString('th-TH')} ${date.toTimeString().slice(0, 5)}`
      },
      calculateDuration() {
        if (!this.testDriveData.start_time || !this.testDriveData.actual_end_time) return 0
        const start = new Date(this.testDriveData.start_time)
        const end = new Date(this.testDriveData.actual_end_time)
        return Math.round((end - start) / (1000 * 60)) // minutes
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
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .logo {
    font-size: 24px;
    font-weight: bold;
  }
  
  .user-info {
    font-size: 14px;
  }
  
  .user-info .branch {
    margin-left: 16px;
  }
  
  /* Main Content */
  main {
    padding: 16px 24px;
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
  
  /* Main Card */
  .main-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  /* Customer Header */
  .customer-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
  }
  
  .customer-info h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .details {
    display: flex;
    align-items: center;
    color: #6b7280;
    font-size: 18px;
    gap: 16px;
  }
  
  .detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  /* Status Badges */
  .status-badge {
    padding: 8px 16px;
    border-radius: 9999px;
    font-size: 16px;
    font-weight: 500;
  }
  
  .status-pending {
    background-color: #fef3c7;
    color: #92400e;
  }
  
  .status-ongoing {
    background-color: #dbeafe;
    color: #1e40af;
  }
  
  .status-completed {
    background-color: #d1fae5;
    color: #065f46;
  }
  
  .status-cancelled {
    background-color: #fee2e2;
    color: #991b1b;
  }
  
  /* System Status */
  .system-status {
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 32px;
    font-size: 18px;
  }
  
  .status-ready {
    background-color: #f0fdf4;
    color: #15803d;
  }
  
  .status-active {
    background-color: #eff6ff;
    color: #1d4ed8;
  }
  
  .status-done {
    background-color: #f0fdf4;
    color: #15803d;
  }
  
  .status-cancelled-system {
    background-color: #fef2f2;
    color: #dc2626;
  }
  
  .status-indicator {
    display: flex;
    align-items: center;
  }
  
  .status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 12px;
  }
  
  .dot-green {
    background-color: #22c55e;
  }
  
  .dot-blue {
    background-color: #3b82f6;
  }
  
  .dot-red {
    background-color: #ef4444;
  }
  
  /* Edit Button */
  .edit-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px;
    border: 2px solid #d1d5db;
    border-radius: 12px;
    background: none;
    color: #4b5563;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 32px;
    transition: background-color 0.2s;
  }
  
  .edit-btn:hover {
    background-color: #f9fafb;
  }
  
  /* Action Buttons */
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .start-btn, .end-btn, .view-report-btn, .new-booking-btn, .rebooking-btn {
    width: 100%;
    padding: 16px;
    background-color: #16a34a;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .start-btn:hover, .end-btn:hover, .view-report-btn:hover, .new-booking-btn:hover, .rebooking-btn:hover {
    background-color: #15803d;
  }
  
  .start-btn:disabled, .end-btn:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
  
  .end-btn {
    background-color: #dc2626;
  }
  
  .end-btn:hover {
    background-color: #b91c1c;
  }
  
  .view-progress-btn {
    width: 100%;
    padding: 16px;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .view-progress-btn:hover {
    background-color: #2563eb;
  }
  
  .cancel-btn {
    width: 100%;
    padding: 16px;
    background: none;
    border: 2px solid #dc2626;
    color: #dc2626;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .cancel-btn:hover {
    background-color: #fef2f2;
  }
  
  /* Additional Info Sections */
  .ongoing-info, .completion-summary {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e5e7eb;
  }
  
  .ongoing-info h3, .completion-summary h3 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #111827;
  }
  
  .info-grid, .summary-grid {
    display: grid;
    gap: 12px;
  }
  
  .info-item, .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .info-item:last-child, .summary-item:last-child {
    border-bottom: none;
  }
  
  .info-label, .summary-label {
    color: #6b7280;
    font-size: 16px;
  }
  
  .info-value, .summary-value {
    color: #111827;
    font-weight: 500;
    font-size: 16px;
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
    width: 350px;
  }
  
  .modal-content h3 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #111827;
  }
  
  .modal-content p {
    color: #6b7280;
    margin-bottom: 24px;
    line-height: 1.5;
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
    background-color: #dc2626;
    border: none;
    color: white;
  }
  
  .modal-btn.confirm:hover {
    background-color: #b91c1c;
  }
  
  .modal-btn.confirm:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
  
  /* Button Focus States */
  button:focus {
    outline: none;
    box-shadow: 0 0 0 2px #3b82f6;
  }
  
  /* Responsive */
  @media screen and (max-height: 932px) {
    .container {
      height: 100vh;
    }
  }
  
  @media screen and (max-width: 430px) {
    .container {
      width: 100%;
    }
    
    .customer-header {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }
    
    .details {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }
  </style>
  