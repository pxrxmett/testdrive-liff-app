<template>
  <div class="success-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>กำลังโหลดข้อมูลการจอง...</p>
    </div>

    <!-- Success Content -->
    <div v-else-if="bookingData" class="success-content">
      <!-- Success Icon -->
      <div class="success-icon">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="40" fill="#10B981"/>
          <path d="M25 40L35 50L55 30" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- Success Message -->
      <h1 class="success-title">จองสำเร็จ!</h1>
      <p class="success-message">
        การจองรถทดลองขับของคุณได้รับการยืนยันแล้ว
      </p>

      <!-- Booking Details Card -->
      <div class="booking-details-card">
        <h2 class="card-title">รายละเอียดการจอง</h2>
        
        <div class="detail-row">
          <span class="label">หมายเลขการจอง:</span>
          <span class="value">#{{ bookingData.id || 'N/A' }}</span>
        </div>

        <div class="detail-row">
          <span class="label">ชื่อผู้จอง:</span>
          <span class="value">{{ bookingData.customerName || bookingData.customer_name }}</span>
        </div>

        <div class="detail-row">
          <span class="label">เบอร์โทรศัพท์:</span>
          <span class="value">{{ bookingData.customerPhone || bookingData.customer_phone }}</span>
        </div>

        <div class="detail-row">
          <span class="label">รุ่นรถ:</span>
          <span class="value">{{ getCarModelName() }}</span>
        </div>

        <div class="detail-row">
          <span class="label">วันที่ทดลองขับ:</span>
          <span class="value">{{ formatDate(bookingData.startTime || bookingData.start_time) }}</span>
        </div>

        <div class="detail-row">
          <span class="label">เวลา:</span>
          <span class="value">{{ formatTime(bookingData.startTime || bookingData.start_time) }} - {{ formatTime(bookingData.expectedEndTime || bookingData.expected_end_time) }}</span>
        </div>

        <div class="detail-row">
          <span class="label">สถานะ:</span>
          <span class="value status-badge" :class="getStatusClass()">{{ getStatusText() }}</span>
        </div>

        <div class="detail-row">
          <span class="label">เส้นทางทดลองขับ:</span>
          <span class="value">{{ bookingData.testRoute || bookingData.test_route || 'รอบโชว์รูม' }}</span>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="next-steps-card">
        <h3 class="card-title">ขั้นตอนถัดไป</h3>
        <ul class="steps-list">
          <li>📱 คุณจะได้รับการติดต่อจากพนักงานเพื่อยืนยันการนัดหมาย</li>
          <li>🚗 กรุณามาถึงโชว์รูมก่อนเวลานัดหมาย 15 นาที</li>
          <li>📄 นำบัตรประชาชนและใบขับขี่มาด้วย</li>
          <li>⏰ หากต้องการเปลี่ยนแปลงเวลา กรุณาติดต่อล่วงหน้าอย่างน้อย 2 ชั่วโมง</li>
        </ul>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button @click="goToHome" class="btn btn-primary">
          กลับหน้าหลัก
        </button>
        <button @click="viewBookingList" class="btn btn-secondary">
          ดูรายการจอง
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-content">
      <div class="error-icon">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="40" fill="#EF4444"/>
          <path d="M50 30L30 50M30 30L50 50" stroke="white" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>
      <h1 class="error-title">ไม่พบข้อมูลการจอง</h1>
      <p class="error-message">ไม่สามารถดึงข้อมูลการจองได้ กรุณาลองใหม่อีกครั้ง</p>
      <button @click="goToHome" class="btn btn-primary">
        กลับหน้าหลัก
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookingSuccessPage',
  layout: 'default',
  head() {
    return {
      title: 'จองสำเร็จ - ISUZU Test Drive',
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap' }
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { hid: 'description', name: 'description', content: 'การจองรถทดลองขับสำเร็จ' }
      ]
    }
  },
  data() {
    return {
      isLoading: true,
      bookingData: null,
      bookingId: null,
      carModels: [
        { id: 'dmax-vcross', name: 'ISUZU D-MAX V-Cross' },
        { id: 'mu-x', name: 'ISUZU MU-X' },
        { id: 'dmax-hiLander', name: 'ISUZU D-MAX Hi-Lander' },
        { id: 'dmax-spark', name: 'ISUZU D-MAX Spark' }
      ]
    }
  },
  async created() {
    // ดึง ID จาก query parameter
    this.bookingId = this.$route.query.id;
    
    // ดึงข้อมูลรุ่นรถก่อน
    await this.fetchCarModels();
    
    if (this.bookingId) {
      await this.fetchBookingDetails();
    } else {
      // ถ้าไม่มี ID ให้ตรวจสอบจาก localStorage (กรณีที่ refresh หน้า)
      const lastBooking = localStorage.getItem('lastBookingSuccess');
      if (lastBooking) {
        try {
          this.bookingData = JSON.parse(lastBooking);
          this.isLoading = false;
        } catch (e) {
          console.error('Error parsing last booking:', e);
          this.isLoading = false;
        }
      } else {
        this.isLoading = false;
      }
    }
  },
  methods: {
    async fetchBookingDetails() {
      try {
        if (this.$axios && this.bookingId) {
          const response = await this.$axios.$get(`/api/test-drives/${this.bookingId}`);
          this.bookingData = response;
          
          // ดึงข้อมูลรุ่นรถเพิ่มเติม
          await this.fetchCarModels();
          
          // บันทึกข้อมูลใน localStorage เพื่อใช้ในกรณีที่ refresh หน้า
          localStorage.setItem('lastBookingSuccess', JSON.stringify(response));
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
        // ถ้าดึงข้อมูลไม่ได้ ลองใช้ข้อมูลจาก localStorage
        const lastBooking = localStorage.getItem('lastBookingSuccess');
        if (lastBooking) {
          try {
            this.bookingData = JSON.parse(lastBooking);
            // ดึงข้อมูลรุ่นรถเพิ่มเติม
            await this.fetchCarModels();
          } catch (e) {
            console.error('Error parsing stored booking:', e);
          }
        }
      } finally {
        this.isLoading = false;
      }
    },

    async fetchCarModels() {
      try {
        // ดึงข้อมูลรุ่นรถจาก API
        if (this.$axios) {
          const response = await this.$axios.$get('/api/stock/vehicles', {
            params: { status: 'available' }
          });
          
          console.log('API Response from /api/stock/vehicles:', response);
          
          if (Array.isArray(response) && response.length > 0) {
            // แมปข้อมูลรถให้ถูกต้อง
            this.carModels = response.map(vehicle => {
              const id = vehicle.id || vehicle.vehicleId || vehicle.vehicleCode || '';
              const name = vehicle.model || vehicle.vehicleModel || vehicle.mdlCd || `รถ ID: ${id}`;
              
              return { id: String(id), name };
            });
            
            console.log('Updated car models:', this.carModels);
          }
        }
      } catch (error) {
        console.error('Error fetching car models:', error);
        // ใช้ข้อมูลเริ่มต้นหากเกิดข้อผิดพลาด
      }
    },
    
    getCarModelName() {
      if (!this.bookingData) return 'N/A';
      
      const vehicleId = this.bookingData.vehicleId || this.bookingData.vehicle_id;
      console.log('Looking for vehicle ID:', vehicleId);
      console.log('Available car models:', this.carModels);
      
      // ลองหาด้วย ID ที่ตรงกัน
      const model = this.carModels.find(car => 
        car.id === String(vehicleId) || 
        car.id === vehicleId ||
        Number(car.id) === Number(vehicleId)
      );
      
      if (model) {
        console.log('Found model:', model);
        return model.name;
      }
      
      // ถ้าไม่เจอ ลองดึงข้อมูลโดยตรงจาก booking data
      if (this.bookingData.model || this.bookingData.vehicleModel) {
        return this.bookingData.model || this.bookingData.vehicleModel;
      }
      
      // ถ้ายังไม่เจอ ให้แสดงชื่อเริ่มต้นตาม vehicle ID
      const defaultNames = {
        '145': 'ISUZU D-MAX V-Cross',
        '146': 'ISUZU MU-X',
        '147': 'ISUZU D-MAX Hi-Lander',
        '148': 'ISUZU D-MAX Spark'
      };
      
      return defaultNames[String(vehicleId)] || `รถรหัส ${vehicleId}`;
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      try {
        const date = new Date(dateString);
        
        // แปลงเวลา UTC เป็น local time zone (Thailand = UTC+7)
        const localDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
        
        const options = { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long',
          timeZone: 'Asia/Bangkok'
        };
        
        return localDate.toLocaleDateString('th-TH', options);
      } catch (e) {
        console.error('Error formatting date:', e);
        return dateString;
      }
    },
    
    formatTime(dateString) {
      if (!dateString) return 'N/A';
      
      try {
        const date = new Date(dateString);
        
        // แปลงเวลา UTC เป็น local time zone (Thailand = UTC+7)
        const localDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
        
        const options = { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Bangkok'
        };
        
        // ใช้ toLocaleTimeString แทน เพื่อให้แสดงเวลาที่ถูกต้อง
        return localDate.toLocaleTimeString('th-TH', options);
      } catch (e) {
        console.error('Error formatting time:', e);
        return dateString;
      }
    },
    
    getStatusText() {
      if (!this.bookingData) return 'N/A';
      
      const status = this.bookingData.status;
      const statusMap = {
        'pending': 'รอดำเนินการ',
        'confirmed': 'ยืนยันแล้ว',
        'ongoing': 'กำลังทดลองขับ',
        'completed': 'เสร็จสิ้น',
        'cancelled': 'ยกเลิก',
        'PENDING': 'รอดำเนินการ',
        'CONFIRMED': 'ยืนยันแล้ว',
        'ONGOING': 'กำลังทดลองขับ',
        'COMPLETED': 'เสร็จสิ้น',
        'CANCELLED': 'ยกเลิก'
      };
      
      return statusMap[status] || status || 'ไม่ทราบสถานะ';
    },
    
    getStatusClass() {
      if (!this.bookingData) return '';
      
      const status = this.bookingData.status;
      if (status === 'pending' || status === 'PENDING') return 'status-pending';
      if (status === 'confirmed' || status === 'CONFIRMED') return 'status-confirmed';
      if (status === 'ongoing' || status === 'ONGOING') return 'status-ongoing';
      if (status === 'completed' || status === 'COMPLETED') return 'status-completed';
      if (status === 'cancelled' || status === 'CANCELLED') return 'status-cancelled';
      return '';
    },
    
    goToHome() {
      // ลบข้อมูลการจองจาก localStorage
      localStorage.removeItem('lastBookingSuccess');
      this.$router.push('/');
    },
    
    viewBookingList() {
      // ลบข้อมูลการจองจาก localStorage
      localStorage.removeItem('lastBookingSuccess');
      this.$router.push('/queue');
    }
  }
}
</script>

