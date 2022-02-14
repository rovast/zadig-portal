<template>
  <div class="projects-container">
    <SubTopbar :comp="comp" :projectName="projectName" />
    <router-view @injectComp="injectComp" ></router-view>
  </div>
</template>
<script>
import SubTopbar from '../../entry/home/subTopbar.vue'
export default {
  data () {
    return {
      comp: null
    }
  },
  components: {
    SubTopbar
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  methods: {
    injectComp (comp) {
      this.comp = comp
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
