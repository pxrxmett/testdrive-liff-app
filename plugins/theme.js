// plugins/theme.js - Auto-apply brand theme on app load
import { applyTheme, getCurrentBrandCode } from '~/utils/brandTheme'

export default ({ store }, inject) => {
  if (process.client) {
    // Apply theme on initial load
    const applyCurrentTheme = () => {
      const brandCode = store.state.auth?.staffInfo?.brandCode ||
                       localStorage.getItem('brandCode') ||
                       getCurrentBrandCode()

      console.log('🎨 Applying theme for brand:', brandCode)
      applyTheme(brandCode)
    }

    // Apply theme immediately
    applyCurrentTheme()

    // Watch for brandCode changes in store
    store.watch(
      (state) => state.auth?.staffInfo?.brandCode,
      (newBrandCode) => {
        if (newBrandCode) {
          console.log('🎨 Brand changed, applying new theme:', newBrandCode)
          applyTheme(newBrandCode)
        }
      }
    )

    // Inject theme helper function
    inject('applyTheme', applyTheme)
  }
}
