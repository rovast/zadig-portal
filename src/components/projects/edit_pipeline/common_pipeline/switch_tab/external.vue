<template>
  <div class="common-external">
    <el-form ref="externalForm" :model="externalData" :rules="rules" label-width="100px">
      <el-form-item label="URL">
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item prop="url">
              <el-select v-model="externalData.url" placeholder="选择外部系统" size="small" clearable>
                <el-option v-for="external in externalList" :key="external.id" :label="external.server" :value="external.server"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="path">
              <el-input v-model="externalData.path" placeholder="输入访问路径" size="small"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="是否回调">
        <el-switch v-model="externalData.is_callback"></el-switch>
        <div>请按规定调用接口：{{fullUrl}} 接口</div>
      </el-form-item>
      <el-form-item label="超时">
        <el-input-number v-model="externalData.timeout" :min="1" :max="100" size="small"></el-input-number>分钟
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getExternalsAPI } from '@api'
import { mapState } from 'vuex'
const externalInfo = {
  type: 'trigger',
  url: '',
  path: '',
  is_callback: false,
  timeout: 10
}
export default {
  data () {
    this.rules = {
      url: {
        required: true,
        message: '请选择外部系统',
        trigger: ['blur', 'change']
      },
      path: {
        required: true,
        message: '请输入访问路径',
        trigger: ['blur', 'change']
      }
    }
    return {
      externalData: { ...externalInfo },
      externalList: [
        {
          id: 'xx',
          server: 'xx'
        },
        {
          id: 'yy',
          server: 'yy'
        }
      ]
    }
  },
  computed: {
    fullUrl () {
      let str = '-'
      if (this.externalData.url) {
        str = this.externalData.url
        if (this.externalData.path) {
          str += '/' + this.externalData.path
        }
      }
      return str
    },
    ...mapState({
      commonInfo: state => state.common_pipeline.commonInfo
    })
  },
  props: {
    validObj: Object
  },
  methods: {
    validate () {
      return this.$refs.externalForm.validate()
    },
    updateCommonInfo () {
      this.$store.commit('UPDATE_COMMON_INFO', { trigger: this.externalData })
    }
  },
  created () {
    getExternalsAPI().then(res => {
      this.externalList = res.external_system
    })
  },
  activated () {
    this.validObj.addValidate({
      name: '扩展',
      valid: this.validate
    })
    this.externalData = { ...externalInfo, ...this.commonInfo.trigger }
  },

  deactivated () {
    this.updateCommonInfo()
    console.log('deactivated')
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
