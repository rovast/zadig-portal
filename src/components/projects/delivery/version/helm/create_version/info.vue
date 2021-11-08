<template>
  <div class="version-info">
    <el-form ref="infoRef" :rules="rules" :model="versionInfo" label-width="100px">
      <el-form-item label="版本名称" prop="version">
        <el-input v-model="versionInfo.version" placeholder="输入版本名称" size="small"></el-input>
      </el-form-item>
      <el-form-item label="版本描述">
        <el-input type="textarea" v-model="versionInfo.desc" placeholder="输入版本描述" :rows="2" size="small"></el-input>
      </el-form-item>
      <el-form-item label="集成环境" prop="envs">
        <el-select v-model="versionInfo.envs" placeholder="请选择集成环境" size="small">
          <el-option label="label" value="value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="服务" prop="services">
        <el-select v-model="versionInfo.services" placeholder="请选择服务" multiple size="small">
          <el-option label="label" value="value"></el-option>
        </el-select>
        <el-button type="text" size="small">全选</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data () {
    this.rules = {
      version: {
        required: true,
        message: '请填写版本名称',
        trigger: ['change', 'blur']
      },
      envs: {
        required: true,
        message: '请选择环境',
        trigger: ['change', 'blur']
      },
      services: {
        required: true,
        message: '请选择服务',
        trigger: ['change', 'blur']
      }
    }
    return {
      versionInfo: {
        version: '',
        desc: '',
        envs: '',
        services: []
      },
      checkAll: false
    }
  },
  methods: {
    validate () {
      return this.$refs.infoRef.validate()
    }
  }
}
</script>

<style lang="less" scoped>
.version-info {
  /deep/.el-input,
  .el-textarea,
  .el-select {
    width: calc(~'100% - 80px');
  }

  /deep/.el-select > .el-input {
    width: 100%;
  }
}
</style>
