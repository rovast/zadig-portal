<template>
  <FunctionSummary :basePath="`tests`"/>
</template>

<script>
import FunctionSummary from '@/components/projects/test/common/function/functionSummary.vue'
import bus from '@utils/eventBus'
export default {
  components: {
    FunctionSummary
  },
  data () {
    return {
    }
  },
  computed: {
    workflowName () {
      return this.$route.params.test_name
    },
    projectName () {
      return this.$route.params.project_name
    }
  },
  created () {
    bus.$emit(`set-topbar-title`, {
      title: '',
      breadcrumb: [
        { title: '测试管理', url: '/v1/tests' },
        { title: this.projectName, url: `/v1/tests/detail/${this.projectName}/test` },
        { title: '功能测试', url: `/v1/tests/detail/${this.projectName}/test/function` },
        { title: this.workflowName, url: '' }]
    })
  }
}
</script>
