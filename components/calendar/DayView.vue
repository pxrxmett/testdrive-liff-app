<!-- components/calendar/DayView.vue -->
<template>
  <div class="day-view">
    <!-- Day Header -->
    <div class="day-header">
      <div class="day-info">
        <h3 class="day-title">{{ dayTitle }}</h3>
        <p class="day-subtitle">{{ daySubtitle }}</p>
      </div>
      <div class="day-stats" v-if="dayBookings.length > 0">
        <div class="stat-item">
          <span class="stat-number">{{ dayBookings.length }}</span>
          <span class="stat-label">คิวทั้งหมด</span>
        </div>
        <div class="stat-item" v-if="getStatusCount('ongoing') > 0">
          <span class="stat-number ongoing">{{ getStatusCount('ongoing') }}</span>
          <span class="stat-label">กำลังทดลองขับ</span>
        </div>
      </div>
    </div>

    <!-- Time Slots -->
    <div class="time-slots">
      <div 
        v-for="hour in timeSlots" 
        :key="hour"
        class="time-slot"
        :class="{ 'current-hour': isCurrentHour(hour) }"
      >
        <div class="time-label">
          {{ formatHour(hour) }}
        </div>
        <div class="time-content">
          <div 
            v-for="booking in getBookingsForHour(hour)" 
            :key="booking.id"
            class="booking-card"
            :class="booking.status"
            @click="viewBookingDetail(booking.id)"
          >
            <div class="booking-header">
              <div class="booking-time">
                {{ formatTime(booking.startTime) }} - {{ formatTime(booking.expectedEndTime) }}
              </div>
              <div class="booking-status" :class="booking.status">
                {{ getStatusText(booking.status) }}
              </div>
            </div>
            <div class="booking-details">
              <h4 class="customer-name">{{ booking.customerName }}</h4>
              <div class="booking-info">
                <div class="info-item">
                  <i class="fas fa-car"></i>
                  <span>{{ booking.vehicleModel || 'ไม่ระบุรุ่น' }}</span>
                </div>
                <div class="info-item" v-if="booking.responsibleStaff">
                  <i class="fas fa-user"></i>
                  <span>{{ booking.responsibleStaff }}</span>
                </div>
                <div class="info-item" v-if="booking.testRoute">
                  <i class="fas fa-route"></i>
                  <span>{{ booking.testRoute }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="getBookingsForHour(hour).length === 0" class="empty-slot">
            <!-- ช่วงเวลาว่าง -->
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="dayBookings.length === 0" class="empty-day">
      <div class="empty-icon">
        <i class="fas fa-calendar-day"></i>
      </div>
      <h3>ไม่มีคิวในวันนี้</h3>
      <p>ไม่มีการจองทดลองขับในวันที่เลือก</p>
      <button @click="addBooking" class="btn-add-booking">
        <i class="fas fa-plus"></i>
        เพิ่มการจอง
      </button>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import 'dayjs/locale/th'

dayjs.locale('th')

export default {
  props: {
    currentDate: {
      type: Object,
      required: true
    },
    bookings: {
      type: Array,
      default: () => []
    },
    bookingsByDate: {
      type: Object,
      default: () => ({})
    }
  },
  
  computed: {
    // ชื่อวันที่
    dayTitle() {
      if (!this.currentDate) return ''
      return this.currentDate.format('D MMMM YYYY')
    },
    
    // รายละเอียดวัน
    daySubtitle() {
      if (!this.currentDate) return ''
      
      const dayName = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
      return `วัน${dayName[this.currentDate.day()]}`
    },
    
    // การจองของวันนี้
    dayBookings() {
      if (!this.currentDate) return []
      
      const dateStr = this.currentDate.format('YYYY-MM-DD')
      const dayData = this.bookingsByDate[dateStr]
      
      if (!dayData || !dayData.bookings) {
        return []
      }
      
      // เรียงลำดับตามเวลาเริ่มต้น
      return dayData.bookings.sort((a, b) => {
        return dayjs(a.startTime).diff(dayjs(b.startTime))
      })
    },
    
    // ช่วงเวลาทั้งหมด (8:00 - 18:00)
    timeSlots() {
      const slots = []
      for (let hour = 8; hour <= 18; hour++) {
        slots.push(hour)
      }
      return slots
    }
  },
  
  methods: {
    // นับจำนวนตามสถานะ
    getStatusCount(status) {
      return this.dayBookings.filter(booking => {
        const bookingStatus = (booking.status || '').toLowerCase()
        return bookingStatus === status.toLowerCase()
      }).length
    },

    // ตรวจสอบว่าเป็นชั่วโมงปัจจุบันหรือไม่
    isCurrentHour(hour) {
      const now = dayjs()
      const currentHour = now.hour()
      const isToday = now.isSame(this.currentDate, 'day')

      return isToday && currentHour === hour
    },

    // จัดรูปแบบชั่วโมง
    formatHour(hour) {
      return `${hour.toString().padStart(2, '0')}:00`
    },

    // จัดรูปแบบเวลา (รองรับหลาย format)
    formatTime(time) {
      if (!time) return ''

      const t = dayjs(time)
      if (!t.isValid()) return ''

      return t.format('HH:mm')
    },

    // ดึงการจองในชั่วโมงนั้น
    getBookingsForHour(hour) {
      return this.dayBookings.filter(booking => {
        if (!booking.startTime) return false

        const bookingTime = dayjs(booking.startTime)
        if (!bookingTime.isValid()) return false

        const bookingHour = bookingTime.hour()
        return bookingHour === hour
      })
    },

    // แปลงสถานะเป็นข้อความ (รองรับทั้ง lowercase และ UPPERCASE)
    getStatusText(status) {
      const statusMap = {
        pending: 'รอดำเนินการ',
        ongoing: 'กำลังทดลองขับ',
        completed: 'เสร็จสิ้น',
        cancelled: 'ยกเลิก'
      }
      const normalizedStatus = (status || '').toLowerCase()
      return statusMap[normalizedStatus] || status
    },
    
    // ดูรายละเอียดการจอง
    viewBookingDetail(id) {
      this.$router.push(`/queue/${id}`)
    },
    
    // เพิ่มการจอง
    addBooking() {
      this.$router.push('/booking')
    }
  },
  
  mounted() {
    console.log('DayView mounted with props:', {
      bookings: this.bookings.length,
      bookingsByDate: Object.keys(this.bookingsByDate).length,
      currentDate: this.currentDate?.format('YYYY-MM-DD'),
      dayBookings: this.dayBookings.length
    })
  },
  
  watch: {
    bookingsByDate: {
      handler(newVal) {
        console.log('DayView bookingsByDate changed:', newVal)
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.day-view {
  width: 100%;
  height: 100%;
}

/* Day Header */
.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #DA291C, #B8241A);
  color: white;
  border-radius: 12px 12px 0 0;
}

.day-info h3 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
}

.day-info p {
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
}

.day-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
}

.stat-number.ongoing {
  color: #60A5FA;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

/* Time Slots */
.time-slots {
  background: white;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}

.time-slot {
  display: flex;
  border-bottom: 1px solid #F3F4F6;
  min-height: 80px;
}

.time-slot:last-child {
  border-bottom: none;
}

.time-slot.current-hour {
  background: rgba(218, 41, 28, 0.02);
  border-left: 3px solid #DA291C;
}

.time-label {
  width: 80px;
  padding: 16px 12px;
  background: #F9FAFB;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #6B7280;
  border-right: 1px solid #E5E7EB;
}

.time-content {
  flex: 1;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-slot {
  flex: 1;
  min-height: 40px;
}

/* Booking Cards */
.booking-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid;
}

.booking-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.booking-card.pending {
  border-left-color: #F59E0B;
  background: rgba(245, 158, 11, 0.02);
}

.booking-card.ongoing {
  border-left-color: #3B82F6;
  background: rgba(59, 130, 246, 0.02);
}

.booking-card.completed {
  border-left-color: #10B981;
  background: rgba(16, 185, 129, 0.02);
}

.booking-card.cancelled {
  border-left-color: #EF4444;
  background: rgba(239, 68, 68, 0.02);
  opacity: 0.7;
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.booking-time {
  font-weight: 600;
  color: #4B5563;
  font-size: 14px;
}

.booking-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.booking-status.pending {
  background: rgba(245, 158, 11, 0.1);
  color: #D97706;
}

.booking-status.ongoing {
  background: rgba(59, 130, 246, 0.1);
  color: #2563EB;
}

.booking-status.completed {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.booking-status.cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: #DC2626;
}

.customer-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.booking-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6B7280;
}

.info-item i {
  width: 16px;
  font-size: 12px;
  color: #9CA3AF;
}

/* Empty State */
.empty-day {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 0 0 12px 12px;
}

.empty-icon {
  font-size: 64px;
  color: #D1D5DB;
  margin-bottom: 20px;
}

.empty-day h3 {
  margin: 0 0 8px 0;
  color: #4B5563;
  font-size: 20px;
}

.empty-day p {
  margin: 0 0 24px 0;
  color: #6B7280;
}

.btn-add-booking {
  background: #DA291C;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-add-booking:hover {
  background: #B8241A;
  transform: translateY(-1px);
}

/* Mobile responsive */
@media screen and (max-width: 767px) {
  .day-header {
    padding: 16px;
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .day-info h3 {
    font-size: 20px;
  }
  
  .day-info p {
    font-size: 14px;
  }
  
  .day-stats {
    gap: 16px;
  }
  
  .stat-number {
    font-size: 20px;
  }
  
  .time-label {
    width: 60px;
    padding: 12px 8px;
    font-size: 12px;
  }
  
  .time-content {
    padding: 8px;
  }
  
  .booking-card {
    padding: 10px;
  }
  
  .customer-name {
    font-size: 14px;
  }
  
  .booking-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .booking-time {
    font-size: 12px;
  }
  
  .info-item {
    font-size: 12px;
  }
  
  .empty-day {
    padding: 40px 15px;
  }
  
  .empty-icon {
    font-size: 48px;
  }
}
</style>