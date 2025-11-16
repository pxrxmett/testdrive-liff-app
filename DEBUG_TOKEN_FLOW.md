# 🔍 Debug Guide - LINE Login Token Flow

## ปัญหา: 401 Unauthorized บน /api/auth/me

### สาเหตุที่เป็นไปได้:
1. Backend ส่ง `access_token` แต่ใช้ชื่อ key ผิด
2. Frontend ไม่เก็บ token
3. Frontend ไม่ส่ง Authorization header
4. Backend JWT validation ไม่ผ่าน

---

## 🧪 วิธี Debug (ทำตามลำดับ)

### Step 1: ตรวจสอบ Backend Response

เปิด **Browser Console** → **Network Tab**

1. Login ผ่าน LINE
2. หา Request: `POST /api/line-integration/check`
3. คลิกดูใน **Response Tab**

**ตัวอย่าง Response ที่ถูกต้อง:**
```json
{
  "registered": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInN0YWZmQ29kZSI6IlNUQUZGMDAxIiwicm9sZSI6InN0YWZmIiwiaWF0IjoxNzA5NzI4ODAwLCJleHAiOjE3MDk4MTUyMDB9.abc123",
  "staffInfo": {
    "id": 1,
    "staff_code": "STAFF001",
    "first_name": "สมชาย",
    "role": "staff"
  }
}
```

**ตรวจสอบ:**
- ✅ มี `access_token` key หรือไม่?
- ✅ `access_token` เป็น string ยาวๆ (JWT format) หรือไม่?
- ✅ มี `registered: true` หรือไม่?

**ถ้า access_token ไม่มี:**
→ **Backend ยังไม่ได้ส่ง token!** กลับไปแก้ Backend

---

### Step 2: ตรวจสอบ Frontend เก็บ Token หรือไม่

ใน **Browser Console** พิมพ์:

```javascript
console.log('Token:', localStorage.getItem('token'))
console.log('Access Token:', localStorage.getItem('access_token'))
```

**ผลลัพธ์ที่ควรเห็น:**
```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**ถ้าไม่มี token:**

#### แก้ไข 1: บันทึก Token ด้วยตัวเอง

ใน **Console** พิมพ์:
```javascript
// Copy token จาก Network Tab Response
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // ← ใส่ token จริง
localStorage.setItem('token', token);
localStorage.setItem('access_token', token);
console.log('✅ Token saved manually');
```

#### แก้ไข 2: ตรวจสอบ axios.js Interceptor

ดูใน **Console** ว่ามี log นี้หรือไม่:
```
🔑 Token updated
```

**ถ้าไม่มี:**
- axios interceptor ไม่ทำงาน
- หรือ Response ไม่มี access_token

---

### Step 3: ตรวจสอบ Authorization Header

ใน **Network Tab** หา Request: `GET /api/auth/me`

คลิกดู **Headers Tab** → **Request Headers**

**ควรเห็น:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**ถ้าไม่มี Authorization header:**

#### Debug ใน Console:

```javascript
// ตรวจสอบ token ใน localStorage
console.log('Token in localStorage:', localStorage.getItem('token'));

// ตรวจสอบ state ใน store
console.log('Token in store:', $nuxt.$store.state.auth.token);

