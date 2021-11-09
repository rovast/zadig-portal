<template>
  <div class="float-link">
    <el-popover class="link-popover" placement="top-start" trigger="hover">
      <div slot="reference" class="icon">
        <el-button type="primary" plain circle icon=" iconfont iconlink1" size="mini"></el-button>
      </div>
      <div class="link-title">快捷链接</div>
      <div class="link-outer" v-for="(link, index) in links" :key="index">
        <el-link :href="link.url" target="_blank">{{link.name}}</el-link>
      </div>
      <div class="link-outer" v-if="links.length === 0">暂无链接</div>
    </el-popover>
  </div>
</template>

<script>
import { getExternalLinksAPI } from '@api'
export default {
  data () {
    return {
      links: []
    }
  },
  methods: {
    getExternalLinks () {
      getExternalLinksAPI().then(res => {
        this.links = res || []
      })
    }
  },
  created () {
    this.getExternalLinks()
  }
}
</script>

<style lang="less" scoped>
.float-link {
  .icon {
    transform: rotate(-45deg);
  }
}

.link-title {
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
}

.link-outer {
  margin-left: 10px;
  font-size: 13px;
}
</style>
