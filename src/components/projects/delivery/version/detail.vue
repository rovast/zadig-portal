<template>
  <component :is="isComp"></component>
</template>

<script>
import K8sDetail from './k8s/detail.vue'
import HelmDetail from './helm/detail.vue'
import bus from '@utils/event_bus'
export default {
  data () {
    return {
      comp: null
    }
  },
  computed: {
    isComp () {
      if (this.$route.query.deployType === 'helm') {
        return HelmDetail
      } else {
        return K8sDetail
      }
    }
  },
  created () {
    const projectName = this.$route.params.project_name
    const deployType = this.$route.query.deployType
    const versionTag = this.$route.query.version
    bus.$emit(`set-topbar-title`, {
      title: '',
      breadcrumb: [
        { title: '版本管理', url: `` },
        {
          title: projectName,
          url: `/v1/delivery/version/${projectName}?deployType=${deployType}`
        },
        { title: versionTag, url: `` }
      ]
    })
  }
}
</script>
