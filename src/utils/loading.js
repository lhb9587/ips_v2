import {
  ElLoading 
} from 'element-plus'

let loadingCount = 0
let loading
let timer

const startLoading = () => {
  loading = ElLoading .service({
    lock: true,
    text: '  请等待',
    background: 'rgba(255, 255, 255, 0.5)',
     // target:'#app',
    // fullscreen:true
  })

  timer = setTimeout(() => {
    loading.close()
    loading = ElLoading .service({
      lock: true,
      text: '正在努力搜索，请稍候...',
      background: 'rgba(255, 255, 255, 0.5)',
      // target:'#app',
      // fullscreen:true
    })
  }, 30000)
}

const endLoading = () => {
  loading.close()
  clearTimeout(timer)
}

export const showLoading = () => {
  if (loadingCount === 0) {
   startLoading()
  }

  loadingCount += 1
}

export const hideLoading = () => {
  if (loadingCount <= 0) {
    return
  }
   loadingCount -= 1
  if (loadingCount === 0) {
     endLoading()
  }
}
