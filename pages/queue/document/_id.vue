<template>
  <div class="document-container">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <button class="back-button" @click="goBack">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="title-container">
          <h1>แบบฟอร์มทดลองขับ</h1>
          <h2>Test Drive Form</h2>
        </div>
      </div>
      <div class="date-time">
        <div class="date">วันที่ (Date): <span>{{ currentDate }}</span></div>
        <div class="time">เวลา (Time): <span>{{ currentTime }}</span></div>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>กำลังโหลด...</p>
    </div>

    <!-- Main Form -->
    <form v-else id="testDriveForm" @submit.prevent="submitForm">
      <!-- Sales Info -->
      <div class="form-grid">
        <div class="form-group">
          <label>ที่ปรึกษาการขาย (Sales Specialist)</label>
          <input type="text" v-model="formData.salesSpecialist" :disabled="isSubmitting">
        </div>
        <div class="form-group">
          <label>โทร (Tel.)</label>
          <input type="tel" v-model="formData.tel" :disabled="isSubmitting">
        </div>
      </div>

      <!-- Customer Info -->
      <div class="customer-info">
        <h3>รายละเอียดผู้ทดลองขับ/ลูกค้า (Customer Information)</h3>
        <div class="form-grid">
          <input 
            type="text" 
            placeholder="ชื่อ-นามสกุล" 
            v-model="formData.customerName"
            :disabled="isSubmitting"
          >
          <input 
            type="text" 
            placeholder="เลขที่บัตรประชาชน" 
            v-model="formData.idNumber"
            :disabled="isSubmitting"
          >
          <input 
            type="tel" 
            placeholder="โทร" 
            v-model="formData.customerTel"
            :disabled="isSubmitting"
          >
          <div class="address-group">
            <input 
              type="text" 
              placeholder="บ้านเลขที่" 
              v-model="formData.houseNo"
              :disabled="isSubmitting"
            >
            <input 
              type="text" 
              placeholder="หมู่" 
              v-model="formData.village"
              :disabled="isSubmitting"
            >
          </div>
          <input 
            type="text" 
            placeholder="อำเภอ/เขต" 
            v-model="formData.district"
            :disabled="isSubmitting"
          >
          <input 
            type="text" 
            placeholder="จังหวัด" 
            v-model="formData.province"
            :disabled="isSubmitting"
          >
        </div>
      </div>

      <!-- Purpose -->
      <div class="purpose-section">
        <h3>วัตถุประสงค์</h3>
        <div class="radio-group">
          <div class="radio-item">
            <input 
              type="radio" 
              id="testDrive" 
              v-model="formData.purpose" 
              value="testDrive"
              :disabled="isSubmitting"
            >
            <label for="testDrive">ทดลองขับ (ระบุรายละเอียด)</label>
          </div>
          <div class="radio-item">
            <input 
              type="radio" 
              id="other" 
              v-model="formData.purpose" 
              value="other"
              :disabled="isSubmitting"
            >
            <label for="other">อื่นๆ</label>
          </div>
        </div>
      </div>

      <!-- Vehicle Selection -->
      <div class="vehicle-selection">
        <div class="radio-group">
          <div class="radio-item">
            <input 
              type="radio" 
              id="isuzu" 
              v-model="formData.vehicleBrand" 
              value="isuzu"
              :disabled="isSubmitting"
            >
            <label for="isuzu">รถยนต์ ISUZU</label>
          </div>
          <div class="radio-item">
            <input 
              type="radio" 
              id="byd" 
              v-model="formData.vehicleBrand" 
              value="byd"
              :disabled="isSubmitting"
            >
            <label for="byd">รถยนต์ไฟฟ้า BYD</label>
          </div>
        </div>

        <div class="form-grid">
          <input 
            type="text" 
            placeholder="รุ่น" 
            v-model="formData.model"
            :disabled="isSubmitting"
          >
          <input 
            type="text" 
            placeholder="ประเภท" 
            v-model="formData.type"
            :disabled="isSubmitting"
          >
          <input 
            type="text" 
            placeholder="สี" 
            v-model="formData.color"
            :disabled="isSubmitting"
          >
          <input 
            type="text" 
            placeholder="หมายเลขตัวถัง" 
            v-model="formData.vinNumber"
            :disabled="isSubmitting"
          >
        </div>
      </div>

      <!-- Vehicle Usage Period -->
      <div class="usage-period">
        <div class="form-grid">
          <input 
            type="text" 
            placeholder="เลขไมล์เริ่มต้น" 
            v-model="formData.startMileage"
            :disabled="isSubmitting"
          >
          <input 
            type="text" 
            placeholder="เลขไมล์สิ้นสุด" 
            v-model="formData.endMileage"
            :disabled="isSubmitting"
          >
        </div>

        <div class="date-range">
          <div class="date-input">
            <span>ใช้รถตั้งแต่วันที่</span>
            <input 
              type="date" 
              v-model="formData.startDate"
              :disabled="isSubmitting"
            >
          </div>
          <div class="date-input">
            <span>ถึงวันที่</span>
            <input 
              type="date" 
              v-model="formData.endDate"
              :disabled="isSubmitting"
            >
            <span>(กรณีขอยืมรถไปใช้)</span>
          </div>
        </div>

        <div class="company-info">
          <span>จากบริษัท</span>
          <span class="company-name">นกเงือกยานยนต์ จำกัด</span>
          <span>ในสภาพเรียบร้อย ครบถ้วนถูกต้อง</span>
        </div>
      </div>

      <!-- License Upload -->
      <div class="license-section">
        <h3>ใบขับขี่</h3>
        <div class="upload-area">
          <input 
            type="file" 
            ref="licenseInput" 
            accept="image/*" 
            hidden 
            @change="handleFileUpload"
            :disabled="isSubmitting"
          >
          <div ref="previewContainer" class="preview-container">
            <img v-if="formData.licenseImage" :src="formData.licenseImage" alt="License preview">
          </div>
          <button 
            type="button" 
            class="upload-button" 
            @click="$refs.licenseInput.click()"
            :disabled="isSubmitting"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            อัพโหลดใบขับขี่
          </button>
        </div>
      </div>

      <!-- Terms -->
      <div class="terms">
        ข้าพเจ้า ขอรับรองว่า จะปฏิบัติตามกฎจราจรอย่างเคร่งครัด โดยระหว่าง การทดลองขับ 
        ข้าพเจ้าจะขับขี่ด้วยความระมัดระวัง ไม่ประมาทจะขับขี่ตามเส้นทางที่บริษัทฯ กำหนดเท่านั้น 
        จะไม่ฝ่าฝืนกฎระเบียบ หากข้าพเจ้าไม่ปฏิบัติตาม อันเป็นเหตุให้เกิดความเสียหายต่อทรัพย์สินของบริษัทฯ 
        ข้าพเจ้าขอรับผิดชอบต่อการกระทำนั้น แต่เพียงผู้เดียว
      </div>

      <!-- Signatures -->
      <div class="signatures">
        <h3>ลายเซ็น</h3>
        <div class="signature-item">
          <div class="signature-label">ลูกค้าผู้ทดลองขับ (Customer)</div>
          <div class="signature-wrapper">
            <div 
              class="signature-pad-container" 
              :class="{ 'disabled': isSubmitting }"
            >
              <canvas 
                ref="customerSignature" 
                class="signature-pad" 
                width="300" 
                height="150"
                @touchstart.prevent="startDrawing($event, 'customer')"
                @touchmove.prevent="draw($event, 'customer')"
                @touchend.prevent="endDrawing('customer')"
                @mousedown.prevent="startDrawing($event, 'customer')"
                @mousemove.prevent="draw($event, 'customer')"
                @mouseup.prevent="endDrawing('customer')"
                @mouseout.prevent="endDrawing('customer')"
              ></canvas>
            </div>
            <button 
              v-if="formData.signatures.customer" 
              type="button" 
              class="clear-signature-button"
              @click="clearSignature('customer')"
              :disabled="isSubmitting"
            >
              ล้าง
            </button>
          </div>
        </div>
        
        <div class="signature-item">
          <div class="signature-label">ที่ปรึกษาการขาย (Sales Specialist)</div>
          <div class="signature-wrapper">
            <div 
              class="signature-pad-container" 
              :class="{ 'disabled': isSubmitting }"
            >
              <canvas 
                ref="salesSignature" 
                class="signature-pad" 
                width="300" 
                height="150"
                @touchstart.prevent="startDrawing($event, 'sales')"
                @touchmove.prevent="draw($event, 'sales')"
                @touchend.prevent="endDrawing('sales')"
                @mousedown.prevent="startDrawing($event, 'sales')"
                @mousemove.prevent="draw($event, 'sales')"
                @mouseup.prevent="endDrawing('sales')"
                @mouseout.prevent="endDrawing('sales')"
              ></canvas>
            </div>
            <button 
              v-if="formData.signatures.sales" 
              type="button" 
              class="clear-signature-button"
              @click="clearSignature('sales')"
              :disabled="isSubmitting"
            >
              ล้าง
            </button>
          </div>
        </div>
        
        <div class="signature-item">
          <div class="signature-label">ผู้จัดการขาย (Sales Manager)</div>
          <div class="signature-wrapper">
            <div 
              class="signature-pad-container" 
              :class="{ 'disabled': isSubmitting }"
            >
              <canvas 
                ref="managerSignature" 
                class="signature-pad" 
                width="300" 
                height="150"
                @touchstart.prevent="startDrawing($event, 'manager')"
                @touchmove.prevent="draw($event, 'manager')"
                @touchend.prevent="endDrawing('manager')"
                @mousedown.prevent="startDrawing($event, 'manager')"
                @mousemove.prevent="draw($event, 'manager')"
                @mouseup.prevent="endDrawing('manager')"
                @mouseout.prevent="endDrawing('manager')"
              ></canvas>
            </div>
            <button 
              v-if="formData.signatures.manager" 
              type="button" 
              class="clear-signature-button"
              @click="clearSignature('manager')"
              :disabled="isSubmitting"
            >
              ล้าง
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="form-actions">
        <button 
          type="button" 
          class="button-cancel" 
          @click="goBack"
          :disabled="isSubmitting"
        >
          ยกเลิก
        </button>
        <button 
          type="submit" 
          class="button-submit" 
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึก' }}
        </button>
      </div>
    </form>

    <!-- Overlay for loading state -->
    <div class="overlay" v-if="isSubmitting">
      <div class="spinner"></div>
      <p>กำลังบันทึกข้อมูล...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestDriveDocumentEdit',
  layout: 'default',
  
  async fetch() {
    // ถ้าเป็นการแก้ไขเอกสาร (มี ID)
    if (this.$route.params.id) {
      this.loading = true
      try {
        // ดึงข้อมูลเอกสารเดิมจาก API
        const response = await this.$axios.$get(`/api/test-drives/${this.$route.params.id}`)
        if (response) {
          // นำข้อมูลมากรอกในฟอร์ม
          this.populateFormData(response)
        }
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error)
        this.$nuxt.$emit('showToast', {
          message: 'ไม่สามารถดึงข้อมูลเอกสารได้ กรุณาลองใหม่อีกครั้ง',
          type: 'error'
        })
      } finally {
        this.loading = false
      }
    } else {
      // กรณีสร้างเอกสารใหม่
      this.loading = false
      
      // ถ้ามีข้อมูลใน store (จากหน้าจอง) ให้ดึงมากรอก
      if (this.$store.state.booking && this.$store.state.booking.currentBooking) {
        const bookingData = this.$store.state.booking.currentBooking
        this.formData.customerName = bookingData.name || ''
        this.formData.customerTel = bookingData.phone || ''
        this.formData.vehicleBrand = bookingData.brand || 'isuzu'
        this.formData.model = bookingData.model || ''
      }
      
      // ดึงข้อมูลผู้ใช้ปัจจุบัน (พนักงานขาย) ถ้ามี
      if (this.$store.state.auth && this.$store.state.auth.user) {
        const userData = this.$store.state.auth.user
        if (userData.role === 'sales') {
          this.formData.salesSpecialist = userData.name || ''
          this.formData.tel = userData.phone || ''
        }
      }
    }
  },
  
  data() {
    return {
      loading: true,
      isSubmitting: false,
      currentDate: '',
      currentTime: '',
      timerInterval: null,
      
      // ข้อมูลสำหรับการวาดลายเซ็น
      isDrawing: {
        customer: false,
        sales: false,
        manager: false
      },
      
      // ตำแหน่งสุดท้ายของการวาด
      lastPosition: {
        customer: { x: 0, y: 0 },
        sales: { x: 0, y: 0 },
        manager: { x: 0, y: 0 }
      },
      
      // ข้อมูลฟอร์ม
      formData: {
        salesSpecialist: '',
        tel: '',
        customerName: '',
        idNumber: '',
        customerTel: '',
        houseNo: '',
        village: '',
        district: '',
        province: '',
        purpose: 'testDrive',
        vehicleBrand: 'isuzu',
        model: '',
        type: '',
        color: '',
        vinNumber: '',
        startMileage: '',
        endMileage: '',
        startDate: '',
        endDate: '',
        licenseImage: null,
        signatures: {
          customer: null,
          sales: null,
          manager: null
        }
      }
    }
  },
  
  mounted() {
    // ตั้งค่าเวลาและวันที่ปัจจุบัน
    this.updateDateTime()
    this.timerInterval = setInterval(this.updateDateTime, 1000)
    
    // ตั้งค่า Canvas สำหรับลายเซ็น
    this.setupSignaturePads()
    
    // รองรับการปรับขนาดหน้าจอ
    window.addEventListener('resize', this.handleResize)
    
    // รองรับการหมุนหน้าจอ (บนมือถือ)
    window.addEventListener('orientationchange', this.handleResize)
  },
  
  beforeDestroy() {
    // ล้าง timer และ event listeners
    clearInterval(this.timerInterval)
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('orientationchange', this.handleResize)
  },
  
  methods: {
    updateDateTime() {
      const now = new Date()
      const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
      this.currentDate = now.toLocaleDateString('th-TH', options)
      this.currentTime = now.toLocaleTimeString('th-TH')
    },
    
    setupSignaturePads() {
      const signatureTypes = ['customer', 'sales', 'manager']
      signatureTypes.forEach(type => {
        const canvas = this.$refs[`${type}Signature`]
        if (canvas) {
          const ctx = canvas.getContext('2d')
          ctx.lineWidth = 2
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.strokeStyle = '#000'
        }
      })
    },
    
    handleResize() {
      // วาดลายเซ็นใหม่เมื่อขนาดหน้าจอเปลี่ยน
      const signatureTypes = ['customer', 'sales', 'manager']
      signatureTypes.forEach(type => {
        if (this.formData.signatures[type]) {
          const canvas = this.$refs[`${type}Signature`]
          if (canvas) {
            const ctx = canvas.getContext('2d')
            const img = new Image()
            img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height)
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            }
            img.src = this.formData.signatures[type]
          }
        }
      })
    },
    
    startDrawing(event, type) {
      // เริ่มต้นการวาดลายเซ็น
      this.isDrawing[type] = true
      const canvas = this.$refs[`${type}Signature`]
      const rect = canvas.getBoundingClientRect()
      const position = this.getEventPosition(event, rect)
      
      this.lastPosition[type] = position
      
      const ctx = canvas.getContext('2d')
      ctx.beginPath()
      ctx.moveTo(position.x, position.y)
      ctx.stroke()
    },
    
    draw(event, type) {
      // วาดลายเซ็นต่อเนื่อง
      if (!this.isDrawing[type]) return
      
      const canvas = this.$refs[`${type}Signature`]
      const rect = canvas.getBoundingClientRect()
      const position = this.getEventPosition(event, rect)
      
      const ctx = canvas.getContext('2d')
      ctx.beginPath()
      ctx.moveTo(this.lastPosition[type].x, this.lastPosition[type].y)
      ctx.lineTo(position.x, position.y)
      ctx.stroke()
      
      this.lastPosition[type] = position
    },
    
    endDrawing(type) {
      // จบการวาดลายเซ็น
      if (this.isDrawing[type]) {
        this.isDrawing[type] = false
        
        // บันทึกลายเซ็นเป็น Data URL
        const canvas = this.$refs[`${type}Signature`]
        this.formData.signatures[type] = canvas.toDataURL('image/png')
      }
    },
    
    clearSignature(type) {
      // ล้างลายเซ็น
      const canvas = this.$refs[`${type}Signature`]
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      this.formData.signatures[type] = null
    },
    
    getEventPosition(event, rect) {
      // ดึงตำแหน่งเม้าส์หรือการสัมผัสบนหน้าจอ
      let clientX, clientY
      
      // รองรับทั้ง Touch และ Mouse events
      if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX
        clientY = event.touches[0].clientY
      } else {
        clientX = event.clientX
        clientY = event.clientY
      }
      
      // คำนวณตำแหน่งเทียบกับ Canvas
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      }
    },
    
    handleFileUpload(event) {
      // อัพโหลดรูปใบขับขี่
      const file = event.target.files[0]
      if (file) {
        // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('ขนาดไฟล์ต้องไม่เกิน 5MB')
          return
        }
        
        // ตรวจสอบประเภทไฟล์ (รูปภาพเท่านั้น)
        if (!file.type.startsWith('image/')) {
          alert('กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น')
          return
        }
        
        // แปลงเป็น Data URL
        const reader = new FileReader()
        reader.onload = (e) => {
          this.formData.licenseImage = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    
    populateFormData(data) {
      // กรอกข้อมูลจาก API เข้าสู่ฟอร์ม
      const simpleFields = [
        'salesSpecialist', 'tel', 'customerName', 'idNumber', 'customerTel',
        'houseNo', 'village', 'district', 'province', 'purpose', 'vehicleBrand',
        'model', 'type', 'color', 'vinNumber', 'startMileage', 'endMileage',
        'startDate', 'endDate', 'licenseImage'
      ]
      
      // กรอกฟิลด์พื้นฐาน
      simpleFields.forEach(field => {
        if (data[field] !== undefined) {
          this.formData[field] = data[field]
        }
      })
      
      // กรอกลายเซ็น
      if (data.signatures) {
        // ดูว่ามีลายเซ็นไหนบ้าง
        const signatureTypes = ['customer', 'sales', 'manager']
        signatureTypes.forEach(type => {
          if (data.signatures[type]) {
            this.formData.signatures[type] = data.signatures[type]
            
            // วาดลายเซ็นลงบน Canvas
            setTimeout(() => {
              const canvas = this.$refs[`${type}Signature`]
              if (canvas) {
                const ctx = canvas.getContext('2d')
                const img = new Image()
                img.onload = () => {
                  ctx.clearRect(0, 0, canvas.width, canvas.height)
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                }
                img.src = data.signatures[type]
              }
            }, 100) // รอให้ Canvas พร้อมก่อน
          }
        })
      }
    },
    
    async submitForm() {
      // ตรวจสอบข้อมูลจำเป็น
      if (!this.validateForm()) {
        return
      }
      
      this.isSubmitting = true
      
      try {
        let response
        const isEdit = !!this.$route.params.id
        
        if (isEdit) {
          // อัพเดตเอกสาร
          response = await this.$axios.$patch(
            `/api/test-drives/${this.$route.params.id}`,
            this.formData
          )
        } else {
          // สร้างเอกสารใหม่
          response = await this.$axios.$post('/test-drives', this.formData)
        }
        
        // แสดงข้อความสำเร็จ
        this.$nuxt.$emit('showToast', {
          message: isEdit ? 'อัพเดตเอกสารเรียบร้อยแล้ว' : 'สร้างเอกสารเรียบร้อยแล้ว',
          type: 'success'
        })
        
        // นำทางไปหน้าอื่น
        if (response && response.id) {
          if (this.$store.state.booking && this.$store.state.booking.currentBooking) {
            // ถ้ามาจากการจอง ให้ไปหน้าจองสำเร็จ
            this.$router.push('/booking/success')
          } else {
            // ไปหน้ารายละเอียดเอกสาร
            this.$router.push(`/queue/${response.id}/document`)
          }
        } else {
          // กลับไปหน้ารายการคิว
          this.$router.push('/queue')
        }
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error)
        this.$nuxt.$emit('showToast', {
          message: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
          type: 'error'
        })
      } finally {
        this.isSubmitting = false
      }
    },
    
    validateForm() {
      // ตรวจสอบข้อมูลจำเป็น
      const requiredFields = {
        'customerName': 'ชื่อ-นามสกุลลูกค้า',
        'idNumber': 'เลขบัตรประชาชน',
        'customerTel': 'เบอร์โทรลูกค้า',
        'salesSpecialist': 'ชื่อที่ปรึกษาการขาย'
      }
      
      // ตรวจสอบฟิลด์ข้อความ
      for (const [field, label] of Object.entries(requiredFields)) {
        if (!this.formData[field]) {
          alert(`กรุณากรอก${label}`)
          return false
        }
      }
      
      // ตรวจสอบลายเซ็นของลูกค้า (บังคับมี)
      if (!this.formData.signatures.customer) {
        alert('กรุณาลงลายเซ็นของลูกค้า')
        return false
      }
      
      return true
    },
    
    goBack() {
      // กลับไปหน้าก่อนหน้า
      this.$router.back()
    }
  },
  
  head() {
    return {
      title: this.$route.params.id ? 'แก้ไขเอกสารทดลองขับ' : 'สร้างเอกสารทดลองขับ'
    }
  }
}
</script>

