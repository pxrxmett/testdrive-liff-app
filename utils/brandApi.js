/**
 * Brand-scoped API Helper Functions
 * Auto-detects brandCode from localStorage and calls brand-specific endpoints
 */

/**
 * Get brandCode from localStorage
 * @returns {string} brandCode (e.g., 'isuzu', 'byd')
 */
function getBrandCode() {
  if (!process.client) return 'isuzu' // Default for SSR

  const brandCode = localStorage.getItem('brandCode')
  if (!brandCode) {
    console.warn('⚠️ brandCode not found in localStorage, using default: isuzu')
    return 'isuzu'
  }

  return brandCode
}

/**
 * Build brand-scoped API path
 * @param {string} endpoint - API endpoint without brand prefix
 * @returns {string} Full path with brand prefix
 */
function buildBrandPath(endpoint) {
  const brandCode = getBrandCode()
  // Remove leading slash if exists
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `/${brandCode}/${cleanEndpoint}`
}

// ============================================
// Test Drive APIs
// ============================================

/**
 * Get all test drives (with optional filters)
 * @param {object} axios - Axios instance
 * @param {object} params - Query parameters (status, vehicleId, etc.)
 * @returns {Promise<object>} API response
 */
export async function getTestDrives(axios, params = {}) {
  const path = buildBrandPath('test-drives')
  return await axios.$get(path, { params })
}

/**
 * Get single test drive by ID
 * @param {object} axios - Axios instance
 * @param {string|number} id - Test drive ID
 * @returns {Promise<object>} Test drive data
 */
export async function getTestDrive(axios, id) {
  const path = buildBrandPath(`test-drives/${id}`)
  return await axios.$get(path)
}

/**
 * Create new test drive booking
 * @param {object} axios - Axios instance
 * @param {object} data - Booking data
 * @returns {Promise<object>} Created test drive
 */
export async function createTestDrive(axios, data) {
  const path = buildBrandPath('test-drives')
  return await axios.$post(path, data)
}

/**
 * Update test drive
 * @param {object} axios - Axios instance
 * @param {string|number} id - Test drive ID
 * @param {object} data - Updated data
 * @returns {Promise<object>} Updated test drive
 */
export async function updateTestDrive(axios, id, data) {
  const path = buildBrandPath(`test-drives/${id}`)
  return await axios.$patch(path, data)
}

/**
 * Delete test drive
 * @param {object} axios - Axios instance
 * @param {string|number} id - Test drive ID
 * @returns {Promise<object>} API response
 */
export async function deleteTestDrive(axios, id) {
  const path = buildBrandPath(`test-drives/${id}`)
  return await axios.$delete(path)
}

/**
 * Submit PDPA consent
 * @param {object} axios - Axios instance
 * @param {string|number} id - Test drive ID
 * @param {boolean} consent - Consent value
 * @returns {Promise<object>} API response
 */
export async function submitPdpaConsent(axios, id, consent) {
  const path = buildBrandPath(`test-drives/${id}/pdpa-consent`)
  return await axios.$post(path, { consent })
}

/**
 * Submit signature
 * @param {object} axios - Axios instance
 * @param {string|number} id - Test drive ID
 * @param {string} signatureData - Base64 signature image
 * @returns {Promise<object>} API response
 */
export async function submitSignature(axios, id, signatureData) {
  const path = buildBrandPath(`test-drives/${id}/signature`)
  return await axios.$post(path, { signatureData })
}

/**
 * Submit multiple signatures (customer, sales, manager)
 * @param {object} axios - Axios instance
 * @param {string|number} id - Test drive ID
 * @param {object} signatures - { customer, sales, manager }
 * @returns {Promise<object>} API response
 */
export async function submitSignatures(axios, id, signatures) {
  const path = buildBrandPath(`test-drives/${id}/signatures`)
  return await axios.$post(path, signatures)
}

// ============================================
// Stock/Vehicle APIs
// ============================================

/**
 * Get all vehicles (with optional filters)
 * @param {object} axios - Axios instance
 * @param {object} params - Query parameters (status, etc.)
 * @returns {Promise<object>} API response with vehicles array
 */
export async function getVehicles(axios, params = {}) {
  const path = buildBrandPath('stock/vehicles')
  return await axios.$get(path, { params })
}

/**
 * Get available vehicles only
 * @param {object} axios - Axios instance
 * @returns {Promise<array>} Available vehicles
 */
export async function getAvailableVehicles(axios) {
  const response = await getVehicles(axios, { status: 'available' })
  return response.data || response // Handle different response formats
}

/**
 * Get single vehicle by ID
 * @param {object} axios - Axios instance
 * @param {string|number} id - Vehicle ID
 * @returns {Promise<object>} Vehicle data
 */
export async function getVehicle(axios, id) {
  const path = buildBrandPath(`stock/${id}`)
  return await axios.$get(path)
}

/**
 * Update vehicle status
 * @param {object} axios - Axios instance
 * @param {string|number} id - Vehicle ID
 * @param {string} status - New status (available, in_test, maintenance, unavailable)
 * @returns {Promise<object>} API response
 */
export async function updateVehicleStatus(axios, id, status) {
  const path = buildBrandPath(`stock/vehicles/${id}/status`)
  return await axios.$patch(path, { status })
}

// ============================================
// Staff APIs
// ============================================

/**
 * Get all staff
 * @param {object} axios - Axios instance
 * @returns {Promise<object>} API response with staff array
 */
export async function getAllStaff(axios) {
  const path = buildBrandPath('staffs')
  return await axios.$get(path)
}

/**
 * Get single staff by ID
 * @param {object} axios - Axios instance
 * @param {string|number} id - Staff ID
 * @returns {Promise<object>} Staff data
 */
export async function getStaff(axios, id) {
  const path = buildBrandPath(`staffs/${id}`)
  return await axios.$get(path)
}

// ============================================
// Export helper for direct path building
// ============================================
export { getBrandCode, buildBrandPath }
