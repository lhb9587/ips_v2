export default {
    bind(el, binding) {
        console.log(el,binding,'ellllelll');
        // 默认抽屉宽度，当宽度小于此值不在压缩
      const minWidth = 400
      const dragDom = el.querySelector('.el-drawer')
      dragDom.style.overflow = 'auto'
      const resizeElL = document.createElement('div')
      const img = new Image(24, 38)
      img.src = require('@/assets/images/leaflet/marker-icon.png')
      dragDom.appendChild(img)
      dragDom.appendChild(resizeElL)
      resizeElL.style.cursor = 'w-resize'
      resizeElL.style.position = 'absolute'
      resizeElL.style.height = '100%'
      resizeElL.style.width = '10px'
      resizeElL.style.top = '0px'
      img.style.position = 'absolute'
      img.style.top = '50%'
      // console.log('binding', binding.value)
      // 区分右侧侧边栏和左侧侧边栏
      if (binding.value === 'right') {
        resizeElL.style.left = '0px'
        img.style.left = '-12px'
        resizeElL.onmousedown = (e) => {
          const elW = dragDom.clientWidth
          const EloffsetLeft = dragDom.offsetLeft
          const clientX = e.clientX
          document.onmousemove = function(e) {
            e.preventDefault()
            if (clientX > EloffsetLeft && clientX < EloffsetLeft + 10) {
              // 往右拖拽
              if (e.clientX > clientX) {
                // console.log('向右-----------------------------')
                if (dragDom.clientWidth >= minWidth) {
                  dragDom.style.width = elW - (e.clientX - clientX) + 'px'
                }
              }
              if (e.clientX < clientX) {
                // console.log('向左-----------------------------')
                dragDom.style.width = elW + (clientX - e.clientX) + 'px'
              }
            }
          }
          // 拉伸结束
          document.onmouseup = function() {
            document.onmousemove = null
            document.onmouseup = null
          }
        }
      } else {
        resizeElL.style.right = '0px'
        img.style.right = '-12px'
        resizeElL.onmousedown = (e) => {
          const elW = dragDom.clientWidth
          const EloffsetLeft = dragDom.offsetLeft + dragDom.offsetWidth
          const clientX = e.clientX
          document.onmousemove = function(e) {
            e.preventDefault()
            if (clientX < EloffsetLeft && clientX > EloffsetLeft - 10) {
              if (e.clientX > clientX) {
                // console.log('向右-----------------------------')
                dragDom.style.width = elW + (e.clientX - clientX) + 'px'
              }
              if (e.clientX < clientX) {
                // console.log('向左-----------------------------')
                if (dragDom.clientWidth >= minWidth) {
                  dragDom.style.width = elW - (clientX - e.clientX) + 'px'
                }
              }
            }
          }
          // 拉伸结束
          document.onmouseup = function() {
            document.onmousemove = null
            document.onmouseup = null
          }
        }
      }
    }
  }