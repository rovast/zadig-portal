<template>
  <div style="
    display: flex;
    flex-direction: column;
    height: 100%;">
    <router-view style="height: 100%;">
    </router-view>
  </div>

</template>

<script>
export default {
  computed: {
    processEnv () {
      return process.env
    }
  },
  mounted () {
    if (this.processEnv && this.processEnv.NODE_ENV === 'production') {
      console.log('%cHello ZADIG！', 'color: #e20382;font-size: 13px;')
      if (this.processEnv.VERSION) {
        console.log(`%cVersion:${this.processEnv.VERSION}`, 'color: #e20382;font-size: 13px;')
      }
      if (this.processEnv.TAG) {
        console.log(`%cCommit:${this.processEnv.TAG}`, 'color: #e20382;font-size: 13px;')
      }
      if (this.processEnv.COMMIT_ID) {
        console.log(`%cCommit:${this.processEnv.COMMIT_ID}`, 'color: #e20382;font-size: 13px;')
      }
      if (this.processEnv.BUILD_TIME) {
        console.log(`%cBuild:${this.processEnv.BUILD_TIME}`, 'color: #e20382;font-size: 13px;')
      }
    }
  }
}
</script>

<style lang="less">
@import url("~@assets/css/common/color.less");
@import url("~@assets/css/common/icon.less");

a {
  text-decoration: none;
}

body {
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
  font-family:
    "Overpass",
    "Noto Sans SC",
    -apple-system,
    BlinkMacSystemFont,
    "Helvetica Neue",
    Helvetica,
    Segoe UI,
    Arial,
    Roboto,
    "PingFang SC",
    "Hiragino Sans GB",
    "Microsoft Yahei",
    sans-serif;
  background-color: #fff;

  .el-card {
    background: #fff;
  }
}
</style>
