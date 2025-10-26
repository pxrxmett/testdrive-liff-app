// plugins/liff.js - Simplified LIFF Plugin
// ✅ FIXED: Removed auto-login logic to prevent race conditions
// ✅ FIXED: Plugin now ONLY initializes LIFF
// ✅ Authentication logic moved to pages and middleware

export default async function({ store, $config, route }, inject) {
  // Only run on client-side
  if (!process.client) return;

  const isDev = process.env.NODE_ENV === 'development';
  const log = isDev ? console.log : () => {};
  const errorLog = console.error;

  try {
    log('🔄 กำลังเริ่มต้น LIFF...');

    // Import LIFF SDK
    const liffModule = await import('@line/liff');
    const liff = liffModule.default;

    // Get environment variables
    const liffId = $config.LIFF_ID || process.env.LIFF_ID;

    // Validate LIFF ID
    if (!liffId) {
      throw new Error('❌ ไม่พบค่า LIFF_ID กรุณาตรวจสอบการตั้งค่าในไฟล์ .env');
    }

    if (isDev) {
      log('🔑 LIFF ID:', liffId);
    }

    // Initialize LIFF SDK
    await liff.init({
      liffId,
      withLoginOnExternalBrowser: true
    });

    log('✅ LIFF initialized successfully');

    // Inject LIFF to make it accessible globally
    inject('liff', liff);
    window.liff = liff;

    // ✅ ONLY save LINE profile if logged in
    // ✅ NO auto-login, NO checkLineRegistration, NO loginWithLine
    // ✅ Let pages and middleware handle authentication flow
    if (liff.isLoggedIn()) {
      try {
        // Get LINE profile and access token
        const [profile, accessToken] = await Promise.all([
          liff.getProfile(),
          liff.getAccessToken()
        ]);

        if (profile && accessToken) {
          const lineProfile = {
            userId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
            statusMessage: profile.statusMessage,
            accessToken
          };

          // Save to store
          store.commit('auth/setLineProfile', lineProfile);
          store.commit('auth/setLineAccessToken', accessToken);

          // Save to localStorage (with error handling)
          try {
            localStorage.setItem('lineProfile', JSON.stringify(lineProfile));
            log('💾 LINE Profile saved to store and localStorage');
          } catch (storageError) {
            errorLog('⚠️ ไม่สามารถบันทึกข้อมูลลง localStorage:', storageError);
          }
        }
      } catch (profileError) {
        errorLog('❌ เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์ LINE:', profileError);

        // Check if token is expired
        if (profileError.code === 'INVALID_ACCESS_TOKEN' ||
            (profileError.message && profileError.message.includes('token'))) {
          log('🔄 LINE Token หมดอายุ - ล็อกเอาท์และรีเฟรช');
          liff.logout();
          window.location.reload();
        }
      }
    } else {
      log('ℹ️ ยังไม่ได้ล็อกอิน LINE - รอให้ผู้ใช้ดำเนินการในหน้า login');
    }

  } catch (error) {
    errorLog('❌ เกิดข้อผิดพลาดในการเริ่มต้น LIFF:', error);

    if (isDev) {
      errorLog('📋 รายละเอียดข้อผิดพลาด:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
    }

    // Don't block app execution even if LIFF fails
    // User will see error message in login page
  }
}
