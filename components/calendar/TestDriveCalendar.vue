<!-- components/calendar/TestDriveCalendar.vue -->
<template>
  <div class="test-drive-calendar">
    <!-- ส่วนฟิลเตอร์และตัวเลือกมุมมอง -->
    <div class="filter-section">
      <select v-model="selectedModel" class="car-select" aria-label="เลือกรุ่นรถ">
        <option value="all">รถทั้งหมด</option>
        <option v-for="model in filteredAvailableModels" :key="model" :value="model">
          {{ model }}
        </option>
      </select>

      <div class="view-toggle" role="tablist">
        <button 
          v-for="view in viewOptions" 
          :key="view.id"
          class="view-btn" 
          :class="{ active: currentView === view.id }" 
          role="tab" 
          :aria-selected="currentView === view.id"
          @click="switchView(view.id)"
        >
          <span class="material-icons">{{ view.icon }}</span>
        </button>
      </div>
    </div>

    <!-- ตัวนำทางระหว่างเดือน/สัปดาห์/วัน -->
    <div class="month-navigator">
      <button class="nav-btn prev-month" @click="navigatePrevious" aria-label="ก่อนหน้า">
        <span class="material-icons">chevron_left</span>
      </button>
      <h2>{{ currentDateLabel }}</h2>
      <button class="nav-btn next-month" @click="navigateNext" aria-label="ถัดไป">
        <span class="material-icons">chevron_right</span>
      </button>
    </div>

    <!-- มุมมองปฏิทิน -->
    <div class="calendar-views" v-if="!loading">
      <!-- Legend แสดงความหมายของสี -->
      <div class="status-legend">
        <div class="legend-item">
          <div class="legend-dot pending"></div>
          <span>รอดำเนินการ</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot ongoing"></div>
          <span>กำลังทดลองขับ</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot completed"></div>
          <span>เสร็จสิ้น</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot cancelled"></div>
          <span>ยกเลิก</span>
        </div>
      </div>
      
      <!-- Month View -->
      <MonthView 
        v-if="currentView === 'month'"
        :current-date="currentDate"
        :bookings="filteredBookings"
        :bookings-by-date="bookingsByDate"
        :selected-date="selectedDate"
        @select-date="selectDate"
      />
      
      <!-- Week View -->
      <WeekView 
        v-else-if="currentView === 'week'"
        :current-date="currentDate"
        :bookings="filteredBookings"
        :bookings-by-date="bookingsByDate"
        @select-date="selectDate"
      />
      
      <!-- Day View -->
      <DayView 
        v-else
        :current-date="currentDate"
        :bookings="filteredBookings"
        :bookings-by-date="bookingsByDate"
      />
    </div>
    
    <!-- สถานะกำลังโหลด -->
    <div v-else class="loading-state">
      <div class="loading-spinner"></div>
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <!-- แสดง Error ถ้ามี -->
    <div v-if="error" class="error-state">
      <span class="material-icons">error</span>
      <p>{{ error }}</p>
      <button @click="refreshBookings" class="retry-btn">ลองอีกครั้ง</button>
    </div>

    <!-- รายการคิวของวันที่เลือก -->
    <div class="bookings-list">
      <h3>คิววันที่ {{ formatSelectedDate }}</h3>
      
      <div v-if="selectedDateBookings.length > 0 && !loading">
        <div 
          v-for="booking in selectedDateBookings" 
          :key="booking.id" 
          class="booking-item"
          @click="viewBookingDetail(booking.id)"
        >
          <div class="booking-header">
            <h4>{{ booking.customerName }}</h4>
            <span class="status-badge" :class="booking.status">{{ getStatusText(booking.status) }}</span>
          </div>
          <div class="booking-details">
            <div class="detail-item">
              <span class="material-icons">directions_car</span>
              <span>{{ booking.vehicleModel || 'ไม่ระบุรุ่น' }}</span>
            </div>
            <div class="detail-item">
              <span class="material-icons">access_time</span>
              <span>{{ formatTimeSlot(booking.startTime, booking.expectedEndTime) }}</span>
            </div>
            <div class="detail-item" v-if="booking.responsibleStaff">
              <span class="material-icons">person</span>
              <span>{{ booking.responsibleStaff }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else-if="loading" class="loading-items">
        <div class="skeleton-item" v-for="i in 3" :key="i"></div>
      </div>
      
      <div v-else class="empty-bookings">
        <span class="material-icons">event_busy</span>
        <p>ไม่มีคิวในวันที่เลือก</p>
      </div>
    </div>

    <!-- ปุ่มเพิ่มการจอง -->
    <button 
      class="add-booking-btn"
      @click="addNewBooking"
    >
      <span class="material-icons">add</span>
    </button>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { getTestDrives } from '~/utils/brandApi'

// เพิ่ม plugins
dayjs.extend(utc)
dayjs.extend(timezone)

export default {
  components: {
    MonthView: () => import('./MonthView.vue'),
    WeekView: () => import('./WeekView.vue'),
    DayView: () => import('./DayView.vue')
  },
  
  data() {
    return {
      currentView: 'month', // 'month', 'week', 'day'
      currentDate: dayjs(),
      selectedDate: dayjs(),
      selectedModel: 'all',
      selectedStatus: 'all',
      loading: false,
      error: null,
      
      // การตั้งค่า Open Hours
      businessHours: {
        start: 9,     // 09:00
        end: 18,      // 18:00
        slotDuration: 1, // 1 ชั่วโมงต่อช่วง
        slots: [
          { id: 1, label: 'ช่วงที่ 1', time: '09:00-10:00' },
          { id: 2, label: 'ช่วงที่ 2', time: '10:00-11:00' },
          { id: 3, label: 'ช่วงที่ 3', time: '11:00-12:00' },
          { id: 4, label: 'ช่วงที่ 4', time: '13:00-14:00' },
          { id: 5, label: 'ช่วงที่ 5', time: '14:00-15:00' },
          { id: 6, label: 'ช่วงที่ 6', time: '15:00-16:00' },
          { id: 7, label: 'ช่วงที่ 7', time: '16:00-17:00' },
          { id: 8, label: 'ช่วงที่ 8', time: '17:00-18:00' }
        ]
      },
      
      // ตัวเลือกมุมมอง
      viewOptions: [
        { 
          id: 'day', 
          icon: 'today'
        },
        { 
          id: 'week', 
          icon: 'view_week'
        },
        { 
          id: 'month', 
          icon: 'calendar_month'
        }
      ],
      
      // ข้อมูลที่ได้จาก API
      bookings: [],
      
      // ข้อมูล staff สำหรับแสดงชื่อ
      staffData: {}
    }
  },
  
  computed: {
    // กรองข้อมูลการจองตามรุ่นรถและสถานะที่เลือก
    filteredBookings() {
      let filtered = this.bookings;
      
      // กรองตามรุ่นรถ
      if (this.selectedModel !== 'all') {
        filtered = filtered.filter(booking => {
          const vehicleModel = booking.vehicleModel || '';
          return vehicleModel.toLowerCase().includes(this.selectedModel.toLowerCase());
        });
      }
      
      // กรองตามสถานะ
      if (this.selectedStatus !== 'all') {
        filtered = filtered.filter(booking => booking.status === this.selectedStatus);
      }
      
      return filtered;
    },
    
    // รายการจองของวันที่เลือก
    selectedDateBookings() {
      if (!this.selectedDate) return [];
      
      const selectedDateStr = this.selectedDate.format('YYYY-MM-DD');
      const bookings = this.filteredBookings.filter(booking => {
        const bookingDate = dayjs(booking.startTime).format('YYYY-MM-DD');
        return bookingDate === selectedDateStr;
      });
      
      // เรียงลำดับตามเวลาเริ่มต้น
      return bookings.sort((a, b) => {
        return dayjs(a.startTime).diff(dayjs(b.startTime));
      });
    },
    
    // ข้อความแสดงช่วงเวลาตามมุมมองปัจจุบัน
    currentDateLabel() {
      if (!this.currentDate) return '';
      
      dayjs.locale('th');
      
      switch (this.currentView) {
        case 'month': {
          return this.currentDate.format('MMMM YYYY');
        }
        case 'week': {
          const startOfWeek = this.currentDate.startOf('week');
          const endOfWeek = this.currentDate.endOf('week');
          return `${startOfWeek.format('D')} - ${endOfWeek.format('D MMMM YYYY')}`;
        }
        case 'day': {
          return this.currentDate.format('D MMMM YYYY');
        }
        default: {
          return this.currentDate.format('MMMM YYYY');
        }
      }
    },
    
    // วันที่เลือกในรูปแบบที่อ่านง่าย
    formatSelectedDate() {
      if (!this.selectedDate) return '';
      
      dayjs.locale('th');
      return this.selectedDate.format('D MMMM YYYY');
    },
    
    // รายการรุ่นรถที่มีในระบบ
    availableModels() {
      const models = new Set(['all']);
      
      this.bookings.forEach(booking => {
        if (booking.vehicleModel) {
          models.add(booking.vehicleModel);
        }
      });
      
      return Array.from(models);
    },
    
    // รายการรุ่นรถที่กรองแล้ว (ไม่รวม 'all')
    filteredAvailableModels() {
      return this.availableModels.filter(model => model !== 'all');
    },
    
    // รายการสถานะที่มีในระบบ
    availableStatuses() {
      return [
        { value: 'all', label: 'ทั้งหมด' },
        { value: 'pending', label: 'รอดำเนินการ' },
        { value: 'ongoing', label: 'กำลังทดลองขับ' },
        { value: 'completed', label: 'เสร็จสิ้น' },
        { value: 'cancelled', label: 'ยกเลิก' }
      ];
    },
    
    // จัดกลุ่มการจองตามวันที่ พร้อมนับจำนวนตามสถานะ
    bookingsByDate() {
      const grouped = {};
      
      this.filteredBookings.forEach(booking => {
        const date = dayjs(booking.startTime).format('YYYY-MM-DD');
        
        if (!grouped[date]) {
          grouped[date] = {
            pending: 0,
            ongoing: 0,
            completed: 0,
            cancelled: 0,
            total: 0,
            bookings: []
          };
        }
        
        grouped[date][booking.status]++;
        grouped[date].total++;
        grouped[date].bookings.push(booking);
      });
      
      return grouped;
    }
  },
  
  methods: {
    // เปลี่ยนมุมมองปฏิทิน
    switchView(view) {
      this.currentView = view;
    },
    
    // ไปวันที่ / สัปดาห์ / เดือน ก่อนหน้า
    navigatePrevious() {
      switch (this.currentView) {
        case 'month': {
          this.currentDate = this.currentDate.subtract(1, 'month');
          break;
        }
        case 'week': {
          this.currentDate = this.currentDate.subtract(1, 'week');
          break;
        }
        case 'day': {
          this.currentDate = this.currentDate.subtract(1, 'day');
          break;
        }
      }
    },
    
    // ไปวันที่ / สัปดาห์ / เดือน ถัดไป
    navigateNext() {
      switch (this.currentView) {
        case 'month': {
          this.currentDate = this.currentDate.add(1, 'month');
          break;
        }
        case 'week': {
          this.currentDate = this.currentDate.add(1, 'week');
          break;
        }
        case 'day': {
          this.currentDate = this.currentDate.add(1, 'day');
          break;
        }
      }
    },
    
    // เลือกวันที่
    selectDate(date) {
      this.selectedDate = dayjs(date);
    },
    
    // แปลงสถานะเป็นข้อความภาษาไทย
    getStatusText(status) {
      const statusMap = {
        pending: 'รอดำเนินการ',
        ongoing: 'กำลังทดลองขับ',
        completed: 'เสร็จสิ้น',
        cancelled: 'ยกเลิก'
      };
      return statusMap[status] || status;
    },
    
    // จัดรูปแบบช่วงเวลาแบบ Open Hours
    formatTimeSlot(startTime, endTime) {
      if (!startTime) return 'ไม่ระบุเวลา';
      
      const start = dayjs(startTime);
      const end = endTime ? dayjs(endTime) : null;
      
      // แปลงเป็น Open Hours format
      return this.convertToOpenHours(start, end);
    },
    
    // แปลงเวลาเป็นรูปแบบ Open Hours
    convertToOpenHours(startTime, endTime = null) {
      if (!startTime) return 'ไม่ระบุเวลา';
      
      const startHour = startTime.hour();
      const startMinute = startTime.minute();
      
      // หาช่วงเวลาที่ตรงกับเวลาที่กำหนด
      const matchingSlot = this.businessHours.slots.find(slot => {
        const [slotStart, slotEnd] = slot.time.split('-');
        const [startH, startM] = slotStart.split(':').map(Number);
        const [endH, endM] = slotEnd.split(':').map(Number);
        
        const slotStartMinutes = startH * 60 + startM;
        const slotEndMinutes = endH * 60 + endM;
        const timeMinutes = startHour * 60 + startMinute;
        
        return timeMinutes >= slotStartMinutes && timeMinutes < slotEndMinutes;
      });
      
      if (matchingSlot) {
        if (endTime) {
          const endHour = endTime.hour();
          const endMinute = endTime.minute();
          
          const endMatchingSlot = this.businessHours.slots.find(slot => {
            const [slotStart, slotEnd] = slot.time.split('-');
            const [startH, startM] = slotStart.split(':').map(Number);
            const [endH, endM] = slotEnd.split(':').map(Number);
            
            const slotStartMinutes = startH * 60 + startM;
            const slotEndMinutes = endH * 60 + endM;
            const timeMinutes = endHour * 60 + endMinute;
            
            return timeMinutes > slotStartMinutes && timeMinutes <= slotEndMinutes;
          });
          
          if (endMatchingSlot && endMatchingSlot.id !== matchingSlot.id) {
            return `${matchingSlot.label} - ${endMatchingSlot.label}`;
          }
        }
        
        return matchingSlot.label;
      }
      
      // ถ้าไม่อยู่ในช่วงทำการ ให้แสดงเวลาปกติ
      const start = startTime.format('HH:mm');
      const end = endTime ? endTime.format('HH:mm') : '';
      return end ? `${start} - ${end}` : start;
    },
    
    // ฟอร์แมตเวลาแบบง่าย (ยังคงไว้สำหรับใช้งานอื่น)
    formatTime(time) {
      if (!time) return '';
      return dayjs(time).format('HH:mm');
    },
    
    // ฟอร์แมตเวลาแบบ Business Hours พร้อมรายละเอียด
    formatDetailedTimeSlot(startTime, endTime) {
      if (!startTime) return 'ไม่ระบุเวลา';
      
      const start = dayjs(startTime);
      const end = endTime ? dayjs(endTime) : null;
      const openHours = this.convertToOpenHours(start, end);
      const actualTime = end ? 
        `${start.format('HH:mm')} - ${end.format('HH:mm')}` : 
        start.format('HH:mm');
      
      return `${openHours} (${actualTime})`;
    },
    
    // ดึงข้อมูลช่วงเวลาทั้งหมด
    getBusinessHours() {
      return this.businessHours.slots;
    },
    
    // ดึงช่วงเวลาปัจจุบันจาก booking
    getCurrentTimeSlot(booking) {
      if (!booking.startTime) return null;
      
      const startTime = dayjs(booking.startTime);
      return this.businessHours.slots.find(slot => {
        const [slotStart, slotEnd] = slot.time.split('-');
        const [startH, startM] = slotStart.split(':').map(Number);
        const [endH, endM] = slotEnd.split(':').map(Number);
        
        const slotStartMinutes = startH * 60 + startM;
        const slotEndMinutes = endH * 60 + endM;
        const timeMinutes = startTime.hour() * 60 + startTime.minute();
        
        return timeMinutes >= slotStartMinutes && timeMinutes < slotEndMinutes;
      });
    },
    
    // ดูรายละเอียดการจอง
    viewBookingDetail(id) {
      this.$router.push(`/queue/${id}`);
    },
    
    // เพิ่มการจองใหม่
    addNewBooking() {
      this.$router.push('/booking');
    },
    
    // แปลงข้อมูลจาก API เป็นรูปแบบที่ใช้ในแอป
    formatBookingData(apiData) {
      return apiData.map(item => {
        // แปลงข้อมูลตาม API structure ที่ให้มา
        return {
          id: item.id,
          vehicleId: item.vehicle_id,
          status: item.status,
          customerName: item.customer_name,
          customerPhone: item.customer_phone,
          testRoute: item.test_route,
          distance: item.distance,
          duration: item.duration,
          startTime: item.start_time,
          expectedEndTime: item.expected_end_time,
          actualEndTime: item.actual_end_time,
          responsibleStaff: this.getStaffName(item.responsible_staff),
          responsibleStaffId: item.responsible_staff,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          // ดึงข้อมูลรถจาก vehicle_id (ต้องมี API แยก)
          vehicleModel: item.vehicle?.model || 'ไม่ระบุรุ่น'
        };
      });
    },
    
    // ดึงชื่อพนักงานจาก staff ID
    getStaffName(staffId) {
      if (!staffId) return '';
      
      const staff = this.staffData[staffId];
      if (staff) {
        return `${staff.first_name} ${staff.last_name}`;
      }
      
      return staffId; // ถ้าไม่เจอข้อมูล ให้แสดง ID แทน
    },
    
    // โหลดข้อมูลพนักงาน
    async fetchStaffData() {
      try {
        const response = await this.$axios.get('/staffs');
        const staffs = response.data;
        
        // แปลงเป็น object เพื่อหาได้เร็ว - ใช้ property shorthand
        this.staffData = staffs.reduce((acc, staff) => {
          acc[staff.id] = staff;
          return acc;
        }, {});
        
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน:', error);
      }
    },
    
    // โหลดข้อมูลการจองจาก API
    async fetchBookings() {
      this.loading = true;
      this.error = null;

      try {
        // ✅ ใช้ brandApi helper แทนการเรียก API โดยตรง
        const response = await getTestDrives(this.$axios);

        if (response && Array.isArray(response)) {
          this.bookings = this.formatBookingData(response);
          console.log('โหลดข้อมูลการจองเรียบร้อย:', this.bookings.length, 'รายการ');
        } else {
          // ถ้าไม่มีข้อมูลหรือข้อมูลไม่ใช่ array
          console.log('ไม่มีข้อมูลการจองหรือข้อมูลไม่ถูกต้อง:', response);
          this.bookings = [];
        }
        
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลการจอง:', error);
        
        // แสดงข้อความ error ที่ชัดเจนขึ้น
        if (error.response?.status === 404) {
          this.error = 'API /test-drives ยังไม่ได้ถูก implement บนเซิร์ฟเวอร์';
        } else if (error.response?.status === 401) {
          this.error = 'ไม่มีสิทธิ์เข้าถึงข้อมูล กรุณาเข้าสู่ระบบใหม่';
        } else if (error.response?.status === 403) {
          this.error = 'ไม่มีสิทธิ์ดูข้อมูลการจอง';
        } else {
          this.error = `เกิดข้อผิดพลาด: ${error.response?.status || 'ไม่ทราบสถานะ'}`;
        }
        
        // ใช้ข้อมูลตัวอย่างแทน
        this.bookings = this.generateSampleData();
        console.log('ใช้ข้อมูลตัวอย่างแทน:', this.bookings.length, 'รายการ');
        
      } finally {
        this.loading = false;
      }
    },
    
    // สร้างข้อมูลตัวอย่างสำหรับการทดสอบ
    generateSampleData() {
      const today = dayjs();
      const currentMonth = today.month();
      const currentYear = today.year();
      
      const sampleData = [];
      
      // สร้างข้อมูลตัวอย่างหลายวันในเดือนปัจจุบัน
      const daysWithBookings = [1, 3, 7, 10, 13, 15, 18, 20, 22, 25, 28];
      
      let bookingId = 1;
      
      daysWithBookings.forEach(day => {
        // สร้าง 1-3 การจองต่อวัน
        const bookingCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < bookingCount; i++) {
          const bookingDate = dayjs().year(currentYear).month(currentMonth).date(day);
          const startHour = 9 + Math.floor(Math.random() * 8); // 9:00 - 16:00
          const duration = [30, 60, 90, 120][Math.floor(Math.random() * 4)]; // 30 นาที - 2 ชั่วโมง
          
          const startTime = bookingDate.hour(startHour).minute(0).second(0);
          const endTime = startTime.add(duration, 'minute');
          
          const statuses = ['pending', 'ongoing', 'completed', 'cancelled'];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          
          const models = ['D-MAX V-CROSS 4x4', 'MU-X THE ICONIC', 'D-MAX SPACECAB', 'MU-X PRESTIGE', 'D-MAX SINGLE CAB'];
          const model = models[Math.floor(Math.random() * models.length)];
          
          const customers = [
            'คุณสมชาย ใจดี', 'คุณสมหญิง รักดี', 'คุณประยุทธ์ มั่นคง', 
            'คุณนิภา ดีเลิศ', 'คุณวิชัย รุ่งเรือง', 'คุณมนทิรา สุขใจ',
            'คุณจิรายุ สงบใจ', 'คุณสุรชัย เก่งกาจ', 'คุณธนาคาร เจริญสุข'
          ];
          const customer = customers[Math.floor(Math.random() * customers.length)];
          
          const staffs = [
            'นายพิชิต สมบูรณ์', 'นายสมศักดิ์ ดีใจ', 'นายจิรายุ สงบใจ',
            'นายวิชัย รุ่งเรือง', 'นายสุรชัย เก่งกาจ', 'นายธนาคาร เจริญสุข'
          ];
          const staff = staffs[Math.floor(Math.random() * staffs.length)];
          
          sampleData.push({
            id: bookingId++,
            vehicleId: bookingId,
            status,
            customerName: customer,
            customerPhone: `08${Math.floor(Math.random() * 10)}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            testRoute: `เส้นทางทดสอบ ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
            distance: (Math.random() * 20 + 5).toFixed(1),
            duration,
            startTime: startTime.toISOString(),
            expectedEndTime: endTime.toISOString(),
            actualEndTime: status === 'completed' ? endTime.subtract(Math.floor(Math.random() * 10), 'minute').toISOString() : null,
            responsibleStaff: staff,
            responsibleStaffId: `staff-${Math.floor(Math.random() * 10) + 1}`,
            vehicleModel: model,
            createdAt: today.toISOString(),
            updatedAt: today.toISOString()
          });
        }
      });
      
      console.log('Generated sample data for days:', daysWithBookings);
      console.log('Total sample bookings:', sampleData.length);
      
      return sampleData;
    },
    
    // รีเฟรชข้อมูลการจอง
    refreshBookings() {
      this.fetchBookings();
    },
    
    // ตรวจสอบการเปลี่ยนรุ่นรถที่เลือก
    onModelChange() {
      console.log('เปลี่ยนรุ่นรถเป็น:', this.selectedModel);
    },
    
    // ตรวจสอบการเปลี่ยนสถานะที่เลือก
    onStatusChange() {
      console.log('เปลี่ยนสถานะเป็น:', this.selectedStatus);
    }
  },
  
  watch: {
    // ติดตามการเปลี่ยนแปลงของรุ่นรถที่เลือก
    selectedModel(newVal) {
      this.onModelChange()
    },
    
    // ติดตามการเปลี่ยนแปลงของสถานะที่เลือก
    selectedStatus(newVal) {
      this.onStatusChange()
    }
  },
  
  mounted() {
    // เพิ่ม Material Icons ถ้ายังไม่มี
    if (!document.querySelector('link[href*="googleapis.com/icon"]')) {
      const link = document.createElement('link');
      link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    
    // โหลดข้อมูลพนักงานก่อน
    this.fetchStaffData().then(() => {
      // โหลดข้อมูลการจอง
      return this.fetchBookings();
    }).then(() => {
      // Debug log เพื่อตรวจสอบข้อมูล
      console.log('=== DEBUG INFO ===');
      console.log('Total bookings:', this.bookings.length);
      console.log('Bookings by date:', this.bookingsByDate);
      console.log('Filtered bookings:', this.filteredBookings.length);
      
      // บังคับให้แน่ใจว่ามีข้อมูล (สำหรับทดสอบ)
      if (Object.keys(this.bookingsByDate).length === 0) {
        console.log('🔧 Force adding sample data...');
        this.bookings = this.generateSampleData();
        console.log('✅ Sample data regenerated:', this.bookings.length, 'items');
        console.log('✅ Updated bookingsByDate:', this.bookingsByDate);
      }
    }).catch((error) => {
      console.error('Error in mounted:', error);
      // หากเกิดข้อผิดพลาด ใช้ข้อมูลตัวอย่าง
      this.bookings = this.generateSampleData();
      console.log('🚨 Using fallback sample data:', this.bookings.length, 'items');
    });
  }
}
</script>

<style scoped>
.test-drive-calendar {
  width: 100%;
  max-width: 100%;
  position: relative;
  padding: 0 12px;
  min-height: 500px;
}

/* Filter Section */
.filter-section {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.car-select {
  flex: 1;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
}

.view-toggle {
  height: 40px;
  display: flex;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.view-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #fff;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn.active {
  background: #FEF2F2;
  color: #DA291C;
}

/* Month Navigator */
.month-navigator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.month-navigator h2 {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: calc(100% - 100px);
}

.nav-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.nav-btn:hover {
  background-color: #F3F4F6;
}

/* Calendar Views */
.calendar-views {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  overflow: hidden;
  margin-bottom: 16px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  margin-bottom: 16px;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(218, 41, 28, 0.2);
  border-radius: 50%;
  border-top-color: #DA291C;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 12px;
  margin-bottom: 16px;
  color: #DC2626;
}

.error-state .material-icons {
  font-size: 48px;
  margin-bottom: 12px;
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: #DC2626;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.retry-btn:hover {
  background: #B91C1C;
}

/* Status Legend */
.status-legend {
  display: flex;
  gap: 12px;
  padding: 8px 12px;
  background: #F9FAFB;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 12px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-dot.pending {
  background-color: #F59E0B;
}

.legend-dot.ongoing {
  background-color: #3B82F6;
}

.legend-dot.completed {
  background-color: #10B981;
}

.legend-dot.cancelled {
  background-color: #EF4444;
}

/* Bookings List */
.bookings-list {
  margin-top: 16px;
}

.bookings-list h3 {
  font-size: 16px;
  margin-bottom: 12px;
  padding: 0 4px;
  font-weight: 600;
  color: #374151;
}

.booking-item {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.booking-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.booking-header h4 {
  font-size: 15px;
  font-weight: 500;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 65%;
  color: #111827;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.pending {
  background-color: #FEF3C7;
  color: #D97706;
}

.status-badge.ongoing {
  background-color: #DBEAFE;
  color: #2563EB;
}

.status-badge.completed {
  background-color: #D1FAE5;
  color: #059669;
}

.status-badge.cancelled {
  background-color: #FEE2E2;
  color: #DC2626;
}

.booking-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6B7280;
  font-size: 13px;
}

.detail-item .material-icons {
  font-size: 18px;
  color: #9CA3AF;
}

/* Empty Bookings */
.empty-bookings {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #9CA3AF;
}

.empty-bookings .material-icons {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-bookings p {
  font-size: 15px;
}

/* Loading Items */
.loading-items {
  padding: 0 4px;
}

.skeleton-item {
  height: 80px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 10px;
  margin-bottom: 10px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Add Booking Button */
.add-booking-btn {
  position: fixed;
  bottom: 80px;
  right: 16px;
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background: #DA291C;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: 5;
}

.add-booking-btn:hover, 
.add-booking-btn:active {
  transform: scale(1.05);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.add-booking-btn .material-icons {
  font-size: 24px;
}

/* Material Icons */
.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}

/* Mobile Responsive */
@media screen and (max-width: 767px) {
  .test-drive-calendar {
    padding: 0 8px;
    min-height: 400px;
  }

  .filter-section {
    gap: 6px;
    margin-bottom: 12px;
  }

  .car-select {
    height: 34px;
    padding: 0 8px;
    font-size: 12px;
  }

  .view-toggle {
    height: 34px;
  }

  .view-btn {
    width: 34px;
    height: 34px;
  }

  .month-navigator {
    margin-bottom: 12px;
  }

  .month-navigator h2 {
    font-size: 15px;
    max-width: calc(100% - 80px);
  }

  .nav-btn {
    width: 30px;
    height: 30px;
  }

  .calendar-views {
    border-radius: 8px;
    font-size: 12px;
  }

  .add-booking-btn {
    bottom: 70px;
    right: 12px;
    width: 42px;
    height: 42px;
    border-radius: 21px;
  }
  
  .add-booking-btn .material-icons {
    font-size: 20px;
  }

  .status-legend {
    gap: 8px;
    padding: 6px 8px;
    font-size: 11px;
  }
  
  .legend-dot {
    width: 6px;
    height: 6px;
  }
}

</style>