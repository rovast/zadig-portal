<template>
  <function-detail :basePath="`projects`"></function-detail>
</template>

<script>
import FunctionDetail from '@/components/projects/test/common/function/function_detail.vue'
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
  components: {
    FunctionDetail
  }
}
</script>
