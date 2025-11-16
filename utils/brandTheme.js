// utils/brandTheme.js - Multi-Brand Theme Configuration
// Auto-detect brand from localStorage and apply theme

/**
 * Brand Theme Configurations
 */
export const brandThemes = {
  ISUZU: {
    code: 'ISUZU',
    name: 'ISUZU เชียงราย',

    // Colors
    primary: '#E60012',
    secondary: '#1A1A1A',
    background: '#F5F5F5',
    backgroundSecondary: '#FFFFFF',
    text: '#1A1A1A',
    textLight: '#666666',

    // Branding
    logo: '/images/isuzu-logo.png',
    logoAlt: 'ISUZU Logo',

    // Shadows & Effects
    shadow: '0 2px 8px rgba(230, 0, 18, 0.15)',
    shadowHover: '0 4px 12px rgba(230, 0, 18, 0.25)',
  },

  BYD: {
    code: 'BYD',
    name: 'BYD เชียงราย',

    // Colors
    primary: '#E60009',
    secondary: '#000000',
    background: '#FFFFFF',
    backgroundSecondary: '#F2F2F2',
    text: '#333333',
    textLight: '#666666',

    // Branding
    logo: '/images/byd-logo.png',
    logoAlt: 'BYD Logo',

    // Shadows & Effects
    shadow: '0 2px 8px rgba(230, 0, 9, 0.15)',
    shadowHover: '0 4px 12px rgba(230, 0, 9, 0.25)',
  },
}

/**
 * Get theme by brand code
 * @param {string} brandCode - Brand code (e.g., 'ISUZU', 'BYD')
 * @returns {object} Theme configuration
 */
export function getTheme(brandCode) {
  const normalizedCode = brandCode?.toUpperCase()
  const theme = brandThemes[normalizedCode]

  if (!theme) {
    console.warn(`⚠️ Unknown brand: ${brandCode}, falling back to ISUZU`)
    return brandThemes.ISUZU
  }

  return theme
}

/**
 * Get current brand code from localStorage
 * @returns {string} Brand code
 */
export function getCurrentBrandCode() {
  if (typeof window === 'undefined') return 'ISUZU'

  const brandCode = localStorage.getItem('brandCode')
  return brandCode?.toUpperCase() || 'ISUZU'
}

/**
 * Get current theme from localStorage
 * @returns {object} Theme configuration
 */
export function getCurrentTheme() {
  const brandCode = getCurrentBrandCode()
  return getTheme(brandCode)
}

/**
 * Apply theme CSS variables to document
 * @param {string} brandCode - Brand code
 */
export function applyTheme(brandCode) {
  if (typeof window === 'undefined') return

  const theme = getTheme(brandCode)
  const root = document.documentElement

  // Apply CSS variables
  root.style.setProperty('--brand-primary', theme.primary)
  root.style.setProperty('--brand-secondary', theme.secondary)
  root.style.setProperty('--brand-bg', theme.background)
  root.style.setProperty('--brand-bg-secondary', theme.backgroundSecondary)
  root.style.setProperty('--brand-text', theme.text)
  root.style.setProperty('--brand-text-light', theme.textLight)
  root.style.setProperty('--brand-shadow', theme.shadow)
  root.style.setProperty('--brand-shadow-hover', theme.shadowHover)

  // Add brand class to body
  document.body.className = document.body.className
    .replace(/theme-\w+/g, '') // Remove old theme classes
    .trim()
  document.body.classList.add(`theme-${theme.code}`)

  console.log(`🎨 Theme applied: ${theme.name}`)
}

// Default export
export default {
  brandThemes,
  getTheme,
  getCurrentBrandCode,
  getCurrentTheme,
  applyTheme,
}
