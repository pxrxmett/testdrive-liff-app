# งานที่เหลือสำหรับ Brand-Scoped API Migration

## ✅ สิ่งที่ทำเสร็จแล้ว (Completed)

### 1. Core Infrastructure
- ✅ สร้าง `utils/brandApi.js` พร้อม helper functions ครบถ้วน
- ✅ Auto-detect brandCode จาก localStorage
- ✅ Build brand-scoped paths: `/{brandCode}/endpoint`

### 2. Store (100% Complete)
- ✅ `store/testDrive.js` - ใช้ brandApi ทั้งหมดแล้ว

### 3. Booking Pages (100% Complete)
- ✅ `pages/booking/index.vue` - ใช้ getVehicles(), createTestDrive()
- ✅ `pages/booking/success.vue` - ใช้ getTestDrive(), getVehicles()

### 4. Queue Pages
- ✅ `pages/queue/edit/_id.vue` - 100% migrated ทุก API call
- ✅ `pages/queue/document/_id.vue` - **CRITICAL FIX**: แยก 3 signatures ก่อน submit

---

## ⚠️ งานที่ยังค้างอยู่ (Remaining Tasks)

### Priority 1: แก้ไข test-drive pages (4 ไฟล์)

**สถานะ:** Import statements เพิ่มแล้ว แต่ยังไม่แทนที่ axios calls

ไฟล์ที่ต้องแก้:
1. `pages/test-drive/_id.vue`
2. `pages/test-drive/start-form/_id.vue`
3. `pages/test-drive/end-form/_id.vue`
4. `pages/test-drive/summary/_id.vue`

**ปัญหา:** ไฟล์เหล่านี้ใช้ `this.$axios.get()` (ไม่ใช่ `$get`) ซึ่ง return `response.data`

**วิธีแก้:**

```javascript
// เดิม:
const testDriveResponse = await this.$axios.get(`/test-drives/${id}`)
this.testDriveData = testDriveResponse.data

// แก้เป็น:
const testDriveData = await getTestDrive(this.$axios, id)
this.testDriveData = testDriveData
```

**API calls ที่ต้องแก้ในแต่ละไฟล์:**

#### `pages/test-drive/_id.vue`
- Line 212: `this.$axios.get('/test-drives/${id}')` → `getTestDrive(this.$axios, id)`
- Line 217: `this.$axios.get('/stock/${id}')` → `getVehicle(this.$axios, id)`
- Line 223: `this.$axios.get('/staffs/${id}')` → `getStaff(this.$axios, id)`
- Line 298: `this.$axios.patch('/test-drives/${id}', payload)` → `updateTestDrive(this.$axios, id, payload)`
- Line 302: `this.$axios.patch('/stock/vehicles/${id}/status', {...})` → `updateVehicleStatus(this.$axios, id, status)`
- Line 313: เหมือน line 298
- Line 317: เหมือน line 302

#### `pages/test-drive/start-form/_id.vue`
- Line ~300: `this.$axios.get('/test-drives/${id}')` → `getTestDrive(this.$axios, id)`
- Line ~312: `this.$axios.get('/stock/${id}')` → `getVehicle(this.$axios, id)`
- Line ~318: `this.$axios.get('/staffs/${id}')` → `getStaff(this.$axios, id)`
- Line ~408: `this.$axios.patch('/test-drives/${id}', payload)` → `updateTestDrive(this.$axios, id, payload)`
- Line ~412: `this.$axios.patch('/stock/vehicles/${id}/status', {...})` → `updateVehicleStatus(this.$axios, id, status)`

#### `pages/test-drive/end-form/_id.vue`
- Line ~470: `this.$axios.get('/test-drives/${id}')` → `getTestDrive(this.$axios, id)`
- Line ~482: `this.$axios.get('/stock/${id}')` → `getVehicle(this.$axios, id)`
- Line ~488: `this.$axios.get('/staffs/${id}')` → `getStaff(this.$axios, id)`
- Line ~578: `this.$axios.patch('/test-drives/${id}', payload)` → `updateTestDrive(this.$axios, id, payload)`
- Line ~582: `this.$axios.patch('/stock/vehicles/${id}/status', {...})` → `updateVehicleStatus(this.$axios, id, status)`

#### `pages/test-drive/summary/_id.vue`
- Line ~262: `this.$axios.get('/test-drives/${id}')` → `getTestDrive(this.$axios, id)`
- Line ~276: `this.$axios.get('/stock/${id}')` → `getVehicle(this.$axios, id)`
- Line ~282: `this.$axios.get('/staffs/${id}')` → `getStaff(this.$axios, id)`

**คำสั่งแก้ (สำหรับแต่ละไฟล์):**
```bash
# ตัวอย่างสำหรับ pages/test-drive/_id.vue
# ใช้ Edit tool ใน Claude แทนที่ axios calls ทีละจุด
```

---

### Priority 2: แก้ไข pages/index.vue

**สถานะ:** Import statement เพิ่มแล้ว

