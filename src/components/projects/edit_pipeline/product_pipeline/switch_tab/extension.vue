<template>
  <el-card class="product-extension">
    <el-form ref="extensionForm" :model="extensionStage" :rules="rules" label-width="100px">
      <el-form-item label="URL">
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item prop="url">
              <el-select v-model="extensionStage.url" placeholder="选择外部系统" size="small" clearable>
                <el-option v-for="external in externalList" :key="external.id" :label="external.server" :value="external.server"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="path">
              <el-input v-model="extensionStage.path" placeholder="输入访问路径" size="small"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <div>
          <el-tag size="small">Headers</el-tag>
          <el-button type="text" @click="addHeader" class="add-header">添加</el-button>
        </div>
        <el-table :data="extensionStage.headers" style="width: 100%;">
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
        <el-switch v-model="extensionStage.is_callback"></el-switch>
        <div v-show="extensionStage.is_callback">
          请根据
          <a href="https://docs.koderover.com/" target="_blank" rel="noopener noreferrer" class="help-link">帮助文档</a>
          调用接口：{{`${origin}/api/callback`}} 接口
        </div>
      </el-form-item>
      <el-form-item label="超时时间">
        <el-input-number v-model="extensionStage.timeout" :min="1" :max="100" size="small"></el-input-number>分钟
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import { getExternalSystemsAPI } from '@api'
import bus from '@utils/eventBus'
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
      externalList: [],
      origin: location.origin
    }
  },
  props: {
    extensionStage: Object
  },
  methods: {
    addHeader () {
      this.extensionStage.headers.push({ key: '', value: '' })
    },
    deleteHeader (index) {
      this.extensionStage.headers.splice(index, 1)
    }
  },
  created () {
    getExternalSystemsAPI().then(res => {
      this.externalList = res.external_system
    })
    bus.$on('check-tab:extension', () => {
      this.$refs.extensionForm.validate(valid => {
        bus.$emit('receive-tab-check:extension', valid)
      })
    })
  },
  beforeDestroy () {
    bus.$off('check-tab:extension')
  }
}
</script>

<style lang="less" scoped>
.product-extension {
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

  .help-link {
    color: inherit;
    text-decoration: underline;
  }
}
</style>