<style scoped>
.success-page {
  min-height: calc(100vh - 120px);
  padding: 20px;
  font-family: 'Prompt', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success-content,
.error-content {
  max-width: 500px;
  margin: 0 auto;
  padding-top: 40px;
}

.success-icon,
.error-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.success-title,
.error-title {
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
}

.success-message,
.error-message {
  text-align: center;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 32px;
  line-height: 1.6;
}

.booking-details-card,
.next-steps-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #6b7280;
  flex: 1;
}

.value {
  font-weight: 600;
  color: #1f2937;
  text-align: right;
  flex: 1;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-confirmed {
  background: #d1fae5;
  color: #059669;
}

.status-ongoing {
  background: #dbeafe;
  color: #2563eb;
}

.status-completed {
  background: #d1fae5;
  color: #059669;
}

.status-cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.steps-list li {
  padding: 12px 0;
  color: #4b5563;
  line-height: 1.6;
  border-bottom: 1px solid #f3f4f6;
}

.steps-list li:last-child {
  border-bottom: none;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.btn {
  flex: 1;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Prompt', sans-serif;
}

.btn-primary {
  background: #059669;
  color: white;
}

.btn-primary:hover {
  background: #047857;
  transform: translateY(-2px);
}

.btn-secondary {
  background: white;
  color: #059669;
  border: 2px solid #059669;
}

.btn-secondary:hover {
  background: #059669;
  color: white;
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .success-page {
    padding: 16px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .value {
    text-align: left;
  }
}
</style>