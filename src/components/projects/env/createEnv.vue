<template>
    <component :is="currentComponents" />
</template>
<script>
import CreatHostEnv from './hostEnv/creatHostEnv.vue'
import CreatEnvDetail from './inner_env/create_env_detail.vue'
import CreateHelmEnv from './createHelmEnv.vue'
import { getSingleProjectAPI } from '@/api'

export default {
  name: 'createEnv',
  data () {
    return {
      currentComponents: null
    }
  },
  methods: {
    async checkProjectFeature () {
      const projectName = this.$route.params.project_name
      this.projectInfo = await getSingleProjectAPI(projectName)
      const feature = this.projectInfo.product_feature
      if (feature) {
        if (feature.create_env_type === 'external') {
          this.currentComponents = CreatHostEnv
        } else if (feature.deploy_type === 'helm') {
          this.currentComponents = CreateHelmEnv
        } else {
          this.currentComponents = CreatEnvDetail
        }// Compatible with old project
      } else {
        this.currentComponents = CreatEnvDetail
      }
    }
  },
  created () {
    this.checkProjectFeature()
  }
}
</script>
