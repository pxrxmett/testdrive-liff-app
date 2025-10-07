<!-- components/common/BottomNav.vue -->
<template>
  <div class="nav">
    <nuxt-link to="/" class="button" :class="{ active: $route.path === '/' }">
      <img class="SVG" alt="Home" src="https://api.iconify.design/mdi:home.svg?color=%239ca3af" />
      <div class="container">
        <div class="text-wrapper" :class="{ active: $route.path === '/' }">หน้าแรก</div>
      </div>
    </nuxt-link>
    
    <nuxt-link to="/calendar" class="button" :class="{ active: $route.path.includes('/calendar') }">
      <img class="SVG" alt="Calendar" src="https://api.iconify.design/mdi:calendar.svg?color=%239ca3af" />
      <div class="container">
        <div class="text-wrapper" :class="{ active: $route.path.includes('/calendar') }">ปฏิทิน</div>
      </div>
    </nuxt-link>
    
    <nuxt-link to="/booking" class="button" :class="{ active: $route.path.includes('/booking') }">
      <img class="SVG" alt="Booking" src="https://api.iconify.design/mdi:car.svg?color=%239ca3af" />
      <div class="container">
        <div class="text-wrapper" :class="{ active: $route.path.includes('/booking') }">จองรถ</div>
      </div>
    </nuxt-link>
    
    <nuxt-link to="/profile" class="button" :class="{ active: $route.path.includes('/profile') }">
      <img class="SVG" alt="Profile" src="https://api.iconify.design/mdi:account.svg?color=%239ca3af" />
      <div class="container">
        <div class="text-wrapper" :class="{ active: $route.path.includes('/profile') }">โปรไฟล์</div>
      </div>
    </nuxt-link>
  </div>
</template>

<script>
export default {
  name: "BottomNav"
};
</script>

<style scoped>
.nav {
  align-items: center;
  background-color: #ffffff;
  border-color: #e5e7eb;
  border-top-style: solid;
  border-top-width: 1px;
  display: flex;
  justify-content: space-around;
  height: 81px;
  max-width: 430px;
  width: 100%;
  padding: 9px 20px 17px 20px;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.button {
  all: unset;
  align-items: center;
  box-sizing: border-box;
  display: inline-flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 4px;
  padding: 4px;
  position: relative;
  cursor: pointer;
  text-decoration: none;
}

.SVG {
  height: 24px;
  position: relative;
  width: 24px;
}

.container {
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  flex-direction: column;
  padding: 3px 0px 2px;
  position: relative;
}

.text-wrapper {
  color: #9ca3af;
  font-family: Arial, sans-serif;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: normal;
  margin-top: -1.00px;
  position: relative;
  text-align: center;
  white-space: nowrap;
  width: fit-content;
}

.button.active .SVG {
  content: url("https://api.iconify.design/mdi:home.svg?color=%23dc2626");
}

.button.active:nth-child(2) .SVG {
  content: url("https://api.iconify.design/mdi:calendar.svg?color=%23dc2626");
}

.button.active:nth-child(3) .SVG {
  content: url("https://api.iconify.design/mdi:car.svg?color=%23dc2626");
}

.button.active:nth-child(4) .SVG {
  content: url("https://api.iconify.design/mdi:account.svg?color=%23dc2626");
}

.text-wrapper.active {
  color: #dc2626;
  font-weight: 500;
}
</style>