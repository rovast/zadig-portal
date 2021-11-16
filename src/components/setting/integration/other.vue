<template>
  <div class="integration-other-container">
    <el-dialog title="其他" :close-on-click-modal="false" :visible.sync="dialogExternalVisible">
      <el-form :model="externalEdit" @submit.native.prevent :rules="externalRules" ref="externalEditForm" label-width="100px">
        <el-form-item label="系统名称" prop="host">
          <el-input v-model="externalEdit.host" placeholder="输入系统访问地址" size="small"></el-input>
        </el-form-item>
        <el-form-item label="访问地址" prop="user">
          <el-input v-model="externalEdit.user" placeholder="输入系统访问地址" size="small"></el-input>
        </el-form-item>
        <el-form-item label="API Token" prop="accessToken">
          <el-input v-model="externalEdit.accessToken" placeholder="输入 API Token" size="small"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" native-type="submit" size="small" @click="updateExternalConfig()" class="start-create">确定</el-button>
        <el-button plain native-type="submit" size="small" @click="handleExternalCancel()">取消</el-button>
      </div>
    </el-dialog>

    <div class="tab-container">
      <template>
        <el-alert type="info" :closable="false">
          <template>
            集成外部系统，配置后工作流可以调用外部系统 API，详情可参考
            <el-link
              style="font-size: 14px; vertical-align: baseline;"
              type="primary"
              :href="`https://docs.koderover.com/zadig/settings/other/`"
              :underline="false"
              target="_blank"
            >帮助文档</el-link>。
          </template>
        </el-alert>
      </template>
      <div class="sync-container">
        <el-button size="small" type="primary" plain @click="handleExternalAdd">添加</el-button>
      </div>
      <el-table :data="external" style="width: 100%;">
        <el-table-column label="系统名称">
          <template slot-scope="scope">{{scope.row.host}}</template>
        </el-table-column>
        <el-table-column label="访问地址">
          <template slot-scope="scope">{{scope.row.user}}</template>
        </el-table-column>
        <el-table-column label="API Token">
          <template>**********</template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" plain @click="handleExternalEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="mini" @click="handleExternalDelete" plain>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import {
  getExternalAPI,
  updateExternalAPI,
  deleteExternalAPI,
  createExternalAPI
} from '@api'
const validateExternalURL = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入服务 URL'))
  } else {
    if (value.endsWith('/')) {
      callback(new Error('URL 末尾不能包含 /'))
    } else {
      callback()
    }
  }
}
export default {
  data () {
    return {
      tabPosition: 'top',
      activeTab: '',
      external: [],
      externalAdd: {
        host: '',
        user: '',
        accessToken: ''
      },
      externalEdit: {
        host: '',
        user: '',
        accessToken: ''
      },
      externalRules: {
        user: {
          required: true,
          message: '请输入用户名',
          trigger: ['blur', 'change']
        },
        host: [
          {
            required: true,
            message: '请输入 Host',
            trigger: 'blur'
          },
          {
            type: 'url',
            message: '请输入正确的 URL，包含协议',
            trigger: ['blur', 'change']
          },
          {
            required: true,
            trigger: 'change',
            validator: validateExternalURL
          }
        ],
        accessToken: {
          required: true,
          message: '请输入密码',
          trigger: ['blur', 'change']
        }
      },
      dialogExternalVisible: false
    }
  },
  methods: {
    clearValidate (ref) {
      this.$refs[ref].clearValidate()
    },
    getExternalConfig () {
      getExternalAPI().then(res => {
        if (res) {
          this.$set(this.external, [0], res)
        } else {
          this.$set(this, 'external', [])
        }
      })
    },
    handleExternalAdd () {
      this.dialogExternalVisible = true
    },
    handleExternalEdit (row) {
      this.dialogExternalVisible = true
      this.externalEdit = this.$utils.cloneObj(row)
    },
    handleExternalDelete () {
      this.$confirm(`确定要删除这个 External 配置吗？`, '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteExternalAPI().then(res => {
          this.getExternalConfig()
          this.$message({
            message: 'External 配置删除成功',
            type: 'success'
          })
        })
      })
    },
    createExternalConfig () {
      this.$refs.externalAddForm.validate(valid => {
        if (valid) {
          const payload = this.externalAdd
          createExternalAPI(payload).then(res => {
            this.getExternalConfig()
            this.handleExternalCancel()
            this.$message({
              message: 'External 配置添加成功',
              type: 'success'
            })
          })
        } else {
          return false
        }
      })
    },
    updateExternalConfig () {
      this.$refs.externalEditForm.validate(valid => {
        if (valid) {
          const payload = this.externalEdit
          updateExternalAPI(payload).then(res => {
            this.getExternalConfig()
            this.handleExternalCancel()
            this.$message({
              message: 'External 配置修改成功',
              type: 'success'
            })
          })
        } else {
          return false
        }
      })
    },
    handleExternalCancel () {
      if (this.$refs.externalAddForm) {
        this.$refs.externalAddForm.resetFields()
        this.dialogExternalVisible = false
      }
      if (this.$refs.externalEditForm) {
        this.$refs.externalEditForm.resetFields()
        this.dialogExternalVisible = false
      }
    }
  },
  activated () {
    this.getExternalConfig()
  }
}
</script>

<style lang="less" scoped>
.integration-other-container {
  position: relative;
  flex: 1;
  overflow: auto;
  font-size: 13px;

  .tab-container {
    .sync-container {
      padding-top: 15px;
      padding-bottom: 15px;
    }
  }

  /deep/.el-dialog {
    width: 550px;

    .el-dialog__header {
      padding: 15px;
      text-align: center;
      border-bottom: 1px solid #e4e4e4;

      .el-dialog__close {
        font-size: 10px;
      }
    }

    .el-dialog__body {
      color: #606266;
      font-size: 14px;

      .el-form-item {
        margin-bottom: 15px;
      }
    }
  }
}
</style>