**API calls ที่ต้องแก้:**
- Line ~345: `this.$axios.$post('/line-integration/check', ...)` - **ไม่ต้องแก้** (ไม่ใช่ brand-scoped)
- Line ~379: `this.$axios.$get('/staffs/${id}')` → `getStaff(this.$axios, id)`
- Line ~473: `this.$axios.$get('/test-drives', {...})` → `getTestDrives(this.$axios, {...})`
- Line ~697: `this.$axios.$patch('/test-drives/${id}', {...})` → `updateTestDrive(this.$axios, id, {...})`

---

### Priority 3: แก้ไข components/calendar/TestDriveCalendar.vue

**API calls ที่ต้องแก้:**
- Line ~562: `this.$axios.get('/staffs')` → `getAllStaff(this.$axios)`
- Line ~583: `this.$axios.get('/test-drives')` → `getTestDrives(this.$axios)`

**ต้องเพิ่ม import:**
```javascript
import { getAllStaff, getTestDrives } from '~/utils/brandApi'
```

---

### Priority 4: ลบ code เก่าที่ไม่ใช้แล้ว

**ใน store/auth.js:**
- ฟังก์ชัน `loginWithLine()` ที่เรียก `POST /auth/line-login` - **ไม่ใช้แล้ว**
  - ตอนนี้ใช้ `/line-integration/link-simple` แทน

**ค้นหาและลบ:**
```bash
grep -r "auth/line-login" pages/ store/
# ถ้าเจอให้ลบออกหรือ comment ไว้
```

---

## 🧪 การทดสอบ (Testing Checklist)

### 1. Authentication Flow
- [ ] เข้าสู่ระบบผ่าน LINE
- [ ] ตรวจสอบว่า brandCode ถูกบันทึกลง localStorage
- [ ] Link staff account ผ่าน `/line-integration/link-simple`

### 2. Booking Flow
- [ ] สร้างจองแบบ Phone booking
- [ ] สร้างจองแบบ Walk-in
- [ ] ตรวจสอบว่า API path เป็น `/{brandCode}/test-drives`

### 3. PDPA & Signature
- [ ] ทดสอบหน้า `/queue/signature/:id` (1 signature)
- [ ] ทดสอบหน้า `/queue/document/:id` (3 signatures)
- [ ] **สำคัญ:** ตรวจสอบว่า 3 signatures ถูกบันทึกแยกกัน

### 4. Queue Management
- [ ] แก้ไขการจอง
- [ ] ส่งให้ลูกค้าเซ็น
- [ ] ยกเลิกการจอง

### 5. Test Drive Execution
- [ ] เริ่มทดลองขับ (pending → ongoing)
- [ ] สิ้นสุดทดลองขับ (ongoing → completed)
- [ ] ตรวจสอบว่า vehicle status เปลี่ยนตาม

---

## 📝 วิธีแก้ไขไฟล์ที่เหลือ

### วิธีที่ 1: ใช้ Claude Code (แนะนำ)

```
กรุณาแก้ไข pages/test-drive/_id.vue:

แทนที่ axios calls ทั้งหมดด้วย brandApi functions:
1. Line 212: const testDriveResponse = await this.$axios.get(`/test-drives/${testDriveId}`)
   → const testDriveData = await getTestDrive(this.$axios, testDriveId)
      this.testDriveData = testDriveData

2. Line 217: const vehicleResponse = await this.$axios.get(`/stock/${this.testDriveData.vehicle_id}`)
   → const vehicleData = await getVehicle(this.$axios, this.testDriveData.vehicle_id)
      this.vehicleData = vehicleData

(ทำต่อไปสำหรับทุก API call ในไฟล์)
```

### วิธีที่ 2: แก้ด้วยมือ

1. เปิดไฟล์ใน editor
2. หา axios calls ทั้งหมด (Ctrl+F: "this.$axios")
3. แทนที่ทีละบรรทัดตามตัวอย่างข้างบน
4. Save และทดสอบ

---

## 🚀 หลังจากแก้เสร็จ

```bash
# 1. Commit changes
git add -A
git commit -m "refactor: complete brand-scoped API migration for all pages"

# 2. Push to remote
git push -u origin claude/dev-role-setup-011CUW3CdCCuUHXUN8TKh8rC

# 3. Test on LIFF Simulator
# เปิด LIFF App และทดสอบทุก flow

# 4. Create pull request (ถ้าต้องการ)
```

---

## 📚 อ้างอิง

**Backend API Format:**
```
GET    /{brandCode}/test-drives
GET    /{brandCode}/test-drives/:id
POST   /{brandCode}/test-drives
PATCH  /{brandCode}/test-drives/:id
DELETE /{brandCode}/test-drives/:id

POST   /{brandCode}/test-drives/:id/pdpa-consent
POST   /{brandCode}/test-drives/:id/signature
POST   /{brandCode}/test-drives/:id/signatures  # สำหรับ 3 signatures

GET    /{brandCode}/stock/vehicles
GET    /{brandCode}/stock/:id
PATCH  /{brandCode}/stock/vehicles/:id/status

GET    /{brandCode}/staffs
GET    /{brandCode}/staffs/:id
```

**brandCode ที่รองรับ:**
- `isuzu`
- `byd`
- (อื่นๆ ตาม backend config)
