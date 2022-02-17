<template>
  <div class="template-library-container">
    <SubTopbar/>
    <router-view></router-view>
  </div>
</template>

<script>
import bus from '@utils/eventBus'
import SubTopbar from './common/subTopbar'
export default {
  components: {
    SubTopbar
  },
  created () {
    bus.$emit('set-topbar-title', { title: '模板库', breadcrumb: [] })
  }
}
</script>

<style lang="less" scoped>
.template-library-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #f6f6f6;
}
</style>
