// plugins/axios.js
export default function ({ $axios, redirect, store }) {
  // ตั้งค่าตัวแปรสำหรับตรวจสอบโหมดและสภาพแวดล้อม
  const isDev = process.env.NODE_ENV === 'development';
  const log = isDev ? console.log : () => {};
  const warn = console.warn;
  const error = console.error;
  
  // ตัวแปรสำหรับเก็บชื่อ token ที่ใช้
  const TOKEN_KEY = 'token';
  
  // ตรวจสอบและตั้งค่า baseURL สำหรับ localtunnel
  if (process.client) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // เพิ่มการตรวจสอบ hostname ที่มาจาก localtunnel
    if (hostname.includes('loca.lt') || hostname === 'testdrive-liff.loca.lt') {
      $axios.defaults.baseURL = `${protocol}//${hostname}`;
      log('ตรวจพบ localtunnel, ตั้งค่า baseURL เป็น:', $axios.defaults.baseURL);
    } else if (hostname.includes('trycloudflare.com')) {
      $axios.defaults.baseURL = `${protocol}//${hostname}`;
      log('ตรวจพบ Cloudflare Tunnel, ตั้งค่า baseURL เป็น:', $axios.defaults.baseURL);
    } else {
      // ใช้ค่าจาก env หรือค่าเริ่มต้น
      $axios.defaults.baseURL = process.env.BASE_URL || 'http://localhost:3000';
      log('กำลังรันบนโดเมนปกติ, ตั้งค่า baseURL เป็น:', $axios.defaults.baseURL);
    }
  }

  // ลดเวลา timeout ลงเพื่อไม่ให้เว็บค้าง
  $axios.defaults.timeout = 15000; // 15 วินาที

  // ================================================================
  // Request Interceptor - ก่อนส่งคำขอไปยังเซิร์ฟเวอร์
  // ================================================================
  $axios.onRequest(config => {
    // ตรวจสอบว่า endpoint นี้ต้องการ authentication หรือไม่
    // แก้ไขเงื่อนไขการตรวจสอบ public endpoint ให้ถูกต้อง
    const isPublicEndpoint = 
      (config.url && (
        // 1. endpoints ที่เกี่ยวกับการล็อกอิน/ลงทะเบียน
        config.url.includes('/api/auth/login') ||
        config.url.includes('/api/auth/line-login') ||
        // 2. endpoints ที่เช็คการเชื่อมโยง LINE แต่ไม่รวมถึงการดึงข้อมูลพนักงานจาก LINE
        (config.url.includes('/api/line-integration/check') && config.method === 'post') ||
        config.url.includes('/api/line-integration/register') ||
        config.url.includes('/api/line-integration/link') ||
        // 3. endpoints สาธารณะอื่นๆ
        config.url.includes('/api/public/')
      ));

    if (!isPublicEndpoint) {
      // ลองดึง token จาก store ก่อน ถ้าไม่มีค่อยดึงจาก localStorage
      const token = store?.state?.auth?.token || 
                   (process.client ? localStorage.getItem(TOKEN_KEY) : null);
      
      if (token) {
        // เพิ่ม token ลงใน header
        config.headers.Authorization = `Bearer ${token}`;
        
        if (isDev) {
          // แสดงข้อมูลเฉพาะในโหมด development
          log(`API REQUEST: ${config.method.toUpperCase()} ${config.url} (with token)`);
        }
      } else {
        warn(`ไม่พบ token สำหรับ API: ${config.url}`);
        
        // ตรวจสอบสถานะการล็อกอินใน store
        const isLoggedIn = store?.state?.auth?.isAuthenticated;
        
        // ตรวจสอบว่าเป็นหน้าที่ต้องล็อกอินหรือไม่ - ยกเว้นหน้า login และเช็คอื่นๆ
        const isProtectedRoute = process.client && 
                                 window.location.pathname !== '/login' && 
                                 !window.location.pathname.includes('/check') &&
                                 !window.location.pathname.includes('/register');
        
        if (isLoggedIn && isProtectedRoute && process.client) {
          warn('พบความไม่สอดคล้อง: สถานะใน store แสดงว่าล็อกอินแล้วแต่ไม่พบ token');
          
          // รีเช็ตสถานะและ redirect
          store.dispatch('auth/logout');
          redirect('/login?error=token_missing');
          return Promise.reject(new Error('ไม่พบ token แต่สถานะแสดงว่าล็อกอินแล้ว'));
        }
      }
    } else if (isDev) {
      log(`API REQUEST: ${config.method.toUpperCase()} ${config.url} (public)`);
    }
    
    return config;
  });

  // ================================================================
  // Response Interceptor - เมื่อได้รับการตอบกลับจากเซิร์ฟเวอร์
  // ================================================================
  $axios.onResponse(response => {
    if (isDev) {
      log(`API SUCCESS: ${response.config.method.toUpperCase()} ${response.config.url}`);
    }
    
    // ตรวจสอบและบันทึก token ใหม่ถ้ามี
    const newToken = response.data?.token || response.data?.access_token || response.data?.accessToken;
    
    if (newToken && process.client) {
      // บันทึก token ใหม่และอัปเดต store
      try {
        localStorage.setItem(TOKEN_KEY, newToken);
        
        if (store?.commit) {
          store.commit('auth/setToken', newToken);
          store.commit('auth/setAuth', true);
          log('อัปเดต token ใหม่เรียบร้อย');
        }
      } catch (e) {
        error('ไม่สามารถบันทึก token ได้:', e);
      }
    }
    
    // ตรวจสอบและบันทึกข้อมูลพนักงานถ้ามี
    const staffInfo = response.data?.staffInfo;
    const checkEndpoint = response.config.url?.includes('/api/line-integration/check');
    
    if (staffInfo && checkEndpoint && process.client) {
      try {
        if (store?.commit) {
          store.commit('auth/setStaffInfo', staffInfo);
          
          if (staffInfo.staff_code) {
            store.commit('auth/setStaffCode', staffInfo.staff_code);
            localStorage.setItem('staffCode', staffInfo.staff_code);
          }
          
          localStorage.setItem('staffInfo', JSON.stringify(staffInfo));
          log('บันทึกข้อมูลพนักงานจาก check response เรียบร้อย');
        }
      } catch (e) {
        error('ไม่สามารถบันทึกข้อมูลพนักงานได้:', e);
      }
    }
    
    return response;
  });

  // ================================================================
  // Error Interceptor - เมื่อเกิดข้อผิดพลาด
  // ================================================================
  $axios.onError(error => {
    const code = error.response?.status;
    const errorData = error.response?.data;

    // บันทึกข้อมูล error แบบย่อ
    const errorInfo = {
      status: code,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: errorData?.message || 'ไม่มีข้อความข้อผิดพลาด'
    };
    
    console.error('API ERROR:', errorInfo);

    // จัดการกับข้อผิดพลาดแต่ละประเภท
    if (code === 401) {
      // ตรวจสอบว่า endpoint นี้เป็น API ล็อกอินหรือไม่
      const isLoginApi = error.config?.url?.includes('/api/auth/login') || 
                        error.config?.url?.includes('/api/auth/line-login');
      
      const isCheckApi = error.config?.url?.includes('/api/line-integration/check');
      
      if (isLoginApi || isCheckApi) {
        // ไม่ต้อง redirect ถ้าเป็นความผิดพลาดจากการพยายามล็อกอินหรือเช็ค
        return Promise.reject(error);
      }
      
      // จัดการกับ token หมดอายุ
      if (process.client) {
        // ล้างข้อมูล authentication
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('user');
        
        if (store?.dispatch) {
          store.dispatch('auth/logout');
        }
        
        // บันทึก URL ปัจจุบันเพื่อให้สามารถกลับมาหลังจากล็อกอินใหม่
        const currentPath = window?.location?.pathname;
        if (currentPath && currentPath !== '/' && !currentPath.includes('/login')) {
          localStorage.setItem('redirectAfterLogin', currentPath);
        }
        
        // redirect ไปยังหน้า login
        redirect('/login?session_expired=true');
      }
    } else if (code === 404 && error.config?.url?.includes('/api/staffs/')) {
      // กรณีพิเศษสำหรับการค้นหาพนักงานที่ไม่พบ
      console.warn(`ไม่พบข้อมูลพนักงานที่ ID: ${error.config.url.split('/').pop()}`);
      
      // ไม่ต้อง redirect เพราะอาจเป็นส่วนหนึ่งของกระบวนการเช็คหลายๆ API
      return Promise.reject(error);
    }

    return Promise.reject(error);
  });
}
