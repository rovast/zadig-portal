<template>
  <div class="version-config">
    <el-form ref="configRef" :rules="rules" :model="releaseInfo" label-width="100px" inline>
      <el-form-item label="集成环境" prop="envName">
        <el-select v-model="releaseInfo.envName" placeholder="请选择集成环境" size="small">
          <el-option :label="name" :value="name" v-for="name in envNames" :key="name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="服务" prop="chartDatas">
        <el-select v-model="releaseInfo.chartDatas" placeholder="请选择服务" multiple size="small">
          <el-option label="label" value="value"></el-option>
        </el-select>
        <el-button type="text" size="small">全选</el-button>
      </el-form-item>
    </el-form>
    <div class="config">
      <div class="left">
        <el-tree ref="treeRef" :data="fileData" :props="defaultProps" @node-click="handleNodeClick" node-key="fullPath" highlight-current>
          <span slot-scope="{data}">
            <i class="icon el-icon-document" v-if="!data.is_dir"></i>
            <i class="icon el-icon-folder" v-else></i>
            {{ data.name }}
          </span>
        </el-tree>
      </div>
      <div class="right">
        <Codemirror class="mirror" v-model="yaml"></Codemirror>
      </div>
    </div>
  </div>
</template>

<script>
import Codemirror from '@/components/projects/common/codemirror.vue'

import {
  listProductAPI,
  getHelmReleaseListAPI,
  getChartInfoAPI,
  createHelmVersionAPI,
  getHelmChartServiceFilePath,
  getHelmChartServiceFileContent
} from '@api'

export default {
  props: {
    releaseInfo: Object
  },
  data () {
    this.defaultProps = { children: 'children', label: 'label' }

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
      fileData: [],
      yaml: '',

      checkAll: false,

      envNames: []
    }
  },
  methods: {
    handleNodeClick (data) {
      console.log(data)
    },
    validate () {
      return this.$refs.configRef.validate()
    },
    getEnvNames () {
      listProductAPI(this.releaseInfo.productName).then(res => {
        this.envNames = res.map(re => re.env_name)
      })
    },
    getServicesNameByEnv () {
      getHelmReleaseListAPI()
    }
  },
  created () {
    this.getEnvNames()
  },
  components: {
    Codemirror
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

      /deep/.el-tree {
        height: 100%;
      }
    }

    .right {
      flex: 1 1 auto;
      height: 100%;
      padding: 0 5px 0 10px;
      overflow: hidden;
    }
  }
}
</style>
