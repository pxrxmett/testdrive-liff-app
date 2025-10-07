<!-- pages/index.vue -->
<template>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div class="brand">ISUZU</div>
        <div class="user-info">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>{{ staffInfo.name }}</span>
          <div class="divider"></div>
          <span>{{ staffInfo.branch }}</span>
        </div>
      </div>
    </div>

    <main class="main-content">
      <!-- Title and Search Section -->
      <div class="title-section">
        <h2>
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          คิวลูกค้าทั้งหมด
        </h2>
        
        <div class="search-container">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchTerm" type="text" placeholder="ค้นหาชื่อลูกค้า..." @input="filterQueues">
        </div>

        <!-- Filter Pills -->
        <div class="filter-pills">
          <button class="filter-btn" @click="showModelFilter = true">
            {{ selectedModel || 'รุ่นรถทั้งหมด' }}
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <button class="filter-btn" @click="showStatusFilter = true">
            {{ selectedStatus ? getStatusText(selectedStatus) : 'สถานะทั้งหมด' }}
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>

        <!-- Model Filter Modal -->
        <div v-if="showModelFilter" class="filter-modal">
          <div class="modal-content">
            <h3>เลือกรุ่นรถ</h3>
            <div class="option-list">
              <button :class="{ active: selectedModel === null }" @click="selectModel(null)">ทั้งหมด</button>
              <button v-for="model in carModels" :key="model" :class="{ active: selectedModel === model }" @click="selectModel(model)">
                {{ model }}
              </button>
            </div>
            <button class="close-btn" @click="showModelFilter = false">ปิด</button>
          </div>
        </div>

        <!-- Status Filter Modal -->
        <div v-if="showStatusFilter" class="filter-modal">
          <div class="modal-content">
            <h3>เลือกสถานะ</h3>
            <div class="option-list">
              <button :class="{ active: selectedStatus === null }" @click="selectStatus(null)">ทั้งหมด</button>
              <button v-for="(text, status) in statusOptions" :key="status" :class="{ active: selectedStatus === status }" @click="selectStatus(status)">
                {{ text }}
              </button>
            </div>
            <button class="close-btn" @click="showStatusFilter = false">ปิด</button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="hasNoQueues && !loading" class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <p>ไม่พบรายการคิวทดลองขับของคุณ</p>
          <button class="reload-btn" @click="fetchTestDrives">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            โหลดข้อมูลใหม่
          </button>
        </div>

        <!-- Queue Lists -->
        <div v-if="!hasNoQueues && !loading" class="queue-lists">
          <div v-if="Object.keys(groupedQueues).length === 0" class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <p>ไม่พบรายการคิวที่ตรงกับเงื่อนไขการค้นหา</p>
          </div>
          <template v-else>
            <div v-for="(queues, date) in groupedQueues" :key="date" class="date-section">
              <div class="date-header">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <h3>{{ formatDate(date) }}</h3>
              </div>
              <div class="queue-cards">
                <div v-for="queue in queues" :key="queue.id" class="queue-card" @click="goToQueueDetail(queue.id)">
                  <div class="queue-info">
                    <h3>{{ queue.name }}</h3>
                    <div class="queue-meta">
                      <span class="time">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {{ queue.time }}
                      </span>
                      <span class="dot"></span>
                      <span>{{ queue.model }}</span>
                      <span v-if="queue.phone" class="dot"></span>
                      <span v-if="queue.phone" class="phone">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        {{ queue.phone }}
                      </span>
                    </div>
                  </div>
                  <div class="queue-actions">
                    <button :class="['status-badge', queue.status]" @click.stop="updateStatus(queue)">
                      {{ getStatusText(queue.status) }}
                    </button>
                    <button v-if="queue.phone" class="action-btn" @click.stop="callCustomer(queue.phone)">
                      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>

    <!-- Status Update Modal -->
    <div v-if="showStatusUpdateModal" class="status-modal">
      <div class="modal-content">
        <h3>อัปเดตสถานะ</h3>
        <div class="status-options">
          <button 
            v-for="(text, status) in statusOptions" 
            :key="status" 
            :class="['status-option', status]"
            @click="confirmStatusUpdate(status)" 
          >
            {{ text }}
          </button>
        </div>
        <button class="close-btn" @click="showStatusUpdateModal = false">ยกเลิก</button>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>กำลังโหลด...</p>
    </div>

    <!-- Bottom Navigation -->
    <BottomNav :active-page="'home'" />
  </div>
