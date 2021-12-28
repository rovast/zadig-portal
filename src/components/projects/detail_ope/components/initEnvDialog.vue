<template>
  <el-dialog :title="`设置 ${currentEnv} 环境变量`" :visible.sync="dialogVisible" width="80%">
    <div>
      <VarList :variables="variables" v-if="deployType === 'k8s'"></VarList>
      <HelmEnvTemplate
        v-else-if="deployType === 'helm'"
        class="chart-value"
        ref="helmEnvTemplateRef"
        :envNames="envNames"
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
import { cloneDeep } from 'lodash'

export default {
  props: {
    visible: Boolean,
    currentEnv: String,
    envNames: Array
  },
  data () {
    return {
      allEnvVariables: {},
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
    }
  },
  watch: {
    currentEnv: async function (nVal, oVal) {
      console.log('???', nVal, oVal)
      this.variables = []
      if (!this.allEnvVariables[nVal]) {
        console.log('如果是k8s，请求vars，如果是helm，组件自己请求数据')
        this.$set(this.allEnvVariables, nVal, {
          initData: [],
          usedData: []
        })
      }
      this.allEnvVariables[nVal].usedData = cloneDeep(
        this.allEnvVariables[nVal].initData
      )
      this.variables = this.allEnvVariables[nVal].usedData
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
