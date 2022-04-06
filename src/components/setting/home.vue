<template>
  <div class="system-setting-container"></div>
</template>
<script>
import bus from '@utils/eventBus'
export default {
  mounted () {
    bus.$emit('show-sidebar', true)
    this.$router.replace('/v1/system/integration')
  }
}
</script>

<style lang="less" >
.system-setting-container {
  position: relative;
  flex: 1;
  width: 100%;
  padding: 15px 20px;
  overflow: auto;
}
</style>