// ทดสอบส่ง request ด้วย token
const token = localStorage.getItem('token');
fetch('https://isuzustock-management-production.up.railway.app/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('✅ Auth/me result:', data))
.catch(err => console.error('❌ Auth/me error:', err));
```

**ผลลัพธ์ที่ควรเห็น:**
```json
{
  "id": 1,
  "staffCode": "STAFF001",
  "firstName": "สมชาย",
  "role": "staff"
}
```

**ถ้ายังได้ 401:**
→ **JWT token ไม่ valid หรือ Backend validation ผิด**

---

### Step 4: ตรวจสอบ JWT Token

Copy token จาก localStorage แล้วไปที่: https://jwt.io

Paste token ลงใน **Encoded** section

**ตรวจสอบ Payload:**
```json
{
  "sub": 1,
  "staffCode": "STAFF001",
  "role": "staff",
  "iat": 1709728800,
  "exp": 1709815200
}
```

**ตรวจสอบ:**
- ✅ มี `sub` (user ID) หรือไม่?
- ✅ มี `exp` (expiration) หรือไม่?
- ✅ `exp` ยังไม่หมดอายุหรือไม่? (Unix timestamp)

**ตรวจสอบ Expiration:**
```javascript
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
const exp = new Date(payload.exp * 1000);
const now = new Date();

console.log('Token expires at:', exp);
console.log('Current time:', now);
console.log('Is expired?', now > exp);
```

**ถ้า token หมดอายุ:**
→ Login ใหม่

---

## 🔧 แก้ไขปัญหา

### ปัญหา 1: Backend ไม่ส่ง access_token

**แก้ที่ Backend:**
```typescript
// line-integration.controller.ts
@Post('check')
async checkRegistration(@Body() body: { lineUserId: string }) {
  const result = await this.lineIntegrationService.checkRegistration(body.lineUserId);

  if (result.registered) {
    const token = await this.authService.generateToken(result.staffInfo);

    return {
      registered: true,
      access_token: token,  // ← ต้องมี!
      staffInfo: result.staffInfo
    };
  }

  return result;
}
```

---

### ปัญหา 2: Frontend ไม่เก็บ token

**แก้ที่ Frontend store/auth.js:**
```javascript
// เพิ่มใน checkLineRegistration action
async checkLineRegistration({ commit, state }) {
  const response = await this.$axios.$post('/line-integration/check', {
    lineUserId: state.lineProfile.userId
  });

  // ← เพิ่มบรรทัดนี้
  if (response.access_token) {
    commit('setToken', response.access_token);
    localStorage.setItem('token', response.access_token);
    console.log('✅ Token saved:', response.access_token.substring(0, 20) + '...');
  }

  return response;
}
```

---

### ปัญหา 3: axios interceptor ไม่ทำงาน

**ตรวจสอบ plugins/axios.js:**

บรรทัด 114-128 ควรมี:
```javascript
const newToken = response.data?.token || response.data?.access_token || response.data?.accessToken;

if (newToken && process.client) {
  localStorage.setItem('token', newToken);
  store.commit('auth/setToken', newToken);
  store.commit('auth/setAuth', true);
  log('🔑 Token updated');
}
```

✅ **ถ้ามีแล้ว:** Interceptor OK
❌ **ถ้าไม่มี:** ต้องเพิ่ม

---

### ปัญหา 4: Backend JWT Secret ไม่ตรง

**ตรวจสอบ Backend:**
```typescript
// app.module.ts หรือ auth.module.ts
JwtModule.register({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  signOptions: { expiresIn: '7d' }
})
```

**ตรวจสอบ Environment Variables:**
- Backend `JWT_SECRET` ต้องตรงกันทั้ง sign และ verify

---

## 📋 Checklist

หลัง Login แล้วต้อง:

- [ ] Network Tab → `/line-integration/check` Response มี `access_token`
- [ ] Console → `localStorage.getItem('token')` มีค่า
- [ ] Console → เห็น log `🔑 Token updated`
- [ ] Network Tab → `/auth/me` Request Headers มี `Authorization: Bearer ...`
- [ ] Console → `fetch` ทดสอบ `/auth/me` ได้ 200 OK
- [ ] JWT.io → Token payload มี `sub`, `staffCode`, `exp`
- [ ] Token ยังไม่หมดอายุ

---

## 🎯 Expected Flow

```
1. User: Login ผ่าน LINE
   ↓
2. Frontend: POST /api/line-integration/check
   { lineUserId: "U123..." }
   ↓
3. Backend: Generate JWT Token
   { registered: true, access_token: "eyJ...", staffInfo: {...} }
   ↓
4. Frontend axios interceptor: เก็บ token
   localStorage.setItem('token', token)
   ↓
5. Frontend: GET /api/auth/me
   Headers: { Authorization: "Bearer eyJ..." }
   ↓
6. Backend: Validate JWT
   return { id, staffCode, role, ... }
   ↓
7. ✅ Login Success!
```

---

## 🚨 Common Errors

### Error 1: "ไม่พบ token ในการตอบกลับจาก API"
→ Backend ไม่ส่ง `access_token`

### Error 2: GET /api/auth/me 401 Unauthorized
→ Frontend ไม่ส่ง Authorization header หรือ token ไม่ valid

### Error 3: Token หมดอายุ
→ Login ใหม่

### Error 4: JWT Signature ไม่ตรง
→ Backend JWT_SECRET ไม่ตรงกัน

---

**ทำตาม Step 1-4 แล้ว report ผลกลับมานะครับ!** 🔍
