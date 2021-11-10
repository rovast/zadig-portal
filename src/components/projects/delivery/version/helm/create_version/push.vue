<template>
  <div class="version-push">
    <el-form ref="pushRef" :rules="rules" :model="versionRepo" label-width="160px">
      <el-form-item label="选择 Chart 仓库" prop="chart">
        <el-select v-model="versionRepo.chart" placeholder="请选择 Chart 仓库" size="small">
          <el-option label="label" value="value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="填写 Chart 版本号"></el-form-item>
      <el-form-item v-for="chart in  chartVersions" :key="chart.name" :label="chart.name">
        <el-input v-model="chart.version" placeholder="请输入 Chart 版本号" size="small"></el-input>
        <span class="last-version">上个版本：{{chart.lastVersion}}</span>
      </el-form-item>
      <div>
        <el-button type="text" @click="showEnhanced = !showEnhanced">
          高级功能
          <i :class="{'el-icon-arrow-right': !showEnhanced, 'el-icon-arrow-down': showEnhanced}"></i>
        </el-button>
      </div>
      <div v-if="showEnhanced">
        <el-form-item label="离线包分发">
          <el-switch v-model="versionRepo.outlineFlag"></el-switch>
        </el-form-item>
        <el-form-item label="对象存储" prop="objectStore">
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
    this.rules = {
      chart: {
        required: true,
        message: '请选择 Chart 仓库',
        trigger: ['change', 'blur']
      },
      objectStore: {
        required: true,
        message: '请选择对象存储',
        trigger: ['change', 'blur']
      }
    }
    return {
      showEnhanced: false,
      versionRepo: {
        chart: '',
        versions: [],
        outlineFlag: false,
        objectStore: ''
      },
      chartVersions: [
        {
          name: 'Zadig',
          version: '',
          lastVersion: '1.3.0'
        },
        {
          name: 'plutus',
          version: '',
          lastVersion: '1.3.0'
        }
      ],
      versionTar: '-v1.3.0.tar.gz'
    }
  },
  methods: {
    validate () {
      return this.$refs.pushRef.validate()
    }
  }
}
</script>

<style lang="less" scoped>
.version-push {
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
}
</style>
