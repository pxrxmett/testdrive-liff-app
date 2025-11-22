// utils/brandApi.js - Helper functions for brand-scoped API calls
// Auto-detects brandCode from localStorage and builds API paths

/**
 * Get brandCode from localStorage
 * @returns {string|null} brandCode (e.g., 'isuzu')
 */
export function getBrandCode() {
  if (typeof window === 'undefined') return null

  const brandCode = localStorage.getItem('brandCode')

  if (!brandCode) {
    console.warn('⚠️ brandCode not found in localStorage')
  }

  return brandCode
}

/**
 * Build brand-scoped API path
 * @param {string} endpoint - API endpoint (e.g., '/stock', '/test-drives')
 * @returns {string} Full path (e.g., '/isuzu/stock')
 */
export function buildBrandApiPath(endpoint) {
  const brandCode = getBrandCode()

  if (!brandCode) {
    throw new Error('brandCode not found in localStorage. Please login first.')
  }

  // ✅ FIX: Convert brandCode to lowercase (API expects 'isuzu' not 'ISUZU')
  const normalizedBrandCode = brandCode.toLowerCase()

  // Validate brandCode
  if (!['isuzu', 'byd'].includes(normalizedBrandCode)) {
    console.warn(`⚠️ Invalid brandCode: ${brandCode}. Expected 'isuzu' or 'byd'. Using anyway...`)
  }

  // Remove leading slash from endpoint if exists
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint

  // ✅ FIX: Don't add /api prefix - axios baseURL already has it
  return `/${normalizedBrandCode}/${cleanEndpoint}`
}

/**
 * Get available vehicles for test drive
 * @param {object} axios - Axios instance from Nuxt
 * @param {object} params - Query parameters (optional)
 * @returns {Promise<Array>} List of vehicles
 */
export async function getAvailableVehicles(axios, params = {}) {
  const path = buildBrandApiPath('/stock')
  const queryParams = { status: 'available', ...params }

  console.log(`📞 GET ${path}`, queryParams)

  const response = await axios.$get(path, { params: queryParams })
  return response
}

/**
 * Get vehicle by ID
 * @param {object} axios - Axios instance from Nuxt
 * @param {number|string} vehicleId - Vehicle ID
 * @returns {Promise<object>} Vehicle details
 */
export async function getVehicleById(axios, vehicleId) {
  const path = buildBrandApiPath(`/stock/${vehicleId}`)

  console.log(`📞 GET ${path}`)

  const response = await axios.$get(path)
  return response
}

/**
 * Create new test drive booking
 * @param {object} axios - Axios instance from Nuxt
 * @param {object} bookingData - Booking details
 * @returns {Promise<object>} Created booking
 */
export async function createTestDrive(axios, bookingData) {
  const path = buildBrandApiPath('/test-drives')

  console.log(`📞 POST ${path}`, bookingData)

  const response = await axios.$post(path, bookingData)
  return response
}

/**
 * Get test drive by ID
 * @param {object} axios - Axios instance from Nuxt
 * @param {number|string} testDriveId - Test drive ID
 * @returns {Promise<object>} Test drive details
 */
export async function getTestDriveById(axios, testDriveId) {
  const path = buildBrandApiPath(`/test-drives/${testDriveId}`)

  console.log(`📞 GET ${path}`)

  const response = await axios.$get(path)
  return response
}

/**
 * Update test drive
 * @param {object} axios - Axios instance from Nuxt
 * @param {number|string} testDriveId - Test drive ID
 * @param {object} updateData - Update data
 * @param {string} method - HTTP method ('PUT' or 'PATCH', default: 'PUT')
 * @returns {Promise<object>} Updated test drive
 */
export async function updateTestDrive(axios, testDriveId, updateData, method = 'PUT') {
  const path = buildBrandApiPath(`/test-drives/${testDriveId}`)

  console.log(`📞 ${method} ${path}`, updateData)

  const response = method === 'PATCH'
    ? await axios.$patch(path, updateData)
    : await axios.$put(path, updateData)

  return response
}

/**
 * Get test drives list with filters
 * @param {object} axios - Axios instance from Nuxt
 * @param {object} filters - Filter parameters (status, date, etc.)
 * @returns {Promise<Array>} List of test drives
 */
export async function getTestDrives(axios, filters = {}) {
  const path = buildBrandApiPath('/test-drives')

  console.log(`📞 GET ${path}`, filters)

  const response = await axios.$get(path, { params: filters })
  return response
}

/**
 * Start test drive
 * @param {object} axios - Axios instance from Nuxt
 * @param {number|string} testDriveId - Test drive ID
 * @param {object} startData - Start form data (odometer, etc.)
 * @returns {Promise<object>} Updated test drive
 */
