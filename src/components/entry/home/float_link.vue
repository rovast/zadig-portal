<template>
  <div class="float-link">
    <el-popover placement="top-start" title="快捷链接" trigger="hover">
      <div slot="reference" class="icon">
        <el-button type="primary" plain circle icon=" iconfont iconlink1" size="mini"></el-button>
      </div>
      <div class="link-outer" v-for="(link, index) in links" :key="index">
        <el-link :href="link.link" target="_blank">
          <i :class="[link.icon]"></i>
          {{link.title}}
        </el-link>
      </div>
    </el-popover>
  </div>
</template>

<script>
export default {
  data () {
    return {
      links: [
        {
          icon: 'el-icon-platform-eleme',
          title: '饿了么',
          link: 'https://element.eleme.cn'
        },
        {
          icon: 'el-icon-eleme',
          title: '百度',
          link: 'http://www.baidu.com'
        },
        {
          icon: 'el-icon-delete-solid',
          title: 'koderover',
          link: 'http://koderover.com'
        }
      ]
    }
  }
}
</script>

<style lang="less" scoped>
.float-link {
  .icon {
    transform: rotate(-45deg);
  }
}
</style>
