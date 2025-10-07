// plugins/icons.js
import Vue from 'vue'
import feather from 'feather-icons'

// สร้าง component ไอคอนแบบง่าย
Vue.component('v-icon', {
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: [Number, String],
      default: 24
    },
    color: {
      type: String,
      default: 'currentColor'
    }
  },
  
  render(h) {
    // ตรวจสอบว่า feather และ feather.icons มีอยู่หรือไม่
    if (!feather || !feather.icons || !feather.icons[this.name]) {
      console.warn(`ไม่พบไอคอน: ${this.name}`)
      return h('span', {
        class: 'feather-icon-placeholder'
      }, '')
    }
    
    try {
      // อ่านข้อมูล SVG จาก feather-icons
      const icon = feather.icons[this.name]
      
      // สร้าง DOM element ชั่วคราว
      // ใช้เทคนิคนี้เพราะในบางครั้ง innerHTML อาจจะมีปัญหาใน SSR
      const svg = document.createElement('div')
      
      svg.innerHTML = icon.toSvg({
        width: this.size,
        height: this.size,
        color: this.color
      })
      
      // คืนค่า SVG element
      return h('span', {
        class: `feather-icon icon-${this.name}`,
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        },
        domProps: {
          innerHTML: svg.innerHTML
        }
      })
    } catch (error) {
      console.error(`เกิดข้อผิดพลาดในการแสดงไอคอน ${this.name}:`, error)
      return h('span', {
        class: 'feather-icon-error'
      }, '')
    }
  }
})