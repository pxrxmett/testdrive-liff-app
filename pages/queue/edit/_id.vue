<template>
  <div class="booking-edit-page">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <button class="back-button" @click="goBack">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="header-text">
          <div class="brand">ISUZU</div>
          <div class="branch-info" v-if="userInfo">พนักงาน: {{ userInfo.name }} สาขา: {{ userInfo.branch }}</div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-container">
      <h1 class="page-title">แก้ไขข้อมูลการจอง</h1>

      <!-- Loading Indicator -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <!-- Error Message -->
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchBookingData" class="retry-button">ลองใหม่</button>
      </div>

      <!-- Booking Form -->
      <form v-else class="booking-form" @submit.prevent="updateBooking">
        <!-- Customer Name -->
        <div class="form-group">
          <label class="form-label">ชื่อลูกค้า</label>
          <input 
            type="text" 
            v-model="bookingData.customerName"
            placeholder="ชื่อลูกค้า"
            class="form-input"
            required
          >
        </div>

        <!-- Phone Number -->
        <div class="form-group">
          <label class="form-label">เบอร์โทรศัพท์</label>
          <input
            type="tel"
            v-model="bookingData.phone"
            placeholder="0XX-XXX-XXXX"
            class="form-input"
            required
          >
        </div>

        <!-- License Number -->
        <div class="form-group">
          <label class="form-label">เลขที่ใบขับขี่</label>
          <input
            type="text"
            v-model="bookingData.licenseNumber"
            placeholder="XX-XXXXXXX-XX"
            class="form-input"
            required
          >
        </div>

        <!-- Date Selection -->
        <div class="form-group">
          <label class="form-label">วันที่</label>
          <div class="date-input-wrapper">
            <input 
              type="date"
              v-model="bookingData.date"
              class="form-input"
              required
              @change="checkAvailableVehicles"
            >
          </div>
        </div>

        <!-- Time Selection -->
        <div class="form-group">
          <label class="form-label">เวลา</label>
          <div class="time-input-wrapper">
            <input 
              type="time" 
              v-model="bookingData.time"
              class="form-input"
              required
            >
          </div>
          <div class="time-info">เวลาทำการ 09:00 - 17:00</div>
        </div>

        <!-- Vehicle Selection -->
        <div class="form-group">
          <label class="form-label">รุ่นรถ</label>
          <div class="car-options">
            <div 
              v-for="vehicle in availableVehicles" 
              :key="vehicle.id"
              :class="['car-option', { 
                'selected': bookingData.vehicleId === vehicle.id
              }]"
              @click="selectVehicle(vehicle.id)"
            >
              <div class="radio-button">
                <div class="radio-inner" v-if="bookingData.vehicleId === vehicle.id"></div>
              </div>
              <div class="car-details">
                <div class="car-name">{{ vehicle.model }}</div>
                <div class="car-description">
                  {{ vehicle.color || 'ไม่ระบุสี' }} - {{ vehicle.vehicleCode }}
                </div>
              </div>
            </div>
          </div>
          <p v-if="availableVehicles.length === 0 && !isCheckingAvailability" class="no-cars-message">
            <span v-if="loading">กำลังโหลดข้อมูลรถ...</span>
            <span v-else>ไม่มีรถที่พร้อมใช้งานในขณะนี้</span>
            <br>
            <small>กรุณาตรวจสอบการเชื่อมต่อ API หรือลองรีเฟรชหน้านี้</small>
          </p>
        </div>

        <!-- Notes -->
        <div class="form-group">
          <label class="form-label">หมายเหตุ</label>
          <textarea
            v-model="bookingData.notes"
            placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
            class="form-input form-textarea"
            rows="4"
          ></textarea>
        </div>

        <!-- Status -->
        <div class="form-group">
          <label class="form-label">สถานะ</label>
          <select
            v-model="bookingData.status"
            class="form-input"
            @change="onStatusChange"
          >
            <option value="pending">รอดำเนินการ</option>
            <option value="ongoing">อยู่ระหว่างทดลองขับ</option>
            <option value="completed">เสร็จสิ้น</option>
            <option value="cancelled">ยกเลิก</option>
          </select>
        </div>

        <!-- Actual End Time (แสดงเมื่อสถานะเป็น completed) -->
        <div v-if="bookingData.status === 'completed'" class="form-group">
          <label class="form-label">เวลาสิ้นสุดจริง</label>
          <input 
            type="datetime-local" 
            v-model="bookingData.actualEndTime"
            class="form-input"
          >
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <!-- Send to Customer Signature Button -->
          <button
            type="button"
            class="signature-button"
            @click="sendToCustomerSignature"
            :disabled="isSubmitting || !bookingData.vehicleId"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            ส่งให้ลูกค้าเซ็น
          </button>

          <!-- Submit Button -->
          <button
            type="submit"
            class="submit-button"
            :disabled="isSubmitting || availableVehicles.length === 0"
          >
            {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { getTestDrive, getTestDrives, updateTestDrive, getVehicles, updateVehicleStatus, getStaff } from '~/utils/brandApi'

export default {
  name: 'EditBookingPage',
  
  data() {
    return {
      loading: true,
      error: null,
      bookingData: {
        customerName: '',
        phone: '',
        licenseNumber: '',
        date: '',
        time: '',
        vehicleId: null,
        notes: '',
        status: 'pending',
        actualEndTime: ''
      },
      originalBookingData: null,
      availableVehicles: [],
      allVehicles: [], // เก็บรถทั้งหมดจาก API
      staffList: [],
      isCheckingAvailability: false,
      isSubmitting: false,
      userInfo: null
    };
  },
  
  async fetch() {
    await this.fetchUserInfo();
    await this.fetchAllVehicles();
    await this.fetchBookingData();
  },
  
  methods: {
    async fetchUserInfo() {
      try {
        const userInfo = this.$store.state.auth?.user;
        
        if (!userInfo) {
          const response = await getStaff(this.$axios, this.$store.state.auth.userId);
          this.userInfo = {
            name: response.name || `${response.first_name || ''} ${response.last_name || ''}`.trim(),
            branch: response.department || 'สาขาหลัก'
          };
        } else {
          this.userInfo = {
            name: userInfo.name || `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim(),
            branch: userInfo.department || 'สาขาหลัก'
          };
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
        this.userInfo = { name: 'Admin', branch: 'สาขาหลัก' };
      }
    },

    async fetchAllVehicles() {
      try {
        console.log('กำลังดึงข้อมูลรถทั้งหมด...');
        
        // Use brand-scoped API to get vehicles
        console.log('Fetching vehicles from brand-scoped API...');
        const response = await getVehicles(this.$axios);
        console.log('Response from brand-scoped vehicles API:', response);
        
        console.log('Final response:', response);
        console.log('Response type:', typeof response);
        console.log('Is array:', Array.isArray(response));
        
        // จัดการ response ที่อาจมาในรูปแบบต่างๆ
        let vehicles = [];
        
        if (Array.isArray(response)) {
          vehicles = response;
          console.log('Response is direct array');
        } else if (response && Array.isArray(response.data)) {
          vehicles = response.data;
          console.log('Response has data property');
        } else if (response && Array.isArray(response.vehicles)) {
          vehicles = response.vehicles;
          console.log('Response has vehicles property');
        } else if (response && typeof response === 'object') {
          // ลองดูว่ามี property ไหนที่เป็น array
          const arrayProps = Object.keys(response).filter(key => Array.isArray(response[key]));
          console.log('Array properties found:', arrayProps);
          
          if (arrayProps.length > 0) {
            vehicles = response[arrayProps[0]];
            console.log(`Using property: ${arrayProps[0]}`);
          } else {
            console.log('No array properties found, response keys:', Object.keys(response));
          }
        }
        
        console.log('Processed vehicles:', vehicles);
        console.log('Number of vehicles:', vehicles.length);
        
        // ตรวจสอบโครงสร้างของรถคันแรก
        if (vehicles.length > 0) {
          console.log('First vehicle structure:', vehicles[0]);
          console.log('First vehicle keys:', Object.keys(vehicles[0]));
        }
        
        this.allVehicles = vehicles;
        
        // กรองเฉพาะรถที่สถานะเป็น available หรือ in_test
        this.availableVehicles = this.allVehicles.filter(vehicle => {
          console.log(`Vehicle ${vehicle.vehicleCode || vehicle.id}: Status = ${vehicle.status}`);
          return vehicle.status === 'available' || vehicle.status === 'in_test';
        });
        
        console.log('Available vehicles after filter:', this.availableVehicles.length, 'คัน');
        
        // ถ้าไม่มีรถที่พร้อมใช้ ให้แสดงรถทั้งหมด
        if (this.availableVehicles.length === 0 && this.allVehicles.length > 0) {
          console.log('No available vehicles found, showing all vehicles');
          this.availableVehicles = [...this.allVehicles];
        }
        
        // ถ้ายังไม่มีเลย ใช้ fallback data
        if (this.availableVehicles.length === 0) {
          console.log('No vehicles at all, using fallback data');
          this.allVehicles = [
            { 
              id: 1, 
              vehicleCode: 'D001', 
              model: 'D-MAX', 
              color: 'ขาว', 
              status: 'available' 
            },
            { 
              id: 2, 
              vehicleCode: 'M001', 
              model: 'MU-X', 
              color: 'เทา', 
              status: 'available' 
            },
            { 
              id: 3, 
              vehicleCode: 'V001', 
              model: 'V-CROSS', 
              color: 'ดำ', 
              status: 'available' 
            }
          ];
          this.availableVehicles = [...this.allVehicles];
        }
        
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        console.error('Error status:', err.response?.status);
        console.error('Error data:', err.response?.data);
        console.error('Error message:', err.message);
        
        // ใช้ข้อมูลตัวอย่างหากเรียก API ไม่ได้
        console.log('Using fallback vehicle data due to error');
        this.allVehicles = [
          { 
            id: 1, 
            vehicleCode: 'D001', 
            model: 'D-MAX', 
            color: 'ขาว', 
            status: 'available' 
          },
          { 
            id: 2, 
            vehicleCode: 'M001', 
            model: 'MU-X', 
            color: 'เทา', 
            status: 'available' 
          },
          { 
            id: 3, 
            vehicleCode: 'V001', 
            model: 'V-CROSS', 
            color: 'ดำ', 
            status: 'available' 
          }
        ];
        this.availableVehicles = [...this.allVehicles];
      }
    },

    fetchStaffList() {
      // ไม่ต้องดึงข้อมูลพนักงานแล้ว
      this.staffList = [];
    },
    
    async fetchBookingData() {
      this.loading = true;
      this.error = null;
      
      try {
        const bookingId = this.$route.params.id;
        const response = await getTestDrive(this.$axios, bookingId);
        
        console.log('ข้อมูลการจองจาก API:', response);
        
        this.originalBookingData = { ...response };
        
        // แปลงข้อมูลสำหรับแสดงในฟอร์ม
        this.bookingData = {
          customerName: response.customer_name || '',
          phone: this.formatPhone(response.customer_phone || ''),
          licenseNumber: response.customer_license_number || '',
          date: this.extractDate(response.start_time),
          time: this.extractTime(response.start_time),
          vehicleId: response.vehicle_id || null,
          notes: response.notes || '',
          status: response.status || 'pending',
          actualEndTime: response.actual_end_time ?
            this.formatDateTimeLocal(response.actual_end_time) : ''
        };
        
        console.log('ข้อมูลที่ใช้ในฟอร์ม:', this.bookingData);
        
        // ตรวจสอบรถที่ว่างในวันที่เลือก
        await this.checkAvailableVehicles();
        
      } catch (err) {
        console.error('Error fetching booking data:', err);
        this.error = 'ไม่สามารถดึงข้อมูลการจองได้ กรุณาลองใหม่อีกครั้ง';
      } finally {
        this.loading = false;
      }
    },

    extractDate(dateTimeString) {
      if (!dateTimeString) return '';
      try {
        const date = new Date(dateTimeString);
        return date.toISOString().split('T')[0];
      } catch {
        return '';
      }
    },
    
    extractTime(dateTimeString) {
      if (!dateTimeString) return '';
      try {
        const date = new Date(dateTimeString);
        return date.toTimeString().slice(0, 5);
      } catch {
        return '';
      }
    },

    formatDateTimeLocal(dateTimeString) {
      if (!dateTimeString) return '';
      try {
        const date = new Date(dateTimeString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      } catch {
        return '';
      }
    },
    
    formatPhone(phone) {
      if (!phone) return '';
      const cleaned = String(phone).replace(/\D/g, '');
      if (cleaned.length !== 10) return phone;
      
      const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
      }
      return phone;
    },
    
    async checkAvailableVehicles() {
      if (!this.bookingData.date) {
        // ถ้าไม่มีวันที่ ให้แสดงรถทั้งหมดที่สถานะ available
        this.availableVehicles = this.allVehicles.filter(vehicle => 
          vehicle.status === 'available' || vehicle.status === 'in_test'
        );
        return;
      }
      
      this.isCheckingAvailability = true;
      
      try {
        console.log('กำลังตรวจสอบรถที่ว่างในวันที่:', this.bookingData.date);
        
        const response = await getTestDrives(this.$axios, {
          date: this.bookingData.date
        });
        
        console.log('รายการจองในวันที่เลือก:', response);
        
        // ดึงรายการ vehicle_id ที่ถูกจองแล้ว
        let bookedVehicleIds = [];
        const currentBookingId = parseInt(this.$route.params.id);
        
        if (Array.isArray(response)) {
          bookedVehicleIds = response
            .filter(booking => booking.id !== currentBookingId) // ไม่นับการจองปัจจุบัน
            .map(booking => booking.vehicle_id)
            .filter(id => id); // กรองค่า null/undefined
        } else if (response && Array.isArray(response.data)) {
          bookedVehicleIds = response.data
            .filter(booking => booking.id !== currentBookingId)
            .map(booking => booking.vehicle_id)
            .filter(id => id);
        }
        
        console.log('รถที่ถูกจองแล้ว (vehicle_ids):', bookedVehicleIds);
        
        // กรองรถที่ยังว่าง
        this.availableVehicles = this.allVehicles.filter(vehicle => {
          // รถต้องมีสถานะ available หรือ in_test
          const statusOk = vehicle.status === 'available' || vehicle.status === 'in_test';
          // และต้องไม่ถูกจองแล้วในวันนี้
          const notBooked = !bookedVehicleIds.includes(vehicle.id);
          return statusOk && notBooked;
        });
        
        // เพิ่มรถที่กำลังแก้ไขอยู่เข้าไปในรายการ (เพื่อให้เลือกได้)
        if (this.bookingData.vehicleId && 
            !this.availableVehicles.find(v => v.id === this.bookingData.vehicleId)) {
          const currentVehicle = this.allVehicles.find(v => v.id === this.bookingData.vehicleId);
          if (currentVehicle) {
            this.availableVehicles.push(currentVehicle);
          }
        }
        
        console.log('รถที่พร้อมใช้:', this.availableVehicles.length, 'คัน');
        
      } catch (err) {
        console.error('Error checking available vehicles:', err);
        // หากมีข้อผิดพลาด ให้แสดงรถทั้งหมด
        this.availableVehicles = this.allVehicles.filter(vehicle => 
          vehicle.status === 'available' || vehicle.status === 'in_test'
        );
      } finally {
        this.isCheckingAvailability = false;
      }
    },
    
    selectVehicle(vehicleId) {
      this.bookingData.vehicleId = vehicleId;
      console.log('เลือกรถ ID:', vehicleId);
    },

    getStatusText(status) {
      const statusMap = {
        'available': 'ว่าง',
        'unavailable': 'ไม่ว่าง',
        'in_test': 'ทดลองขับ'
      };
      return statusMap[status] || status;
    },

    onStatusChange() {
      // ถ้าเปลี่ยนเป็น completed ให้ตั้งเวลาสิ้นสุดจริงเป็นเวลาปัจจุบัน
      if (this.bookingData.status === 'completed' && !this.bookingData.actualEndTime) {
        const now = new Date();
        this.bookingData.actualEndTime = this.formatDateTimeLocal(now.toISOString());
      }
    },
    
    validateForm() {
      if (!this.bookingData.customerName.trim()) {
        alert('กรุณากรอกชื่อลูกค้า');
        return false;
      }

      if (!this.bookingData.phone.trim()) {
        alert('กรุณากรอกเบอร์โทรศัพท์');
        return false;
      }

      if (!this.bookingData.licenseNumber.trim()) {
        alert('กรุณากรอกเลขที่ใบขับขี่');
        return false;
      }

      if (!this.bookingData.date) {
        alert('กรุณาเลือกวันที่');
        return false;
      }

      if (!this.bookingData.time) {
        alert('กรุณาเลือกเวลา');
        return false;
      }

      if (!this.bookingData.vehicleId) {
        alert('กรุณาเลือกรถ');
        return false;
      }

      return true;
    },

    async sendToCustomerSignature() {
      // Validate form first
      if (!this.validateForm()) {
        return;
      }

      try {
        // Save the booking first
        this.isSubmitting = true;
        const bookingId = this.$route.params.id;

        // แปลงวันที่และเวลา
        const dateParts = this.bookingData.date.split('-');
        const timeParts = this.bookingData.time.split(':');

        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1;
        const day = parseInt(dateParts[2]);
        const hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);

        const startDateTime = new Date(year, month, day, hours, minutes);
        const endDateTime = new Date(startDateTime.getTime() + (60 * 60 * 1000));

        const apiUpdateData = {
          customer_name: this.bookingData.customerName.trim(),
          customer_phone: this.bookingData.phone.replace(/[-\s]/g, ''),
          customer_license_number: this.bookingData.licenseNumber.trim(),
          vehicle_id: parseInt(this.bookingData.vehicleId),
          start_time: startDateTime.toISOString(),
          expected_end_time: endDateTime.toISOString(),
          notes: this.bookingData.notes || '',
          status: this.bookingData.status
        };

        console.log('บันทึกข้อมูลก่อนส่งให้ลูกค้าเซ็น:', apiUpdateData);

        await updateTestDrive(this.$axios, bookingId, apiUpdateData);

        // Redirect to signature page
        this.$router.push(`/queue/signature/${bookingId}`);

      } catch (err) {
        console.error('Error saving before signature:', err);
        alert('ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่');
      } finally {
        this.isSubmitting = false;
      }
    },
    
    async updateBooking() {
      if (this.isSubmitting) return;
      
      if (!this.validateForm()) {
        return;
      }
      
      this.isSubmitting = true;
      
      try {
        const bookingId = this.$route.params.id;
        
        // แปลงวันที่และเวลาให้เป็นรูปแบบ ISO String
        const dateParts = this.bookingData.date.split('-');
        const timeParts = this.bookingData.time.split(':');
        
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1;
        const day = parseInt(dateParts[2]);
        const hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);
        
        const startDateTime = new Date(year, month, day, hours, minutes);
        const endDateTime = new Date(startDateTime.getTime() + (60 * 60 * 1000)); // เพิ่ม 1 ชั่วโมง
        
        const apiUpdateData = {
          customer_name: this.bookingData.customerName.trim(),
          customer_phone: this.bookingData.phone.replace(/[-\s]/g, ''),
          customer_license_number: this.bookingData.licenseNumber.trim(),
          vehicle_id: parseInt(this.bookingData.vehicleId),
          start_time: startDateTime.toISOString(),
          expected_end_time: endDateTime.toISOString(),
          notes: this.bookingData.notes || '',
          actual_end_time: this.bookingData.actualEndTime ?
            new Date(this.bookingData.actualEndTime).toISOString() : null,
          status: this.bookingData.status
        };
        
        console.log('ข้อมูลที่จะส่งไปอัพเดต:', apiUpdateData);
        
        const response = await updateTestDrive(this.$axios, bookingId, apiUpdateData);

        console.log('ผลการอัพเดตข้อมูล:', response);
        
        // อัพเดตสถานะรถ
        await this.updateVehicleStatus();
        
        alert('แก้ไขข้อมูลการจองเรียบร้อยแล้ว');
        this.$router.push('/queue');
        
      } catch (err) {
        console.error('Error updating booking:', err);
        
        if (err.response) {
          console.error('API error response:', err.response.data);
        }
        
        alert('ไม่สามารถแก้ไขข้อมูลการจองได้ กรุณาลองใหม่อีกครั้ง');
        
        this.error = err.response?.data?.message || 
                    'ไม่สามารถแก้ไขข้อมูลการจองได้ กรุณาลองใหม่อีกครั้ง';
      } finally {
        this.isSubmitting = false;
      }
    },

    async updateVehicleStatus() {
      try {
        let vehicleStatus = 'available';
        
        if (this.bookingData.status === 'ongoing') {
          vehicleStatus = 'in_test';
        } else if (this.bookingData.status === 'completed' || this.bookingData.status === 'cancelled') {
          vehicleStatus = 'available';
        }
        
        await updateVehicleStatus(this.$axios, this.bookingData.vehicleId, vehicleStatus);
        
        console.log(`อัพเดตสถานะรถ ${this.bookingData.vehicleId} เป็น ${vehicleStatus}`);
        
      } catch (err) {
        console.error('Error updating vehicle status:', err);
      }
    },
    
    goBack() {
      this.$router.back();
    }
  }
};
</script>

<style scoped>
/* Isuzu Brand Colors */
:root {
  --isuzu-red: #E30613;
  --isuzu-gray-dark: #2D2D2D;
  --isuzu-gray-light: #F5F5F5;
  --success: #27AE60;
  --warning: #F39C12;
}

/* Base styles */
.booking-edit-page {
  font-family: system-ui, -apple-system, sans-serif;
  background-color: #F5F5F5;
  height: 100%;
  min-height: 100vh;
}

/* Header */
.header {
  background-color: #E30613;
  color: white;
  padding: 1rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
}

.icon {
  width: 24px;
  height: 24px;
  stroke: currentColor;
  stroke-width: 2;
}

.header-text {
  flex: 1;
}

.brand {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.branch-info {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Main Container */
.main-container {
  padding: 1rem 1rem 6rem 1rem; /* เพิ่ม padding-bottom เพื่อหลีกเลี่ยง nav bar */
  max-width: 430px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #111827;
}

/* Form Styles */
.booking-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  color: #111827;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #E30613;
  box-shadow: 0 0 0 2px rgba(227, 6, 19, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.time-info {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

/* Car Selection */
.car-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.car-option {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.car-option.selected {
  border-color: #E30613;
  background-color: #fef2f2;
}

.radio-button {
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;
}

.car-option.selected .radio-button {
  border-color: #E30613;
}

.radio-inner {
  width: 0.75rem;
  height: 0.75rem;
  background-color: #E30613;
  border-radius: 50%;
}

.car-details {
  flex: 1;
}

.car-name {
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.25rem;
}

.car-description {
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.available {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.in_test {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.unavailable {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
  margin-bottom: 2rem;
}

.signature-button {
  width: 100%;
  padding: 1rem;
  background-color: #27AE60;
  color: white;
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

.signature-button:hover:not(:disabled) {
  background-color: #229954;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.signature-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
  opacity: 0.6;
}

.signature-button .icon {
  width: 20px;
  height: 20px;
}

/* Submit Button */
.submit-button {
  width: 100%;
  padding: 1rem;
  background-color: #E30613;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #c10510;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.submit-button:disabled {
  background-color: #f87171;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Time and Date Input Wrappers */
.time-input-wrapper,
.date-input-wrapper {
  position: relative;
  width: 100%;
}

input[type="time"],
input[type="date"] {
  appearance: none;
  -webkit-appearance: none;
  background-color: white;
}

/* Loading Styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(220, 38, 38, 0.1);
  border-radius: 50%;
  border-top-color: #dc2626;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Styles */
.error-message {
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
  color: #991b1b;
  text-align: center;
  margin-bottom: 1.5rem;
}

.retry-button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #b91c1c;
}

.no-cars-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
  padding: 1rem;
  background-color: #fef2f2;
  border-radius: 0.5rem;
  border: 1px solid #fee2e2;
}

/* Mobile Responsiveness */
@media (max-width: 480px) {
  .main-container {
    padding: 0.5rem 0.5rem 7rem 0.5rem; /* เพิ่ม padding-bottom มากขึ้นในมือถือ */
  }
  
  .booking-form {
    gap: 1rem;
  }
  
  .form-input {
    font-size: 16px; /* ป้องกัน zoom ใน iOS */
  }
  
  .car-option {
    padding: 0.75rem;
  }
  
  .header-content {
    padding: 0 0.5rem;
  }
  
  .submit-button {
    margin-bottom: 3rem; /* เพิ่ม margin-bottom มากขึ้นในมือถือ */
  }
}

/* Additional mobile optimizations */
@media (max-width: 375px) {
  .page-title {
    font-size: 1.125rem;
  }
  
  .car-name {
    font-size: 0.875rem;
  }
  
  .car-description {
    font-size: 0.75rem;
  }
}
</style>