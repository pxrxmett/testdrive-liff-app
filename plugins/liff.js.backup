export default async function({ store, $config, route }, inject) {
  // ไม่ทำงานใน server-side rendering
  if (!process.client) return;

  const isDev = process.env.NODE_ENV === 'development';
  const log = isDev ? console.log : () => {};
  const errorLog = console.error;

  try {
    log('กำลังเริ่มต้น LIFF...');
    
    // นำเข้า LIFF SDK อย่างมีประสิทธิภาพ
    const liffModule = await import('@line/liff');
    const liff = liffModule.default;
    
    // ดึงค่าตัวแปรสภาพแวดล้อม
    const liffId = $config.LIFF_ID || process.env.LIFF_ID;
    const tunnelUrl = $config.TUNNEL_URL || process.env.TUNNEL_URL || 'testdrive-liff.loca.lt';
    const isTunnel = $config.IS_TUNNEL || process.env.IS_TUNNEL || true;
    
    // ตรวจสอบว่ามีค่า LIFF ID หรือไม่
    if (!liffId) {
      throw new Error('ไม่พบค่า LIFF_ID กรุณาตรวจสอบการตั้งค่าในไฟล์ .env');
    }
    
    if (isDev) {
      log('LIFF ID:', liffId);
      log('Tunnel URL:', tunnelUrl);
      log('Is Tunnel:', isTunnel);
    }
    
    // เริ่มต้น LIFF SDK
    await liff.init({ 
      liffId,
      withLoginOnExternalBrowser: true
    });
    
    log('LIFF initialized successfully');
    
    // ฉีด LIFF ให้เข้าถึงได้ทั่วแอปพลิเคชัน
    inject('liff', liff);
    window.liff = liff;
    
    // ตรวจสอบสถานะการล็อกอิน
    if (!liff.isLoggedIn() && route.path !== '/login') {
      log('ยังไม่ได้ล็อกอิน จะแสดงหน้าล็อกอิน LINE');
      
      // กำหนด redirectUri ตามสภาพแวดล้อม
      let redirectUri;
      if (isTunnel) {
        redirectUri = `https://${tunnelUrl}${route.path}`;
      } else if (isDev) {
        redirectUri = `http://localhost:4000${route.path}`;
      } else {
        redirectUri = window.location.href;
      }
      
      if (isDev) {
        log('Redirect URI:', redirectUri);
      }
      
      // ล็อกอินโดยใช้ Promise แทน try-catch ที่ซ้อนกัน
      liff.login({ redirectUri })
        .catch(loginError => {
          errorLog('เกิดข้อผิดพลาดในการล็อกอิน LINE:', loginError);
          
          // กรณีมีปัญหากับ redirectUri ลองใช้การล็อกอินแบบพื้นฐาน
          if (loginError.message && loginError.message.includes('redirect_uri')) {
            log('ทดลองล็อกอินโดยไม่ระบุ redirectUri');
            liff.login();
          }
        });
      
      return;
    }
    
    // ✅ ปรับปรุงการจัดการข้อมูลผู้ใช้หลังจากล็อกอินสำเร็จ
    if (liff.isLoggedIn()) {
      try {
        // ใช้ Promise.all เพื่อดึงข้อมูลพร้อมกัน
        const [profile, accessToken] = await Promise.all([
          liff.getProfile(),
          liff.getAccessToken()
        ]);

        if (isDev) {
          log('ได้รับข้อมูลโปรไฟล์ LINE');
        }
        
        if (accessToken && profile) {
          const lineProfile = {
            userId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
            statusMessage: profile.statusMessage,
            accessToken
          };

          // บันทึกข้อมูลลงใน store
          store.commit('auth/setLineProfile', lineProfile);
          store.commit('auth/setLineAccessToken', accessToken);
          
          // ใช้ localStorage แบบมีการตรวจสอบ
          try {
            localStorage.setItem('lineProfile', JSON.stringify(lineProfile));
          } catch (storageError) {
            errorLog('ไม่สามารถบันทึกข้อมูลลง localStorage:', storageError);
          }
          
          // ✅ แก้ไขการตรวจสอบการลงทะเบียนและล็อกอิน
          try {
            // ตรวจสอบการเชื่อมโยงบัญชี LINE ก่อน
            const checkResult = await store.dispatch('auth/checkLineRegistration');
            log('ผลการตรวจสอบการเชื่อมโยง:', checkResult);
            
            if (checkResult.registered) {
              log('พบข้อมูลการเชื่อมโยงบัญชี - พยายามล็อกอินอัตโนมัติ');
              
              // พยายามล็อกอินด้วย LINE
              const loginResult = await store.dispatch('auth/loginWithLine', {
                lineProfile,
                lineAccessToken: accessToken
              });
              
              if (loginResult.success) {
                log('ล็อกอินด้วย LINE สำเร็จใน LIFF plugin');
              } else {
                errorLog('ล็อกอินด้วย LINE ไม่สำเร็จ:', loginResult.error);
              }
            } else {
              log('ยังไม่ได้เชื่อมโยงบัญชี LINE กับพนักงาน');
              // ไม่ต้องทำอะไรเพิ่ม ให้ middleware จัดการ
            }
          } catch (authError) {
            errorLog('เกิดข้อผิดพลาดในขั้นตอนการตรวจสอบ/ล็อกอิน:', authError);
            // ไม่ throw error เพื่อไม่ให้หยุดการทำงานของ LIFF
          }
        } else {
          errorLog('ไม่ได้รับ accessToken หรือ profile จาก LINE');
        }
      } catch (profileError) {
        errorLog('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์ LINE:', profileError);
        
        // ตรวจสอบ token ที่หมดอายุ
        if (profileError.message && (profileError.message.includes('token') || profileError.code === 'INVALID_ACCESS_TOKEN')) {
          log('Token หมดอายุหรือไม่ถูกต้อง ทำการล็อกเอาท์และล็อกอินใหม่');
          liff.logout();
          window.location.reload();
        }
      }
    } else {
      log('ยังไม่ได้ล็อกอิน LINE (liff.isLoggedIn() เป็น false)');
    }
  } catch (error) {
    errorLog('เกิดข้อผิดพลาดในการเริ่มต้น LIFF:', error);
    
    if (isDev) {
      errorLog('รายละเอียดข้อผิดพลาด:', {
        message: error.message,
        stack: error.stack
      });
      
      // แสดงข้อความแจ้งเตือนเฉพาะในโหมดพัฒนา
      alert(`LIFF Error: ${error.message}\nโปรดตรวจสอบ Console เพื่อดูรายละเอียดเพิ่มเติม`);
    }
  }
}