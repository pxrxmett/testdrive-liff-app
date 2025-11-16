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
  background-color: var(--brand-bg-secondary);
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
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
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
  transition: transform 0.2s;
}

.button:active {
  transform: scale(0.95);
}

.SVG {
  height: 24px;
  position: relative;
  width: 24px;
  transition: filter 0.2s;
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
  transition: color 0.2s;
}

/* ✅ Use CSS variables for active state - adapts to brand theme */
.button.active .SVG {
  filter: brightness(0) saturate(100%) invert(18%) sepia(92%) saturate(7497%) hue-rotate(355deg) brightness(95%) contrast(107%);
}

.text-wrapper.active {
  color: var(--brand-primary);
  font-weight: 500;
}

/* Theme-specific icon colors for better visual consistency */
.theme-ISUZU .button.active .SVG {
  filter: brightness(0) saturate(100%) invert(11%) sepia(97%) saturate(6920%) hue-rotate(357deg) brightness(91%) contrast(115%);
}

.theme-BYD .button.active .SVG {
  filter: brightness(0) saturate(100%) invert(10%) sepia(100%) saturate(7443%) hue-rotate(358deg) brightness(94%) contrast(114%);
}
</style>