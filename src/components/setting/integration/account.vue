<template>
  <div class="integration-account-container">
    <el-dialog title="用户账户管理-添加" :close-on-click-modal="false" custom-class="edit-form-dialog" :visible.sync="dialogUserAccountFormVisible">
      <el-form :model="userAccount" @submit.native.prevent :rules="userAccountRules" status-icon ref="userAccountForm">
        <el-form-item label="账户类型" prop="type">
          <el-select v-model="userAccount.type" @change="clearValidate('userAccountForm')" :disabled="userAccount.mode ==='edit'">
            <!-- <el-option label="Microsoft Active Directory" value="ad"></el-option> -->
            <el-option label="OpenLDAP" value="ldap"></el-option>
            <el-option label="GitHub" value="github"></el-option>
            <!-- <el-option label="SSO" value="sso"></el-option> -->
          </el-select>
        </el-form-item>
      </el-form>
      <template v-if="userAccount.type ==='github'">
        <el-form
          :model="userAccountGitHub.config"
          @submit.native.prevent
          :rules="userAccountGitHubRules"
          status-icon
          ref="userAccountGitHubForm"
        >
          <el-alert type="info" :closable="false">
            <slot>
              <span class="tips">{{`Authorization Callback URL 请填写`}}</span>
              <span class="tips code-line">
                {{`${$utils.getOrigin()}/dex/callback`}}
                <span
                  v-clipboard:copy="`${$utils.getOrigin()}/dex/callback`"
                  v-clipboard:success="copyCommandSuccess"
                  v-clipboard:error="copyCommandError"
                  class="el-icon-copy-document copy"
                ></span>
              </span>
            </slot>
          </el-alert>
          <el-form-item label="Client ID" prop="clientID">
            <el-input
              v-model="userAccountGitHub.config.clientID"
              placeholder="输入 OAuth App Client ID"
              autofocus
              clearable
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="Client Secret" prop="clientSecret">
            <el-input
              v-model="userAccountGitHub.config.clientSecret"
              placeholder="输入 OAuth App Client Secret"
              autofocus
              clearable
              auto-complete="off"
            ></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="userAccount.type ==='ldap'">
        <el-form :model="userAccountLDAP" @submit.native.prevent :rules="userAccountLDAPRules" status-icon ref="userAccountLDAPForm">
          <el-form-item label="主机名:端口" prop="config.host">
            <el-input v-model="userAccountLDAP.config.host" placeholder="主机名:端口" autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="bindDN" prop="config.bindDN">
            <el-input v-model="userAccountLDAP.config.bindDN" autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="bindPW" prop="config.bindPW">
            <el-input v-model="userAccountLDAP.config.bindPW" autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="usernamePrompt" prop="config.usernamePrompt">
            <el-input v-model="userAccountLDAP.config.usernamePrompt" autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="userSearch.baseDN" prop="config.userSearch.baseDN">
            <el-input v-model="userAccountLDAP.config.userSearch.baseDN" placeholder="userSearch.baseDN" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="userSearch.filter" prop="config.userSearch.filter">
            <el-input v-model="userAccountLDAP.config.userSearch.filter" placeholder="userSearch.filter" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="userSearch.username" prop="config.userSearch.username">
            <el-input v-model="userAccountLDAP.config.userSearch.username" placeholder="userSearch.username" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="userSearch.idAttr" prop="config.userSearch.idAttr">
            <el-input v-model="userAccountLDAP.config.userSearch.idAttr" placeholder="userSearch.idAttr" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="userSearch.emailAttr" prop="config.userSearch.emailAttr">
            <el-input
              v-model="userAccountLDAP.config.userSearch.emailAttr"
              placeholder="userSearch.emailAttr"
              autofocus
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="userSearch.nameAttr" prop="config.userSearch.nameAttr">
            <el-input v-model="userAccountLDAP.config.userSearch.nameAttr" placeholder="userSearch.nameAttr" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="groupSearch.baseDN" prop="config.groupSearch.baseDN">
            <el-input v-model="userAccountLDAP.config.groupSearch.baseDN" placeholder="groupSearch.baseDN" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="groupSearch.filter" prop="config.groupSearch.filter">
            <el-input v-model="userAccountLDAP.config.groupSearch.filter" placeholder="groupSearch.filter" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <!-- todo userMatchers: -->
          <el-form-item label="groupSearch.nameAttr" prop="config.groupSearch.nameAttr">
            <el-input
              v-model="userAccountLDAP.config.groupSearch.nameAttr"
              placeholder="groupSearch.nameAttr"
              autofocus
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="其它">
            <el-checkbox v-model="userAccountLDAP.config.startTLS">startTLS</el-checkbox>
            <el-checkbox v-model="userAccountLDAP.config.insecureNoSSL">insecureNoSSL</el-checkbox>
            <el-checkbox v-model="userAccountLDAP.config.insecureSkipVerify">insecureSkipVerify</el-checkbox>
          </el-form-item>
        </el-form>
      </template>

      <div slot="footer" class="dialog-footer">
        <el-button
          v-if="userAccount.mode==='add'"
          :disabled="userAccount.type === ''"
          type="primary"
          native-type="submit"
          size="small"
          @click="createAccountUser()"
          class="start-create"
        >保存</el-button>
        <el-button
          v-else-if="userAccount.mode==='edit'"
          :disabled="userAccount.type === ''"
          type="primary"
          native-type="submit"
          size="small"
          @click="updateAccountUser()"
          class="start-create"
        >保存</el-button>
        <el-button plain native-type="submit" size="small" @click="handleUserAccountCancel">取消</el-button>
      </div>
    </el-dialog>
    <!--end of add account dialog-->
    <div class="tab-container">
      <template>
        <el-alert type="info" :closable="false">
          <template>
            为系统定义用户来源，默认支持 LDAP、AD、以及 SSO 集成，详情可参考
            <el-link
              style="font-size: 14px; vertical-align: baseline;"
              type="primary"
              :href="`https://docs.koderover.com/zadig/settings/account/`"
              :underline="false"
              target="_blank"
            >帮助文档</el-link>。
          </template>
        </el-alert>
      </template>
      <div class="sync-container">
        <el-button size="small" type="primary" plain @click="addAccount()">添加</el-button>
      </div>
      <el-table v-if="accounts.length>0" :data="accounts" style="width: 100%;">
        <el-table-column label="名称">
          <template slot-scope="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="账户类型">
          <template slot-scope="scope">{{scope.row.type}}</template>
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" plain @click="handleUserAccountEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="mini" @click="handleUserAccountDelete(scope.row)" plain>删除</el-button>
            <el-button
              v-if="scope.row.type === 'ldap'"
              type="primary"
              size="mini"
              :loading="syncAccountUserLoading"
              @click="syncAccountUser(scope.row)"
              plain
            >同步</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import {
  getConnectorsAPI,
  deleteConnectorAPI,
  updateConnectorAPI,
  createConnectorAPI,
  syncLDAPAPI
} from '@api'
import { cloneDeep } from 'lodash'
export default {
  data () {
    return {
      accounts: [],
      dialogUserAccountFormVisible: false,
      syncAccountUserLoading: false,
      userAccount: {
        type: '',
        mode: 'add'
      },
      userAccountLDAP: {
        type: 'ldap',
        id: 'ldap',
        name: 'LDAP',
        config: {
          host: '',
          insecureNoSSL: false,
          insecureSkipVerify: false,
          startTLS: true,
          // rootCA: '/etc/dex/ldap.ca',
          // rootCAData:'',
          bindDN: '',
          bindPW: '',
          usernamePrompt: 'SSO Username',
          userSearch: {
            baseDN: '',
            filter: '(objectClass=person)',
            username: '',
            idAttr: '',
            emailAttr: '',
            nameAttr: ''
          },
          groupSearch: {
            baseDN: '',
            filter: '',
            // userMatchers: [
            //   {
            //     userAttr: 'uid',
            //     groupAttr: 'member'
            //   }
            // ],
            nameAttr: 'name'
          }
        }
      },
      userAccountGitHub: {
        type: 'github',
        id: 'github',
        name: 'GitHub',
        config: {
          clientID: '',
          clientSecret: '',
          redirectURI: '',
          // orgs: [
          //   {
          //     name: 'my-organization'
          //   },
          //   {
          //     name: 'my-organization-with-teams',
          //     teams: ['red-team', 'blue-team']
          //   }
          // ],
          loadAllGroups: false,
          teamNameField: 'slug',
          useLoginAsID: false
        }
      },
      userAccountRules: {},
      userAccountLDAPRules: {},
      userAccountGitHubRules: {
        clientID: {
          required: true,
          message: '请填写 Client ID',
          trigger: ['blur', 'change']
        },
        clientSecret: {
          required: true,
          message: '请填写 Client Secret',
          trigger: ['blur', 'change']
        }
      }
    }
  },
  computed: {
    type () {
      return this.userAccount.type
    }
  },
  methods: {
    copyCommandSuccess (event) {
      this.$message({
        message: '地址已成功复制到剪贴板',
        type: 'success'
      })
    },
    copyCommandError (event) {
      this.$message({
        message: '地址复制失败',
        type: 'error'
      })
    },
    clearValidate (ref) {
      this.$refs[ref].clearValidate()
    },
    addAccount () {
      this.dialogUserAccountFormVisible = true
      this.userAccount = {
        type: '',
        mode: 'add'
      }
    },
    handleUserAccountEdit (row) {
      const type = row.type
      this.userAccount = {
        type: type,
        mode: 'edit'
      }
      this.dialogUserAccountFormVisible = true
      if (type === 'ldap') {
        this.userAccountLDAP = cloneDeep(row)
      } else if (type === 'github') {
        this.userAccountGitHub = cloneDeep(row)
      }
    },
    handleUserAccountCancel () {
      if (this.$refs.userAccountGitHubForm) {
        this.userAccountGitHub = {
          type: 'github',
          id: 'github',
          name: 'GitHub',
          config: {
            clientID: '',
            clientSecret: '',
            redirectURI: '',
            loadAllGroups: false,
            teamNameField: 'slug',
            useLoginAsID: false
          }
        }
      }
      if (this.$refs.userAccountLDAPForm) {
        this.userAccountLDAP = {
          type: 'ldap',
          id: 'ldap',
          name: 'LDAP',
          config: {
            host: '',
            insecureNoSSL: false,
            insecureSkipVerify: false,
            startTLS: true,
            bindDN: '',
            bindPW: '',
            usernamePrompt: 'SSO Username',
            userSearch: {
              baseDN: '',
              filter: '(objectClass=person)',
              username: '',
              idAttr: '',
              emailAttr: '',
              nameAttr: ''
            },
            groupSearch: {
              baseDN: '',
              filter: '',
              nameAttr: 'name'
            }
          }
        }
      }
      this.dialogUserAccountFormVisible = false
    },
    handleUserAccountDelete (row) {
      this.$confirm(`确定要删除 ${row.name} 这个账户类型吗？`, '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteConnectorAPI(row.id).then(res => {
          this.getAccountConfig()
          this.$message({
            message: '删除成功',
            type: 'success'
          })
        })
      })
    },
    getAccountConfig () {
      getConnectorsAPI().then(res => {
        this.$set(this, 'accounts', res)
      })
    },
    syncAccountUser (row) {
      const id = row.id
      this.syncAccountUserLoading = true
      syncLDAPAPI(id).then(
        res => {
          this.syncAccountUserLoading = false
          this.$message({
            message: '同步 LDAP 数据成功',
            type: 'success'
          })
        },
        () => {
          this.syncAccountUserLoading = false
        }
      )
    },
    createAccountUser () {
      if (this.type === 'ldap') {
        this.$refs.userAccountLDAPForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountLDAP
            createConnectorAPI(payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: '用户数据添加成功',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      } else if (this.type === 'github') {
        this.$refs.userAccountGitHubForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountGitHub
            payload.redirectURI = `${this.$utils.getOrigin()}/dex/callback`
            createConnectorAPI(payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: '用户数据添加成功',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      }
    },
    updateAccountUser () {
      if (this.type === 'ldap') {
        this.$refs.userAccountLDAPForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountLDAP
            updateConnectorAPI(payload.id, payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: '用户数据修改成功',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      } else if (this.type === 'github') {
        this.$refs.userAccountGitHubForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountGitHub
            payload.redirectURI = `${this.$utils.getOrigin()}/dex/callback`
            updateConnectorAPI(payload.id, payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: '用户数据修改成功',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      }
    }
  },
  mounted () {
    this.getAccountConfig()
  }
}
</script>

<style lang="less">
.integration-account-container {
  position: relative;
  flex: 1;
  overflow: auto;
  font-size: 13px;

  .module-title h1 {
    margin-bottom: 1.5rem;
    font-weight: 200;
    font-size: 2rem;
  }

  .tips {
    display: block;

    &.code-line {
      display: inline-block;
      font-size: 14px;
      word-wrap: break-word;
      word-break: break-all;
      border-radius: 2px;

      .copy {
        color: #1989fa;
        font-size: 16px;
        cursor: pointer;
      }
    }
  }

  .edit-form-dialog {
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
      padding: 0 20px;
      padding-bottom: 0;
      color: #606266;
      font-size: 14px;

      .el-form-item {
        margin-bottom: 15px;
      }
    }

    .el-select {
      width: 100%;
    }

    .el-input {
      display: inline-block;
    }
  }
}
</style>
