<template>
  <div class="version-config">
    <el-form ref="configRef" :rules="rules" :model="releaseInfo" label-width="100px" inline>
      <el-form-item label="集成环境" prop="envName">
        <el-select v-model="releaseInfo.envName" placeholder="请选择集成环境" size="small" @change="getServicesNameByEnv" clearable>
          <el-option :label="name" :value="name" v-for="name in envNames" :key="name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="服务">
        <el-select
          v-model="newAddSelectedServicesName"
          placeholder="请选择服务"
          multiple
          size="small"
          clearable
          filterable
          collapse-tags
          value-key="serviceName"
        >
          <el-option :label="service" :value="service" v-for="service in lastServiceNames" :key="service"></el-option>
        </el-select>
        <el-button type="text" size="small" @click="newAddSelectedServicesName = lastServiceNames">全选</el-button>
        <el-button type="primary" size="mini" plain @click="addServiceNames">添加</el-button>
      </el-form-item>
    </el-form>

    <Multipane class="config">
      <FileTree
        :style="{width: '200px', minWidth: '100px', maxWidth: '400px'}"
        class="left"
        ref="fileTreeRef"
        :envName="this.releaseInfo.envName"
        :fileData="releaseInfo.chartDatas"
        @clickFile="getFile"
        @deleteService="deleteService"
      ></FileTree>
      <MultipaneResizer></MultipaneResizer>
      <div :style="{ minWidth: '200px', width: '50%'}" class="middle">
        <Codemirror v-model="yamlStorage[selectedPath]" :cmOption="cmOption"></Codemirror>
      </div>
      <MultipaneResizer></MultipaneResizer>
      <div :style="{flexGrow: 1, width: '200px', minWidth: '100px'}" class="right">
        <div class="title">全局变量</div>
        <Codemirror v-model="globalYaml" class="mirror"></Codemirror>
        <div class="bottom">
          <el-button type="primary" size="mini" plain @click="applyGlobalVars" :loading="useLoading">应用</el-button>
          <el-button type="primary" size="mini" plain @click="resetAllVars" :disabled="useLoading">重置</el-button>
        </div>
      </div>
    </Multipane>
  </div>
</template>

<script>
import { Multipane, MultipaneResizer } from 'vue-multipane'
import Codemirror from '@/components/projects/common/codemirror.vue'
import FileTree from './file_tree.vue'

import {
  listProductAPI,
  getHelmReleaseListAPI,
  getHelmChartServiceFileContent,
  useGlobalVariablesAPI
} from '@api'