export async function startTestDrive(axios, testDriveId, startData) {
  const path = buildBrandApiPath(`/test-drives/${testDriveId}/start`)

  console.log(`📞 POST ${path}`, startData)

  const response = await axios.$post(path, startData)
  return response
}

/**
 * End test drive
 * @param {object} axios - Axios instance from Nuxt
 * @param {number|string} testDriveId - Test drive ID
 * @param {object} endData - End form data (odometer, condition, etc.)
 * @returns {Promise<object>} Updated test drive
 */
export async function endTestDrive(axios, testDriveId, endData) {
  const path = buildBrandApiPath(`/test-drives/${testDriveId}/end`)

  console.log(`📞 POST ${path}`, endData)

  const response = await axios.$post(path, endData)
  return response
}

/**
 * Get vehicle models for the brand
 * @param {object} axios - Axios instance from Nuxt
 * @returns {Promise<Array>} List of vehicle models
 */
export async function getVehicleModels(axios) {
  const path = buildBrandApiPath('/vehicle-models')

  console.log(`📞 GET ${path}`)

  const response = await axios.$get(path)
  return response
}

/**
 * Upload document for test drive
 * @param {object} axios - Axios instance from Nuxt
 * @param {number|string} testDriveId - Test drive ID
 * @param {FormData} formData - Form data with file
 * @returns {Promise<object>} Upload result
 */
export async function uploadTestDriveDocument(axios, testDriveId, formData) {
  const path = buildBrandApiPath(`/test-drives/${testDriveId}/documents`)

  console.log(`📞 POST ${path}`, '(file upload)')

  const response = await axios.$post(path, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response
}

/**
 * Get calendar events for test drives
 * @param {object} axios - Axios instance from Nuxt
 * @param {object} params - Query parameters (start_date, end_date, etc.)
 * @returns {Promise<Array>} Calendar events
 */
export async function getCalendarEvents(axios, params = {}) {
  const path = buildBrandApiPath('/test-drives/calendar')

  console.log(`📞 GET ${path}`, params)

  const response = await axios.$get(path, { params })
  return response
}

/**
 * Delete/Cancel test drive (ตาม API Documentation)
 * @param {object} axios - Axios instance from Nuxt
 * @param {number|string} testDriveId - Test drive ID
 * @returns {Promise<object>} Deleted test drive response
 */
export async function deleteTestDrive(axios, testDriveId) {
  const path = buildBrandApiPath(`/test-drives/${testDriveId}`)

  console.log(`📞 DELETE ${path}`)

  const response = await axios.$delete(path)
  return response
}

/**
 * @deprecated Use deleteTestDrive instead (API uses DELETE method, not POST /cancel)
 */
export async function cancelTestDrive(axios, testDriveId) {
  console.warn('⚠️ cancelTestDrive is deprecated. Use deleteTestDrive instead.')
  return deleteTestDrive(axios, testDriveId)
}

// ========================================
// 🆕 Staff APIs
// ========================================

/**
 * Get all staffs for the brand
 * @param {object} axios - Axios instance from Nuxt
 * @param {object} params - Query parameters (optional)
 * @returns {Promise<Array>} List of staffs
 */
export async function getAllStaffs(axios, params = {}) {
  const path = buildBrandApiPath('/staff')  // ✅ FIX: /staff ไม่ใช่ /staffs

  console.log(`📞 GET ${path}`, params)

  const response = await axios.$get(path, { params })
  return response
}

/**
 * Get staff by ID
 * @param {object} axios - Axios instance from Nuxt
 * @param {number|string} staffId - Staff ID
 * @returns {Promise<object>} Staff details
 */
export async function getStaffById(axios, staffId) {
  const path = buildBrandApiPath(`/staff/${staffId}`)  // ✅ FIX: /staff ไม่ใช่ /staffs

  console.log(`📞 GET ${path}`)

  const response = await axios.$get(path)
  return response
}

// ========================================
// 🆕 Stock Management APIs
// ========================================

/**
 * Update vehicle status
 * @param {object} axios - Axios instance from Nuxt
 * @param {number|string} vehicleId - Vehicle ID
 * @param {string} status - New status (e.g., 'available', 'in_use', 'maintenance')
 * @returns {Promise<object>} Updated vehicle
 */
export async function updateVehicleStatus(axios, vehicleId, status) {
  const path = buildBrandApiPath(`/stock/vehicles/${vehicleId}/status`)

  console.log(`📞 PATCH ${path}`, { status })

  const response = await axios.$patch(path, { status })
  return response
}

// ========================================
// 🆕 Signature Upload with Compression
// ========================================

/**
 * Compress base64 image to reduce size (fix 413 error)
 * @param {string} base64Image - Base64 image string (with data:image/... prefix)
 * @param {number} maxWidth - Maximum width in pixels (default: 600)
 * @param {number} quality - JPEG quality 0-1 (default: 0.6)
 * @returns {Promise<string>} Compressed base64 image
 */
export function compressBase64Image(base64Image, maxWidth = 600, quality = 0.6) {
  return new Promise((resolve, reject) => {
    // Create image element
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      // Create canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      // Draw compressed image
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to base64 with compression
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality)

      console.log('📦 Image compression:', {
        original: (base64Image.length / 1024).toFixed(2) + ' KB',
        compressed: (compressedBase64.length / 1024).toFixed(2) + ' KB',
        reduction: (((base64Image.length - compressedBase64.length) / base64Image.length) * 100).toFixed(1) + '%'
      })

      resolve(compressedBase64)
    }

    img.onerror = (error) => {
      reject(new Error('Failed to load image for compression: ' + error))
    }

    img.src = base64Image
  })
}

