<template>
  <div class="common-external">
    <el-form ref="form" :model="externalData" label-width="100px">
      <el-form-item label="URL">
        <el-row :gutter="10">
          <el-col :span="8">
            <el-select v-model="externalData.external" placeholder="placeholder" size="small">
              <el-option label="label" value="value"></el-option>
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-input v-model="externalData.path" placeholder size="small"></el-input>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="是否回调">
        <el-switch v-model="externalData.callback"></el-switch>
        <div>请按规定调用接口：xxx 接口</div>
      </el-form-item>
      <el-form-item label="超时">
        <el-input-number v-model="externalData.overtime" :min="1" :max="100" size="small"></el-input-number>分钟
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      externalData: {
        external: '',
        path: '',
        callback: false,
        overtime: 10
      }
    }
  }
}
</script>

<style lang="less" scoped>
.common-external {
  /deep/.el-input,
  .el-select {
    width: 100%;
  }
}
</style>
