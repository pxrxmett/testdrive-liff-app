<template>
  <div class="signature-container">
    <canvas
      ref="signatureCanvas"
      class="signature-pad"
      :width="width"
      :height="height"
      @touchstart.prevent="startDrawing"
      @touchmove.prevent="draw"
      @touchend.prevent="stopDrawing"
      @mousedown.prevent="startDrawing"
      @mousemove.prevent="draw"
      @mouseup.prevent="stopDrawing"
      @mouseout.prevent="stopDrawing"
    ></canvas>
    <div class="signature-label">{{ label }}</div>
    <button
      v-if="hasSignature"
      type="button"
      class="clear-button"
      @click="clearSignature"
    >
      ล้าง
    </button>
  </div>
</template>

<script>
export default {
  name: 'SignaturePad',
  
  props: {
    width: {
      type: Number,
      default: 200
    },
    height: {
      type: Number,
      default: 100
    },
    label: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: null
    }
  },
  
  data() {
    return {
      isDrawing: false,
      hasSignature: false,
      lastX: 0,
      lastY: 0,
      ctx: null
    };
  },
  
  watch: {
    value(newValue) {
      if (newValue && this.ctx) {
        this.drawSavedSignature(newValue);
      } else if (!newValue && this.ctx) {
        this.clearCanvas();
      }
    }
  },
  
  mounted() {
    this.initCanvas();
    window.addEventListener('resize', this.handleResize);
    
    // ถ้ามีลายเซ็นเดิมให้แสดง
    if (this.value) {
      this.drawSavedSignature(this.value);
    }
  },
  
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  
  methods: {
    initCanvas() {
      const canvas = this.$refs.signatureCanvas;
      if (canvas) {
        this.ctx = canvas.getContext('2d');
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = '#000';
      }
    },
    
    startDrawing(event) {
      this.isDrawing = true;
      const rect = this.$refs.signatureCanvas.getBoundingClientRect();
      const position = this.getEventPosition(event, rect);
      
      this.lastX = position.x;
      this.lastY = position.y;
      
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
    },
    
    draw(event) {
      if (!this.isDrawing) return;
      
      const rect = this.$refs.signatureCanvas.getBoundingClientRect();
      const position = this.getEventPosition(event, rect);
      
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(position.x, position.y);
      this.ctx.stroke();
      
      this.lastX = position.x;
      this.lastY = position.y;
    },
    
    stopDrawing() {
      if (this.isDrawing) {
        this.isDrawing = false;
        this.hasSignature = true;
        
        // ส่งค่า base64 ของลายเซ็นกลับไปยัง parent
        const signatureData = this.$refs.signatureCanvas.toDataURL();
        this.$emit('input', signatureData);
      }
    },
    
    clearSignature() {
      this.clearCanvas();
      this.hasSignature = false;
      this.$emit('input', null);
    },
    
    clearCanvas() {
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.$refs.signatureCanvas.width, this.$refs.signatureCanvas.height);
      }
    },
    
    drawSavedSignature(dataUrl) {
      if (this.ctx) {
        const img = new Image();
        img.onload = () => {
          this.clearCanvas();
          this.ctx.drawImage(img, 0, 0);
          this.hasSignature = true;
        };
        img.src = dataUrl;
      }
    },
    
    getEventPosition(event, rect) {
      // รองรับทั้ง touch และ mouse events
      if (event.touches && event.touches[0]) {
        return {
          x: event.touches[0].clientX - rect.left,
          y: event.touches[0].clientY - rect.top
        };
      } else {
        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
      }
    },
    
    handleResize() {
      // เมื่อขนาดหน้าจอเปลี่ยน ให้วาดลายเซ็นใหม่เพื่อไม่ให้สูญหาย
      if (this.value) {
        this.drawSavedSignature(this.value);
      }
    }
  }
};
</script>

<style scoped>
.signature-container {
  text-align: center;
  position: relative;
}

.signature-pad {
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 8px;
  touch-action: none;
  background-color: #fff;
  width: 100%;
  max-width: 200px;
}

.signature-label {
  font-size: 14px;
  color: #555;
  margin-bottom: 4px;
}

.clear-button {
  font-size: 12px;
  padding: 4px 8px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 4px;
}

.clear-button:hover {
  background-color: #eee;
}

@media (hover: none) {
  .signature-pad {
    touch-action: none;
  }
  
  .clear-button {
    min-height: 36px; /* เพิ่มความสูงสำหรับการแตะบนมือถือ */
  }
}
</style>
