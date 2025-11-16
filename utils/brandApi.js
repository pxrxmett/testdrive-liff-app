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

  // Remove leading slash from endpoint if exists
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint

  // ✅ FIX: Don't add /api prefix - axios baseURL already has it
  return `/${brandCode}/${cleanEndpoint}`
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
 * @returns {Promise<object>} Updated test drive
 */
export async function updateTestDrive(axios, testDriveId, updateData) {
  const path = buildBrandApiPath(`/test-drives/${testDriveId}`)

  console.log(`📞 PUT ${path}`, updateData)

  const response = await axios.$put(path, updateData)
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
 * Cancel test drive
 * @param {object} axios - Axios instance from Nuxt
 * @param {number|string} testDriveId - Test drive ID
 * @param {object} cancelData - Cancellation reason, etc.
 * @returns {Promise<object>} Updated test drive
 */
export async function cancelTestDrive(axios, testDriveId, cancelData = {}) {
  const path = buildBrandApiPath(`/test-drives/${testDriveId}/cancel`)

  console.log(`📞 POST ${path}`, cancelData)

  const response = await axios.$post(path, cancelData)
  return response
}
