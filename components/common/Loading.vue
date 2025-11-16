# components/common/Loading.vue
<template>
  <div class="loading-overlay" v-if="show">
    <div class="loading-container">
      <div class="car-container">
        <div class="car">
          <div class="body">
            <div class="front"></div>
            <div class="rear"></div>
          </div>
          <div class="wheel wheel-left"></div>
          <div class="wheel wheel-right"></div>
        </div>
        <div class="road">
          <div class="line"></div>
        </div>
      </div>
      <p class="loading-text">{{ message || 'กำลังโหลด...' }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingOverlay',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-container {
  text-align: center;
}

.car-container {
  width: 200px;
  height: 100px;
  margin: 0 auto 20px;
  position: relative;
}

.car {
  position: absolute;
  width: 60px;
  height: 30px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  animation: carMove 1s infinite linear;
}

.body {
  width: 100%;
  height: 100%;
  background: var(--brand-primary);
  border-radius: 10px;
  position: relative;
}

.front {
  position: absolute;
  width: 15px;
  height: 15px;
  background: var(--brand-primary);
  right: -5px;
  top: 5px;
  border-radius: 3px;
}

.rear {
  position: absolute;
  width: 12px;
  height: 15px;
  background: var(--brand-primary);
  left: -3px;
  top: 5px;
  border-radius: 3px;
}

.wheel {
  width: 12px;
  height: 12px;
  background: #333;
  border-radius: 50%;
  position: absolute;
  bottom: -6px;
  animation: wheelRotate 0.5s infinite linear;
}

.wheel-left {
  left: 5px;
}

.wheel-right {
  right: 5px;
}

.road {
  width: 100%;
  height: 2px;
  background: #ddd;
  position: absolute;
  bottom: 0;
  overflow: hidden;
}

.line {
  width: 200%;
  height: 2px;
  background: repeating-linear-gradient(
    to right,
    #ddd 0%,
    #ddd 50%,
    transparent 50%,
    transparent 100%
  );
  background-size: 20px 100%;
  animation: roadMove 0.5s infinite linear;
}

.loading-text {
  font-size: 18px;
  color: #333;
  margin-top: 20px;
  font-weight: 500;
  animation: textPulse 1.5s infinite;
}

@keyframes carMove {
  0% {
    transform: translate(-50%, -50%) translateY(0px);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-2px);
  }
  100% {
    transform: translate(-50%, -50%) translateY(0px);
  }
}

@keyframes wheelRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes roadMove {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-20px);
  }
}

@keyframes textPulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
