<template>
  <div class="helm-env-variable">
    <div v-show="envVariable.yamlSource === 'default'" class="default-values">
      <div class="secondary-title">暂无环境默认变量 values 文件</div>
      <el-button type="text" @click="envVariable.yamlSource = 'freeEdit'" style="padding: 5px 0;">添加 values 文件</el-button>
    </div>
    <ImportValues
      v-show="envVariable.yamlSource !== 'default'"
      showDelete
      ref="importValuesRef"
      :resize="{direction: 'vertical'}"
      :importRepoInfo="envVariable"
      @closeValueEdit="envVariable.overrideYaml = ''"
      style="margin-top: 0;"
    ></ImportValues>
  </div>
</template>

<script>
import ImportValues from '@/components/projects/common/importValues/index.vue'
import { getEnvDefaultVariableAPI } from '@api'

export default {
  name: 'EnvValues',
  props: {
    envName: {
      type: String,
      required: true
    },
    overrideYaml: {
      type: String,
      required: false
    }
  },
  data () {
    return {
      envVariable: {}
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  methods: {
    switchTabs () {
      return this.$refs.importValuesRef.validate()
    },
    initEnvVariableInfo (envName = '') {
      this.envVariable = {
        yamlSource: this.overrideYaml ? 'freeEdit' : 'default', // : String
        overrideYaml: this.overrideYaml || '', // : String
        envName
      }
    },
    validate () {
      const valid = []
      if (this.$refs.importValuesRef) {
        valid.push(this.$refs.importValuesRef.validate())
      }
      return Promise.all(valid)
    },
    async getEnvVariablesYaml ({ envName }) {
      const res = await getEnvDefaultVariableAPI(
        this.projectName,
        envName
      ).catch(err => {
        console.log(err)
        this.initEnvVariableInfo(envName)
      })
      if (res) {
        this.envVariable = {
          yamlSource: res.defaultValues ? 'freeEdit' : 'default',
          overrideYaml: res.defaultValues
        }
      }
    }
  },
  watch: {
    envName: {
      handler (newV, oldV) {
        if (newV === '' || this.overrideYaml) {
          this.initEnvVariableInfo()
        } else {
          this.getEnvVariablesYaml({ envName: newV })
        }
      },
      immediate: true
    },
    'envVariable.overrideYaml' (newV) {
      this.$emit('envYaml', {
        envName: this.envName,
        defaultValues: newV
      })
    }
  },
  components: {
    ImportValues
  }
}
</script>

<style lang="less" scoped>
.helm-env-variable {
  width: 100%;

  .default-values {
    .secondary-title {
      margin-bottom: 8px;
    }
  }
}
</style>
