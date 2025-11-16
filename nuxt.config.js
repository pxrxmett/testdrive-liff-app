export default {
  ssr: false,
  
  head: {
    title: 'ระบบจองทดลองขับรถ',
    htmlAttrs: { lang: 'th' },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'ระบบจองทดลองขับรถออนไลน์ผ่าน LINE' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' },
      { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css' }
    ]
  },
  
  router: {
    middleware: ['auth']
  },

  css: [
    '~/assets/css/themes.css'
  ],

  plugins: [
    { src: '~/plugins/liff.js', mode: 'client' },
    { src: '~/plugins/axios.js' },
    '~/plugins/dayjs.js',
    { src: '~/plugins/theme.js', mode: 'client' }
  ],
  
  components: true,
  
  buildModules: [
    '@nuxtjs/eslint-module',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/dotenv'
  ],
  
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/proxy'
  ],
  
  axios: {
    // ใน production ใช้ direct URL, ใน dev ใช้ proxy
    baseURL: process.env.NODE_ENV === 'production'
      ? (process.env.NUXT_PUBLIC_API_URL || process.env.API_URL || 'https://isuzustock-management-production.up.railway.app/api')
      : '/api',

    // เปิด proxy เฉพาะ development
    proxy: process.env.NODE_ENV !== 'production',

    headers: {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    },
    timeout: 30000,
    credentials: true
  },
  
  // Proxy - ใช้เฉพาะ development
  proxy: process.env.NODE_ENV === 'production' 
    ? {} 
    : {
        '/': {
          target: process.env.BASE_URL || 'http://localhost:3000',
          pathRewrite: { '^/api/': '/' },
          changeOrigin: true,
          timeout: 60000,
          proxyTimeout: 60000
        }
      },
  
  publicRuntimeConfig: {
    liffId: process.env.NUXT_PUBLIC_LIFF_ID || process.env.LIFF_ID || '2006746784-e1y9NRqn',
    apiUrl: process.env.NUXT_PUBLIC_API_URL || process.env.API_URL || 'https://isuzustock-management-production.up.railway.app/api',
    baseUrl: process.env.BASE_URL || 'https://testdrive-liff-app-production-91da.up.railway.app',
    nodeEnv: process.env.NODE_ENV,
    // Keep legacy keys for backward compatibility
    LIFF_ID: process.env.NUXT_PUBLIC_LIFF_ID || process.env.LIFF_ID || '2006746784-e1y9NRqn',
    API_URL: process.env.NUXT_PUBLIC_API_URL || process.env.API_URL || 'https://isuzustock-management-production.up.railway.app/api',
    BASE_URL: process.env.BASE_URL || 'https://testdrive-liff-app-production-91da.up.railway.app'
  },
  
  privateRuntimeConfig: {},
  
  env: {
    LIFF_ID: process.env.NUXT_PUBLIC_LIFF_ID || process.env.LIFF_ID || '2006746784-e1y9NRqn',
    BASE_URL: process.env.BASE_URL || 'https://testdrive-liff-app-production-91da.up.railway.app',
    API_URL: process.env.NUXT_PUBLIC_API_URL || process.env.API_URL || 'https://isuzustock-management-production.up.railway.app/api'
  },
  
  server: {
    port: process.env.PORT || 4000,
    host: '0.0.0.0',
    timing: false
  },
  
  build: {
    transpile: [
      '@line/liff'
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        automaticNameDelimiter: '.',
        name: true,
        cacheGroups: {
          commons: {
            name: 'commons',
            chunks: 'initial',
            minChunks: 2,
            maxInitialRequests: 5,
            minSize: 0
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: -10
          }
        }
      }
    },
    terser: {
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production'
        }
      }
    },
    extend(config, ctx) {
      if (ctx.isDev) {
        config.devtool = 'eval-source-map'
      }
      
      config.performance = {
        hints: false,
        maxEntrypointSize: 1024000,
        maxAssetSize: 1024000
      }
    }
  },
  
  render: {
    http2: {
      push: false
    },
    compressor: {
      level: 9
    },
    static: {
      maxAge: 1000 * 60 * 60 * 24 * 7
    },
    dist: {
      maxAge: '1y',
      index: false,
      immutable: true
    },
    etag: {
      weak: true
    },
    csp: false
  },
  
  telemetry: false
}
