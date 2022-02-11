<template>
  <div class="container-home">

  </div>
</template>
<script>
export default {
  methods: {},
  mounted () {
    this.$router.replace('/v1/system/integration')
  }
}
</script>

<style lang="less" >
.container-home {
  position: relative;
  flex: 1;
  width: 100%;
  padding: 15px 20px;
  overflow: auto;
}
</style>