export default {
  props: {
    releaseInfo: Object
  },
  data () {
    this.rules = {
      envName: {
        required: true,
        message: '请选择环境',
        trigger: ['change', 'blur']
      }
    }
    return {
      yamlStorage: {},
      envNames: [],
      serviceNames: [],
      selectedPath: '',
      newAddSelectedServicesName: [],
      useLoading: false,
      globalYaml: ''
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    },
    cmOption () {
      return {
        readOnly: this.useLoading || !this.validateValuesYaml(this.selectedPath)
      }
    },
    lastServiceNames () {
      const selected = this.releaseInfo.chartDatas.map(
        chart => chart.serviceName
      )
      return this.serviceNames.filter(name => !selected.includes(name))
    }
  },
  methods: {
    validateValuesYaml (path) {
      return /^([^\/]*)\/values.yaml$/.exec(path)
    },
    applyGlobalVars () {
      const chartDatas = []
      this.releaseInfo.globalVariables = this.globalYaml
      this.releaseInfo.chartDatas.forEach(chart => {
        const yaml = this.yamlStorage[`${chart.serviceName}/values.yaml`]
        if (yaml) {
          chartDatas.push({
            serviceName: chart.serviceName,
            valuesYamlContent: yaml
          })
        }
      })
      this.useGlobalVariables(chartDatas)
    },
    async useGlobalVariables (chartDatas) {
      const payload = {
        globalVariables: this.releaseInfo.globalVariables,
        chartDatas
      }

      this.useLoading = true
      const res = await useGlobalVariablesAPI(payload).catch(err => {
        console.log(err)
      })
      this.useLoading = false
      if (res) {
        res.chartDatas.forEach(chart => {
          this.$set(
            this.yamlStorage,
            `${chart.serviceName}/values.yaml`,
            chart.valuesYamlContent
          )
        })
      }
    },
    resetAllVars () {
      this.globalYaml = ''
      this.releaseInfo.globalVariables = ''
      this.yamlStorage = {}
      this.selectedPath = ''
    },
    addServiceNames () {
      const add = this.newAddSelectedServicesName.map(name => {
        return {
          serviceName: name
        }
      })
      this.releaseInfo.chartDatas = this.releaseInfo.chartDatas.concat(add)
      this.newAddSelectedServicesName = []
    },
    validate () {
      const info = this.releaseInfo
      if (info.envName && info.chartDatas.length) {
        const revision = this.$refs.fileTreeRef.getRevision()
        this.releaseInfo.chartDatas = this.releaseInfo.chartDatas.map(chart => {
          return {
            serviceName: chart.serviceName,
            version: chart.version || info.version,
            valuesYamlContent:
              this.yamlStorage[`${chart.serviceName}/values.yaml`] || '',
            lastVersion: revision[chart.serviceName]
          }
        })
        return this.$refs.configRef.validate()
      } else {
        this.$message.error('请先选择服务')
        return Promise.reject('false')
      }
    },
    getEnvNames () {
      listProductAPI(this.projectName).then(res => {
        this.envNames = res.map(re => re.name)
      })
    },
    getServicesNameByEnv (envName) {
      if (envName) {
        getHelmReleaseListAPI(this.projectName, envName).then(res => {
          this.serviceNames = res.map(re => {
            return re.serviceName
          })
        })
      }
      this.releaseInfo.chartDatas = []
      this.yamlStorage = {}
    },
    async getFile (data) {
      // 两种情况  一种直接请求数据  另一种使用缓存
      if (!this.yamlStorage[data.fullPath]) {
        await getHelmChartServiceFileContent(data).then(res => {
          this.$set(this.yamlStorage, data.fullPath, res)
        })
        const valid = this.validateValuesYaml(data.fullPath)
        if (valid && this.releaseInfo.globalVariables) {
          const chartData = {
            serviceName: valid[1],
            valuesYamlContent: this.yamlStorage[data.fullPath]
          }
          await this.useGlobalVariables([chartData])
        }
      }
      this.selectedPath = data.fullPath
    },
    deleteService (name) {
      const index = this.releaseInfo.chartDatas.findIndex(
        chart => chart.serviceName === name
      )
      // 清理列表里的服务
      if (index > -1) {
        this.releaseInfo.chartDatas.splice(index, 1)
      }
      // 清理缓存的文件
      Object.keys(this.yamlStorage).forEach(storage => {
        if (storage.startsWith(`${name}/`)) {
          this.$delete(this.yamlStorage, storage)
        }
      })
      // 如果当前展示的是被删除的服务 清空选择的文件
      if (this.selectedPath.startsWith(`${name}/`)) {
        this.selectedPath = ''
      }
    }
  },
  created () {
    this.getEnvNames()
  },
  components: {
    Codemirror,
    FileTree,
    Multipane,
    MultipaneResizer
  }
}
</script>

<style lang="less" scoped>
.version-config {
  height: calc(~'100% - 200px');
  color: #606266;

  .config {
    width: 100%;
    height: calc(~'100% - 60px');
    background-color: #f5f7f7;
    border: 3px solid transparent;

    .left,
    .right {
      height: 100%;
      max-height: 100%;
      overflow: auto;
      background-color: #fff;
    }

    .right {
      .title {
        margin: 5px;
        font-weight: 500;
        font-size: 14px;
      }

      .mirror {
        height: 80%;
        margin: 5px;
        overflow: hidden;
        border: 1px solid #eee;
        border-radius: 3px;
      }

      .bottom {
        margin: 10px 5px;
        white-space: nowrap;
        text-align: right;
      }
    }

    .middle {
      height: 100%;
      margin: 0 3px;
      overflow: hidden;
    }
  }
}
</style>