</template>

<script>
import BottomNav from '~/components/common/BottomNav.vue'
import { formatDate as formatDateUtil, formatTime as formatTimeUtil } from '~/utils/dateFormatter'

export default {
  name: 'IndexPage',
  layout: 'default',
  
  components: {
    BottomNav
  },
  
  middleware: ['auth'],
  
  data() {
    return {
      loading: false,
      errorMessage: '',
      staffInfo: {
        id: '',
        name: '',
        branch: '',
        staff_code: ''
      },
      searchTerm: '',
      showStatusUpdateModal: false,
      selectedQueue: null,
      queueData: [],
      filteredQueues: [],
      carModels: ['D-MAX', 'MU-X', 'BYD DOLPHIN'], // เพิ่มรุ่นรถ BYD จากข้อมูล API
      statusOptions: {
        pending: 'รอดำเนินการ',
        testing: 'กำลังทดสอบขับ',
        completed: 'เสร็จสิ้น',
        cancelled: 'ยกเลิก',
        in_progress: 'กำลังดำเนินการ'
      },
      // เพิ่ม properties ที่ template ใช้
      selectedModel: '',
      selectedStatus: '',
      showModelFilter: false,
      showStatusFilter: false
    }
  },
  
  computed: {
    groupedQueues() {
      const groups = {}
      this.filteredQueues.forEach(queue => {
        // ตรวจสอบว่า date ไม่ใช่ค่าว่าง
        const date = queue.date || 'ไม่ระบุวันที่'
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(queue)
      })
      
      // เรียงลำดับตามวันที่
      const sortedGroups = {}
      Object.keys(groups)
        .sort((a, b) => {
          if (a === 'ไม่ระบุวันที่') return 1
          if (b === 'ไม่ระบุวันที่') return -1
          
          const dateA = new Date(groups[a][0].rawDate)
          const dateB = new Date(groups[b][0].rawDate)
          return dateA - dateB
        })
        .forEach(date => {
          // เรียงข้อมูลในแต่ละวันตามเวลา
          sortedGroups[date] = groups[date].sort((a, b) => {
            const timeA = a.time || ''
            const timeB = b.time || ''
            return timeA.localeCompare(timeB)
          })
        })
      
      return sortedGroups
    },
    
    hasNoQueues() {
      return this.queueData.length === 0
    }
  },
  
  async mounted() {
    try {
      this.loading = true
      console.log('เริ่มต้นการตรวจสอบสถานะ...')

      // ดึงข้อมูล token จาก localStorage หรือ store
      const token = this.$store.state.auth?.token || localStorage.getItem('token')
      if (!token) {
        console.log('ไม่พบ token ในระบบ')
        await this.$router.push('/login')
        return
      }

      // ให้แน่ใจว่า middleware ตรวจสอบถูกต้อง
      if (this.$store.state.auth?.user?.id) {
        console.log('ใช้ข้อมูลจาก store:', this.$store.state.auth.user)
        this.staffInfo = {...this.$store.state.auth.user}
        
        // เพิ่มการตรวจสอบ staff_code จาก localStorage ถ้าไม่มีใน store
        if (!this.staffInfo.staff_code) {
          try {
            const lineProfileStr = localStorage.getItem('lineProfile')
            if (lineProfileStr) {
              const lineCheckData = localStorage.getItem('lineCheckData')
              if (lineCheckData) {
                const checkData = JSON.parse(lineCheckData)
                if (checkData.staffCode || checkData.staff_code) {
                  console.log('พบ staff_code ใน localStorage:', checkData.staff_code || checkData.staffCode)
                  this.staffInfo.staff_code = checkData.staff_code || checkData.staffCode
                  
                  // อัปเดต store ด้วย
                  await this.$store.dispatch('auth/setUser', this.staffInfo)
                }
              }
            }
          } catch (error) {
            console.error('ไม่สามารถดึงข้อมูล staff_code จาก localStorage:', error)
          }
        }
        
        if (this.staffInfo.id) {
          console.log('มีข้อมูล ID พนักงานแล้ว:', this.staffInfo.id)
          console.log('Staff Code จาก store:', this.staffInfo.staff_code)
          await this.fetchTestDrives()
          return
        }
      }

      // ตรวจสอบการเชื่อมโยงบัญชี LINE
      console.log('กำลังตรวจสอบการเชื่อมโยงบัญชี LINE...')
      let checkResponse
      try {
        // ดึงข้อมูล LINE Profile จาก localStorage
        const lineProfileStr = localStorage.getItem('lineProfile')
        if (!lineProfileStr) {
          console.error('ไม่พบข้อมูล LINE Profile ในระบบ')
          await this.$router.push('/login')
          return
        }
        
        const lineProfile = JSON.parse(lineProfileStr)
        const lineUserId = lineProfile.userId
        
        if (!lineUserId) {
          console.error('ไม่พบข้อมูล LINE userId ในระบบ')
          await this.$router.push('/login')
          return
        }
        
        // ส่งข้อมูล lineUserId ไปกับ API (ไม่ต้องการ token)
        checkResponse = await this.$axios.$post('/api/line-integration/check', { 
          lineUserId
        })
        
        console.log('ผลการตรวจสอบ LINE:', checkResponse)
        
        // เก็บข้อมูลเพื่อใช้ในครั้งต่อไป
        if (checkResponse?.staffInfo) {
          localStorage.setItem('lineCheckData', JSON.stringify(checkResponse.staffInfo))
        }
      } catch (error) {
        console.error('ข้อผิดพลาดในการตรวจสอบการเชื่อมโยง LINE:', error)
        await this.$router.push('/login')
        return
      }

      // ตรวจสอบ response
      if (!checkResponse?.registered) {
        console.log('ยังไม่ได้เชื่อมโยงบัญชี LINE')
        await this.$router.push('/login')
        return
      }

      // ตรวจสอบ staffInfo
      if (!checkResponse?.staffInfo?.id) {
        console.error('ไม่พบ staffInfo.id ในผลลัพธ์การตรวจสอบ LINE')
        throw new Error('ข้อมูลเชื่อมโยงไม่สมบูรณ์ กรุณาเชื่อมโยงบัญชีใหม่')
      }

      const staffId = checkResponse.staffInfo.id;
      console.log('กำลังดึงข้อมูลพนักงาน... Staff ID:', staffId)
      
      // ดึงข้อมูลพนักงาน
      try {
        const staffResponse = await this.$axios.$get(`/api/staffs/${staffId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        console.log('ข้อมูลพนักงานที่ได้รับ:', staffResponse)

        if (!staffResponse) {
          throw new Error('ไม่สามารถดึงข้อมูลพนักงานได้')
        }

        // ตรวจสอบว่ามี ID หรือไม่
        if (!staffResponse.id) {
          console.error('API ส่งค่าตอบกลับมาแต่ไม่มี ID:', staffResponse)
          throw new Error('ข้อมูลพนักงานที่ได้รับไม่ถูกต้อง (ไม่มี ID)')
        }

        // ตรวจสอบการใช้ staff_code จาก checkResponse
        const checkStaffCode = checkResponse.staffInfo?.staffCode || checkResponse.staffInfo?.staff_code

        // กำหนดข้อมูลพนักงาน
        this.staffInfo = {
          id: staffResponse.id,
          name: staffResponse.name || `${staffResponse.first_name || ''} ${staffResponse.last_name || ''}`.trim(),
          branch: staffResponse.branch || 'เชียงราย',
          staff_code: staffResponse.staff_code || checkStaffCode
        }

        console.log('ข้อมูลพนักงานที่แปลงแล้ว:', this.staffInfo)

        // บันทึกข้อมูลลง store
        await this.$store.dispatch('auth/setUser', this.staffInfo)

        // ตรวจสอบว่า staffInfo มี ID หรือไม่หลังจากบันทึก
        if (!this.staffInfo.id) {
          console.error('หลังจากบันทึก store แล้วยังไม่มี ID:', this.staffInfo)
          throw new Error('เกิดข้อผิดพลาดในการเก็บข้อมูลพนักงาน')
        }

        // ดึงข้อมูลคิว
        await this.fetchTestDrives()

      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน:', error)
        throw error
      }

    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error)
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง'
      
      this.$store.dispatch('notifications/add', {
        type: 'error',
        message: errorMessage
      })
      
      await this.$store.dispatch('auth/logout')
      await this.$router.push('/login')
    } finally {
      this.loading = false
    }
  },
  
  methods: {
    async fetchTestDrives() {
      try {
        this.loading = true
        console.log('กำลังดึงข้อมูลคิว...')

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!this.staffInfo?.id) {
          console.error('ไม่พบข้อมูล ID พนักงาน:', this.staffInfo)
          
          // ลองดึงข้อมูลจาก store อีกครั้ง
          const userInfo = this.$store.state.auth?.user
          if (userInfo?.id) {
            console.log('ใช้ข้อมูลพนักงานจาก store แทน:', userInfo)
            this.staffInfo = {...userInfo}
          } else {
            throw new Error('ไม่พบข้อมูลพนักงาน กรุณาเข้าสู่ระบบใหม่')
          }
        }

        const token = this.$store.state.auth?.token || localStorage.getItem('token')
        if (!token) {
          console.error('ไม่พบ token')
          throw new Error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่')
        }

        console.log('กำลังส่งคำขอ API ด้วย ID พนักงาน:', this.staffInfo.id)
        console.log('Staff Code:', this.staffInfo.staff_code)
        
        // เรียก API เพื่อดึงข้อมูลคิวทั้งหมด (ไม่ส่ง parameters เพราะ API ยังไม่รองรับ)
        const response = await this.$axios.$get('/api/test-drives', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        console.log('ข้อมูลคิวที่ได้รับ (ทั้งหมด):', response)
        
        // Debug: ดูโครงสร้างข้อมูลจริง
        if (response.length > 0) {
          console.log('ตัวอย่างข้อมูลคิวแรก (ทั้งหมด):', JSON.stringify(response[0], null, 2))
          console.log('Keys ทั้งหมดในคิวแรก:', Object.keys(response[0]))
        }

        if (!Array.isArray(response)) {
          console.error('ข้อมูลไม่ถูกต้อง:', response)
          throw new Error('ข้อมูลที่ได้รับไม่ถูกต้อง ไม่ใช่ array')
        }
        
        // กรองเฉพาะคิวของพนักงานที่ล็อกอิน
        // หมายเหตุ: API ปัจจุบันไม่มี responsible_staff ID จึงแสดงทุกคิวชั่วคราว
        console.log('⚠️ API ไม่มี responsible_staff field - แสดงทุกคิวชั่วคราว')
        console.log('ข้อมูลพนักงานปัจจุบัน:', {
          id: this.staffInfo.id,
          staff_code: this.staffInfo.staff_code,
          name: this.staffInfo.name
        })
        
        // ชั่วคราว: กรองตาม staff_name ถ้ามี (หรือแสดงทุกคิวถ้าไม่มี)
        const filteredByStaff = response.filter(item => {
          // ถ้า staff_name มีค่าและตรงกับชื่อพนักงาน
          if (item.staff_name && this.staffInfo.name) {
            const isMatch = item.staff_name.toLowerCase().includes(this.staffInfo.name.toLowerCase()) ||
                           this.staffInfo.name.toLowerCase().includes(item.staff_name.toLowerCase())
            
            console.log('ตรวจสอบ Queue ID:', item.id, 'Staff Name:', item.staff_name, 'vs ชื่อพนักงาน:', this.staffInfo.name, 'Match:', isMatch)
            return isMatch
          }
          
          // ถ้าไม่มี staff_name หรือเป็น null ให้แสดงทุกคิว (เพื่อให้เห็นข้อมูล)
          console.log('Queue ID:', item.id, 'ไม่มี staff_name - รวมไว้ในรายการ')
          return true
        })
        
        // แจ้งเตือนเกี่ยวกับปัญหา API
        if (filteredByStaff.length === response.length) {
          console.log('🚨 แสดงทุกคิวเพราะ API ไม่มี responsible_staff field')
          this.$store.dispatch('notifications/add', {
            type: 'warning',
            message: 'กำลังแสดงคิวทั้งหมด เนื่องจาก API ยังไม่รองรับการกรองตามพนักงาน'
          })
        } else {
          console.log('กรองแล้ว - คิวทั้งหมด:', response.length, 'คิวของพนักงานนี้:', filteredByStaff.length)
        }
        
        // แปลงข้อมูล
        this.queueData = this.formatAPIData(filteredByStaff)
        
        // เรียงลำดับตามวันที่และเวลา
        this.queueData.sort((a, b) => {
          if (!a.rawDate && !b.rawDate) return 0
          if (!a.rawDate) return 1
          if (!b.rawDate) return -1
          
          const dateComparison = new Date(a.rawDate) - new Date(b.rawDate)
          if (dateComparison !== 0) return dateComparison
          
          const timeA = a.time || ''
          const timeB = b.time || ''
          return timeA.localeCompare(timeB)
        })
        
        // กำหนดข้อมูลที่จะแสดง
        this.filteredQueues = [...this.queueData]
        
        console.log('จำนวนคิวของพนักงานนี้:', this.queueData.length)
        
        // แจ้งเตือนถ้าไม่มีคิว
        if (this.queueData.length === 0) {
          console.log('ไม่พบคิวสำหรับพนักงานรหัส:', this.staffInfo.staff_code)
          this.$store.dispatch('notifications/add', {
            type: 'info',
            message: 'ไม่พบคิวการทดลองขับสำหรับคุณในขณะนี้'
          })
        } else {
          this.$store.dispatch('notifications/add', {
            type: 'info',
            message: `พบคิว ${this.queueData.length} รายการ${filteredByStaff.length === response.length ? ' (ทั้งหมด - ยังไม่กรองตามพนักงาน)' : ''}`
          })
        }
        
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลคิว:', error)
        
        let errorMessage = 'ไม่สามารถโหลดข้อมูลคิวได้ กรุณาลองใหม่อีกครั้ง'
        
        // ตรวจสอบประเภทของ error
        if (error.response) {
          const statusCode = error.response.status
          if (statusCode === 401) {
            errorMessage = 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่'
          } else if (statusCode === 403) {
            errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้'
          } else if (statusCode === 404) {
            errorMessage = 'ไม่พบข้อมูลคิวสำหรับพนักงานนี้'
          } else if (statusCode >= 500) {
            errorMessage = 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาติดต่อผู้ดูแลระบบ'
          }
          
          console.error('HTTP Error:', statusCode, error.response.data)
        } else if (error instanceof Error) {
          errorMessage = error.message
        }
        
        this.$store.dispatch('notifications/add', {
          type: 'error',
          message: errorMessage
        })

        if (errorMessage.includes('Session') || errorMessage.includes('เข้าสู่ระบบ')) {
          await this.$store.dispatch('auth/logout')
          await this.$router.push('/login')
        }
      } finally {
        this.loading = false
      }
    },
    
    formatAPIData(apiData) {
      // Debug: ดูข้อมูลที่ได้รับ
      if (apiData.length > 0) {
        console.log('ตัวอย่างข้อมูลคิวแรก:', apiData[0])
        console.log('ข้อมูลพนักงานปัจจุบัน:', this.staffInfo)
      }
      
      return apiData.map(item => {
        // Debug: ดู responsible staff ในแต่ละ item
        console.log('Queue ID:', item.id, 'Responsible Staff Info:', {
          responsible_staff: item.responsible_staff,
          responsibleStaff: item.responsibleStaff,
          responsibleStaffId: item.responsibleStaffId,
          staff_id: item.staff_id
        })
        
        // แปลงสถานะ
        let status = 'pending'
        if (item.status) {
          switch(item.status.toLowerCase()) {
            case 'in_progress':
            case 'testing':
            case 'ongoing':
              status = 'testing'
              break
            case 'completed':
            case 'done':
              status = 'completed'
              break
            case 'cancelled':
            case 'canceled':
              status = 'cancelled'
              break
            default:
              status = item.status.toLowerCase()
          }
        }
        
        // ดึงข้อมูลรถยนต์
        let vehicleModel = 'ไม่ระบุ'
        if (item.vehicle && item.vehicle.model) {
          vehicleModel = item.vehicle.model
        }
        
        // ดึงข้อมูลวันที่และเวลา
        const startTime = item.startTime || item.start_time || ''
        const expectedEndTime = item.expectedEndTime || item.expected_end_time || ''
        
        return {
          id: item.id,
          name: item.customerName || item.customer_name || '',
          model: vehicleModel,
          time: this.formatTime(startTime),
          date: this.formatDate(startTime),
          status,
          phone: item.customerPhone || item.customer_phone || '',
          rawDate: startTime,
          duration: item.duration || 0,
          expectedEndTime,
          vehicleId: item.vehicle?.id,
          vehicleDetails: item.vehicle || null,
          createdAt: item.createdAt || item.created_at,
          updatedAt: item.updatedAt || item.updated_at,
          responsibleStaff: item.responsible_staff || item.responsibleStaff || item.responsibleStaffId
        }
      })
    },
    
    filterQueues() {
      this.filteredQueues = this.queueData.filter(queue => {
        // กรองตามคำค้นหา (ชื่อลูกค้า, รุ่นรถ, เบอร์โทร)
        const searchTermLower = this.searchTerm.toLowerCase()
        const matchesSearch = this.searchTerm === '' || 
               (queue.name && queue.name.toLowerCase().includes(searchTermLower)) ||
               (queue.model && queue.model.toLowerCase().includes(searchTermLower)) ||
               (queue.phone && queue.phone.includes(searchTermLower))
        
        // กรองตามรุ่นรถ
        const matchesModel = this.selectedModel === '' || queue.model === this.selectedModel
        
        // กรองตามสถานะ
        const matchesStatus = this.selectedStatus === '' || queue.status === this.selectedStatus
        
        return matchesSearch && matchesModel && matchesStatus
      })
    },
    
   updateStatus(queue) {
      this.selectedQueue = queue
      this.showStatusUpdateModal = true
    },
    
    async confirmStatusUpdate(newStatus) {
      if (!this.selectedQueue) return
      
      try {
        this.loading = true
        
        await this.$axios.$patch(`/api/test-drives/${this.selectedQueue.id}`, {
          status: newStatus
        })
        
        this.selectedQueue.status = newStatus
        
        const queueIndex = this.queueData.findIndex(q => q.id === this.selectedQueue.id)
        if (queueIndex !== -1) {
          this.queueData[queueIndex].status = newStatus
        }
        
        this.$store.dispatch('notifications/add', {
          type: 'success',
          message: `อัปเดตสถานะเป็น "${this.getStatusText(newStatus)}" สำเร็จ`
        })
        
        this.showStatusUpdateModal = false
        this.selectedQueue = null
        this.filterQueues()
        
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ:', error)
        
        this.$store.dispatch('notifications/add', {
          type: 'error',
          message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ กรุณาลองใหม่อีกครั้ง'
        })
      } finally {
        this.loading = false
      }
    },
    
    getStatusText(status) {
      return this.statusOptions[status] || status
    },
    
    formatDate(date) {
      return formatDateUtil(date)
    },
    
    formatTime(time) {
      return formatTimeUtil(time)
    },
    
    goToQueueDetail(id) {
      this.$router.push(`/queue/${id}`)
    },
    
    callCustomer(phone) {
      if (!phone) return
      window.location.href = `tel:${phone}`
    },

    // เพิ่ม methods สำหรับ filter
    toggleModelFilter() {
      this.showModelFilter = !this.showModelFilter
      this.showStatusFilter = false
    },

    toggleStatusFilter() {
      this.showStatusFilter = !this.showStatusFilter
      this.showModelFilter = false
    },

    selectModel(model) {
      this.selectedModel = model
      this.showModelFilter = false
      this.filterQueues()
    },

    selectStatus(status) {
      this.selectedStatus = status
      this.showStatusFilter = false
      this.filterQueues()
    },

    clearFilters() {
      this.selectedModel = ''
      this.selectedStatus = ''
      this.searchTerm = ''
      this.showModelFilter = false
      this.showStatusFilter = false
      this.filterQueues()
    }
  }
}
</script>


<style scoped>
/* Base styles */
.container {
  font-family: system-ui, -apple-system, sans-serif;
  background-color: #f9fafb;
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  padding-bottom: 80px;
  position: relative;
}

.icon {
  width: 20px;
  height: 20px;
  stroke: currentColor;
}

/* Header */
.header {
  background-color: #dc2626;
  color: white;
  padding: 1rem 1.25rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: -0.025em;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
}

.divider {
  width: 1px;
  height: 16px;
  background-color: rgba(255, 255, 255, 0.3);
}

/* Main Content */
.main-content {
  padding: 1rem 1.25rem;
}

/* Title Section */
.title-section h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.title-section h2 .icon {
  color: #dc2626;
}

/* Search Container */
.search-container {
  position: relative;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  width: 16px;
  height: 16px;
  z-index: 5;
}

input[type="text"] {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

input[type="text"]:focus {
  outline: none;
  border-color: #fca5a5;
  box-shadow: 0 0 0 4px rgba(252, 165, 165, 0.1);
}

/* Filter Pills */
.filter-pills {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.filter-btn {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.filter-btn:hover {
  border-color: #fca5a5;
  background-color: #fff5f5;
}

.filter-btn .icon {
  width: 16px;
  height: 16px;
}

/* Filter Modals */
.filter-modal, .status-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal-content {
  width: 85%;
  max-width: 360px;
  background-color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.option-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.option-list button {
  padding: 0.75rem 1rem;
  text-align: left;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: white;
}

.option-list button.active {
  border-color: #dc2626;
  background-color: #fef2f2;
  color: #dc2626;
  font-weight: 500;
}

.close-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #f3f4f6;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  color: #374151;
}

/* Status Options */
.status-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.status-option {
  padding: 0.75rem 1rem;
  text-align: left;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  color: white;
}

.status-option.pending {
  background-color: #fbbf24;
}

.status-option.testing {
  background-color: #3b82f6;
}

.status-option.completed {
  background-color: #10b981;
}

.status-option.cancelled {
  background-color: #6b7280;
}

/* Queue Lists */
.date-section {
  margin-bottom: 1.5rem;
}

.date-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.25rem;
  margin-bottom: 0.75rem;
}

.date-header .icon {
  color: #dc2626;
  width: 18px;
  height: 18px;
}

.date-header h3 {
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
}

/* Queue Cards */
.queue-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.queue-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  cursor: pointer;
  gap: 1rem;  /* เพิ่มระยะห่างระหว่าง content และ actions */
}

.queue-card:hover {
  border-color: #fca5a5;
  background-color: #fff5f5;
}

.queue-info {
  flex: 1;       /* ให้ส่วนข้อมูลยืดหยุ่น */
  min-width: 0;  /* ป้องกันการล้น */
}

.queue-info h3 {
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
}

.queue-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
  color: #6b7280;
}

.time {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.time .icon, .phone .icon {
  width: 14px;
  height: 14px;
  color: #9ca3af;
}

.dot {
  width: 4px;
  height: 4px;
  background-color: #d1d5db;
  border-radius: 50%;
}

.phone {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

/* Queue Actions */
.queue-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
  flex-shrink: 0;  /* ป้องกันการหดตัว */
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f3f4f6;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: #e5e7eb;
}

.action-btn .icon {
  width: 16px;
  height: 16px;
  color: #374151;
}

/* Status Badges - Hybrid Style (แบบที่ 5) */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  white-space: nowrap;  /* ป้องกันการตกบรรทัด */
  flex-shrink: 0;       /* ป้องกันการหดตัว */
}

.status-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}
.status-badge.pending::before { 
  background-color: #f59e0b; 
}

.status-badge.testing {
  background-color: #dbeafe;
  color: #1e40af;
}
.status-badge.testing::before { 
  background-color: #3b82f6; 
}

.status-badge.completed {
  background-color: #d1fae5;
  color: #065f46;
}
.status-badge.completed::before { 
  background-color: #10b981; 
}

.status-badge.cancelled {
  background-color: #f3f4f6;
  color: #4b5563;
}
.status-badge.cancelled::before { 
  background-color: #6b7280; 
}

/* Hover effect for status badge */
.status-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  width: 48px;
  height: 48px;
  stroke: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #6b7280;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.reload-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reload-btn:hover {
  background-color: #b91c1c;
}

.reload-btn .icon {
  width: 16px;
  height: 16px;
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
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #dc2626;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-overlay p {
  color: #374151;
  font-size: 1rem;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>