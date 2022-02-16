<template>
  <div class="common-parcel-block update-template-container">
    <div class="template-block">
      <div class="primary-title template-title" @click="showGlobalVariable = !showGlobalVariable">
        全局服务变量
        <i :class="[showGlobalVariable ?  'el-icon-arrow-up' : 'el-icon-arrow-down' ]"></i>
      </div>
      <EnvValues
        v-show="showGlobalVariable"
        ref="envValuesRef"
        :envName="handledEnv"
        @envYaml="saveEnvYaml"
        :overrideYaml="defaultEnvValue && defaultEnvValue.defaultValues"
      ></EnvValues>
    </div>
    <div class="template-block">
      <div class="primary-title not-first-child template-title" @click="showServiceVariable = !showServiceVariable">
        服务变量
        <i :class="[showServiceVariable ?  'el-icon-arrow-up' : 'el-icon-arrow-down' ]"></i>
      </div>
      <ChartValues
        v-show="showServiceVariable"
        ref="chartValuesRef"
        :chartNames="chartNames"
        :envNames="envNames"
        :handledEnv="handledEnv"
        :envScene="envScene"
        :showEnvTabs="showEnvTabs"
        :defaultEnvValue="defaultEnvValue"
      ></ChartValues>
    </div>
  </div>
</template>

<script>
import EnvValues from '../common/updateHelmEnvVariable.vue'
import ChartValues from '../common/updateHelmEnvChart.vue'
export default {
  name: 'HelmEnvTemplate',
  data () {
    return {
      defaultEnvsValues: {}, // { key: envName, value: defaultEnvValue }
      showGlobalVariable: true,
      showServiceVariable: true
    }
  },
  props: {
    chartNames: {
      type: Array, // Object{serviceName}[]
      required: false,
      default: () => null
    },
    envNames: {
      type: Array,
      required: false,
      default: () => []
    },
    handledEnv: {
      // 正在处理的环境名称
      type: String,
      required: false,
      default: ''
    },
    showEnvTabs: {
      /**
       * 是否展示具体服务信息的环境tab
       */
      default: false,
      type: Boolean
    },
    envScene: {
      type: String,
      required: true
    }
  },
  computed: {
    defaultEnvValue () {
      const envName = this.handledEnv || 'DEFAULT'
      return {
        envName,
        defaultValues: this.defaultEnvsValues[envName]
      }
    }
  },
  methods: {
    saveEnvYaml (data) {
      const envName = data.envName || 'DEFAULT'
      this.$set(this.defaultEnvsValues, envName, data.defaultValues)
    },
    validate () {
      const valid = []
      valid.push(this.$refs.envValuesRef.validate())
      valid.push(this.$refs.chartValuesRef.validate())
      return Promise.all(valid)
    },
    collapseChange (activeName) { // will update
      this.validate()
        .catch(() => {
          this.activeName = activeName === 'env' ? 'service' : 'env'
        })
        .then(() => {
          this.$refs.chartValuesRef.closeReview()
        })
    },
    getAllInfo () {
      return {
        envInfo: this.defaultEnvsValues,
        chartInfo: this.$refs.chartValuesRef.getAllChartNameInfo()
      }
    }
  },
  components: {
    EnvValues,
    ChartValues
  },
  created () {
    this.envNames.forEach(env => {
      this.$set(this.defaultEnvsValues, env, '')
    })
  }
}
</script>

<style lang="less" scoped>
@iconColor: #a0a0a0;

.update-template-container {
  .template-block {
    width: 100%;
    max-width: 1000px;

    .template-title {
      cursor: pointer;

      i {
        margin-left: 8px;
        color: @iconColor;
      }
    }
  }
}
</style>
