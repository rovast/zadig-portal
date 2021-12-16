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
        <div>
          <el-tag size="small">Headers</el-tag>
          <el-button type="text" @click="addHeader" class="add-header">添加</el-button>
        </div>
        <el-table :data="externalData.headers" style="width: 100%;">
          <el-table-column label="Header Name">
            <template slot-scope="{row}">
              <el-input v-model="row.key" placeholder="Header Name" size="small"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="Header Value">
            <template slot-scope="{row}">
              <el-input v-model="row.value" placeholder="Header Value" size="small"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="操作" width="100px">
            <template slot-scope="{$index}">
              <el-button style="font-size: 20px;" type="text" icon="el-icon-remove-outline" @click="deleteHeader($index)"></el-button>
              <el-button style="font-size: 20px;" type="text" icon="el-icon-circle-plus-outline" @click="addHeader"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="是否回调">
        <el-switch v-model="externalData.is_callback"></el-switch>
        <div v-show="externalData.is_callback">请按规定调用接口：{{`${origin}/api/callback`}} 接口</div>
      </el-form-item>
      <el-form-item label="超时">
        <el-input-number v-model="externalData.timeout" :min="1" :max="100" size="small"></el-input-number>分钟
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getExternalSystemsAPI } from '@api'
import { mapState } from 'vuex'
import { cloneDeep } from 'lodash'
const externalInfo = {
  enabled: true,
  type: 'trigger',
  url: '',
  path: '',
  headers: [], // key,value
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
      externalData: cloneDeep(externalInfo),
      externalList: [
        {
          id: 'xx',
          server: 'xx'
        },
        {
          id: 'yy',
          server: 'yy'
        }
      ],
      origin: location.origin
    }
  },
  computed: {
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
      this.externalData.headers = this.externalData.headers.filter(
        header => header.key
      )
      this.$store.commit('UPDATE_COMMON_INFO', { trigger: cloneDeep(this.externalData) })
    },
    addHeader () {
      this.externalData.headers.push({ key: '', value: '' })
    },
    deleteHeader (index) {
      this.externalData.headers.splice(index, 1)
    }
  },
  created () {
    getExternalSystemsAPI().then(res => {
      this.externalList = res.external_system
    })
  },
  activated () {
    this.validObj.addValidate({
      name: '扩展',
      valid: this.validate
    })
    this.externalData = {
      ...cloneDeep(externalInfo),
      ...cloneDeep(this.commonInfo.trigger)
    }
  },

  deactivated () {
    this.updateCommonInfo()
  }
}
</script>

<style lang="less" scoped>
.common-external {
  /deep/.el-input,
  .el-select {
    width: 100%;
  }

  /deep/.el-table {
    .el-table__cell {
      padding: 0;
    }

    .el-table__empty-block {
      min-height: 48px;

      .el-table__empty-text {
        line-height: 48px;
      }
    }
  }

  .add-header {
    margin-left: 5px;
    font-size: 13px;
  }
}
</style>
