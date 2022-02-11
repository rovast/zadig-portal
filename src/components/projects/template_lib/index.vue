<template>
  <div class="template-container">
    <router-view></router-view>
  </div>
</template>

<script>
import bus from '@utils/eventBus'
export default {
  created () {
    bus.$emit('set-topbar-title', { title: '模板库', breadcrumb: [] })
  }
}
</script>

<style lang="less" scoped>
.template-container {
  display: flex;
  height: 100%;
  overflow: hidden;
}
</style>
