<template>
  <div class="projects-container">
    <SubTopbar :projectName="projectName" />
    <router-view></router-view>
  </div>
</template>
<script>
import SubTopbar from '../../entry/home/subTopbar.vue'
export default {
  components: {
    SubTopbar
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  }
}
</script>

<style lang="less" scoped>
@titleColor: #44447e;

.projects-container {
  position: relative;
  height: 100%;
  overflow: auto;
  background-color: #f6f6f6;
}
</style>
