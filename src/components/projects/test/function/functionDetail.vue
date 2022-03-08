<template>
  <FunctionDetail :basePath="`projects`"/>
</template>

<script>
import FunctionDetail from '@/components/projects/test/common/function/functionDetail.vue'
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
