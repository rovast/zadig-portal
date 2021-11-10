<template>
  <div class="version-config">
    <el-form ref="configRef" :rules="rules" :model="releaseInfo" label-width="100px" inline>
      <el-form-item label="集成环境" prop="envName">
        <el-select v-model="releaseInfo.envName" placeholder="请选择集成环境" size="small" @change="getServicesNameByEnv" clearable>
          <el-option :label="name" :value="name" v-for="name in envNames" :key="name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="服务" prop="chartDatas">
        <el-select v-model="releaseInfo.chartDatas" placeholder="请选择服务" multiple size="small" clearable>
          <el-option :label="name" :value="name" v-for="name in serviceNames" :key="name"></el-option>
        </el-select>
        <el-button type="text" size="small" @click="releaseInfo.chartDatas = serviceNames">全选</el-button>
      </el-form-item>
    </el-form>
    <div class="config">
      <FileTree class="left" :fileData="releaseInfo.chartDatas"></FileTree>
      <Codemirror class="right" v-model="yaml"></Codemirror>
    </div>
  </div>
</template>

<script>
import Codemirror from '@/components/projects/common/codemirror.vue'
import FileTree from './file_tree.vue'

import { listProductAPI, getHelmReleaseListAPI } from '@api'

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
      yaml: '',
      envNames: [],
      serviceNames: []
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  methods: {
    validate () {
      return this.$refs.configRef.validate()
    },
    getEnvNames () {
      listProductAPI(this.projectName).then(res => {
        this.envNames = res.map(re => re.env_name)
      })
    },
    getServicesNameByEnv (envName) {
      this.serviceNames = [1, 2, 3, 4]
      if (envName) {
        getHelmReleaseListAPI(this.projectName, envName).then(res => {
          this.serviceNames = res.map(re => re.serviceName)
        })
      }
    }
  },
  created () {
    this.getEnvNames()
  },
  components: {
    Codemirror,
    FileTree
  }
}
</script>

<style lang="less" scoped>
.version-config {
  height: calc(~'100% - 200px');

  .config {
    display: flex;
    box-sizing: border-box;
    height: calc(~'100% - 60px');
    background-color: #f5f7f7;
    border: 3px solid transparent;

    .left {
      width: 200px;
      height: 100%;
      max-height: 100%;
      overflow: auto;
    }

    .right {
      flex: 1 1 auto;
      height: 100%;
      margin-left: 3px;
      overflow: hidden;
    }
  }
}
</style>