<style scoped>
/* Container */
.document-container {
  max-width: 430px;
  margin: 0 auto;
  padding: 16px;
  padding-bottom: 80px; /* เพิ่ม padding ด้านล่างเพื่อไม่ให้ทับซ้อนกับ bottomnav */
  background-color: #fff;
  min-height: 100vh;
}

/* Header styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #333;
}

.back-button:hover {
  background-color: #f5f5f5;
  border-radius: 50%;
}

.title-container h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.title-container h2 {
  font-size: 14px;
  color: #666;
  margin: 4px 0 0 0;
}

.date-time {
  font-size: 14px;
  text-align: right;
}

.date-time .date,
.date-time .time {
  margin-bottom: 4px;
}

/* Loading container */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #2563eb;
  width: 36px;
  height: 36px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Form styles */
.form-group {
  margin-bottom: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
}

input[type="text"],
input[type="tel"],
input[type="date"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s;
}

input[type="text"]:focus,
input[type="tel"]:focus,
input[type="date"]:focus {
  outline: none;
  border-color: #2563eb;
}

input[type="text"]:disabled,
input[type="tel"]:disabled,
input[type="date"]:disabled,
input[type="radio"]:disabled {
  background-color: #f9f9f9;
  cursor: not-allowed;
}

/* Customer Info section */
.customer-info {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  background-color: #fff;
}

