<template>
  <div :class="['app-container', themeClass]" class="bg-theme">
    <Nuxt />
    <BottomNav />
  </div>
</template>

<script>
import BottomNav from '~/components/common/BottomNav.vue'

export default {
  name: 'DefaultLayout',
  components: {
    BottomNav
  },
  computed: {
    brandCode() {
      return this.$store.getters['auth/brandCode']
    },
    brandTheme() {
      return this.$store.getters['auth/brandTheme']
    },
    themeClass() {
      return `theme-${this.brandCode || 'ISUZU'}`
    }
  },
  watch: {
    brandCode(newBrand) {
      if (newBrand && this.$applyTheme) {
        this.$applyTheme(newBrand)
      }
    }
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  transition: background-color 0.3s ease;
}
</style>