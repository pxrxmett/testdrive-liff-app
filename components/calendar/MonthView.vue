<!-- components/calendar/MonthView.vue -->
<template>
  <div class="month-view">
    <div class="weekday-header">
      <div v-for="day in weekdays" :key="day">{{ day }}</div>
    </div>
    <div class="days-grid">
      <!-- วันก่อนเดือนปัจจุบัน -->
      <div 
        v-for="day in prevMonthDays" 
        :key="'prev-' + day.date()" 
        class="calendar-day other-month"
      >
        <span>{{ day.date() }}</span>
      </div>
      
      <!-- วันในเดือนปัจจุบัน -->
      <div 
        v-for="day in currentMonthDays" 
        :key="'current-' + day.date()" 
        class="calendar-day"
        :class="{ 
          'today': isToday(day), 
          'selected': isSelectedDate(day)
        }"
        @click="$emit('select-date', day)"
      >
        <span>{{ day.date() }}</span>
        
        <!-- สัญลักษณ์แสดงว่ามีคิวในวันนี้หรือไม่ -->
        <div v-if="hasBookings(day)" class="event-indicator-container">
          <div 
            v-for="status in getBookingStatusesForDay(day)" 
            :key="status"
            class="event-indicator"
            :class="status"
            :title="getStatusLabel(status)"
          ></div>
          
          <!-- แสดงจำนวนถ้ามีมากกว่า 3 การจอง -->
          <div v-if="getBookingCountForDay(day) > 3" class="booking-count-small">
            {{ getBookingCountForDay(day) }}
          </div>
        </div>
      </div>
      
      <!-- วันหลังเดือนปัจจุบัน -->
      <div 
        v-for="day in nextMonthDays" 
        :key="'next-' + day.date()" 
        class="calendar-day other-month"
      >
        <span>{{ day.date() }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

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
    },
    selectedDate: {
      type: Object,
      default: null
    }
  },
  
  data() {
    return {
      weekdays: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
    }
  },
  
  computed: {
    // วันแรกของเดือน
    firstDayOfMonth() {
      if (!this.currentDate) return dayjs().startOf('month')
      return this.currentDate.startOf('month')
    },
    
    // วันสุดท้ายของเดือน
    lastDayOfMonth() {
      if (!this.currentDate) return dayjs().endOf('month')
      return this.currentDate.endOf('month')
    },
    
    // วันแรกของกริดปฏิทิน (อาจเป็นวันในเดือนก่อนหน้า)
    firstCalendarDay() {
      const firstDay = this.firstDayOfMonth
      const dayOfWeek = firstDay.day() // 0 = อาทิตย์, 1 = จันทร์, ...
      return firstDay.subtract(dayOfWeek, 'day')
    },
    
    // วันสุดท้ายของกริดปฏิทิน (อาจเป็นวันในเดือนถัดไป)
    lastCalendarDay() {
      const lastDay = this.lastDayOfMonth
      const dayOfWeek = lastDay.day() // 0 = อาทิตย์, 1 = จันทร์, ...
      return lastDay.add(6 - dayOfWeek, 'day')
    },
    
    // วันของเดือนก่อนหน้าที่แสดงในกริด
    prevMonthDays() {
      const days = []
      let day = this.firstCalendarDay
      
      while (day.isBefore(this.firstDayOfMonth)) {
        days.push(day)
        day = day.add(1, 'day')
      }
      
      return days
    },
    
    // วันของเดือนปัจจุบันที่แสดงในกริด
    currentMonthDays() {
      const days = []
      let day = this.firstDayOfMonth
      
      while (day.isSameOrBefore(this.lastDayOfMonth)) {
        days.push(day)
        day = day.add(1, 'day')
      }
      
      return days
    },
    
    // วันของเดือนถัดไปที่แสดงในกริด
    nextMonthDays() {
      const days = []
      let day = this.lastDayOfMonth.add(1, 'day')
      
      while (day.isSameOrBefore(this.lastCalendarDay)) {
        days.push(day)
        day = day.add(1, 'day')
      }
      
      return days
    }
  },
  
  methods: {
    // ตรวจสอบว่าวันที่ให้มาเป็นวันนี้หรือไม่
    isToday(date) {
      return date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
    },
    
    // ตรวจสอบว่าวันที่ให้มาเป็นวันที่เลือกหรือไม่
    isSelectedDate(date) {
      if (!this.selectedDate) return false
      return date.format('YYYY-MM-DD') === this.selectedDate.format('YYYY-MM-DD')
    },
    
    // ตรวจสอบว่ามีการจองในวันที่ให้มาหรือไม่
    hasBookings(date) {
      const dateStr = date.format('YYYY-MM-DD')
      const hasBookingsFromProp = this.bookingsByDate[dateStr] && this.bookingsByDate[dateStr].total > 0
      
      // Debug log
      if (date.date() === 13) {
        console.log(`Day 13 check:`, {
          dateStr,
          bookingsByDate: this.bookingsByDate[dateStr],
          hasBookingsFromProp,
          allBookingsByDate: this.bookingsByDate
        })
      }
      
      return hasBookingsFromProp
    },
    
    // ดึงสถานะทั้งหมดของการจองในวันที่กำหนด (ใช้แสดงจุดสีต่างๆ)
    getBookingStatusesForDay(date) {
      const dateStr = date.format('YYYY-MM-DD')
      const dayData = this.bookingsByDate[dateStr]
      
      if (!dayData) return []
      
      const statuses = []
      
      // เพิ่มสถานะตามจำนวนที่มี (แสดงไม่เกิน 4 จุด)
      if (dayData.pending > 0) statuses.push('pending')
      if (dayData.ongoing > 0) statuses.push('ongoing')
      if (dayData.completed > 0) statuses.push('completed')
      if (dayData.cancelled > 0) statuses.push('cancelled')
      
      return statuses
    },
    
    // ดึงจำนวนการจองทั้งหมดในวันนั้น
    getBookingCountForDay(date) {
      const dateStr = date.format('YYYY-MM-DD')
      const dayData = this.bookingsByDate[dateStr]
      
      return dayData ? dayData.total : 0
    },
    
    // แปลงสถานะเป็นข้อความ
    getStatusLabel(status) {
      const labels = {
        pending: 'รอดำเนินการ',
        ongoing: 'กำลังทดลองขับ',
        completed: 'เสร็จสิ้น',
        cancelled: 'ยกเลิก'
      }
      return labels[status] || status
    }
  },
  
  mounted() {
    console.log('MonthView mounted with props:', {
      bookings: this.bookings.length,
      bookingsByDate: Object.keys(this.bookingsByDate).length,
      currentDate: this.currentDate?.format('YYYY-MM-DD')
    })
  },
  
  watch: {
    bookingsByDate: {
      handler(newVal) {
        console.log('MonthView bookingsByDate changed:', newVal)
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.month-view {
  padding: 16px;
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 8px;
}

.weekday-header div {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #6B7280;
  font-weight: 600;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border-radius: 8px;
  position: relative;
  min-height: 48px;
  cursor: pointer;
  transition: background-color 0.2s;
  border: 1px solid transparent;
}

.calendar-day:hover:not(.other-month) {
  background: #F9FAFB;
  border-color: #E5E7EB;
}

.calendar-day.other-month {
  color: #D1D5DB;
}

.calendar-day.today {
  background: #FEF2F2;
  color: #DA291C;
  font-weight: 600;
  border-color: #DA291C;
}

.calendar-day.selected {
  background: #DA291C;
  color: white;
  font-weight: 600;
}

.event-indicator-container {
  display: flex;
  gap: 2px;
  position: absolute;
  bottom: 4px;
  align-items: center;
}

.event-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* สีต่างๆ ตามสถานะ - ใช้สีเดียวกับที่กำหนดใน TestDriveCalendar */
.event-indicator.pending {
  background: #F59E0B; /* เหลือง - รอดำเนินการ */
}

.event-indicator.ongoing {
  background: #3B82F6; /* น้ำเงิน - กำลังทดลองขับ */
}

.event-indicator.completed {
  background: #10B981; /* เขียว - เสร็จสิ้น */
}

.event-indicator.cancelled {
  background: #EF4444; /* แดง - ยกเลิก */
}

.calendar-day.selected .event-indicator {
  background: white !important;
  border-color: rgba(255, 255, 255, 0.8);
}

.calendar-day.today .event-indicator {
  border-color: rgba(218, 41, 28, 0.3);
}

.booking-count-small {
  background: #DA291C;
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 8px;
  padding: 1px 4px;
  margin-left: 2px;
  min-width: 14px;
  text-align: center;
  line-height: 1.2;
}

.calendar-day.selected .booking-count-small {
  background: white;
  color: #DA291C;
}

/* Mobile responsive */
@media screen and (max-width: 767px) {
  .month-view {
    padding: 8px;
  }
  
  .calendar-day {
    min-height: 40px;
    font-size: 14px;
  }
  
  .weekday-header div {
    height: 28px;
    font-size: 12px;
  }
  
  .event-indicator {
    width: 5px;
    height: 5px;
  }
  
  .booking-count-small {
    font-size: 9px;
    padding: 1px 3px;
    min-width: 12px;
  }
}

@media screen and (max-width: 480px) {
  .calendar-day {
    min-height: 35px;
    font-size: 12px;
  }
  
  .event-indicator {
    width: 4px;
    height: 4px;
  }
  
  .booking-count-small {
    font-size: 8px;
    padding: 1px 2px;
    min-width: 10px;
  }
}
</style>