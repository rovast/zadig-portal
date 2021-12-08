<template>
  <div class="basic-dialog">
    <section v-if="param">
      <el-form ref="form" v-if="param.type === 'choice'" :model="paramData" label-width="90px">
        <el-form-item label="变量名称">
          <el-input v-model="param.key" disabled size="small"></el-input>
        </el-form-item>
        <el-form-item label="可选值">
          <el-input type="textarea" v-model="paramData.choice_option" placeholder="可选值之间用英文 “,” 隔开" size="small" rows="4"></el-input>
        </el-form-item>
      </el-form>

      <el-form ref="form" v-else-if="param.type === 'external'" :model="paramData.external_setting" label-width="90px">
        <el-form-item label="API 地址">
          <el-row :gutter="10">
            <el-col :span="8">
              <el-select v-model="paramData.external_setting.system_id" placeholder="请选择外部系统" size="small">
                <el-option v-for="external in externalList" :key="external.id" :label="external.server" :value="external.id"></el-option>
              </el-select>
            </el-col>
            <el-col :span="8">
              <el-input v-model="paramData.external_setting.endpoint" size="small" placeholder="输入访问路径"></el-input>
            </el-col>
            <el-col :span="6">
              <el-input v-model="paramData.external_setting.method" size="small" placeholder="输入访问方法"></el-input>
            </el-col>
          </el-row>
          <div>
            <el-radio-group v-model="check" size="mini">
              <el-radio-button label="header">Headers</el-radio-button>
              <el-radio-button label="body">Body</el-radio-button>
            </el-radio-group>
            <el-button v-show="check === 'header'" type="text" @click="addHeader">添加</el-button>
          </div>
          <el-table v-show="check === 'header'" :data="paramData.external_setting.headers" style="width: 100%;">
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
          <el-input v-show="check === 'body'" type="textarea" v-model="paramData.external_setting.body" placeholder="请输入请求体" rows="4"></el-input>
        </el-form-item>
        <el-form-item label="变量名称">
          <div v-for="(param, index) in paramData.external_setting.params" :key="index" class="show-variable">
            <el-input class="item" v-model="param.param_key" placeholder="变量名" size="small"></el-input>
            <span class="item small">-&gt;</span>
            <el-input class="item" v-model="param.response_key" placeholder="接口返回字段" size="small"></el-input>
            <span class="item operation">
              <el-radio v-model="display" :label="param.param_key">显示</el-radio>
              <el-button
                v-if="paramData.external_setting.params.length > 1 "
                style="font-size: 20px;"
                type="text"
                icon="el-icon-remove-outline"
                @click="deleteParam(index)"
              ></el-button>
              <el-button
                v-if="paramData.external_setting.params.length -1 === index"
                style="font-size: 20px;"
                type="text"
                icon="el-icon-circle-plus-outline"
                @click="addParam"
              ></el-button>
            </span>
          </div>
        </el-form-item>
      </el-form>
    </section>
  </div>
</template>

<script>
import { getExternalsAPI } from '@api'
import { cloneDeep } from 'lodash'

const paramInfo = {
  key: '',
  type: '',
  default_value: '',
  choice_option: '',
  external_setting: {
    system_id: '',
    // Endpoint路径
    endpoint: '',
    // 请求方法
    method: 'GET',
    // 请求头
    headers: [
      {
        key: '',
        value: ''
      }
    ],
    // 请求体
    body: '',
    // 变量设置
    params: [
      {
        param_key: '',
        response_key: '',
        display: false
      }
    ]
  }
}
export default {
  props: {
    param: Object,
    value: Boolean
  },
  data () {
    return {
      paramData: cloneDeep(paramInfo),
      check: 'header', // body
      externalList: [],
      display: ''
    }
  },
  watch: {
    value: {
      handler (newV) {
        if (newV) {
          const choice_option = Array.isArray(this.param.choice_option)
            ? this.param.choice_option.join(',')
            : ''
          this.paramData = {
            ...cloneDeep(paramInfo),
            ...cloneDeep(this.param),
            ...{ choice_option }
          }
          if (this.paramData.external_setting.params) {
            const res = this.paramData.external_setting.params.filter(
              param => param.display
            )
            if (res.length) {
              this.display = res[0].param_key
            } else {
              this.display = ''
            }
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    deleteHeader (index) {
      this.paramData.external_setting.headers.splice(index, 1)
    },
    addHeader () {
      this.paramData.external_setting.headers.push({ key: '', value: '' })
    },
    getParamData () {
      if (
        this.paramData.external_setting &&
        this.paramData.external_setting.params
      ) {
        let hasUsed = false
        this.paramData.external_setting.params.forEach(param => {
          if (param.param_key === this.display) {
            param.display = true
            hasUsed = true
          } else {
            param.display = false
          }
        })
        if (!hasUsed) {
          this.paramData.external_setting.params[0].display = true
        }

        this.paramData.external_setting.headers = this.paramData.external_setting.headers.filter(
          header => header.key
        )
      }
      return cloneDeep(this.paramData)
    },
    deleteParam (index) {
      this.paramData.external_setting.params.splice(index, 1)
    },
    addParam () {
      this.paramData.external_setting.params.push({
        param_key: '',
        response_key: '',
        display: false
      })
    }
  },
  created () {
    getExternalsAPI().then(res => {
      this.externalList = res.external_system
    })
  }
}
</script>

<style lang="less" scoped>
.basic-dialog {
  /deep/.el-input {
    width: 100%;
  }

  /deep/.el-button--text {
    padding: 6px 0;
  }

  /deep/.el-radio {
    margin-right: 15px;
  }

  .show-variable {
    display: inline-flex;

    .item {
      flex: 1 1 auto;

      &.small {
        flex: 0 0 auto;
        width: 30px;
        text-align: center;
      }

      &.operation {
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        justify-content: center;
        width: 130px;
        margin-left: 10px;
      }
    }
  }
}
</style>
