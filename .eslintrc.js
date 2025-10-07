module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'prettier'
  ],
  plugins: [
  ],
  // เพิ่ม rules ตรงนี้
  rules: {
    // ปรับ attribute order เป็น warning หรือปิดไปเลย
    'vue/attributes-order': 'off',  // หรือใช้ 'warn' ถ้าต้องการให้เตือนแต่ไม่บังคับ
    
    // ปรับ component order เป็น warning หรือปิดไปเลย
    'vue/order-in-components': 'off',  // หรือใช้ 'warn'
    
    // ยอมให้ใช้ console.log ได้ (เหมาะสำหรับช่วง development)
    'no-console': 'off'
    
    // ถ้าต้องการให้ ESLint ยังเตือนเรื่อง console อยู่แต่ไม่ถือเป็น error
    // 'no-console': 'warn'
  }
}