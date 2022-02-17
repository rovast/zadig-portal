<template>
  <FunctionTest/>
</template>

<script>
import FunctionTest from '@/components/projects/test/common/function/function.vue'
import bus from '@utils/eventBus'
export default {
  data () {
    return {
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  created () {
    bus.$emit(`set-topbar-title`, { title: '', breadcrumb: [{ title: '项目', url: '/v1/projects' }, { title: this.projectName, url: `/v1/projects/detail/${this.projectName}/detail` }, { title: '功能测试', url: '' }] })
  },
  components: {
    FunctionTest
  }
}
</script>
