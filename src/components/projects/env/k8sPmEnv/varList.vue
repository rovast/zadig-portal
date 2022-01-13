<template>
  <div class="variable-list">
    <el-table :data="variables" style="width: 100%;">
      <el-table-column label="Key" prop="key"></el-table-column>
      <el-table-column label="Value">
        <template slot-scope="{ row }">
          <el-input
            size="small"
            v-model="row.value"
            type="textarea"
            :disabled="rollbackMode"
            :autosize="{ minRows: 1, maxRows: 4}"
            placeholder="请输入内容"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column label="关联服务">
        <template slot-scope="{ row }">
          <span>{{ row.services?row.services.join(','):'-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="{ row, $index }">
          <span class="operate">
            <el-button v-if="row.state === 'unused'" type="text" @click="deleteRenderKey($index, row.state)" class="delete">移除</el-button>
            <el-tooltip v-else effect="dark" content="模板中用到的渲染 Key 无法被删除" placement="top">
              <span class="el-icon-question"></span>
            </el-tooltip>
          </span>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="addKeyInputVisable" class="add-key-container">
      <el-table :data="addKeyData" :show-header="false" style="width: 100%;">
        <el-table-column>
          <template slot-scope="{ row }">
            <el-form :model="row" :rules="keyCheckRule" ref="addKeyForm" hide-required-asterisk>
              <el-form-item label="Key" prop="key" inline-message>
                <el-input size="small" type="textarea" :autosize="{ minRows: 1, maxRows: 4}" v-model="row.key" placeholder="请输入 Key"></el-input>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column>
          <template slot-scope="{ row }">
            <el-form :model="row" :rules="keyCheckRule" ref="addValueForm" hide-required-asterisk>
              <el-form-item label="Value" prop="value" inline-message>
                <el-input size="small" type="textarea" :autosize="{ minRows: 1, maxRows: 4}" v-model="row.value" placeholder="请输入 Value"></el-input>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column width="100">
          <template>
            <span style="display: inline-block; margin-bottom: 15px;">
              <el-button @click="addRenderKey()" type="text">确认</el-button>
              <el-button @click="addKeyInputVisable=false" type="text">取消</el-button>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <span v-if="!rollbackMode" class="add-kv-btn">
      <i title="添加" @click="addKeyInputVisable=true" class="el-icon-circle-plus">新增</i>
    </span>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'

const validateKey = (rule, value, callback) => {
  if (typeof value === 'undefined' || value === '') {
    callback(new Error('请输入Key'))
  } else {
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      callback(new Error('Key 只支持字母大小写和数字，特殊字符只支持下划线'))
    } else {
      callback()
    }
  }
}

export default {
  props: {
    variables: Array,
    rollbackMode: {
      default: false,
      type: Boolean
    }
  },
  data () {
    this.keyCheckRule = {
      key: [
        {
          type: 'string',
          required: true,
          validator: validateKey,
          trigger: 'blur'
        }
      ],
      value: [
        {
          type: 'string',
          required: false,
          message: 'value',
          trigger: 'blur'
        }
      ]
    }
    return {
      addKeyInputVisable: false,
      addKeyData: [
        {
          key: '',
          value: '',
          state: 'unused'
        }
      ]
    }
  },
  methods: {
    deleteRenderKey (index, state) {
      if (state === 'present') {
        this.$confirm('该 Key 被产品服务模板引用，确定删除', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.variables.splice(index, 1)
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
      } else {
        this.variables.splice(index, 1)
      }
    },
    addRenderKey () {
      if (this.addKeyData[0].key !== '') {
        this.$refs.addKeyForm.validate(valid => {
          if (valid) {
            this.variables.push(cloneDeep(this.addKeyData[0]))
            this.addKeyData[0].key = ''
            this.addKeyData[0].value = ''
            this.$refs.addKeyForm.clearValidate()
            this.$refs.addValueForm.clearValidate()
          } else {
            return false
          }
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.variable-list {
  /deep/.el-table {
    .unused {
      background: #e6effb;
    }

    .present {
      background: #fff;
    }

    .new {
      background: oldlace;
    }
  }

  /deep/.el-table__row {
    .cell {
      span {
        font-weight: 400;
      }

      .operate {
        font-size: 1.12rem;

        .delete {
          color: #ff1949;
        }
      }
    }
  }

  .render-value {
    display: block;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .add-key-container {
    /deep/.el-form-item__label {
      display: none;
    }

    /deep/.el-form-item {
      margin-bottom: 15px;
    }
  }

  .add-kv-btn {
    display: inline-block;
    margin-top: 10px;
    margin-left: 5px;

    i {
      padding-right: 4px;
      color: #5e6166;
      color: #1989fa;
      font-size: 14px;
      line-height: 14px;
      cursor: pointer;
    }
  }
}
</style>
