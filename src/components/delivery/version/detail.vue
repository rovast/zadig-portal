<template>
  <component :is="isComp"></component>
</template>

<script>
import K8sDetail from './k8s/detail.vue'
import HelmDetail from './helm/detail.vue'
import bus from '@utils/eventBus'
export default {
  data () {
    return {
      comp: null
    }
  },
  computed: {
    isComp () {
      if (this.$route.query.type === 'HelmChart') {
        return HelmDetail
      } else {
        return K8sDetail
      }
    },
    projectName () {
      return this.$route.params.project_name
    },
    inProject () {
      return this.$route.path.indexOf('/v1/projects/detail') > -1
    }
  },
  created () {
    const version = this.$route.query.version
    if (this.inProject) {
      bus.$emit(`set-topbar-title`, {
        title: '',
        breadcrumb: [
          { title: '项目', url: `/v1/projects` },
          {
            title: this.projectName,
            isProjectName: true,
            url: `/v1/projects/detail/${this.projectName}/detail`
          },
          { title: '版本管理', url: `/v1/projects/detail/${this.projectName}/version` },
          { title: version, url: `` }
        ]
      })
    } else {
      bus.$emit(`set-topbar-title`, {
        title: '',
        breadcrumb: [
          { title: '交付中心', url: `/v1/delivery/artifacts` },
          { title: '版本管理', url: `/v1/delivery/version` },
          { title: version, url: `` }
        ]
      })
    }
  }
}
</script>
