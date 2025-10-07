<template>
  <div class="link-account-page">
    <h2>เชื่อมโยงบัญชี LINE กับบัญชีพนักงาน</h2>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <form @submit.prevent="handleSubmit" class="link-form">
      <div class="form-group">
        <label>รหัสพนักงาน</label>
        <input 
          v-model="staffId"
          type="text"
          required
          placeholder="กรุณากรอกรหัสพนักงาน"
        >
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'กำลังดำเนินการ...' : 'เชื่อมโยงบัญชี' }}
      </button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      staffId: '',
      error: null,
      isLoading: false
    }
  },

  methods: {
    async handleSubmit() {
      try {
        this.isLoading = true
        this.error = null

        await this.$store.dispatch('auth/linkStaffLine', this.staffId)
        await this.$store.dispatch('auth/loginWithLine')
        
        this.$router.push('/')
      } catch (error) {
        console.error('Link account error:', error)
        this.error = 'เกิดข้อผิดพลาดในการเชื่อมโยงบัญชี กรุณาลองใหม่'
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.link-account-page {
  padding: 2rem;
  max-width: 400px;
  margin: 0 auto;
}

.link-form {
  margin-top: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.error-message {
  color: red;
  margin-bottom: 1rem;
}

button {
  width: 100%;
  padding: 0.8rem;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>