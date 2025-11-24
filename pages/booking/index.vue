<template>
  <div class="add-queue">
    <!-- ส่วนหัว -->
    <div class="background-shadow">
      <div class="button-margin" @click="$router.back()">
        <svg class="img" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </div>

      <div class="heading">
        <div class="text-wrapper">จองคิวรถทดสอบ</div>
      </div>
    </div>

    <div class="container">
      <!-- ส่วนแท็บ -->
      <div class="background">
        <button class="button" :class="{ active: activeTab === 'phone' }" @click="setActiveTab('phone')">
          <svg class="SVG" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <div class="div">จองทางโทรศัพท์</div>
        </button>

        <button class="button-2" :class="{ active: activeTab === 'walkin' }" @click="setActiveTab('walkin')">
          <svg class="SVG" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <div class="text-wrapper-2">Walk-in</div>
        </button>
      </div>

      <div class="container-wrapper">
        <div class="container-2">
          <!-- ฟอร์มจองทางโทรศัพท์ -->
          <div v-if="activeTab === 'phone'">
            <!-- ส่วนแสดงข้อมูลพนักงาน -->
            <div class="background-2">
              <div class="div-wrapper">
                <div class="text-wrapper-3">ผู้สร้างคำขอ</div>
              </div>

              <div class="container-3">
                <svg class="SVG-2" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <div class="container-4">
                  <div class="text-wrapper-4">{{ staffInfo.name }}</div>
                </div>
                <div class="container-5">
                  <div class="text-wrapper-5">({{ staffInfo.position }})</div>
                </div>
              </div>
            </div>

            <div class="container-6">
              <div class="container-7">
                <div class="div-wrapper">
                  <div class="text-wrapper-6">รุ่นรถที่ต้องการทดสอบ</div>
                  <div v-if="checkingAvailability" class="availability-checking">
                    กำลังตรวจสอบความพร้อมของรถ...
                  </div>
                </div>

                <select v-model="phoneForm.carModel" class="options">
                  <option value="" class="text-wrapper-7">เลือกรุ่นรถ</option>
                  <option
                    v-for="car in carModels"
                    :key="car.id"
                    :value="car.id"
                    :disabled="unavailableVehicleIds.includes(car.id)"
                    class="text-wrapper-7">
                    {{ car.name }}{{ unavailableVehicleIds.includes(car.id) ? ' (ไม่ว่าง)' : '' }}
                  </option>
                </select>
                <div v-if="unavailableVehicleIds.length > 0" class="availability-info">
                  ⚠️ มีรถ {{ unavailableVehicleIds.length }} คันที่ไม่ว่างในช่วงเวลานี้
                </div>
              </div>

              <div class="container-7">
                <div class="div-wrapper">
                  <div class="text-wrapper-6">วันที่ต้องการทดสอบ</div>
                </div>

                <input type="date" v-model="phoneForm.date" class="input" :min="minBookingDate">
              </div>

              <div class="container-7">
                <div class="div-wrapper">
                  <div class="text-wrapper-6">เวลาที่ต้องการทดสอบ</div>
                </div>

                <select v-model="phoneForm.time" class="options">
                  <option v-for="timeSlot in timeSlots" :key="timeSlot" :value="timeSlot">
                    {{ timeSlot }} น.
                  </option>
                </select>
              </div>

              <div class="container-7">
                <div class="div-wrapper">
                  <div class="text-wrapper-6">ชื่อ-นามสกุล ลูกค้า</div>
                </div>

                <input type="text" v-model="phoneForm.customerName" placeholder="ระบุชื่อ-นามสกุล" class="input-2">
              </div>

              <div class="container-7">
                <div class="div-wrapper">
                  <div class="text-wrapper-6">เบอร์โทรติดต่อ</div>
                </div>

                <input type="tel" v-model="phoneForm.phone" placeholder="ระบุเบอร์โทร" class="input-2"
                       :class="{'error': phoneValidationError && phoneForm.phone}">
                <div v-if="phoneValidationError && phoneForm.phone" class="error-message">
                  กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (เช่น 0812345678)
                </div>
              </div>

              <!-- ✅ เพิ่มช่อง Notes -->
              <div class="container-7">
                <div class="div-wrapper">
                  <div class="text-wrapper-6">หมายเหตุ (ถ้ามี)</div>
                </div>

                <textarea v-model="phoneForm.notes" placeholder="ระบุข้อมูลเพิ่มเติม" class="input-2 textarea-notes" rows="3"></textarea>
              </div>
            </div>

            <button class="button-3" @click="submitBooking('phone')" :disabled="isSubmitting">
              <div class="text-wrapper-11">{{ isSubmitting ? 'กำลังบันทึก...' : 'สร้างคำขอจองรถทดสอบ' }}</div>
            </button>
          </div>

          <!-- ฟอร์มจอง Walk-in -->
          <div v-if="activeTab === 'walkin'">
            <div class="scan-buttons">
              <button class="scan-qr-button" @click="openQRModal">
                <svg class="scan-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>สแกน QR Code</span>
              </button>
              <button class="scan-id-button" @click="openLicenseScannerModal">
                <svg class="scan-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                  <path d="M8 15h2"></path>
                  <path d="M14 15h2"></path>
                </svg>
                <span>สแกนใบขับขี่</span>
              </button>
            </div>

            <div class="background-2">
              <div class="div-wrapper">
                <div class="text-wrapper-3">ผู้สร้างคำขอ</div>
              </div>

              <div class="container-3">
                <svg class="SVG-2" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <div class="container-4">
                  <div class="text-wrapper-4">{{ staffInfo.name }}</div>
                </div>
                <div class="container-5">
                  <div class="text-wrapper-5">({{ staffInfo.position }})</div>
                </div>
              </div>
            </div>

            <div class="container-6">
              <div class="container-7">
                <div class="div-wrapper">
                  <div class="text-wrapper-6">รุ่นรถที่ต้องการทดสอบ</div>
                  <div v-if="checkingAvailability" class="availability-checking">
                    กำลังตรวจสอบความพร้อมของรถ...
                  </div>
                </div>

                <select v-model="walkinForm.carModel" class="options">
                  <option value="" class="text-wrapper-7">เลือกรุ่นรถ</option>
                  <option
                    v-for="car in carModels"
                    :key="car.id"
                    :value="car.id"
                    :disabled="unavailableVehicleIds.includes(car.id)"
                    class="text-wrapper-7">
                    {{ car.name }}{{ unavailableVehicleIds.includes(car.id) ? ' (ไม่ว่าง)' : '' }}
                  </option>
                </select>
                <div v-if="unavailableVehicleIds.length > 0" class="availability-info">
                  ⚠️ มีรถ {{ unavailableVehicleIds.length }} คันที่ไม่ว่างในช่วงเวลานี้
                </div>
              </div>

              <div class="container-7">
                <div class="div-wrapper">
                  <div class="text-wrapper-6">วันที่ต้องการทดสอบ</div>
                </div>

                <input type="date" v-model="walkinForm.date" class="input" :min="minBookingDate">
              </div>

              <div class="container-7">
                <div class="div-wrapper">
                  <div class="text-wrapper-6">เวลาที่ต้องการทดสอบ</div>
                </div>

                <select v-model="walkinForm.time" class="options">
                  <option v-for="timeSlot in timeSlots" :key="timeSlot" :value="timeSlot">
                    {{ timeSlot }} น.
                  </option>
                </select>
              </div>

              <div class="container-7">
                <div class="div-wrapper">
                  <div class="text-wrapper-6">ชื่อ-นามสกุล ลูกค้า</div>
                </div>

                <input type="text" v-model="walkinForm.customerName" placeholder="ข้อมูลจากการสแกนใบขับขี่" 
                       :class="{'input-2': true, 'scanned-data': isDataScanned}">
                <div v-if="isDataScanned" class="scanned-badge">
                  <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                  <span>ข้อมูลจากการสแกน</span>
                </div>
              </div>

              <div v-if="isDataScanned" class="container-7">
                <div class="div-wrapper">
                  <div class="text-wrapper-6">เลขใบขับขี่</div>
                </div>
                <input type="text" v-model="walkinForm.idNumber" class="input-2 scanned-data" readonly>
                <div class="scanned-badge">
                  <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                  <span>ข้อมูลจากการสแกน</span>
                </div>
              </div>
              
              <div v-if="isDataScanned && walkinForm.expireDate" class="container-7">
                <div class="div-wrapper">
                  <div class="text-wrapper-6">วันหมดอายุใบขับขี่</div>
                </div>
                <input type="text" v-model="walkinForm.expireDate" class="input-2 scanned-data" readonly>
                <div class="scanned-badge">
                  <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                  <span>ข้อมูลจากการสแกน</span>
                </div>
              </div>

              <!-- ✅ เพิ่มช่อง Notes สำหรับ Walk-in -->
              <div class="container-7">
                <div class="div-wrapper">
                  <div class="text-wrapper-6">หมายเหตุ (ถ้ามี)</div>
                </div>

                <textarea v-model="walkinForm.notes" placeholder="ระบุข้อมูลเพิ่มเติม" class="input-2 textarea-notes" rows="3"></textarea>
              </div>
            </div>

            <button class="button-3" @click="submitBooking('walkin')" :disabled="isSubmitting">
              <div class="text-wrapper-11">{{ isSubmitting ? 'กำลังบันทึก...' : 'สร้างคำขอจองรถทดสอบ' }}</div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ใช้คอมโพเนนต์ BottomNav -->
    <BottomNav :active-page="'booking'" />

    <!-- โมดัลสแกน QR Code -->
    <div class="modal" :class="{ open: isQRModalOpen }">
      <div class="modal-content">
        <div class="modal-header">
          <h2>สแกน QR Code</h2>
          <button class="close-modal" @click="closeQRModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="scanner-placeholder">
            <svg class="scanner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <p class="scan-instruction">กดปุ่มด้านล่างเพื่อเปิดกล้องสำหรับสแกน QR Code</p>
            <button class="scan-start-btn" @click="scanWithLIFF">สแกนด้วย LINE</button>
          </div>
        </div>
      </div>
    </div>

    <!-- โมดัลสแกนใบขับขี่ (ใช้คอมโพเนนต์ใหม่) -->
    <LicenseScannerModal 
      :is-open="isLicenseScannerOpen" 
      @close="closeLicenseScannerModal"
      @scan-success="handleLicenseScanSuccess"
    />
    
    <!-- Loading Overlay -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="loading-spinner"></div>
      <p class="loading-text">กำลังโหลด...</p>
    </div>
  </div>
