<template>
  <div class="helm-env-variable">
    <div v-show="envVariable.yamlSource === 'default'" class="default-values">
      <div class="desc">暂无环境默认变量 values 文件</div>
      <el-button type="text" @click="envVariable.yamlSource = 'freeEdit'" icon="el-icon-plus">添加 values 文件</el-button>
    </div>
    <ImportValues
      v-show="envVariable.yamlSource !== 'default'"
      showDelete
      ref="importValuesRef"
      :resize="{direction: 'vertical'}"
      :importRepoInfo="envVariable"
      @closeValueEdit="envVariable.overrideYaml = ''"
    ></ImportValues>
  </div>
</template>

<script>
import ImportValues from '@/components/projects/common/import_values/index.vue'
import { getEnvDefaultVariableAPI } from '@api'

export default {
  name: 'EnvValues',
  props: {
    envName: {
      type: String,
      required: true
    },
    baseEnvObj: {
      type: Object,
      required: false,
      default: () => null
    },
    defaultEnvsValues: {
      type: Object,
      required: true
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
    },
    overrideYaml () {
      return this.defaultEnvsValues[this.envName || 'DEFAULT']
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
    async getEnvVariablesYaml (envName, baseEnvName = envName) {
      const res = await this.initEnvVariablesYaml(envName, baseEnvName).catch(
        err => {
          console.log(err)
          this.initEnvVariableInfo(envName)
        }
      )
      if (res) {
        this.envVariable = {
          yamlSource: res.defaultValues ? 'freeEdit' : 'default',
          overrideYaml: res.defaultValues
        }
      }
    },
    initEnvVariablesYaml (envName, baseEnvName) {
      return getEnvDefaultVariableAPI(this.projectName, baseEnvName).then(
        res => {
          this.$set(this.defaultEnvsValues, envName, res.defaultValues)
          return res
        }
      )
    }
  },
  watch: {
    envName: {
      handler (newV, oldV) {
        if (newV === '' || this.overrideYaml || this.baseEnvObj) {
          this.initEnvVariableInfo()
        } else {
          this.getEnvVariablesYaml(newV)
        }
      },
      immediate: true
    },
    'envVariable.overrideYaml' (newV) {
      this.$set(this.defaultEnvsValues, this.envName || 'DEFAULT', newV)
    },
    baseEnvObj: {
      handler (newV, oldV) {
        if (newV) {
          Object.keys(newV).forEach(val => {
            const fn =
              val === this.envName
                ? this.getEnvVariablesYaml
                : this.initEnvVariablesYaml
            fn(val, newV[val])
          })
        }
      },
      deep: true,
      immediate: true
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

  .desc {
    margin-top: 10px;
    color: #909399;
    font-size: 14px;
  }
}
</style>
