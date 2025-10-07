<!-- pages/calendar/index.vue -->
<template>
  <div class="calendar-page">
    <Header title="ปฏิทินทดลองขับ" />
    <div class="calendar-container">
      <TestDriveCalendar />
    </div>
    <BottomNav />
  </div>
</template>

<script>
export default {
  components: {
    Header: () => import('~/components/common/Header.vue'),
    BottomNav: () => import('~/components/common/BottomNav.vue'),
    TestDriveCalendar: () => import('~/components/calendar/TestDriveCalendar.vue')
  },
  
  layout: 'default',
  
  head() {
    return {
      title: 'ปฏิทินทดลองขับ - ISUZU',
      meta: [
        { 
          hid: 'description', 
          name: 'description', 
          content: 'ตารางการจองทดลองขับรถยนต์ ISUZU' 
        }
      ]
    }
  }
}
</script>

<style scoped>
.calendar-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.calendar-container {
  flex: 1;
  padding: 16px;
  margin-top: 120px; /* ให้พื้นที่กับส่วนหัว */
  padding-bottom: 100px; /* ให้พื้นที่กับเมนูด้านล่าง */
}
</style>