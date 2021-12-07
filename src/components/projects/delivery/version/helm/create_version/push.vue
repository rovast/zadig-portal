<template>
  <div class="version-push">
    <el-form ref="pushRef" :rules="rules" :model="releaseInfo" label-width="160px">
      <el-form-item label="选择镜像仓库" prop="imageRegistryID">
        <el-select v-model="releaseInfo.imageRegistryID" placeholder="选择镜像仓库" size="small">
          <el-option :label="`${image.reg_addr}/${image.namespace}`" :value="image.id" v-for="image in imageRegistryList" :key="image.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择 Chart 仓库" prop="chartRepoName">
        <el-select v-model="releaseInfo.chartRepoName" placeholder="请选择 Chart 仓库" size="small" @change="updateSelectedChart">
          <el-option :label="repo.repo_name" :value="repo.repo_name" v-for="repo in helmRepoList" :key="repo.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="填写 Chart 版本号"></el-form-item>
      <el-form-item
        v-for="(chart, index) in releaseInfo.chartDatas"
        :key="chart.serviceName"
        :label="chart.serviceName"
        :prop="`chartDatas[${index}].version`"
        :rules="[{
          required: true, message: `请输入 Chart ${chart.serviceName} 版本号`, trigger: ['change', 'blur']
        }]"
      >
        <el-input v-model="chart.version" placeholder="请输入 Chart 版本号" size="small"></el-input>
        <span class="last-version">上个版本：{{chart.lastVersion || '无'}}</span>
      </el-form-item>
      <!-- <div>
        <el-button type="text" @click="showEnhanced = !showEnhanced">
          高级功能
          <i :class="{'el-icon-arrow-right': !showEnhanced, 'el-icon-arrow-down': showEnhanced}"></i>
        </el-button>
      </div>
      <div v-if="showEnhanced">
        <el-form-item label="离线包分发">
          <el-switch v-model="releaseInfo.options.enableOfflineDist"></el-switch>
          <span class="desc">将所选服务的镜像和 Chart 打包并上传对象存储</span>
        </el-form-item>
        <el-form-item label="对象存储" prop="options.s3StorageID">
          <el-select v-model="releaseInfo.options.s3StorageID" placeholder="请选择对象存储" size="small">
            <el-option :label="`${storage.bucket}(${storage.endpoint})`" :value="storage.id" v-for="storage in storageList" :key="storage.id"></el-option>
          </el-select>
        </el-form-item>
      </div>-->
    </el-form>
  </div>
</template>

<script>
import {
  getStorageListAPI,
  getHelmRepoAPI,
  getRegistryListAPI,
  getChartLastVersionAPI
} from '@api'
import { keyBy } from 'lodash'

export default {
  props: {
    releaseInfo: Object
  },
  data () {
    this.rules = {
      imageRegistryID: {
        required: true,
        message: '请选择镜像仓库',
        trigger: ['change', 'blur']
      },
      chartRepoName: {
        required: true,
        message: '请选择 Chart 仓库',
        trigger: ['change', 'blur']
      },
      'options.s3StorageID': {
        required: true,
        message: '请选择对象存储',
        trigger: ['change', 'blur']
      }
    }
    return {
      showEnhanced: false,
      helmRepoList: [],
      storageList: [],
      imageRegistryList: []
    }
  },
  methods: {
    validate () {
      return this.$refs.pushRef.validate()
    },
    getStorageList () {
      getStorageListAPI().then(res => {
        this.storageList = res
      })
    },
    getHelmRepo () {
      getHelmRepoAPI().then(res => {
        this.helmRepoList = res
      })
    },
    getRegistryList () {
      getRegistryListAPI().then(res => {
        this.imageRegistryList = res
      })
    },
    updateSelectedChart () {
      const chartRepoName = this.releaseInfo.chartRepoName
      if (!chartRepoName) {
        return
      }
      const chartName = this.releaseInfo.chartDatas.map(chart => {
        chart.lastVersion = ''
        return chart.serviceName
      })
      getChartLastVersionAPI(chartRepoName, chartName).then(res => {
        const resObj = keyBy(res, 'chartName')
        this.releaseInfo.chartDatas.forEach(chart => {
          chart.lastVersion = resObj[chart.serviceName].chartVersion
        })
      })
    }
  },
  created () {
    this.getHelmRepo()
    this.getStorageList()
    this.getRegistryList()
  },
  activated () {
    this.updateSelectedChart()
  }
}
</script>

<style lang="less" scoped>
@import url('~@assets/css/common/scroll-bar.less');

.version-push {
  box-sizing: border-box;
  height: calc(~'100% - 200px');
  padding-bottom: 20px;
  overflow: auto;
  .scrollBar2();

  .last-version {
    display: inline-block;
    margin-left: 8px;
    color: #606266;
    font-size: 12px;
  }

  /deep/.el-input,
  .el-textarea,
  .el-select {
    width: calc(~'100% - 150px');
  }

  /deep/.el-select > .el-input {
    width: 100%;
  }

  .desc {
    display: inline-block;
    margin-left: 10px;
    color: #606266;
    font-size: 12px;
  }
}
</style>
