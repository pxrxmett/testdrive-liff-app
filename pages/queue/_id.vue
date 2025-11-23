<template>
  <div class="detail">
    <header class="header">
      <div class="button" @click="goBack">
        <svg class="SVG" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </div>
      <div class="heading">
        <div class="text-wrapper">รายละเอียดการจอง</div>
      </div>
    </header>
    <div class="main">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <div>กำลังโหลดข้อมูล...</div>
      </div>
      <div v-else-if="error" class="error-container">
        <div>เกิดข้อผิดพลาด: {{ error }}</div>
        <button class="button-secondary" @click="fetchBookingDetails">ลองใหม่อีกครั้ง</button>
      </div>
      <template v-else>
        <div class="background-shadow">
          <div class="container">
            <div class="background">
              <svg class="img" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="margin">
              <div class="div">
                <div class="div-wrapper">
                  <div class="text-wrapper-2">{{ booking.customerName || 'ไม่ระบุชื่อลูกค้า' }}</div>
                </div>
                <div class="container-2">
                  <div class="text-wrapper-3">รหัสการจอง: #{{ booking.id }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="container-3">
            <div class="container-4">
              <div class="SVG-margin">
                <svg class="SVG" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
              <div class="div">
                <div class="container-2">
                  <div class="text-wrapper-3">รุ่นรถ</div>
                </div>
                <div class="container-5">
                  <div class="text-wrapper-4">{{ booking.model || 'ไม่ระบุรุ่นรถ' }}</div>
                </div>
                <div class="container-2" v-if="booking.modelDescription">
                  <div class="text-wrapper-3">{{ booking.modelDescription }}</div>
                </div>
              </div>
            </div>
            <div class="container-4">
              <div class="SVG-margin">
                <svg class="SVG" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div class="div">
                <div class="container-2">
                  <div class="text-wrapper-3">วันที่จอง</div>
                </div>
                <div class="container-6">
                  <div class="text-wrapper-5">{{ formatDate(booking.bookingDate) || 'ไม่ระบุวันที่' }}</div>
                </div>
              </div>
            </div>
            <div class="container-4">
              <div class="SVG-margin">
                <svg class="SVG" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div class="div">
                <div class="container-2">
                  <div class="text-wrapper-3">เวลาทดลองขับ</div>
                </div>
                <div class="container-6">
                  <div class="text-wrapper-6">{{ booking.bookingTime || 'ไม่ระบุ' }} น.</div>
                </div>
              </div>
            </div>
            <div class="container-4">
              <div class="SVG-margin">
                <svg class="SVG" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div class="div">
                <div class="container-2">
                  <div class="text-wrapper-3">สาขา</div>
                </div>
                <div class="container-6">
                  <div class="text-wrapper-7">{{ booking.branch || 'ไม่ระบุสาขา' }}</div>
                </div>
              </div>
            </div>
            <div v-if="booking.status" class="container-4">
              <div class="SVG-margin">
                <svg class="SVG" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div class="div">
                <div class="container-2">
                  <div class="text-wrapper-3">สถานะ</div>
                </div>
                <div class="container-6">
                  <div class="status-badge" :class="booking.status">
                    {{ getStatusText(booking.status) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="container-7">
          <button class="button-2" @click="editBooking">
            <div class="text-wrapper-8">แก้ไขคิว</div>
          </button>
          <button class="button-3" @click="showCancelConfirm = true">
            <div class="text-wrapper-9">ยกเลิกคิว</div>
          </button>
          <!-- ✅ ปุ่มเปลี่ยนตามสถานะเอกสาร -->
          <button v-if="!booking.hasPdpaConsent" class="button-4" @click="proceedToSignature">
            <div class="text-wrapper-10">เซ็นเอกสาร PDPA</div>
          </button>
          <button v-else-if="!booking.hasDocument" class="button-4" @click="proceedToDocument">
            <div class="text-wrapper-10">กรอกแบบฟอร์มทดลองขับ</div>
          </button>
          <button v-else class="button-4 button-start" @click="startTestDrive">
            <div class="text-wrapper-10">เริ่มทดลองขับ</div>
          </button>
        </div>
      </template>
    </div>

    <!-- Modal ยืนยันการยกเลิก -->
    <div v-if="showCancelConfirm" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title">ยืนยันการยกเลิกคิว</div>
        </div>
        <div class="modal-body">
          <p>คุณต้องการยกเลิกคิวการทดลองขับนี้ใช่หรือไม่?</p>
          <p class="modal-warning">หมายเหตุ: การยกเลิกไม่สามารถเรียกคืนได้</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn-cancel" @click="showCancelConfirm = false">ยกเลิก</button>
          <button class="modal-btn-confirm" @click="cancelBooking" :disabled="processingCancel">
            {{ processingCancel ? 'กำลังดำเนินการ...' : 'ยืนยัน' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getTestDriveById, deleteTestDrive, getTestDriveDocument } from '~/utils/brandApi'
import { formatTime as formatTimeUtil } from '~/utils/dateFormatter'

export default {
  name: "QueueDetail",
  data() {
    return {
      loading: true,
      error: null,
      showCancelConfirm: false,
      processingCancel: false,
      booking: {
        id: "",
        customerName: "",
        model: "",
        modelDescription: "",
        bookingDate: "",
        bookingTime: "",
        branch: "",
        status: "",
        hasDocument: false, // ✅ เช็คว่ามีเอกสารแล้วหรือยัง
        hasPdpaConsent: false // ✅ เช็คว่าเซ็น PDPA แล้วหรือยัง
      }
    };
  },
  mounted() {
    this.fetchBookingDetails();
  },
  methods: {
    async fetchBookingDetails() {
      this.loading = true;
      this.error = null;
      
      try {
        // รับค่า id จาก URL parameter
        const bookingId = this.$route.params.id;
        console.log('Fetching booking ID:', bookingId);

        // ✅ MIGRATED: ใช้ getTestDriveById helper (brand-scoped)
        const response = await getTestDriveById(this.$axios, bookingId);
        console.log('API Response:', response);

        // แปลงข้อมูลจาก API เป็นรูปแบบที่ใช้ในคอมโพเนนท์
        this.booking = {
          id: response.id || bookingId,
          customerName: response.customerName || "ไม่ระบุ",
          model: response.vehicle?.vehicleCode || response.vehicleCode || "ไม่ระบุรุ่นรถ",
          modelDescription: response.vehicle?.model || "",
          bookingDate: response.startTime || "",
          // ✅ FIX: ใช้ formatTime จาก utils เพื่อให้ timezone ถูกต้อง
          bookingTime: response.startTime ? formatTimeUtil(response.startTime) : "",
          branch: response.branch?.name || "ไม่ระบุสาขา",
          status: response.status || "pending",
          customerPhone: response.customerPhone || "",
          hasPdpaConsent: response.pdpaConsent || false, // ✅ เช็คจาก response
          hasDocument: false // จะเช็คด้านล่าง
        };

        // ✅ เช็คว่ามีเอกสารแล้วหรือยัง
        try {
          const document = await getTestDriveDocument(this.$axios, bookingId);
          if (document && document.id) {
            this.booking.hasDocument = true;
            console.log('✅ มีเอกสารแล้ว - Document ID:', document.id);
          }
        } catch (docError) {
          if (docError.response && docError.response.status === 404) {
            this.booking.hasDocument = false;
            console.log('ℹ️ ยังไม่มีเอกสาร');
          } else {
            console.warn('⚠️ Error checking document:', docError);
          }
        }

        console.log('Processed booking data:', this.booking);
      } catch (error) {
        console.error("Error fetching booking details:", error);
        this.error = "ไม่สามารถดึงข้อมูลการจองได้ กรุณาลองใหม่อีกครั้ง";
      } finally {
        this.loading = false;
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return "ไม่ระบุวันที่";
      
      try {
        // ตรวจสอบว่ารูปแบบวันที่ถูกต้องหรือไม่
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          console.warn('Invalid date string:', dateString);
          return "ไม่ระบุวันที่";
        }
        
        const dayNames = ["วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์"];
        const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
        
        const day = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear() + 543; // แปลงเป็นปี พ.ศ.
        const dayOfWeek = dayNames[date.getDay()];
        
        return `${dayOfWeek}ที่ ${day} ${month} ${year}`;
      } catch (error) {
        console.error("Error formatting date:", error);
        return "ไม่ระบุวันที่";
      }
    },
    
    getStatusText(status) {
      const statusMap = {
        pending: "รอดำเนินการ",
        testing: "กำลังทดสอบขับ",
        completed: "เสร็จสิ้น",
        cancelled: "ยกเลิกแล้ว"
      };
      return statusMap[status] || status;
    },
    
    goBack() {
      this.$router.back();
    },
    
    editBooking() {
      // นำทางไปยังหน้าแก้ไขการจอง
      this.$router.push(`/queue/edit/${this.booking.id}`);
    },
    
    async cancelBooking() {
      try {
        this.processingCancel = true;

        // ✅ ใช้ brandApi helper - DELETE /api/{brandCode}/test-drives/{id}
        await deleteTestDrive(this.$axios, this.booking.id);

        // ปิด modal
        this.showCancelConfirm = false;

        // แสดงข้อความแจ้งเตือน
        if (this.$store && this.$store.state.notifications) {
          this.$store.dispatch('notifications/add', {
            type: 'success',
            message: 'ยกเลิกคิวเรียบร้อยแล้ว'
          });
        } else if (this.$toast) {
          this.$toast.success("ยกเลิกคิวเรียบร้อยแล้ว");
        } else {
          alert("ยกเลิกคิวเรียบร้อยแล้ว");
        }

        // กลับไปยังหน้าหลัก
        this.$router.push("/");
      } catch (error) {
        console.error("Error cancelling booking:", error);

        // กำหนดข้อความแสดงข้อผิดพลาดที่เฉพาะเจาะจงมากขึ้น
        let errorMessage = "เกิดข้อผิดพลาดในการยกเลิกคิว กรุณาลองใหม่อีกครั้ง";

        // ตรวจสอบสถานะข้อผิดพลาดจาก API
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = "ไม่พบข้อมูลการจองที่ต้องการยกเลิก";
          } else if (error.response.status === 403) {
            errorMessage = "คุณไม่มีสิทธิ์ในการยกเลิกการจองนี้";
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        }

        if (this.$store && this.$store.state.notifications) {
          this.$store.dispatch('notifications/add', {
            type: 'error',
            message: errorMessage
          });
        } else if (this.$toast) {
          this.$toast.error(errorMessage);
        } else {
          alert(errorMessage);
        }
      } finally {
        this.processingCancel = false;
      }
    },
    proceedToSignature() {
      // ไปหน้าเซ็น PDPA (ยังไม่มี PDPA)
      this.$router.push(`/queue/signature/${this.booking.id}`);
    },

    proceedToDocument() {
      // ไปหน้ากรอกเอกสาร (มี PDPA แล้วแต่ยังไม่มีเอกสาร)
      this.$router.push(`/queue/document/${this.booking.id}`);
    },

    startTestDrive() {
      // ไปหน้าเริ่มทดลองขับ (มีเอกสารครบแล้ว)
      console.log('🚗 เริ่มทดลองขับ - ไปหน้า start-form');
      this.$router.push(`/test-drive/start-form/${this.booking.id}`);
    }
    
    
  }
};
</script>


<style scoped>
.detail {
  align-items: flex-start;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  position: relative;
}

.header {
  align-items: center;
  align-self: stretch;
  background-color: #dc2626;
  box-shadow: 0px 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 12px;
  height: 60px;
  padding: 12px 16px;
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 10;
  color: white;
}

.button {
  align-items: center;
  border-radius: 9999px;
  cursor: pointer;
  display: inline-flex;
  flex: 0 0 auto;
  justify-content: center;
  padding: 8px;
  position: relative;
}

.button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.SVG {
  height: 20px;
  position: relative;
  width: 20px;
}

.heading {
  align-items: flex-start;
  display: inline-flex;
  flex: 0 0 auto;
  flex-direction: column;
  padding: 8px 0px 3px;
  position: relative;
}

.text-wrapper {
  color: #ffffff;
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: normal;
  position: relative;
  width: fit-content;
}

.main {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
  padding-bottom: 90px; /* เพิ่ม padding ด้านล่างให้มีพื้นที่สำหรับ BottomNav */
  position: relative;
  width: 100%;
  overflow-y: auto;
}

.background-shadow {
  align-items: flex-start;
  align-self: stretch;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  position: relative;
  width: 100%;
}

.container {
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  position: relative;
  width: 100%;
}

.background {
  align-items: center;
  justify-content: center;
  background-color: #fef2f2;
  border-radius: 9999px;
  display: inline-flex;
  flex: 0 0 auto;
  padding: 12px;
  position: relative;
}

.img {
  height: 24px;
  position: relative;
  width: 24px;
}

.margin {
  align-items: flex-start;
  display: inline-flex;
  flex: 1;
  flex-direction: column;
  padding: 0px 0px 0px 16px;
  position: relative;
}

.div {
  align-items: flex-start;
  display: inline-flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.div-wrapper {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  padding: 8px 0px 4px;
  position: relative;
  width: 100%;
}

.text-wrapper-2 {
  color: #000000;
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: normal;
  position: relative;
  width: fit-content;
}

.container-2 {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  padding: 6px 0px 2px;
  position: relative;
  width: 100%;
}

.text-wrapper-3 {
  color: #6b7280;
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: normal;
  position: relative;
  width: fit-content;
}

.container-3 {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 20px;
  position: relative;
  width: 100%;
}

.container-4 {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  gap: 12px;
  position: relative;
  width: 100%;
}

.SVG-margin {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  height: 24px;
  padding: 4px 0px 0px;
  position: relative;
  width: 20px;
}

.container-5 {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  padding: 1px 0px 2px;
  position: relative;
  width: 100%;
}

.text-wrapper-4 {
  color: #000000;
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 15.5px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: normal;
  position: relative;
  width: fit-content;
}

.container-6 {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  padding: 6px 0px 3px;
  position: relative;
  width: 100%;
}

.text-wrapper-5 {
  color: #000000;
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 13.8px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: normal;
  position: relative;
  width: fit-content;
}

.text-wrapper-6 {
  color: #000000;
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: normal;
  position: relative;
  white-space: nowrap;
  width: fit-content;
}

.SVG-2 {
  height: 20px;
  position: relative;
  width: 20px;
}

.text-wrapper-7 {
  color: #000000;
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: normal;
  position: relative;
  white-space: nowrap;
  width: fit-content;
}

.container-7 {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 12px;
  position: relative;
  width: 100%;
  margin-bottom: 60px; /* เพิ่ม margin ด้านล่างให้มากขึ้นเพื่อให้มีพื้นที่สำหรับ BottomNav */
}

.button-2 {
  align-items: center;
  align-self: stretch;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
  padding: 16px;
  position: relative;
  width: 100%;
}

.button-2:hover {
  background-color: #f9fafb;
}

.text-wrapper-8 {
  color: #374151;
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: normal;
  position: relative;
  text-align: center;
}

.button-3 {
  align-items: center;
  align-self: stretch;
  background-color: #fef2f2;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
  padding: 16px;
  position: relative;
  width: 100%;
}

.button-3:hover {
  background-color: #fee2e2;
}

.text-wrapper-9 {
  color: #dc2626;
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: normal;
  position: relative;
  text-align: center;
}

.button-4 {
  align-items: center;
  align-self: stretch;
  background-color: #2563eb;
  border: none;
  border-radius: 12px;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
  padding: 16px;
  position: relative;
  width: 100%;
}

.button-4:hover {
  background-color: #1e40af;
}

/* ✅ สีเขียวสำหรับปุ่ม "เริ่มทดลองขับ" */
.button-4.button-start {
  background-color: #10b981;
}

.button-4.button-start:hover {
  background-color: #059669;
}

.text-wrapper-10 {
  color: #ffffff;
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: normal;
  position: relative;
  text-align: center;
}

/* สถานะการจอง */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.testing {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-badge.completed {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.cancelled {
  background-color: #f3f4f6;
  color: #6b7280;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 40px 0;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(220, 38, 38, 0.1);
  border-left-color: #dc2626;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 40px 0;
  gap: 16px;
  text-align: center;
  color: #dc2626;
}

.button-secondary {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
}

.button-secondary:hover {
  background-color: #f3f4f6;
}

/* Modal Confirmation */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-container {
  background-color: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal-header {
  margin-bottom: 16px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.modal-body {
  margin-bottom: 24px;
}

.modal-warning {
  color: #dc2626;
  font-size: 14px;
  margin-top: 8px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-btn-cancel {
  background-color: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
}

.modal-btn-confirm {
  background-color: #dc2626;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
}

/* เพิ่มสไตล์สำหรับ BottomNav */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  z-index: 50;
}
</style>