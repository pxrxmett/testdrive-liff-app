<template>
  <div>
  
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
  }
}
</script>

<style>
/* สไตล์ทั่วไปสำหรับ layout ถ้าต้องการ */
</style>