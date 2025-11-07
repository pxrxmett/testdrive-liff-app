// plugins/axios.js
export default function ({ $axios, redirect, store }) {
  // ตั้งค่าตัวแปรสำหรับตรวจสอบโหมดและสภาพแวดล้อม
  const isDev = process.env.NODE_ENV === 'development';
  const log = isDev ? console.log : () => {};
  const warn = console.warn;
  const error = console.error;
  
  // ตัวแปรสำหรับเก็บชื่อ token ที่ใช้
  const TOKEN_KEY = 'token';
  
  // ตรวจสอบและตั้งค่า baseURL
  if (process.client) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Production บน Railway
    if (hostname.includes('railway.app')) {
      // ใช้ API_URL จาก environment variables (มี /api อยู่แล้ว)
      $axios.defaults.baseURL = process.env.API_URL || 'https://isuzu-liff.up.railway.app/api';
      log('Railway Production, baseURL:', $axios.defaults.baseURL);
    }
    // Localtunnel
    else if (hostname.includes('loca.lt') || hostname === 'testdrive-liff.loca.lt') {
      $axios.defaults.baseURL = `${protocol}//${hostname}`;
      log('Localtunnel detected, baseURL:', $axios.defaults.baseURL);
    }
    // Cloudflare Tunnel
    else if (hostname.includes('trycloudflare.com')) {
      $axios.defaults.baseURL = `${protocol}//${hostname}`;
      log('Cloudflare Tunnel detected, baseURL:', $axios.defaults.baseURL);
    }
    // Local Development
    else {
      $axios.defaults.baseURL = process.env.BASE_URL || 'http://localhost:3000';
      log('Local Development, baseURL:', $axios.defaults.baseURL);
    }
    
    // แสดง baseURL ที่ใช้งานจริง
    console.log('🔗 Axios baseURL:', $axios.defaults.baseURL);
  }

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

    // DEBUG: แสดง response structure (แม้ใน production)
    if (response.config.url?.includes('/line-integration/check')) {
      console.log('🔍 DEBUG /line-integration/check response:', {
        data: response.data,
        hasToken: !!response.data?.token,
        hasAccessToken: !!response.data?.access_token,
        hasAccessToken2: !!response.data?.accessToken
      });
    }

    // ตรวจสอบและบันทึก token ใหม่ถ้ามี
    const newToken = response.data?.token || response.data?.access_token || response.data?.accessToken;

    if (newToken && process.client) {
      try {
        localStorage.setItem(TOKEN_KEY, newToken);

        if (store?.commit) {
          store.commit('auth/setToken', newToken);
          store.commit('auth/setAuth', true);
          console.log('🔑 Token saved to localStorage and store:', newToken.substring(0, 20) + '...');
        }
      } catch (e) {
        error('❌ Failed to save token:', e);
      }
    } else if (response.config.url?.includes('/line-integration/check')) {
      console.warn('⚠️ No token found in response from /line-integration/check');
    }
    
    // ตรวจสอบและบันทึกข้อมูลพนักงานถ้ามี
    const staffInfo = response.data?.staffInfo;
    const checkEndpoint = response.config.url?.includes('/line-integration/check');
    
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