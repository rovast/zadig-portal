<template>
  <div class="version-push">
    <el-form ref="form" :model="versionRepo" label-width="160px">
      <el-form-item label="选择 Chart 仓库" prop="chart">
        <el-select v-model="versionRepo.chart" placeholder="请选择 Chart 仓库" size="small">
          <el-option label="label" value="value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-for="chart in  chartVersions" :key="chart.name" :label="`${chart.name} Chart 版本号`">
        <el-input v-model="chart.version" placeholder="请输入 Chart 版本号" size="small"></el-input>
      </el-form-item>
      <div>
        <el-button type="text" @click="showEnhanced = !showEnhanced">
          高级功能
          <i :class="{'el-icon-arrow-right': !showEnhanced, 'el-icon-arrow-down': showEnhanced}"></i>
        </el-button>
      </div>
      <div v-show="showEnhanced">
        <el-form-item label="离线包分发">
          <el-switch v-model="versionRepo.outlineFlag"></el-switch>
        </el-form-item>
        <el-form-item label="镜像包名称">
          <el-input v-model="versionRepo.imageName" placeholder="请输入镜像包名称" size="small">
             <template slot="append">{{versionTar}}</template>
          </el-input>
        </el-form-item>
        <el-form-item label="离线包名称">
          <el-input v-model="versionRepo.outlineName" placeholder="请输入离线包名称" size="small">
             <template slot="append">{{versionTar}}</template>
          </el-input>
        </el-form-item>
        <el-form-item label="对象存储">
          <el-select v-model="versionRepo.objectStore" placeholder="请选择对象存储" size="small">
            <el-option label="label" value="value"></el-option>
          </el-select>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      showEnhanced: false,
      versionRepo: {
        chart: '',
        outlineFlag: false,
        imageName: '',
        outlineName: '',
        objectStore: ''
      },
      chartVersions: [
        {
          name: 'Zadig',
          version: ''
        },
        {
          name: 'plutus',
          version: ''
        }
      ],
      versionTar: '-v1.3.0.tar.gz'
    }
  }
}
</script>

<style lang="less" scoped>
.version-push {
  /deep/.el-input,
  .el-textarea,
  .el-select {
    width: calc(~'100% - 50px');
  }

  /deep/.el-select > .el-input {
    width: 100%;
  }
}
</style>
