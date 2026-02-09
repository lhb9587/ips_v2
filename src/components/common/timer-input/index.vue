<template>
  <el-input
    v-model="inputValue" 
    :placeholder="placeholder"
    @input="handleInput"
    @blur="handleBlur"
    @keypress="validateKeyPress"
  />
</template>

<script>
export default {
  name: 'TimerInput',
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''  
    }
  },
  data() {
    return {
      inputValue: this.value
    }
  },
  methods: {
    // 键盘按下时验证
    validateKeyPress(e) {
      const char = String.fromCharCode(e.keyCode)
      // 只允许数字和冒号
      if(!/[\d:]/.test(char)) {
        e.preventDefault()
      }
      // 如果已经有冒号，则不允许再输入冒号
      if(char === ':' && this.inputValue.includes(':')) {
        e.preventDefault()
      }
    },
    
    handleInput(val) {
      // 过滤非法字符
      let newVal = val.replace(/[^\d:]/g, '')
      
      // 处理冒号
      if(newVal.split(':').length > 2) {
        newVal = newVal.substring(0, newVal.lastIndexOf(':'))
      }
      
      // 限制长度
      if(newVal.includes(':')) {
        const [hours, minutes] = newVal.split(':')
        newVal = `${hours.slice(0,2)}:${minutes.slice(0,2)}`
      } else if(newVal.length > 2) {
        newVal = `${newVal.slice(0,2)}:${newVal.slice(2,4)}`
      }

      this.inputValue = newVal
      this.$emit('update:modelValue', newVal)
    },

    handleBlur(e) {
      const value = e.target.value
      if(value) {
        // 验证并格式化时间
        if(value.includes(':')) {
          const [hours, minutes] = value.split(':')
          const h = hours.padStart(2, '0')
          const m = minutes.padStart(2, '0')
          
          if(Number(h) > 23 || Number(m) > 59) {
            this.inputValue = '00:00'
          } else {
            this.inputValue = `${h}:${m}`
          }
        } else {
          // 如果没有冒号，自动补全格式
          const h = value.slice(0,2).padStart(2, '0')
          const m = value.slice(2,4).padStart(2, '0')
          this.inputValue = `${h}:${m}`
        }
      }
      this.$emit('inputBlur', this.inputValue)
    }
  },
  watch: {
    value(newVal) {
      this.inputValue = newVal
    }
  }
}
</script>

<style scoped>
.is-invalid :deep(.el-input__inner) {
  border-color: #ff4949;
}
</style>
