<template>
  <el-dialog :title="`设置 ${currentEnv} 环境变量`" :visible.sync="dialogVisible" width="80%">
    <div>
      <VarList :variables="variables" v-if="deployType === 'k8s'"></VarList>
      <HelmEnvTemplate
        v-else-if="deployType === 'helm'"
        class="chart-value"
        ref="helmEnvTemplateRef"
        :envNames="envInfos.envNames"
        :baseEnvObj="envInfos.baseEnvObj"
        :handledEnv="currentEnv"
        :envScene="`updateRenderSet`"
      ></HelmEnvTemplate>
    </div>
    <div slot="footer">
      <el-button size="small" type="primary" @click="dialogVisible = false">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import VarList from '@/components/projects/env/k8sPmEnv/varList.vue'
import HelmEnvTemplate from '@/components/projects/env/env_detail/components/updateHelmEnvTemp.vue'

export default {
  props: {
    visible: Boolean,
    currentEnv: String,
    envObj: Array
  },
  data () {
    return {
      variables: []
    }
  },
  computed: {
    dialogVisible: {
      get () {
        return this.visible
      },
      set (val) {
        console.log('为false时，需要做些数据处理')
        this.$emit('update:visible', val)
      }
    },
    deployType () {
      const projectName = this.$route.params.project_name
      const project = this.$store.getters.projectList.find(
        project => project.name === projectName
      )
      return project ? project.deployType : ''
    },
    envInfos () {
      const envNames = []
      const envObj = {}
      this.envObj.forEach(env => {
        // new environment can initialize environment variable
        if (env.collaboration_type === 'new') {
          envNames.push(env.name, env.base_name)
          envObj[env.name] = env.base_name
        }
      })
      return {
        envNames: [...new Set(envNames)],
        baseEnvObj: envObj
      }
    }
  },
  watch: {
    currentEnv: async function (nVal, oVal) {
      console.log('如果是k8s，使用 vars，如果是helm，组件自己请求数据')
      if (deployType === 'k8s') {
        this.variables = this.envObj.find(obj => obj.name === nVal).vars
      }
    }
  },
  methods: {
    getEnvInfo () {
      if (!this.$refs.helmEnvTemplateRef) {
        console.log('env info has not')
        return
      }
      const { envInfo, chartInfo } = this.$refs.helmEnvTemplateRef.getAllInfo()
      console.log('env info', envInfo, chartInfo)
    }
  },
  components: {
    VarList,
    HelmEnvTemplate
  }
}
</script>

<style lang="less" scoped>
/deep/.el-dialog {
  .el-dialog__header {
    text-align: center;
  }

  .el-dialog__body {
    padding: 12px 20px;
  }
}

.chart-value {
  width: 100%;
  min-width: 450px;
  margin-left: 5px;
}
</style>
