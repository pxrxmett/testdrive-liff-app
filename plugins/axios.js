// plugins/axios.js
export default function ({ $axios, redirect, store }) {
  // ตั้งค่าตัวแปรสำหรับตรวจสอบโหมดและสภาพแวดล้อม
  const isDev = process.env.NODE_ENV === 'development';
  const log = isDev ? console.log : () => {};
  const warn = console.warn;
  const error = console.error;
  
  // ตัวแปรสำหรับเก็บชื่อ token ที่ใช้ (แก้ไขเป็น access_token)
  const TOKEN_KEY = 'access_token';
  
  // baseURL is configured in nuxt.config.js - no need to override here
  console.log('🔗 Axios baseURL:', $axios.defaults.baseURL);

  // ลดเวลา timeout ลงเพื่อไม่ให้เว็บค้าง
  $axios.defaults.timeout = 15000; // 15 วินาที

  // ================================================================
  // Request Interceptor - ก่อนส่งคำขอไปยังเซิร์ฟเวอร์
  // ================================================================
  $axios.onRequest(config => {
    // แสดง URL ที่จะเรียกจริง (เพื่อ debug)
    if (process.client) {
      const fullUrl = config.baseURL + config.url;
      log(`→ ${config.method.toUpperCase()} ${fullUrl}`);
    }
    
    // ตรวจสอบว่า endpoint นี้ต้องการ authentication หรือไม่
    const isPublicEndpoint = 
      (config.url && (
        // 1. endpoints ที่เกี่ยวกับการล็อกอิน/ลงทะเบียน
        config.url.includes('/auth/login') ||
        config.url.includes('/auth/line-login') ||
        // 2. endpoints ที่เช็คการเชื่อมโยง LINE
        (config.url.includes('/line-integration/check') && config.method === 'post') ||
        config.url.includes('/line-integration/register') ||
        config.url.includes('/line-integration/link') ||
        config.url.includes('/line-integration/link-simple') ||
        // 3. endpoints สาธารณะอื่นๆ
        config.url.includes('/public/')
      ));

    if (!isPublicEndpoint) {
      // ลองดึง token จาก store ก่อน ถ้าไม่มีค่อยดึงจาก localStorage
      const token = store?.state?.auth?.token || 
                   (process.client ? localStorage.getItem(TOKEN_KEY) : null);
      
      if (token) {
        // เพิ่ม token ลงใน header
        config.headers.Authorization = `Bearer ${token}`;
        log(`🔐 Added token to request`);
      } else {
        warn(`⚠️ No token found for: ${config.url}`);
        
        // ตรวจสอบสถานะการล็อกอินใน store
        const isLoggedIn = store?.state?.auth?.isAuthenticated;
        
        // ตรวจสอบว่าเป็นหน้าที่ต้องล็อกอินหรือไม่
        const isProtectedRoute = process.client && 
                                 window.location.pathname !== '/login' && 
                                 !window.location.pathname.includes('/check') &&
                                 !window.location.pathname.includes('/register');
        
        if (isLoggedIn && isProtectedRoute && process.client) {
          warn('⚠️ Token missing but user appears logged in');
          
          // รีเช็ตสถานะและ redirect
          store.dispatch('auth/logout');
          redirect('/login?error=token_missing');
          return Promise.reject(new Error('Token missing'));
        }
      }
    } else {
      log(`🌐 Public endpoint: ${config.url}`);
    }
    
    return config;
  });

  // ================================================================
  // Response Interceptor - เมื่อได้รับการตอบกลับจากเซิร์ฟเวอร์
  // ================================================================
  $axios.onResponse(response => {
    log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    
    // ตรวจสอบและบันทึก token ใหม่ถ้ามี (รองรับหลายรูปแบบ)
    const newToken = response.data?.token || 
                    response.data?.access_token || 
                    response.data?.accessToken;
    
    if (newToken && process.client) {
      try {
        localStorage.setItem(TOKEN_KEY, newToken);
        
        if (store?.commit) {
          store.commit('auth/setToken', newToken);
          store.commit('auth/setAuth', true);
          log('🔑 Token updated');
        }
      } catch (e) {
        error('❌ Failed to save token:', e);
      }
    }
    
    // ตรวจสอบและบันทึกข้อมูลพนักงานถ้ามี
    const staffInfo = response.data?.staffInfo || response.data?.staff;
    const checkEndpoint = response.config.url?.includes('/line-integration/check') ||
                         response.config.url?.includes('/line-integration/link');
    
    if (staffInfo && checkEndpoint && process.client) {
      try {
        if (store?.commit) {
          store.commit('auth/setStaffInfo', staffInfo);
          
          if (staffInfo.staff_code) {
            store.commit('auth/setStaffCode', staffInfo.staff_code);
            localStorage.setItem('staffCode', staffInfo.staff_code);
          }
          
          localStorage.setItem('staffInfo', JSON.stringify(staffInfo));
          log('👤 Staff info saved');
        }
      } catch (e) {
        error('❌ Failed to save staff info:', e);
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

    // บันทึกข้อมูล error
    const errorInfo = {
      status: code,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: errorData?.message || error.message || 'No error message'
    };
    
    console.error('❌ API ERROR:', errorInfo);

    // จัดการกับข้อผิดพลาดแต่ละประเภท
    if (code === 401) {
      // ตรวจสอบว่า endpoint นี้เป็น API ล็อกอินหรือไม่
      const isLoginApi = error.config?.url?.includes('/auth/login') || 
                        error.config?.url?.includes('/auth/line-login');
      
      const isCheckApi = error.config?.url?.includes('/line-integration/check');
      
      if (isLoginApi || isCheckApi) {
        // ไม่ต้อง redirect ถ้าเป็นความผิดพลาดจากการพยายามล็อกอินหรือเช็ค
        return Promise.reject(error);
      }
      
      // จัดการกับ token หมดอายุ
      if (process.client) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('user');
        localStorage.removeItem('staffInfo');
        localStorage.removeItem('staffCode');
        
        if (store?.dispatch) {
          store.dispatch('auth/logout');
        }
        
        // บันทึก URL ปัจจุบัน
        const currentPath = window?.location?.pathname;
        if (currentPath && currentPath !== '/' && !currentPath.includes('/login')) {
          localStorage.setItem('redirectAfterLogin', currentPath);
        }
        
        redirect('/login?session_expired=true');
      }
    } else if (code === 404 && error.config?.url?.includes('/staffs/')) {
      console.warn(`⚠️ Staff not found: ${error.config.url}`);
      return Promise.reject(error);
    }

    return Promise.reject(error);
  });
}