/**
 * Submit PDPA consent for test drive
 * @param {object} axios - Axios instance from Nuxt
 * @param {number|string} testDriveId - Test drive ID
 * @param {boolean} consent - Consent value (true/false)
 * @returns {Promise<object>} Response
 */
export async function submitPdpaConsent(axios, testDriveId, consent) {
  const path = buildBrandApiPath(`/test-drives/${testDriveId}/pdpa-consent`)

  console.log(`📞 POST ${path}`, { consent })

  const response = await axios.$post(path, { consent })
  return response
}

/**
 * Upload signature with automatic compression
 * @param {object} axios - Axios instance from Nuxt
 * @param {number|string} testDriveId - Test drive ID
 * @param {string} signatureData - Base64 signature image
 * @param {boolean} compress - Auto-compress image (default: true)
 * @returns {Promise<object>} Upload result
 */
export async function uploadSignature(axios, testDriveId, signatureData, compress = true) {
  const path = buildBrandApiPath(`/test-drives/${testDriveId}/signature`)

  let finalSignatureData = signatureData

  // Auto-compress if enabled and image is large
  if (compress && signatureData.length > 100 * 1024) { // > 100KB
    console.log('🔄 Compressing signature image...')
    finalSignatureData = await compressBase64Image(signatureData, 600, 0.6)
  }

  console.log(`📞 POST ${path}`, '(signature upload)')

  const response = await axios.$post(path, { signatureData: finalSignatureData })
  return response
}

/**
 * ==========================================
 * TEST DRIVE DOCUMENT APIs (Brand-scoped)
 * ==========================================
 */

/**
 * Create test drive document (with PDF generation)
 * @param {object} axios - Axios instance from Nuxt
 * @param {number|string} testDriveId - Test drive ID
 * @param {object} documentData - Document data including salesSpecialist, customerName, licenseImage, signatures, etc.
 * @returns {Promise<object>} Created document with pdfUrl (may be null initially)
 */
export async function createTestDriveDocument(axios, testDriveId, documentData) {
  const path = buildBrandApiPath(`/test-drives/${testDriveId}/document`)

  console.log(`📞 POST ${path}`, '(create document)')

  const response = await axios.$post(path, documentData)
  return response
}

/**
 * Get test drive document
 * @param {object} axios - Axios instance from Nuxt
 * @param {number|string} testDriveId - Test drive ID
 * @returns {Promise<object>} Document data with URLs
 */
export async function getTestDriveDocument(axios, testDriveId) {
  const path = buildBrandApiPath(`/test-drives/${testDriveId}/document`)

  console.log(`📞 GET ${path}`)

  const response = await axios.$get(path)
  return response
}

/**
 * Update test drive document
 * @param {object} axios - Axios instance from Nuxt
 * @param {number|string} testDriveId - Test drive ID
 * @param {object} documentData - Updated document data
 * @returns {Promise<object>} Updated document with new pdfUrl
 */
export async function updateTestDriveDocument(axios, testDriveId, documentData) {
  const path = buildBrandApiPath(`/test-drives/${testDriveId}/document`)

  console.log(`📞 PATCH ${path}`, '(update document)')

  const response = await axios.$patch(path, documentData)
  return response
}

/**
 * Get document PDF download URL
 * @param {number|string} testDriveId - Test drive ID
 * @returns {string} PDF download URL
 */
export function getDocumentPdfDownloadUrl(testDriveId) {
  const brandCode = getBrandCode()
  if (!brandCode) {
    throw new Error('brandCode not found in localStorage')
  }
  const normalizedBrandCode = brandCode.toLowerCase()

  // Return relative URL (browser will use current origin)
  return `/api/${normalizedBrandCode}/test-drives/${testDriveId}/document/download`
}
