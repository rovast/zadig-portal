<template>
  <div class="version-config">
    <el-form ref="configRef" :rules="rules" :model="releaseInfo" label-width="100px" inline>
      <el-form-item label="集成环境" prop="envName">
        <el-select v-model="releaseInfo.envName" placeholder="请选择集成环境" size="small" @change="getServicesNameByEnv" clearable>
          <el-option :label="name" :value="name" v-for="name in envNames" :key="name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="服务" prop="chartDatas">
        <el-select
          v-model="releaseInfo.chartDatas"
          placeholder="请选择服务"
          multiple
          size="small"
          clearable
          collapse-tags
          value-key="serviceName"
        >
          <el-option :label="service.serviceName" :value="service" v-for="service in serviceNames" :key="service.serviceName"></el-option>
        </el-select>
        <el-button type="text" size="small" @click="releaseInfo.chartDatas = serviceNames">全选</el-button>
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
      <div :style="{minWidth: '200px', width: '500px'}" class="right">
        <Codemirror v-model="yamlStorage[selectedPath]" :cmOption="cmOption"></Codemirror>
      </div>
      <MultipaneResizer></MultipaneResizer>
      <div :style="{flexGrow: 1, minWidth: '100px'}"></div>
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
  getHelmChartServiceFileContent
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
      },
      chartDatas: {
        required: true,
        message: '请选择服务',
        trigger: ['change', 'blur']
      }
    }
    return {
      yamlStorage: {},
      envNames: [],
      serviceNames: [],
      selectedPath: ''
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    },
    cmOption () {
      const path = this.selectedPath.split('/')
      return { readOnly: !(path.length === 2 && path[1] === 'values.yaml') }
    }
  },
  methods: {
    validate () {
      const info = this.releaseInfo
      if (info.envName && info.chartDatas.length) {
        const revision = this.$refs.fileTreeRef.getRevision()
        this.releaseInfo.chartDatas = this.releaseInfo.chartDatas.map(chart => {
          return {
            serviceName: chart.serviceName,
            version: chart.version || info.version,
            valuesYamlContent: this.yamlStorage[`${chart}/values.yaml`] || '',
            lastVersion: revision[chart]
          }
        })
      }
      return this.$refs.configRef.validate()
    },
    getEnvNames () {
      listProductAPI(this.projectName).then(res => {
        this.envNames = res.map(re => re.env_name)
      })
    },
    getServicesNameByEnv (envName) {
      console.log('update env')
      this.serviceNames = ['1', '2', '3', '4'].map(re => {
        return {
          serviceName: re
        }
      })
      if (envName) {
        getHelmReleaseListAPI(this.projectName, envName).then(res => {
          this.serviceNames = res.map(re => {
            return {
              serviceName: re.serviceName
            }
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
      }
      this.selectedPath = data.fullPath
    },
    deleteService (names) {
      names.forEach(name => {
        const index = this.releaseInfo.chartDatas.findIndex(
          chart => chart.serviceName === name
        )
        if (index > -1) {
          this.releaseInfo.chartDatas.splice(index, 1)
        }

        const storages = []
        Object.keys(this.yamlStorage).forEach(storage => {
          if (storage.startsWith(`${name}/`)) {
            storages.push(storage)
          }
        })
        storages.forEach(sto => {
          this.$delete(this.yamlStorage, sto)
        })
        if (this.selectedPath.startsWith(`${name}/`)) {
          this.selectedPath = ''
        }
      })
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

  .config {
    width: 100%;
    height: calc(~'100% - 60px');
    background-color: #f5f7f7;
    border: 3px solid transparent;

    .left {
      height: 100%;
      max-height: 100%;
      overflow: auto;
    }

    .right {
      height: 100%;
      margin-left: 3px;
      overflow: hidden;
    }
  }
}
</style>
