<template>
  <div class="camera-container">
    <video
      ref="video"
      :width="width"
      :height="height"
      autoplay
      playsinline
      class="camera-view"
    ></video>
    <canvas
      ref="canvas"
      :width="width"
      :height="height"
      class="camera-canvas"
    ></canvas>
  </div>
</template>

<script>
export default {
  name: 'CameraStream',
  props: {
    width: {
      type: Number,
      default: 640
    },
    height: {
      type: Number,
      default: 480
    }
  },
  data() {
    return {
      stream: null,
      videoTrack: null,
      isCameraActive: false
    }
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    this.stopCamera()
  },
  methods: {
    async init() {
      try {
        // เริ่มต้นกล้อง
        await this.startCamera()
        // แจ้งข้อมูลการเริ่มต้นสำเร็จ
        this.$emit('init', Promise.resolve())
      } catch (error) {
        // แจ้งข้อมูลการเริ่มต้นไม่สำเร็จ
        this.$emit('init', Promise.reject(error))
        console.error('Error initializing camera:', error)
      }
    },
    
    async startCamera() {
      try {
        // ขอสิทธิ์ในการใช้กล้อง
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // ใช้กล้องหลัง (ถ้ามี)
            width: { ideal: this.width },
            height: { ideal: this.height }
          },
          audio: false
        })
        
        // เชื่อมต่อสตรีมกับวิดีโอ
        if (this.$refs.video) {
          this.$refs.video.srcObject = this.stream
        }
        
        // เก็บข้อมูล video track
        this.videoTrack = this.stream.getVideoTracks()[0]
        this.isCameraActive = true
        
        // แจ้งว่ากล้องพร้อมใช้งาน
        this.$emit('camera-ready')
      } catch (error) {
        console.error('Error starting camera:', error)
        throw error
      }
    },
    
    stopCamera() {
      // หยุดการใช้งานกล้อง
      if (this.videoTrack) {
        this.videoTrack.stop()
      }
      
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop())
      }
      
      if (this.$refs.video) {
        this.$refs.video.srcObject = null
      }
      
      this.isCameraActive = false
    },
    
    capture() {
      if (!this.isCameraActive) {
        console.error('Camera is not active')
        return null
      }
      
      const video = this.$refs.video
      const canvas = this.$refs.canvas
      const context = canvas.getContext('2d')
      
      // วาดภาพจากวิดีโอลงบน canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // แปลง canvas เป็น data URL
      const imageData = canvas.toDataURL('image/jpeg')
      
      // ส่งข้อมูลภาพไปยัง parent component
      this.$emit('capture', imageData)
      
      return imageData
    }
  }
}
</script>

<style scoped>
.camera-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: #000;
  border-radius: 6px;
}

.camera-view {
  width: 100%;
  height: auto;
  display: block;
}

.camera-canvas {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
