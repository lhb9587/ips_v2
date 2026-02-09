<template>
  <el-config-provider :locale="zhCn">
    <router-view v-slot="{ Component }">
      <keep-alive :include="cacheViews">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </el-config-provider>
</template>

<script>
import zhCn from "element-plus/es/locale/lang/zh-cn";
export default {
  name: "App",
  data() {
    return {
      cacheViews: ['default'] // 需要缓存的组件名数组
    }
  },
  watch: {
    $route(to) {
      console.log(to.meta.keepAlive,'to.meta.keepAlive');
      console.log(to.name,'to.name');
      if (to.meta.keepAlive) {
        if (!this.cacheViews.includes(to.name)) {
          this.cacheViews.push(to.name);
        }
      } else {
        const index = this.cacheViews.indexOf(to.name);
        if (index > -1) {
          this.cacheViews.splice(index, 1);
        }
      }
    }
  },
  computed: {
    zhCn() {
      return zhCn;
    },
  },
  mounted() {
    console.log(this.$route);
  },
};
</script>
