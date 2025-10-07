<!-- components/calendar/WeekView.vue -->
<template>
  <div class="week-view">
    <div class="weekday-header">
      <div 
        v-for="(day, index) in weekDays" 
        :key="index" 
        class="weekday-item"
        :class="{ 'today': isToday(day) }"
      >
        <span class="day-name">{{ getDayName(day) }}</span>
        <span class="day-number">{{ day.date() }}</span>
        
        <!-- แสดงจุดสถานะ -->
        <div class="status-dots" v-if="hasBookingsOnDay(day)">
          <div 
            v-for="status in getStatusesForDay(day)"
            :key="status"
            class="status-dot"
            :class="status"
          ></div>
        </div>
      </div>
    </div>
    
    <div class="week-events">
      <div 
        v-for="(day, index) in weekDays" 
        :key="index"
        class="day-column"
        :class="{ 'today': isToday(day) }"
        @click="$emit('select-date', day)"
      >
        <div 
          v-for="booking in getBookingsForDay(day)" 
          :key="booking.id"
          class="event-item"
          :class="booking.status"
          @click.stop="viewBookingDetail(booking.id)"
        >
          <div class="event-time">{{ formatTime(booking.startTime) }} - {{ formatTime(booking.expectedEndTime) }}</div>
          <div class="event-title">{{ booking.customerName }}</div>
          <div class="event-model">{{ booking.vehicleModel || 'ไม่ระบุรุ่น' }}</div>
        </div>
        
        <div v-if="getBookingsForDay(day).length === 0" class="no-events">
          ไม่มีคิว
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

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
    // วันต่างๆ ในสัปดาห์
    weekDays() {
      if (!this.currentDate) {
        return Array(7).fill().map((_, i) => dayjs().startOf('week').add(i, 'day'))
      }
      
      const startOfWeek = this.currentDate.startOf('week')
      const days = []
      
      for (let i = 0; i < 7; i++) {
        days.push(startOfWeek.add(i, 'day'))
      }
      
      return days
    }
  },
  
  methods: {
    // ตรวจสอบว่าวันที่ให้มาเป็นวันนี้หรือไม่
    isToday(date) {
      return date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
    },
    
    // รับชื่อวันจากวันที่ (ภาษาไทย)
    getDayName(date) {
      const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
      return dayNames[date.day()]
    },
    
    // ตรวจสอบว่ามีการจองในวันนั้นหรือไม่
    hasBookingsOnDay(date) {
      const dateStr = date.format('YYYY-MM-DD')
      const dayData = this.bookingsByDate[dateStr]
      return dayData && dayData.total > 0
    },
    
    // ดึงสถานะทั้งหมดของวันนั้น
    getStatusesForDay(date) {
      const dateStr = date.format('YYYY-MM-DD')
      const dayData = this.bookingsByDate[dateStr]
      
      if (!dayData) return []
      
      const statuses = []
      if (dayData.pending > 0) statuses.push('pending')
      if (dayData.ongoing > 0) statuses.push('ongoing')
      if (dayData.completed > 0) statuses.push('completed')
      if (dayData.cancelled > 0) statuses.push('cancelled')
      
      return statuses
    },
    
    // รับการจองทั้งหมดสำหรับวันที่กำหนด
    getBookingsForDay(date) {
      const dateStr = date.format('YYYY-MM-DD')
      const dayData = this.bookingsByDate[dateStr]
      
      if (!dayData || !dayData.bookings) {
        return []
      }
      
      // เรียงลำดับตามเวลาเริ่มต้น
      return dayData.bookings.sort((a, b) => {
        return dayjs(a.startTime).diff(dayjs(b.startTime))
      })
    },
    
    // จัดรูปแบบเวลา
    formatTime(time) {
      if (!time) return ''
      return dayjs(time).format('HH:mm')
    },
    
    // ดูรายละเอียดการจอง
    viewBookingDetail(id) {
      this.$router.push(`/queue/${id}`)
    }
  },
  
  mounted() {
    console.log('WeekView mounted with props:', {
      bookings: this.bookings.length,
      bookingsByDate: Object.keys(this.bookingsByDate).length,
      currentDate: this.currentDate?.format('YYYY-MM-DD')
    })
  },
  
  watch: {
    bookingsByDate: {
      handler(newVal) {
        console.log('WeekView bookingsByDate changed:', newVal)
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.week-view {
  width: 100%;
}

.weekday-header {
  display: flex;
  border-bottom: 1px solid #E5E7EB;
}

.weekday-item {
  flex: 1;
  padding: 12px 4px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.weekday-item.today {
  background: #FEF2F2;
  color: #DA291C;
}

.day-name {
  font-size: 13px;
  margin-bottom: 2px;
  color: #6B7280;
}

.weekday-item.today .day-name {
  color: #DA291C;
}

.day-number {
  font-size: 16px;
  font-weight: 500;
}

/* Status dots */
.status-dots {
  display: flex;
  gap: 2px;
  margin-top: 4px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-dot.pending {
  background-color: #F59E0B;
}

.status-dot.ongoing {
  background-color: #3B82F6;
}

.status-dot.completed {
  background-color: #10B981;
}

.status-dot.cancelled {
  background-color: #EF4444;
}

.week-events {
  display: flex;
  min-height: 300px;
}

.day-column {
  flex: 1;
  min-height: 100%;
  padding: 8px 4px;
  border-right: 1px solid #F3F4F6;
  cursor: pointer;
}

.day-column:last-child {
  border-right: none;
}

.day-column.today {
  background: rgba(254, 242, 242, 0.5);
}

.event-item {
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  border-left: 3px solid;
  background: #F9FAFB;
  cursor: pointer;
  transition: all 0.2s;
}

.event-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* สีตามสถานะ - ใช้สีเดียวกับ MonthView */
.event-item.pending {
  border-left-color: #F59E0B;
  background: rgba(245, 158, 11, 0.05);
}

.event-item.ongoing {
  border-left-color: #3B82F6;
  background: rgba(59, 130, 246, 0.05);
}

.event-item.completed {
  border-left-color: #10B981;
  background: rgba(16, 185, 129, 0.05);
}

.event-item.cancelled {
  border-left-color: #EF4444;
  background: rgba(239, 68, 68, 0.05);
  opacity: 0.7;
}

.event-time {
  font-weight: 600;
  color: #4B5563;
  margin-bottom: 4px;
  font-size: 11px;
}

.event-title {
  font-weight: 500;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #111827;
}

.event-model {
  color: #6B7280;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-events {
  color: #9CA3AF;
  font-size: 12px;
  text-align: center;
  padding: 16px 0;
  font-style: italic;
}

/* Mobile responsive */
@media screen and (max-width: 767px) {
  .weekday-item {
    padding: 8px 2px;
  }
  
  .day-name {
    font-size: 11px;
  }
  
  .day-number {
    font-size: 14px;
  }
  
  .status-dot {
    width: 4px;
    height: 4px;
  }
  
  .event-item {
    padding: 6px;
    font-size: 11px;
  }
  
  .event-time {
    font-size: 10px;
  }
  
  .event-model {
    font-size: 10px;
  }
  
  .week-events {
    min-height: 250px;
  }
}
</style>