.customer-info h3 {
  font-size: 16px;
  margin: 0 0 16px 0;
  font-weight: 500;
}

.address-group {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 8px;
}

/* Radio groups */
.radio-group {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.radio-item input[type="radio"] {
  width: 18px;
  height: 18px;
  margin-right: 4px;
}

.radio-item label {
  margin-bottom: 0;
  font-size: 14px;
}

/* Purpose section */
.purpose-section {
  margin-bottom: 24px;
}

.purpose-section h3 {
  font-size: 16px;
  margin: 0 0 12px 0;
  font-weight: 500;
}

/* Vehicle selection */
.vehicle-selection {
  margin-bottom: 24px;
}

/* Usage period */
.usage-period {
  margin-bottom: 24px;
}

.date-range {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin: 16px 0;
}

.date-input {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.date-input span {
  font-size: 14px;
  color: #555;
}

.company-info {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 16px;
  font-size: 14px;
}

.company-name {
  font-weight: 500;
}

/* License upload section */
.license-section {
  margin-bottom: 24px;
}

.license-section h3 {
  font-size: 16px;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
}

.preview-container {
  margin-bottom: 16px;
  min-height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-container img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}

.upload-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fff;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-button:hover {
  background-color: #f5f5f5;
}

.upload-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Terms section */
.terms {
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
}

/* ข้อมูลสำคัญก่อนทดลองขับ - ส่วนที่เพิ่มเติม */
.insurance-info {
  background-color: #f8fafc;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.insurance-info h3 {
  font-size: 16px;
  margin: 0 0 12px 0;
  font-weight: 600;
  color: #1e40af;
}

.insurance-info-content {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}

.info-list {
  margin: 12px 0;
  padding-left: 16px;
}

.info-list li {
  margin-bottom: 8px;
}

.highlight-box {
  background-color: #eef2ff;
  border-left: 4px solid #2563eb;
  padding: 12px;
  margin: 12px 0;
  border-radius: 0 4px 4px 0;
}

/* ข้อควรระวัง - ส่วนเพิ่มเติม */
.caution-section {
  background-color: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.caution-section h3 {
  font-size: 16px;
  margin: 0 0 12px 0;
  font-weight: 600;
  color: #b45309;
  display: flex;
  align-items: center;
  gap: 8px;
}

.caution-icon {
  width: 20px;
  height: 20px;
  background-color: #b45309;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.caution-list {
  margin: 0;
  padding-left: 16px;
}

.caution-list li {
  margin-bottom: 8px;
  font-size: 14px;
  color: #78350f;
}

/* Signatures section */
.signatures {
  margin-bottom: 32px;
}

.signatures h3 {
  font-size: 16px;
  margin: 0 0 16px 0;
  font-weight: 500;
}

.signature-item {
  margin-bottom: 24px;
}

.signature-label {
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
}

.signature-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.signature-pad-container {
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
  width: 100%;
  max-width: 300px;
}

.signature-pad-container.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.signature-pad {
  touch-action: none;
  background-color: #fff;
  width: 100%;
}

.clear-signature-button {
  font-size: 12px;
  padding: 4px 12px;
  background-color: #f3f4f6;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-signature-button:hover {
  background-color: #e5e7eb;
}

.clear-signature-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Action buttons */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  margin-bottom: 16px; /* เพิ่ม margin ด้านล่าง */
  position: relative; /* ปรับตำแหน่ง */
  z-index: 10; /* ให้อยู่เหนือชั้นอื่นๆ */
}

.button-cancel,
.button-submit {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px; /* เพิ่มขนาดปุ่มให้กดง่ายบนมือถือ */
}

.button-cancel {
  background-color: #fff;
  border: 1px solid #ddd;
  color: #333;
}

.button-cancel:hover {
  background-color: #f5f5f5;
}

.button-submit {
  background-color: #2563eb;
  border: none;
  color: #fff;
}

.button-submit:hover {
  background-color: #1d4ed8;
}

.button-cancel:disabled,
.button-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Overlay for loading state */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* แก้ไขสำหรับ bottomnav */
.bottom-nav-spacer {
  height: 60px; /* ความสูงของ bottom nav */
  width: 100%;
  margin-top: 20px;
}

/* Responsive design */
@media screen and (max-width: 430px) {
  .document-container {
    padding: 12px;
    padding-bottom: 80px; /* คงค่า padding ด้านล่างเพื่อไม่ให้ทับซ้อนกับ bottomnav */
  }

  .header {
    margin-bottom: 20px;
  }

  .form-grid {
    gap: 12px;
  }

  input[type="text"],
  input[type="tel"],
  input[type="date"] {
    font-size: 16px; /* ป้องกันการซูมบน iOS */
    padding: 10px;
  }

  .radio-group {
    gap: 12px;
  }

  .button-cancel,
  .button-submit {
    padding: 10px 20px;
    font-size: 14px;
  }
}

/* Touch device optimizations */
@media (hover: none) {
  input[type="text"],
  input[type="tel"],
  input[type="date"] {
    font-size: 16px; /* ป้องกันการซูมบน iOS */
  }

  .signature-pad {
    touch-action: none;
  }

  .button-cancel,
  .button-submit,
  .clear-signature-button,
  .upload-button {
    min-height: 44px; /* เพิ่มขนาดปุ่มให้กดง่ายบนมือถือ */
  }
}
</style>