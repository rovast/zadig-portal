<template>
  <FunctionTest :basePath="`tests`" ref="functionTest" />
</template>

<script>
import FunctionTest from '@/components/projects/test/common/function/function.vue'
import bus from '@utils/eventBus'
export default {
  components: {
    FunctionTest
  },
  data () {
    return {}
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  watch: {
    $route (to, from) {
      if (this.projectName !== '') {
        this.$refs.functionTest.fetchTestList()
        bus.$emit(`set-topbar-title`, {
          title: '',
          breadcrumb: [
            { title: '测试管理', url: '/v1/tests' },
            {
              title: this.projectName,
              url: `/v1/tests/detail/${this.projectName}/test`
            },
            { title: '功能测试', url: '' }
          ]
        })
      }
    }
  },
  created () {
    bus.$emit(`set-topbar-title`, {
      title: '',
      breadcrumb: [
        { title: '测试管理', url: '/v1/tests' },
        {
          title: this.projectName,
          url: `/v1/tests/detail/${this.projectName}/test`
        },
        { title: '功能测试', url: '' }
      ]
    })
  }
}
</script>