</template>

ทีนี้เราได้เห็นข้อความ error ที่ชัดเจนแล้ว! ข้อผิดพลาดหลักมี 2 ประการ:

1. `responsible_staff must be a number conforming to the specified constraints` - ต้องเป็นตัวเลข
2. `status must be one of the following values: PENDING, ONGOING, COMPLETED, CANCELLED` - ต้องเป็นตัวพิมพ์ใหญ่

ขอแก้ไขโค้ดให้ถูกต้องตามข้อความ error ที่ได้รับมาครับ:

```javascript
<script>
import LicenseScannerModal from './LicenseScannerModal.vue'
import BottomNav from '~/components/common/BottomNav.vue'
import { getAvailableVehicles, createTestDrive, getTestDrives, getBrandCode } from '~/utils/brandApi'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// ✅ FIX: Enable timezone support
dayjs.extend(utc)
dayjs.extend(timezone)

export default {
  name: "BookingPage",
  layout: 'default',
  components: {
    BottomNav,
    LicenseScannerModal
  },
  head() {
    return {
      title: 'จองคิวรถทดสอบ - ISUZU Test Drive',
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap' }
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { hid: 'description', name: 'description', content: 'จองคิวรถทดสอบขับของ ISUZU ได้อย่างสะดวกผ่านแอพพลิเคชัน' }
      ]
    }
  },
  data() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // รูปแบบ YYYY-MM-DD
    
    return {
      activeTab: 'phone',
      isQRModalOpen: false,
      isLicenseScannerOpen: false,
      isLoading: false,
      isSubmitting: false,
      isDataScanned: false,
      phoneValidationError: false,
      checkingAvailability: false,
      unavailableVehicleIds: [], // รถที่ไม่ว่างในช่วงเวลาที่เลือก
      // เวลาทำการ
      businessHours: {
        start: 9, // 9:00
        end: 17   // 17:00
      },
      timeSlots: [], // จะถูกสร้างใน created()
      staffInfo: {
        id: '',
        name: 'สมชาย ใจดี',
        position: 'พนักงานขาย'
      },
      // กำหนดค่าเริ่มต้นเพื่อให้มั่นใจว่ามีข้อมูลแสดงก่อนเรียก API
      carModels: [
        { id: 'dmax-vcross', name: 'ISUZU D-MAX V-Cross' },
        { id: 'mu-x', name: 'ISUZU MU-X' },
        { id: 'dmax-hiLander', name: 'ISUZU D-MAX Hi-Lander' },
        { id: 'dmax-spark', name: 'ISUZU D-MAX Spark' }
      ],
      phoneForm: {
        carModel: '',
        date: formattedDate, // ใช้วันที่ปัจจุบัน
        time: '', // จะถูกกำหนดค่าเริ่มต้นใน created()
        customerName: '',
        phone: '',
        notes: '' // ✅ เพิ่มช่อง notes
      },
      walkinForm: {
        carModel: '',
        date: formattedDate,
        time: '', // จะถูกกำหนดค่าเริ่มต้นใน created()
        customerName: '',
        idNumber: '',
        idType: 'drivingLicense',
        expireDate: '',
        notes: '' // ✅ เพิ่มช่อง notes
      },
      apiErrorMessages: [] // เพิ่มตัวแปรสำหรับเก็บข้อความแสดงข้อผิดพลาดจาก API
    }
  },
  computed: {
    minBookingDate() {
      // วันที่ต่ำสุดที่อนุญาตให้จอง - วันนี้
      const today = new Date();
      return today.toISOString().split('T')[0];
    }
  },
  watch: {
    // ตรวจสอบความพร้อมของรถเมื่อเลือกวันที่ (ฟอร์มโทรศัพท์)
    'phoneForm.date'(newDate) {
      if (newDate && this.phoneForm.time) {
        this.checkVehicleAvailability(newDate, this.phoneForm.time);
      }
    },
    // ตรวจสอบความพร้อมของรถเมื่อเลือกเวลา (ฟอร์มโทรศัพท์)
    'phoneForm.time'(newTime) {
      if (newTime && this.phoneForm.date) {
        this.checkVehicleAvailability(this.phoneForm.date, newTime);
      }
    },
    // ตรวจสอบความพร้อมของรถเมื่อเลือกวันที่ (ฟอร์ม Walk-in)
    'walkinForm.date'(newDate) {
      if (newDate && this.walkinForm.time) {
        this.checkVehicleAvailability(newDate, this.walkinForm.time);
      }
    },
    // ตรวจสอบความพร้อมของรถเมื่อเลือกเวลา (ฟอร์ม Walk-in)
    'walkinForm.time'(newTime) {
      if (newTime && this.walkinForm.date) {
        this.checkVehicleAvailability(this.walkinForm.date, newTime);
      }
    }
  },
  async created() {
    try {
      this.isLoading = true;
      
      // สร้างช่วงเวลาทำการสำหรับการจอง (ทุก 1 ชั่วโมง)
      this.generateTimeSlots();
      
      // กำหนดค่าเริ่มต้นสำหรับเวลา
      this.setDefaultTime();
      
      // ทำงานพร้อมกันเพื่อประหยัดเวลา
      await Promise.all([
        this.getUserProfile(),
        this.fetchCarModels()
      ]);
    } catch (error) {
      console.error('Error initializing page:', error);
      if (this.$store && this.$store.state.notifications) {
        this.$store.dispatch('notifications/add', {
          type: 'error',
          message: error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง'
        });
      } else {
        alert(error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    // สร้างช่วงเวลาทำการสำหรับการจอง (ทุก 1 ชั่วโมง)
    generateTimeSlots() {
      this.timeSlots = [];
      
      // สร้างช่วงเวลาตามเวลาทำการ โดยเพิ่มทีละ 1 ชั่วโมง
      for (let hour = this.businessHours.start; hour < this.businessHours.end; hour++) {
        const formattedHour = hour.toString().padStart(2, '0');
        this.timeSlots.push(`${formattedHour}:00`);
      }
    },
    
    // กำหนดค่าเริ่มต้นสำหรับเวลา
    setDefaultTime() {
      const now = new Date();
      const currentHour = now.getHours();

      // ค้นหาช่วงเวลาที่ใกล้ที่สุดในเวลาทำการ
      let defaultTimeSlot = this.timeSlots[0]; // เริ่มต้นด้วยช่วงเวลาแรก

      // ถ้าเวลาปัจจุบันอยู่ในช่วงเวลาทำการ
      if (currentHour >= this.businessHours.start && currentHour < this.businessHours.end) {
        // เลือกช่วงเวลาถัดไปจากเวลาปัจจุบัน
        const nextHourSlot = `${(currentHour + 1).toString().padStart(2, '0')}:00`;

        // ตรวจสอบว่าช่วงเวลาถัดไปยังอยู่ในเวลาทำการหรือไม่
        if (currentHour + 1 < this.businessHours.end) {
          defaultTimeSlot = nextHourSlot;
        }
      }

      // กำหนดค่าเริ่มต้นสำหรับเวลา
      this.phoneForm.time = defaultTimeSlot;
      this.walkinForm.time = defaultTimeSlot;
    },

    // ตรวจสอบความพร้อมของรถในช่วงเวลาที่เลือก
    async checkVehicleAvailability(date, time) {
      try {
        this.checkingAvailability = true;

        // สร้างช่วงเวลาที่ต้องการตรวจสอบ
        const [hour, minute] = time.split(':').map(Number);
        const selectedStartTime = new Date(`${date}T${time}:00.000Z`);
        const selectedEndTime = new Date(selectedStartTime);
        selectedEndTime.setHours(selectedEndTime.getHours() + 1); // เพิ่ม 1 ชั่วโมง

        console.log('🔍 Checking vehicle availability for:', {
          date,
          time,
          startTime: selectedStartTime.toISOString(),
          endTime: selectedEndTime.toISOString()
        });

        // ✅ FIX: ดึงรายการจองทั้งหมดในวันที่เลือก (ไม่ filter status ที่ API เพราะ API ไม่ support)
        const allBookings = await getTestDrives(this.$axios, {
          start_date: date,
          end_date: date
        });

        // ✅ FIX: Filter เฉพาะรายการที่ยังไม่เสร็จสิ้นฝั่ง client แทน
        const bookings = allBookings.filter(booking => {
          const status = (booking.status || '').toUpperCase();
          return status === 'PENDING' || status === 'ONGOING';
        });

        console.log('📋 Found bookings:', bookings.length, '(filtered from', allBookings.length, 'total)');

        // หารถที่ไม่ว่างในช่วงเวลาที่เลือก
        const unavailableIds = new Set();

        bookings.forEach(booking => {
          if (!booking.start_time || !booking.vehicle_id) return;

          // แปลงเวลาจองเป็น Date object
          const bookingStart = new Date(booking.start_time);
          const bookingEnd = booking.expected_end_time
            ? new Date(booking.expected_end_time)
            : new Date(bookingStart.getTime() + 60 * 60 * 1000); // default +1 hour

          // ตรวจสอบว่าช่วงเวลาทับซ้อนกันหรือไม่
          const isOverlapping = (
            (selectedStartTime >= bookingStart && selectedStartTime < bookingEnd) || // เริ่มในช่วงที่มีการจอง
            (selectedEndTime > bookingStart && selectedEndTime <= bookingEnd) ||     // สิ้นสุดในช่วงที่มีการจอง
            (selectedStartTime <= bookingStart && selectedEndTime >= bookingEnd)     // ครอบคลุมช่วงที่มีการจอง
          );

          if (isOverlapping) {
            unavailableIds.add(booking.vehicle_id);
            console.log('❌ Vehicle unavailable:', {
              vehicleId: booking.vehicle_id,
              bookingTime: `${bookingStart.toISOString()} - ${bookingEnd.toISOString()}`,
              customerName: booking.customer_name || booking.customerName
            });
          }
        });

        // อัพเดทรายการรถที่ไม่ว่าง
        this.unavailableVehicleIds = Array.from(unavailableIds);

        console.log('✅ Availability check complete:', {
          unavailableVehicles: this.unavailableVehicleIds.length,
          vehicleIds: this.unavailableVehicleIds
        });

      } catch (error) {
        console.error('Error checking vehicle availability:', error);
        // ไม่แสดง error ให้ user เพื่อไม่ให้รบกวนประสบการณ์การใช้งาน
        this.unavailableVehicleIds = [];
      } finally {
        this.checkingAvailability = false;
      }
    },
    
    // ฟังก์ชันสำหรับตั้งค่าแท็บที่เลือก
    setActiveTab(tab) {
      this.activeTab = tab;
      // รีเซ็ตข้อความแจ้งเตือนเมื่อเปลี่ยนแท็บ
      this.phoneValidationError = false;
      // รีเซ็ตข้อความแสดงข้อผิดพลาดจาก API
      this.apiErrorMessages = [];
    },
    
    async getUserProfile() {
      try {
        // เริ่มต้นจากการเช็คว่ามี LIFF SDK หรือไม่
        if (window.liff && window.liff.isLoggedIn && window.liff.isLoggedIn()) {
          const profile = await window.liff.getProfile();
          this.staffInfo = {
            id: profile.userId,
            name: profile.displayName,
            position: 'พนักงานขาย', // ค่าเริ่มต้น
          };
          
          // ตรวจสอบว่าเป็นพนักงานหรือไม่
          if (this.$axios) {
            try {
              const checkResponse = await this.$axios.$post('/line-integration/check', { 
                lineUserId: profile.userId 
              });
              
              if (checkResponse?.registered && checkResponse?.staffInfo?.id) {
                const staffInfo = checkResponse.staffInfo;
                // ✅ FIX: Prioritize real staff name (first_name + last_name) BEFORE LINE displayName
                const realName = `${staffInfo.first_name || ''} ${staffInfo.last_name || ''}`.trim();
                this.staffInfo = {
                  id: staffInfo.id,
                  name: realName || staffInfo.name || staffInfo.displayName || 'พนักงาน',
                  position: staffInfo.position || 'พนักงานขาย'
                };
                
                // บันทึกข้อมูลใน store
                if (this.$store && this.$store.dispatch) {
                  try {
                    // ตรวจสอบว่ามี action auth/setUser หรือไม่
                    if (this.$store._actions && this.$store._actions['auth/setUser']) {
                      await this.$store.dispatch('auth/setUser', this.staffInfo);
                    } else {
                      console.warn('Action auth/setUser not found, storing in localStorage instead');
                      localStorage.setItem('currentStaff', JSON.stringify(this.staffInfo));
                    }
                  } catch (err) {
                    console.warn('Error dispatching auth/setUser:', err);
                    localStorage.setItem('currentStaff', JSON.stringify(this.staffInfo));
                  }
                }
              }
            } catch (err) {
              console.error('Error checking staff from LINE ID:', err);
            }
          }
          
          // บันทึกข้อมูล LINE Profile ไว้ใน localStorage
          localStorage.setItem('lineProfile', JSON.stringify(profile));
          
          return;
        }
        
        // ถ้าไม่มี LIFF หรือยังไม่ได้ล็อกอิน ให้ตรวจสอบใน store ก่อน
        if (this.$store && this.$store.state.auth?.user?.id) {
          this.staffInfo = {
            id: this.$store.state.auth.user.id,
            name: this.$store.state.auth.user.name || `${this.$store.state.auth.user.first_name || ''} ${this.$store.state.auth.user.last_name || ''}`.trim(),
            position: this.$store.state.auth.user.position || 'พนักงานขาย'
          };
          return;
        }
        
        // ถ้ายังไม่มีข้อมูลให้ตรวจสอบใน localStorage
        if (window.localStorage) {
          const lineProfileStr = localStorage.getItem('lineProfile');
          if (lineProfileStr) {
            try {
              const lineProfile = JSON.parse(lineProfileStr);
              this.staffInfo.name = lineProfile.displayName || this.staffInfo.name;
              this.staffInfo.id = lineProfile.userId || this.staffInfo.id;
            } catch (e) {
              console.error('Error parsing LINE profile:', e);
            }
          }
        }
        
        // ใช้ข้อมูลเริ่มต้นเมื่อไม่สามารถดึงข้อมูลได้
        console.log('Using default staff info:', this.staffInfo);
      } catch (error) {
        console.error('Error getting user profile:', error);
        // ใช้ข้อมูลเริ่มต้นที่กำหนดไว้ใน data()
      }
    },
    
    async fetchCarModels() {
      try {
        // ✅ ใช้ brandApi helper แทนการเรียก API โดยตรง
        if (this.$axios) {
          const response = await getAvailableVehicles(this.$axios, { status: 'available' });

          console.log('API Response from getAvailableVehicles:', response);
          
          if (Array.isArray(response)) {
            // ตรวจสอบโครงสร้างของข้อมูลที่ได้รับ
            if (response.length > 0) {
              console.log('Sample car data:', response[0]);

              // ✅ FIX: Filter only ISUZU brand vehicles before mapping
              const currentBrand = (getBrandCode() || 'isuzu').toUpperCase();
              const filteredVehicles = response.filter(vehicle => {
                const vehicleBrand = (vehicle.brand || vehicle.brandCode || '').toUpperCase();
                const isMatch = vehicleBrand === currentBrand;
                if (!isMatch) {
                  console.log(`⚠️ Filtering out non-${currentBrand} vehicle:`, vehicle.model || vehicle.vehicleModel, `(brand: ${vehicleBrand})`);
                }
                return isMatch;
              });

              console.log(`✅ Filtered ${filteredVehicles.length}/${response.length} vehicles for brand: ${currentBrand}`);

              // ปรับเปลี่ยนวิธีแมปข้อมูลให้ตรงกับโครงสร้างจริงที่ได้จาก API
              this.carModels = filteredVehicles.map(vehicle => {
                // ตรวจสอบว่าค่าอยู่ในโครงสร้างใด
                const id = vehicle.id || vehicle.vehicleId || vehicle.vehicleCode || '';
                const name = vehicle.model || vehicle.vehicleModel || vehicle.mdlCd || 'ไม่ระบุ';

                console.log(`Mapping car: ${id} - ${name}`);

                return { id, name };
              });

              console.log('Mapped car models:', this.carModels);
            } else {
              console.log('No vehicles returned from API, using default data');
              // ไม่ต้องทำอะไร ใช้ข้อมูลเริ่มต้นที่กำหนดไว้ใน data()
            }
          } else {
            console.log('API response is not an array:', response);
            // ไม่ต้องทำอะไร ใช้ข้อมูลเริ่มต้นที่กำหนดไว้ใน data()
          }
        } else {
          console.log('No Axios instance available, using default car models');
          // ไม่ต้องทำอะไร ใช้ข้อมูลเริ่มต้นที่กำหนดไว้ใน data()
        }
      } catch (error) {
        console.error('Error fetching car models:', error);
        // ไม่ต้องทำอะไร ใช้ข้อมูลเริ่มต้นที่กำหนดไว้ใน data()
      }
    },
    
    // ฟังก์ชันสำหรับคำนวณเวลาเพิ่มชั่วโมง
    addHoursToTime(timeString, hoursToAdd) {
      const [hours, minutes] = timeString.split(':').map(Number);
      let newHours = hours + hoursToAdd;
      
      // จัดการกับกรณีที่เวลาเกิน 24 ชั่วโมง
      if (newHours >= 24) {
        newHours = newHours - 24;
      }
      
      return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    },
    
    // ฟังก์ชันสำหรับสแกน QR Code ด้วย LIFF API
    async scanWithLIFF() {
      try {
        if (window.liff && window.liff.scanCodeV2) {
          // แสดงสถานะกำลังโหลด
          this.isLoading = true;
          
          // เรียกใช้ LIFF API สำหรับการสแกน QR code
          const result = await window.liff.scanCodeV2();
          
          // ซ่อนสถานะโหลด
          this.isLoading = false;
          
          // จัดการผลลัพธ์
          if (result && result.value) {
            this.handleScanResult({
              type: 'qr',
              data: result.value
            });
            
            // ปิดโมดัลสแกน
            this.closeQRModal();
          }
        } else {
          // กรณีไม่ได้อยู่ใน LINE หรือ LIFF ไม่พร้อมใช้งาน ให้ใช้การจำลองแทน
          console.log('LIFF API ไม่พร้อมใช้งาน ใช้การจำลองแทน');
          this.simulateScan('qr');
        }
      } catch (error) {
        console.error('Error scanning with LIFF:', error);
        this.isLoading = false;
        
        // ใช้การจำลองหากเกิดข้อผิดพลาด
        console.log('เกิดข้อผิดพลาดในการสแกน ใช้การจำลองแทน');
        this.simulateScan('qr');
      }
    },
    
    // ฟังก์ชันสำหรับจำลองการสแกน QR Code
    simulateScan(type) {
      this.isLoading = true;
      
      // จำลองการประมวลผลเป็นเวลา 1 วินาที
      setTimeout(() => {
        const mockResult = this.getMockScanResult(type);
        this.handleScanResult(mockResult);
        this.isLoading = false;
        
        // ปิดโมดัล
        this.closeQRModal();
        this.closeLicenseScannerModal();
      }, 1000);
    },
    
    getMockScanResult(type) {
      // จำลองข้อมูลสำหรับการทดสอบ
      if (type === 'qr') {
        return {
          type: 'qr',
          data: {
            name: 'สมหญิง รักไทย',
            id: '1234567890123'
          }
        };
      } else if (type === 'license') {
        return {
          type: 'license',
          data: {
            fullName: 'สมหญิง รักไทย',
            licenseId: 'T123456789',
            expireDate: '2027-05-15'
          }
        };
      }
      return null;
    },
    
    // ฟังก์ชันสำหรับจัดการผลลัพธ์การสแกน QR Code
    handleScanResult(result) {
      try {
        if (result.type === 'qr') {
          // ประมวลผล QR Code
          const qrData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
          
          if (qrData.name) {
            this.walkinForm.customerName = qrData.name;
            this.walkinForm.idNumber = qrData.id || '';
            this.walkinForm.idType = 'nationalId';
            this.isDataScanned = true;
            
            if (this.$store && this.$store.state.notifications) {
              this.$store.dispatch('notifications/add', {
                type: 'success',
                message: 'สแกน QR Code สำเร็จ'
              });
            } else {
              alert('สแกน QR Code สำเร็จ');
            }
          } else {
            throw new Error('ข้อมูล QR Code ไม่ถูกต้อง');
          }
        }
      } catch (error) {
        console.error('Error handling scan result:', error);
        const errorMessage = 'ไม่สามารถอ่านข้อมูลได้ กรุณาลองใหม่อีกครั้ง';
        
        if (this.$store && this.$store.state.notifications) {
          this.$store.dispatch('notifications/add', {
            type: 'error',
            message: errorMessage
          });
        } else {
          alert(errorMessage);
        }
      }
    },
    
    // ฟังก์ชันสำหรับจัดการผลลัพธ์การสแกนใบขับขี่
    handleLicenseScanSuccess(result) {
      try {
        if (result.type === 'license') {
          const licenseData = result.data;
          
          if (licenseData.fullName) {
            this.walkinForm.customerName = licenseData.fullName;
            this.walkinForm.idNumber = licenseData.licenseId || '';
            this.walkinForm.idType = 'drivingLicense';
            this.walkinForm.expireDate = licenseData.expireDate || '';
            this.isDataScanned = true;
            
            if (this.$store && this.$store.state.notifications) {
              this.$store.dispatch('notifications/add', {
                type: 'success',
                message: 'สแกนใบขับขี่สำเร็จ'
              });
            } else {
              alert('สแกนใบขับขี่สำเร็จ');
            }
          } else {
            throw new Error('ข้อมูลใบขับขี่ไม่ถูกต้อง');
          }
        }
      } catch (error) {
        console.error('Error handling license scan result:', error);
        const errorMessage = 'ไม่สามารถอ่านข้อมูลจากใบขับขี่ได้ กรุณาลองใหม่อีกครั้ง';
        
        if (this.$store && this.$store.state.notifications) {
          this.$store.dispatch('notifications/add', {
            type: 'error',
            message: errorMessage
          });
        } else {
          alert(errorMessage);
        }
      }
    },
    
    submitBooking(type) {
      if (type === 'phone') {
        this.submitPhoneBooking();
      } else if (type === 'walkin') {
        this.submitWalkinBooking();
      }
    },
    
    // ฟังก์ชันรวมสำหรับเตรียมข้อมูลการจองให้ตรงตามรูปแบบที่ API ต้องการ
    prepareBookingData(type) {
      const formData = type === 'phone' ? this.phoneForm : this.walkinForm;

      // ✅ FIX: สร้างวันที่และเวลาด้วย timezone-aware approach
      // User เลือกเวลา Bangkok time แต่ backend ต้องการ UTC
      const bangkokDateTime = dayjs.tz(`${formData.date} ${formData.time}`, 'Asia/Bangkok')
      const startTimeISO = bangkokDateTime.toISOString()

      // คำนวณเวลาสิ้นสุด (เพิ่ม 1 ชั่วโมง)
      const endTimeISO = bangkokDateTime.add(1, 'hour').toISOString()

      console.log('🕐 Booking time conversion:', {
        userInput: `${formData.date} ${formData.time}`,
        bangkokTime: bangkokDateTime.format(),
        utcTime: startTimeISO,
        endTime: endTimeISO
      })

      // ✅ FIX: แปลง vehicle_id ให้เป็น integer และตรวจสอบว่าเลือกรถแล้ว
      const vehicleId = this.parseVehicleId(formData.carModel);

      // ✅ Validate vehicle_id
      if (!vehicleId) {
        throw new Error('กรุณาเลือกรุ่นรถ');
      }

      // ✅ แปลง brandCode เป็น brand_id (1 = ISUZU, 2 = BYD)
      const brandCode = this.$store?.state?.auth?.brandCode || localStorage.getItem('brandCode') || 'ISUZU';
      const brandId = brandCode.toUpperCase() === 'BYD' ? 2 : 1;

      // ✅ FIX: ดึง staff ID ที่เป็นตัวเลขจาก store หรือ staffInfo
      // staffInfo.id อาจเป็น LINE User ID (string) ถ้ายังไม่ได้ check
      // ให้ดึงจาก store.auth.user.id หรือ store.auth.staffInfo.id ก่อน
      let responsibleStaffId = this.staffInfo.id;

      // ถ้า staffInfo.id เป็น string (LINE User ID) ให้ดึงจาก store แทน
      if (typeof responsibleStaffId === 'string' || !responsibleStaffId) {
        responsibleStaffId = this.$store?.state?.auth?.user?.id ||
                           this.$store?.state?.auth?.staffInfo?.id ||
                           this.staffInfo.id;
      }

      // แปลงเป็น number ให้แน่ใจ
      responsibleStaffId = parseInt(responsibleStaffId) || null;

      console.log('🔍 Debug prepareBookingData:', {
        brandCode,
        brandId,
        vehicleId,
        staffInfoId: this.staffInfo.id,
        responsibleStaffId,
        staffInfo: this.staffInfo,
        storeUser: this.$store?.state?.auth?.user,
        storeStaffInfo: this.$store?.state?.auth?.staffInfo
      });

      // สร้างข้อมูลพื้นฐานสำหรับการจอง
      const bookingData = {
        vehicle_id: vehicleId, // ต้องเป็น integer
        status: "PENDING", // ต้องเป็นตัวพิมพ์ใหญ่ตามข้อความ error
        customer_name: formData.customerName,
        customer_phone: type === 'phone' ? formData.phone : '0000000000',
        start_time: startTimeISO,
        expected_end_time: endTimeISO,
        actual_end_time: null,
        test_route: "รอบโชว์รูม", // ตัวอย่างเส้นทาง
        distance: 0, // ค่าเริ่มต้น
        duration: 60, // หน่วยเป็นนาที
        responsible_staff: responsibleStaffId, // ✅ FIX: ใช้ staff ID ที่เป็น number
        brand_id: brandId // ✅ เพิ่ม brand_id ตาม API spec
        // ⚠️ notes: ไม่ส่งเพราะ backend ยังไม่ support (จะเก็บไว้ใน localStorage แทน)
      };

      // ✅ เก็บ notes ไว้ใน localStorage สำหรับใช้ภายหลัง (เมื่อ backend support)
      if (formData.notes && formData.notes.trim()) {
        try {
          const notesData = JSON.parse(localStorage.getItem('testDriveNotes') || '{}');
          // จะเก็บ notes พร้อม timestamp สำหรับใช้ภายหลัง
          notesData[`pending_${Date.now()}`] = {
            customerName: formData.customerName,
            notes: formData.notes.trim(),
            createdAt: new Date().toISOString()
          };
          localStorage.setItem('testDriveNotes', JSON.stringify(notesData));
          console.log('📝 Notes saved to localStorage (backend not supported yet):', formData.notes);
        } catch (err) {
          console.warn('Failed to save notes to localStorage:', err);
        }
      }
      
      // เพิ่มข้อมูลเกี่ยวกับบัตรประชาชน/ใบขับขี่ (สำหรับ walkin)
      if (type === 'walkin' && this.isDataScanned) {
        if (formData.idType === 'nationalId') {
          bookingData.national_id = formData.idNumber;
        } else if (formData.idType === 'drivingLicense') {
          bookingData.license_number = formData.idNumber;
          if (formData.expireDate) {
            bookingData.license_expire_date = formData.expireDate;
          }
        }
      }
      
      return bookingData;
    },
    
    // ฟังก์ชันช่วยแปลง vehicle_id ให้เป็นรูปแบบที่ถูกต้อง (integer)
    parseVehicleId(vehicleId) {
      // ตรวจสอบว่า vehicleId เป็นรูปแบบตัวเลขหรือไม่
      if (/^\d+$/.test(vehicleId)) {
        return parseInt(vehicleId);
      }
      // ✅ FIX: ถ้าไม่ได้เลือกรถ ให้ return null แทน 1 เพื่อให้ validation จับได้
      console.warn('⚠️ Invalid vehicle_id:', vehicleId);
      return null;
    },
    
    // ปรับปรุงฟังก์ชัน submitPhoneBooking
    async submitPhoneBooking() {
      // รีเซ็ตข้อความแสดงข้อผิดพลาดก่อนทำการตรวจสอบใหม่
      this.apiErrorMessages = [];
      
      // ตรวจสอบความถูกต้องของข้อมูล
      if (!this.validatePhoneForm()) {
        if (this.$store && this.$store.state.notifications) {
          this.$store.dispatch('notifications/add', {
            type: 'error',
            message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
          });
        } else {
          alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        }
        return;
      }
      
      try {
        this.isSubmitting = true;
        
        // แปลงรูปแบบข้อมูลให้ตรงตามที่ API ต้องการ
        const bookingData = this.prepareBookingData('phone');
        
        // แสดงข้อมูลที่จะส่งไป API
        console.log('Sending booking data:', JSON.stringify(bookingData, null, 2));
        
        // ✅ ใช้ brandApi helper แทนการเรียก API โดยตรง
        if (this.$axios) {
          try {
            const response = await createTestDrive(this.$axios, bookingData);

            console.log('API Response from createTestDrive:', response);
            
            // แสดงข้อความสำเร็จและนำทางไปหน้าถัดไป
            this.handleBookingSuccess(response);
          } catch (apiError) {
            // จัดการกับข้อผิดพลาดจาก API
            this.handleApiError(apiError);
          }
        } else {
          // กรณีทดสอบไม่มี API
          alert('สร้างคำขอจองรถทดสอบสำเร็จ (จำลอง)');
          this.$router.push('/');
        }
        
        // รีเซ็ตฟอร์ม
        this.resetPhoneForm();
      } catch (error) {
        console.error('Error creating booking:', error);
        
        if (this.$store && this.$store.state.notifications) {
          this.$store.dispatch('notifications/add', {
            type: 'error',
            message: 'ไม่สามารถสร้างคำขอจองได้ กรุณาลองใหม่อีกครั้ง'
          });
        } else {
          alert('ไม่สามารถสร้างคำขอจองได้ กรุณาลองใหม่อีกครั้ง');
        }
      } finally {
        this.isSubmitting = false;
      }
    },
    // ปรับปรุงฟังก์ชัน submitWalkinBooking 
   async submitWalkinBooking() {
     // รีเซ็ตข้อความแสดงข้อผิดพลาดก่อนทำการตรวจสอบใหม่
     this.apiErrorMessages = [];
     
     // ตรวจสอบความถูกต้องของข้อมูล
     if (!this.validateWalkinForm()) {
       if (this.$store && this.$store.state.notifications) {
         this.$store.dispatch('notifications/add', {
           type: 'error',
           message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
         });
       } else {
         alert('กรุณากรอกข้อมูลให้ครบถ้วน');
       }
       return;
     }
     
     try {
       this.isSubmitting = true;
       
       // แปลงรูปแบบข้อมูลให้ตรงตามที่ API ต้องการ
       const bookingData = this.prepareBookingData('walkin');
       
       // แสดงข้อมูลที่จะส่งไป API
       console.log('Sending booking data:', JSON.stringify(bookingData, null, 2));
       
       // ✅ ใช้ brandApi helper แทนการเรียก API โดยตรง
       if (this.$axios) {
         try {
           const response = await createTestDrive(this.$axios, bookingData);

           console.log('API Response from createTestDrive:', response);
           
           // แสดงข้อความสำเร็จและนำทางไปหน้าถัดไป
           this.handleBookingSuccess(response);
         } catch (apiError) {
           // จัดการกับข้อผิดพลาดจาก API
           this.handleApiError(apiError);
         }
       } else {
         // กรณีทดสอบไม่มี API
         alert('สร้างคำขอจองรถทดสอบสำเร็จ (จำลอง)');
         this.$router.push('/');
       }
       
       // รีเซ็ตฟอร์ม
       this.resetWalkinForm();
     } catch (error) {
       console.error('Error creating booking:', error);
       
       if (this.$store && this.$store.state.notifications) {
         this.$store.dispatch('notifications/add', {
           type: 'error',
           message: 'ไม่สามารถสร้างคำขอจองได้ กรุณาลองใหม่อีกครั้ง'
         });
       } else {
         alert('ไม่สามารถสร้างคำขอจองได้ กรุณาลองใหม่อีกครั้ง');
       }
     } finally {
       this.isSubmitting = false;
     }
   },
   
   // ฟังก์ชันจัดการกับผลลัพธ์สำเร็จจาก API
   handleBookingSuccess(response) {
     if (this.$store && this.$store.state.notifications) {
       this.$store.dispatch('notifications/add', {
         type: 'success',
         message: 'สร้างคำขอจองรถทดสอบสำเร็จ'
       });
     } else {
       alert('สร้างคำขอจองรถทดสอบสำเร็จ');
     }
     
     // ถ้ามี id ให้ไปหน้า success พร้อมส่งข้อมูล
     if (response && response.id) {
       this.$router.push({
         path: '/booking/success',
         query: { id: response.id }
       });
     } else {
       // ถ้าไม่มี id แต่ API สำเร็จ ให้กลับไปหน้าหลัก
       this.$router.push('/');
     }
   },
   
   // ปรับปรุงฟังก์ชันจัดการกับข้อผิดพลาดจาก API
   handleApiError(error) {
     console.error('Full API Error Response:', error.response);
     
     let errorMessage = 'ไม่สามารถสร้างคำขอจองได้ กรุณาลองใหม่อีกครั้ง';
     
     // ตรวจสอบและแสดงรายละเอียดข้อผิดพลาดที่ชัดเจน
     if (error.response && error.response.data) {
       console.log('API Error Details:', error.response.data);
       
       if (Array.isArray(error.response.data.message)) {
         // กรณีข้อความเป็น Array
         this.apiErrorMessages = [...error.response.data.message];
         errorMessage = error.response.data.message.join(', ');
         console.log('ERROR MESSAGES:', this.apiErrorMessages);
       } 
       else if (typeof error.response.data.message === 'string') {
         // กรณีข้อความเป็น String
         errorMessage = error.response.data.message;
         this.apiErrorMessages = [errorMessage];
       }
       else if (typeof error.response.data.error === 'string') {
         // กรณีมี error แต่ไม่มี message
         errorMessage = `เกิดข้อผิดพลาด: ${error.response.data.error}`;
         this.apiErrorMessages = [errorMessage];
       }
       else {
         // กรณีไม่มีรูปแบบข้างต้น พยายามแสดงข้อมูลทั้งหมด
         try {
           const errorDetail = JSON.stringify(error.response.data);
           console.log('Detailed error:', errorDetail);
           this.apiErrorMessages = [`ข้อผิดพลาด: ${errorDetail}`];
           errorMessage = `เกิดข้อผิดพลาด: ${errorDetail}`;
         } catch (e) {
           console.error('Error stringify error data:', e);
         }
       }
     }
     
     // แสดงข้อความแจ้งเตือน
     if (this.$store && this.$store.state.notifications) {
       this.$store.dispatch('notifications/add', {
         type: 'error',
         message: errorMessage
       });
     } else {
       alert(errorMessage);
     }
   },
   
   validatePhoneForm() {
     // รีเซ็ตสถานะข้อผิดพลาด
     this.phoneValidationError = false;

     // ตรวจสอบว่ามีการกรอกข้อมูลครบถ้วนหรือไม่
     if (!this.phoneForm.carModel || !this.phoneForm.date || !this.phoneForm.time || !this.phoneForm.customerName || !this.phoneForm.phone) {
       return false;
     }

     // ตรวจสอบรูปแบบเบอร์โทรศัพท์
     if (!this.validatePhone(this.phoneForm.phone)) {
       this.phoneValidationError = true;
       return false;
     }

     // ✅ ตรวจสอบว่ารถที่เลือกไม่ว่างในช่วงเวลาที่เลือก
     if (this.unavailableVehicleIds.includes(this.phoneForm.carModel)) {
       if (this.$store && this.$store.state.notifications) {
         this.$store.dispatch('notifications/add', {
           type: 'error',
           message: 'รถที่เลือกไม่ว่างในช่วงเวลานี้ กรุณาเลือกรถคันอื่นหรือเปลี่ยนเวลา'
         });
       } else {
         alert('รถที่เลือกไม่ว่างในช่วงเวลานี้ กรุณาเลือกรถคันอื่นหรือเปลี่ยนเวลา');
       }
       return false;
     }

     return true;
   },
   
   validateWalkinForm() {
     // ตรวจสอบว่ามีการกรอกข้อมูลครบถ้วนหรือไม่
     return (
       this.walkinForm.carModel && 
       this.walkinForm.date && 
       this.walkinForm.time && 
       this.walkinForm.customerName
     );
   },
   
   validatePhone(phone) {
     // ตรวจสอบรูปแบบเบอร์โทรศัพท์ไทย (10 หลัก เริ่มต้นด้วย 0)
     const phoneRegex = /^0[6-9][0-9]{8}$/;
     return phoneRegex.test(phone);
   },
   
   resetPhoneForm() {
     // ดึงข้อมูลวันที่ปัจจุบัน
     const today = new Date();
     const formattedDate = today.toISOString().split('T')[0];
     
     // รีเซ็ตฟอร์ม แต่ยังคงใช้วันที่ปัจจุบัน
     this.phoneForm = {
       carModel: '',
       date: formattedDate,
       time: this.timeSlots.length > 0 ? this.timeSlots[0] : '09:00', // ใช้เวลาเริ่มต้นของเวลาทำการ
       customerName: '',
       phone: ''
     };
     
     // รีเซ็ตสถานะข้อผิดพลาด
     this.phoneValidationError = false;
     this.apiErrorMessages = [];
     
     // กำหนดค่าเริ่มต้นสำหรับเวลา
     this.setDefaultTime();
   },
   
   resetWalkinForm() {
     // ดึงข้อมูลวันที่ปัจจุบัน
     const today = new Date();
     const formattedDate = today.toISOString().split('T')[0];
     
     // รีเซ็ตฟอร์ม แต่ยังคงใช้วันที่ปัจจุบัน
     this.walkinForm = {
       carModel: '',
       date: formattedDate,
       time: this.timeSlots.length > 0 ? this.timeSlots[0] : '09:00', // ใช้เวลาเริ่มต้นของเวลาทำการ
       customerName: '',
       idNumber: '',
       idType: 'drivingLicense',
       expireDate: ''
     };
     
     // รีเซ็ตสถานะการสแกน
     this.isDataScanned = false;
     this.apiErrorMessages = [];
     
     // กำหนดค่าเริ่มต้นสำหรับเวลา
     this.setDefaultTime();
   },
   
   openQRModal() {
     this.isQRModalOpen = true;
   },
   
   closeQRModal() {
     this.isQRModalOpen = false;
   },
   
   openLicenseScannerModal() {
     this.isLicenseScannerOpen = true;
   },
   
   closeLicenseScannerModal() {
     this.isLicenseScannerOpen = false;
   }
 }
}
</script>

   

   


<style scoped>
/* สไตล์สำหรับหน้าจอมือถือ */
.add-queue {
  align-items: flex-start;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 100vh;
  position: relative;
  width: 100%;
  max-width: 100vw;
  padding-bottom: 85px; /* พื้นที่สำหรับเมนูด้านล่าง */
  overflow-x: hidden;
}

.background-shadow {
  align-items: center;
  align-self: stretch;
  background-color: #dc2626; /* สีแดงของ ISUZU */
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  height: 56px;
  padding: 0 15px;
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 100;
}

.button-margin {
  align-items: center;
  display: flex;
  justify-content: center;
  padding-right: 15px;
  position: relative;
  cursor: pointer;
  touch-action: manipulation;
}

.img {
  height: 24px;
  width: 24px;
  stroke: white;
}

.heading {
  align-items: center;
  display: flex;
  flex: 1;
  position: relative;
}

.text-wrapper {
  color: #ffffff;
  font-family: 'Prompt', sans-serif;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.2px;
  line-height: normal;
  position: relative;
  white-space: nowrap;
}

.container {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding: 10px 15px;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.background {
  align-items: center;
  align-self: stretch;
  background-color: #f8f8f8;
  border-radius: 8px;
  display: flex;
  gap: 8px;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.button, .button-2 {
  all: unset;
  align-items: center;
  background-color: #f8f8f8;
  border-radius: 8px;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  gap: 8px;
  justify-content: center;
  padding: 12px;
  position: relative;
  cursor: pointer;
  touch-action: manipulation;
}

.button.active, .button-2.active {
  background-color: #dc2626;
}

.SVG {
  height: 18px;
  width: 18px;
  stroke: #333;
}

.button.active .SVG, .button-2.active .SVG {
  stroke: white;
}

.div, .text-wrapper-2 {
  color: #333;
  font-family: 'Prompt', sans-serif;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: normal;
  position: relative;
  text-align: center;
  white-space: nowrap;
}

.button.active .div, .button-2.active .text-wrapper-2 {
  color: white;
}

.container-wrapper {
  align-items: flex-start;
  align-self: stretch;
  background-color: #ffffff;
  border-color: #dc2626;
  border-radius: 0 0 8px 8px;
  border-top-style: solid;
  border-top-width: 3px;
  display: flex;
  flex-direction: column;
  padding: 20px 15px;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.container-2 {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  width: 100%;
}

.background-2 {
  align-items: flex-start;
  align-self: stretch;
  background-color: #f8f8f8;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 12px;
  position: relative;
  width: 100%;
  border-left: 3px solid #dc2626;
  box-sizing: border-box;
}

.div-wrapper {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  padding: 3px 0;
  position: relative;
  width: 100%;
}

.text-wrapper-3 {
  align-self: stretch;
  color: #666666;
  font-family: 'Prompt', sans-serif;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: normal;
  position: relative;
}

.container-3 {
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: 10px;
  position: relative;
  width: 100%;
}

.SVG-2 {
  height: 20px;
  width: 20px;
  flex-shrink: 0;
}

.container-4 {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  padding: 4px 0;
  position: relative;
}

.text-wrapper-4 {
  color: #333;
  font-family: 'Prompt', sans-serif;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: normal;
  position: relative;
  white-space: nowrap;
}

.container-5 {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  padding: 3px 0;
  position: relative;
}

.text-wrapper-5 {
  color: #666666;
  font-family: 'Prompt', sans-serif;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: normal;
  position: relative;
  white-space: nowrap;
}

.container-6 {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: relative;
  width: 100%;
}

.container-7 {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: relative;
  width: 100%;
}

.text-wrapper-6 {
  align-self: stretch;
  color: #333;
  font-family: 'Prompt', sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: normal;
  position: relative;
}

.options {
  align-items: flex-start;
  align-self: stretch;
  background-color: #ffffff;
  border: 1px solid #dc2626;
  border-radius: 6px;
  display: flex;
  padding: 12px 15px;
  position: relative;
  width: 100%;
  font-family: 'Prompt', sans-serif;
  font-size: 14px;
  box-sizing: border-box;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23dc2626' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
}

.text-wrapper-7 {
  align-self: stretch;
  color: #333;
  font-family: 'Prompt', sans-serif;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 20px;
  position: relative;
}

.input, .input-2 {
  align-items: flex-start;
  align-self: stretch;
  background-color: #ffffff;
  border: 1px solid #dc2626;
  border-radius: 6px;
  display: flex;
  padding: 12px 15px;
  position: relative;
  width: 100%;
  font-family: 'Prompt', sans-serif;
  font-size: 14px;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
}

.input-2::placeholder {
  color: #999;
}

/* ✅ Textarea notes styling */
.textarea-notes {
  min-height: 80px;
  resize: vertical;
  line-height: 1.5;
}

.button-3 {
  all: unset;
  align-items: center;
  align-self: stretch;
  background-color: #dc2626;
  border-radius: 8px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  padding: 15px;
  position: relative;
  width: 100%;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.button-3:disabled {
  background-color: #e5a6a6;
  cursor: not-allowed;
}

.text-wrapper-11 {
  color: #ffffff;
  font-family: 'Prompt', sans-serif;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.2px;
  line-height: normal;
  position: relative;
  text-align: center;
  width: 100%;
}

/* Scan Buttons สำหรับโหมด Walk-in */
.scan-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
  width: 100%;
}

.scan-qr-button,
.scan-id-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #dc2626;
  background: white;
  color: #dc2626;
  border-radius: 8px;
  height: 100px;
  cursor: pointer;
  font-family: 'Prompt', sans-serif;
  font-size: 13px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.scan-icon {
  width: 32px;
  height: 32px;
  stroke: #dc2626;
}

/* Modal Styles */
.modal {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.6);
  justify-content: center;
  align-items: center;
}

.modal.open {
  display: flex;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 350px;
  padding: 20px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 2px solid #dc2626;
  padding-bottom: 10px;
}

.modal-header h2 {
  font-size: 18px;
  color: #dc2626;
  font-weight: 600;
  font-family: 'Prompt', sans-serif;
  margin: 0;
}

.close-modal {
  background: none;
  border: none;
  font-size: 26px;
  color: #dc2626;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  margin: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scanner-placeholder {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f8f8f8;
  border-radius: 10px;
  border: 2px dashed #e0e0e0;
  margin-top: 10px;
  padding: 20px;
  gap: 15px;
}

.scanner-icon {
  width: 60px;
  height: 60px;
  stroke: #dc2626;
}

.scan-instruction {
  font-family: 'Prompt', sans-serif;
  font-size: 14px;
  color: #666;
  text-align: center;
  margin: 0;
}

.scan-start-btn {
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-family: 'Prompt', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

/* Scanner Options */
.scanner-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}

.scan-option {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  font-family: 'Prompt', sans-serif;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.scan-option:hover {
  background-color: #f0f0f0;
  border-color: #dc2626;
}

.option-icon {
  width: 24px;
  height: 24px;
  stroke: #dc2626;
}

/* Scanned Data Styles */
.scanned-data {
  border-color: #10b981;
  background-color: #f0fdfa;
}

.scanned-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
  color: #10b981;
  font-family: 'Prompt', sans-serif;
}

.check-icon {
  width: 14px;
  height: 14px;
  stroke: currentColor;
}

/* Vehicle Availability Indicators */
.availability-checking {
  font-size: 12px;
  color: #666;
  font-family: 'Prompt', sans-serif;
  margin-top: 4px;
  font-style: italic;
}

.availability-info {
  font-size: 12px;
  color: #dc2626;
  font-family: 'Prompt', sans-serif;
  margin-top: 6px;
  padding: 8px 12px;
  background-color: #fef2f2;
  border-radius: 4px;
  border-left: 3px solid #dc2626;
}

/* Style for disabled options */
.options option:disabled {
  color: #999;
  background-color: #f5f5f5;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #dc2626;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.loading-text {
  font-family: 'Prompt', sans-serif;
  font-size: 16px;
  color: #333;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* เพิ่มสไตล์เพื่อรองรับการเปลี่ยนขนาดหน้าจอ */
@media (max-width: 360px) {
  .scan-qr-button,
  .scan-id-button {
    height: 90px;
    font-size: 12px;
    padding: 10px;
  }
  
  .scan-icon {
    width: 28px;
    height: 28px;
  }
  
  .text-wrapper-4 {
    font-size: 15px;
  }
  
  .text-wrapper-5 {
    font-size: 12px;
  }
  
  .text-wrapper-6 {
    font-size: 13px;
  }
  
  .options, .input, .input-2 {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .container {
    padding: 8px 12px;
  }
}
</style>