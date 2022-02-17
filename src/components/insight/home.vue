<template>
  <div class="insight-home">
    <div class="header">
      <SubTopbar @changeProject="changeProject" @changeDuration="changeDuration" />
    </div>
    <router-view :selectedProjects="selectedProjects" :selectedDuration="selectedDuration"></router-view>
  </div>
</template>
<script>
import bus from '@utils/eventBus'
import SubTopbar from './common/subTopbar'
export default {
  data () {
    return {
      selectedProjects: [],
      selectedDuration: [
        new Date().getTime() - 3600 * 1000 * 24 * 30,
        new Date().getTime()
      ]
    }
  },
  methods: {
    changeProject (projects) {
      this.selectedProjects = projects
    },
    changeDuration (duration) {
      this.selectedDuration = duration
    }
  },
  mounted () {
    this.$router.push('/v1/insight/build')
    bus.$emit(`show-sidebar`, true)
    bus.$emit(`set-topbar-title`, { title: '效能洞察', breadcrumb: [] })
  },
  components: {
    SubTopbar
  }
}
</script>
<style lang="less">
.insight-home {
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: auto;
  line-height: 1.5;
  background-color: #f6f6f6;

  .header {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
}
</style>
