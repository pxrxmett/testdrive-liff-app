// middleware/auth.js - Simplified Version
export default async function ({ store, redirect, route }) {
  // ทำงานเฉพาะฝั่ง client
  if (!process.client) return;

  // หน้าที่ไม่ต้องตรวจสอบการล็อกอิน
  const publicPages = [
    '/login', 
    '/link-account',
    '/register',
    '/auth/callback'
  ];
  
  const isPublicPage = publicPages.includes(route.path) || 
                       route.path.startsWith('/public/') ||
                       Object.prototype.hasOwnProperty.call(route.query, 'liffRedirectUri');

  if (isPublicPage) {
    console.log('อยู่ในหน้าที่ไม่ต้องตรวจสอบการล็อกอิน:', route.path);
    return;
  }

  // ✅ ลำดับการตรวจสอบใหม่
  console.log('ตรวจสอบการยืนยันตัวตนสำหรับหน้า:', route.path);

  // 1. ตรวจสอบ token ที่มีอยู่ก่อน
  let isAuthenticated = store.getters['auth/isAuthenticated'];
  
  if (!isAuthenticated) {
    // ลองโหลดจาก localStorage
    try {
      const initResult = await store.dispatch('auth/initAuth');
      if (initResult) {
        isAuthenticated = true;
        console.log('โหลดข้อมูลจาก localStorage สำเร็จ');
      }
    } catch (error) {
      console.warn('ไม่สามารถโหลดข้อมูลจาก localStorage:', error);
    }
  }

  // 2. ถ้ายังไม่มี token ให้ตรวจสอบ LIFF
  if (!isAuthenticated && window.liff) {
    try {
      console.log('ตรวจสอบสถานะ LIFF...');
      
      // ตรวจสอบการล็อกอิน LINE
      if (!window.liff.isLoggedIn()) {
        console.log('ยังไม่ได้ล็อกอิน LINE จะทำการล็อกอิน');
        localStorage.setItem('redirectAfterLogin', route.fullPath);
        window.liff.login();
        return;
      }

      // ถ้าล็อกอิน LINE แล้วแต่ไม่มี token ระบบ
      console.log('ล็อกอิน LINE แล้วแต่ยังไม่มี token ระบบ');
      
      // ดึงข้อมูล LINE Profile
      const lineProfile = store.getters['auth/lineProfile'];
      
      if (!lineProfile) {
        console.log('ดึงข้อมูล LINE Profile...');
        const [profile, accessToken] = await Promise.all([
          window.liff.getProfile(),
          window.liff.getAccessToken()
        ]);
        
        if (profile && accessToken) {
          const newLineProfile = {
            userId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
            statusMessage: profile.statusMessage,
            accessToken
          };
          
          store.commit('auth/setLineProfile', newLineProfile);
          store.commit('auth/setLineAccessToken', accessToken);
          localStorage.setItem('lineProfile', JSON.stringify(newLineProfile));
          
          // ตรวจสอบและล็อกอิน
          await attemptLineLogin(store, newLineProfile, accessToken, redirect);
        } else {
          throw new Error('ไม่สามารถดึงข้อมูล LINE Profile ได้');
        }
      } else {
        // ใช้ข้อมูล LINE Profile ที่มีอยู่
        const accessToken = lineProfile.accessToken || store.getters['auth/lineAccessToken'];
        if (accessToken) {
          await attemptLineLogin(store, lineProfile, accessToken, redirect);
        } else {
          throw new Error('ไม่พบ LINE Access Token');
        }
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการตรวจสอบ LIFF:', error);
      redirectToLogin(redirect, route, error.message);
      return;
    }
  }

  // 3. ตรวจสอบความถูกต้องของ token สุดท้าย
  if (store.getters['auth/isAuthenticated']) {
    try {
      const isValid = await store.dispatch('auth/refreshAuth');
      if (!isValid) {
        console.warn('Token ไม่ถูกต้องแล้ว');
        redirectToLogin(redirect, route, 'Token หมดอายุ');
        return;
      }
      console.log('ยืนยันตัวตนสำเร็จ สามารถเข้าถึงหน้าได้');
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการตรวจสอบ token:', error);
      redirectToLogin(redirect, route, 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์');
    }
  } else {
    console.log('ไม่ผ่านการยืนยันตัวตน');
    redirectToLogin(redirect, route, 'กรุณาเข้าสู่ระบบ');
  }
}

// ✅ Helper function สำหรับตรวจสอบและล็อกอินด้วย LINE
async function attemptLineLogin(store, lineProfile, accessToken, redirect) {
  try {
    console.log('ตรวจสอบการเชื่อมโยงบัญชี LINE...');

    // ✅ เรียก checkLineRegistration ซึ่งจะคืน token มาเลยถ้าเชื่อมโยงแล้ว
    const checkResult = await store.dispatch('auth/checkLineRegistration');

    if (!checkResult.registered) {
      console.log('ยังไม่ได้เชื่อมโยงบัญชี จะ redirect ไปหน้าล็อกอิน');
      redirectToLogin(redirect, null, 'ยังไม่ได้เชื่อมโยงบัญชี LINE กับพนักงาน');
      return;
    }

    // ✅ checkLineRegistration จะคืน token มาแล้ว ไม่ต้องเรียก /auth/line-login อีก
    const token = checkResult.token || store.state.auth?.token || localStorage.getItem('token');

    if (token) {
      console.log('✅ มี token แล้ว - ล็อกอินสำเร็จ');

      // ตรวจสอบ redirect path
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath && redirectPath !== '/login') {
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectPath;
      }
    } else {
      console.error('❌ ไม่พบ token แม้ว่าจะเชื่อมโยงแล้ว');
      redirectToLogin(redirect, null, 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการตรวจสอบ LINE:', error);
    redirectToLogin(redirect, null, 'เกิดข้อผิดพลาดในการล็อกอิน');
  }
}

// ✅ Helper function สำหรับ redirect ไปหน้าล็อกอิน
function redirectToLogin(redirect, route, errorMessage) {
  // ล้างข้อมูลเก่า
  const itemsToRemove = ['token', 'user', 'staffId', 'staffInfo'];
  itemsToRemove.forEach(item => {
    try {
      localStorage.removeItem(item);
    } catch (error) {
      console.warn(`ไม่สามารถลบ ${item}:`, error);
    }
  });
  
  // บันทึก URL สำหรับ redirect กลับ
  if (route && route.path !== '/' && !route.path.includes('/login')) {
    localStorage.setItem('redirectAfterLogin', route.fullPath);
  }
  
  // redirect พร้อมข้อความ error
  const params = errorMessage ? `?error=${encodeURIComponent(errorMessage)}` : '';
  redirect(`/login${params}`);
}