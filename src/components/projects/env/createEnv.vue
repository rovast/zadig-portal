<template>
    <component :is="currentComponents" />
</template>
<script>
import CreateHostEnv from './hostEnv/createHostEnv.vue'
import CreateEnvDetail from './inner_env/createEnvDetail.vue'
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
          this.currentComponents = CreateHostEnv
        } else if (feature.deploy_type === 'helm') {
          this.currentComponents = CreateHelmEnv
        } else {
          this.currentComponents = CreateEnvDetail
        }// Compatible with old project
      } else {
        this.currentComponents = CreateEnvDetail
      }
    }
  },
  created () {
    this.checkProjectFeature()
  }
}
</script>
