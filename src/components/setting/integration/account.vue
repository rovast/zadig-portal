<template>
  <div class="integration-account-container">
    <el-dialog title="用户账户管理-添加" :close-on-click-modal="false" custom-class="edit-form-dialog" :visible.sync="dialogUserAccountFormVisible">
      <el-form :model="userAccount" @submit.native.prevent :rules="userAccountRules" status-icon ref="userAccountForm">
        <el-form-item label="账户类型" prop="type">
          <el-select v-model="userAccount.name" @change="clearValidate('userAccountForm')" :disabled="userAccount.mode ==='edit'">
            <el-option label="Microsoft Active Directory" value="Microsoft Active Directory"></el-option>
            <el-option label="OpenLDAP" value="OpenLDAP"></el-option>
            <el-option label="GitHub" value="GitHub"></el-option>
            <el-option label="OAuth" value="OAuth"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template v-if="userAccount.name ==='GitHub'">
        <el-form
          :model="userAccountGitHub.config"
          @submit.native.prevent
          :rules="userAccountGitHubRules"
          ref="userAccountGitHubForm"
          label-position="left"
          label-width="105px"
        >
          <el-alert type="info" :closable="false" style="margin-bottom: 15px;">
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
      <template v-if="userAccount.name ==='Microsoft Active Directory'">
        <el-form
          :model="userAccountAD.config"
          @submit.native.prevent
          :rules="userAccountADRules"
          ref="userAccountADForm"
          label-width="168px"
          label-position="left"
        >
          <h4>基本配置</h4>
          <el-form-item label="主机地址" prop="addr">
            <el-col :span="14">
              <el-form-item prop="addr">
                <el-input v-model="userAccountAD.config.addr" placeholder="AD 地址" autofocus clearable auto-complete="off"></el-input>
              </el-form-item>
            </el-col>
            <el-col style="text-align: center;" :span="1">:</el-col>
            <el-col :span="5">
              <el-form-item prop="port">
                <el-input v-model="userAccountAD.config.port" placeholder="端口" autofocus clearable auto-complete="off"></el-input>
              </el-form-item>
            </el-col>
          </el-form-item>
          <el-form-item label="管理员账号" prop="bindDN">
            <el-input
              v-model="userAccountAD.config.bindDN"
              placeholder="AD 管理员，示例：cn=user,dc=domain,dc=name"
              autofocus
              clearable
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="管理员密码" prop="bindPW">
            <el-input v-model="userAccountAD.config.bindPW" placeholder="管理员密码" autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item prop="startTLS" label="使用 SSL">
            <el-checkbox v-model="userAccountAD.config.startTLS"></el-checkbox>
          </el-form-item>
          <h4>用户规则</h4>
          <el-form-item label="基础 DN" prop="baseDN">
            <el-input
              v-model="userAccountAD.config.userSearch.baseDN"
              placeholder="从根节点搜索用户，例如：cn=users,dc=example.com,dc=com"
              autofocus
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="用户过滤器" prop="userSearch.filter">
            <el-input v-model="userAccountAD.config.userSearch.filter" placeholder="userSearch.filter" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="用户名属性（用于登录）" prop="userSearch.username">
            <el-input v-model="userAccountAD.config.userSearch.username" placeholder="cn" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="用户昵称属性" prop="userSearch.nameAttr">
            <el-input v-model="userAccountAD.config.userSearch.nameAttr" label="用户邮箱" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="用户邮箱属性" prop="userSearch.emailAttr">
            <el-input v-model="userAccountAD.config.userSearch.emailAttr" label="用户邮箱" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <h4>组规则</h4>
          <el-form-item label="组基础 DN" prop="groupSearch.baseDN">
            <el-input
              v-model="userAccountAD.config.groupSearch.baseDN"
              placeholder="从根节点搜索用户组，例如：cn=group,dc=example.com,dc=com"
              autofocus
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="组过滤器" prop="groupSearch.filter">
            <el-input v-model="userAccountAD.config.groupSearch.filter" placeholder="groupSearch.filter" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <!-- todo userMatchers: -->
          <el-form-item label="组名称属性" prop="groupSearch.nameAttr">
            <el-input v-model="userAccountAD.config.groupSearch.nameAttr" placeholder="groupSearch.nameAttr" autofocus auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="userAccount.name ==='OpenLDAP'">
        <el-form
          :model="userAccountLDAP.config"
          @submit.native.prevent
          :rules="userAccountLDAPRules"
          ref="userAccountLDAPForm"
          label-width="168px"
          label-position="left"
        >
          <h4>基本配置</h4>
          <el-form-item label="主机地址" prop="addr">
            <el-col :span="14">
              <el-form-item prop="addr">
                <el-input v-model="userAccountLDAP.config.addr" placeholder="LDAP 地址" autofocus clearable auto-complete="off"></el-input>
              </el-form-item>
            </el-col>
            <el-col style="text-align: center;" :span="1">:</el-col>
            <el-col :span="5">
              <el-form-item prop="port">
                <el-input v-model="userAccountLDAP.config.port" placeholder="端口" autofocus clearable auto-complete="off"></el-input>
              </el-form-item>
            </el-col>
          </el-form-item>
          <el-form-item label="管理员账号" prop="bindDN">
            <el-input
              v-model="userAccountLDAP.config.bindDN"
              placeholder="LDAP 管理员，示例：cn=user,dc=domain,dc=name"
              autofocus
              clearable
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="管理员密码" prop="bindPW">
            <el-input v-model="userAccountLDAP.config.bindPW" placeholder="管理员密码" autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item prop="startTLS" label="使用 SSL">
            <el-checkbox v-model="userAccountLDAP.config.startTLS"></el-checkbox>
          </el-form-item>
          <h4>用户规则</h4>
          <el-form-item label="基础 DN" prop="userSearch.baseDN">
            <el-input
              v-model="userAccountLDAP.config.userSearch.baseDN"
              placeholder="从根节点搜索用户，例如：cn=users,dc=example.com,dc=com"
              autofocus
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="用户过滤器" prop="userSearch.filter">
            <el-input v-model="userAccountLDAP.config.userSearch.filter" placeholder="userSearch.filter" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="用户名属性（用于登录）" prop="userSearch.username">
            <el-input v-model="userAccountLDAP.config.userSearch.username" placeholder="cn" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="用户昵称属性" prop="userSearch.nameAttr">
            <el-input v-model="userAccountLDAP.config.userSearch.nameAttr" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="用户邮箱属性" prop="userSearch.emailAttr">
            <el-input v-model="userAccountLDAP.config.userSearch.emailAttr" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <h4>组规则</h4>
          <el-form-item label="组基础 DN" prop="groupSearch.baseDN">
            <el-input
              v-model="userAccountLDAP.config.groupSearch.baseDN"
              placeholder="从根节点搜索用户组，例如：cn=group,dc=example.com,dc=com"
              autofocus
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="组过滤器" prop="groupSearch.filter">
            <el-input v-model="userAccountLDAP.config.groupSearch.filter" placeholder="groupSearch.filter" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <!-- todo userMatchers: -->
          <el-form-item label="组名称属性" prop="groupSearch.nameAttr">
            <el-input
              v-model="userAccountLDAP.config.groupSearch.nameAttr"
              placeholder="groupSearch.nameAttr"
              autofocus
              auto-complete="off"
            ></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="userAccount.name ==='OAuth'">
        <el-form
          :model="userAccountOAuth.config"
          @submit.native.prevent
          :rules="userAccountOAuthRules"
          ref="userAccountOAuthForm"
          label-width="180px"
          label-position="left"
        >
          <el-alert type="info" :closable="false" style="margin-bottom: 15px;">
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
            <el-input v-model="userAccountOAuth.config.clientID" placeholder="输入 OAuth Client ID" autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="Client Secret" prop="clientSecret">
            <el-input
              v-model="userAccountOAuth.config.clientSecret"
              placeholder="输入 OAuth Client Secret"
              autofocus
              clearable
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="Authorization URL" prop="authorizationURL">
            <el-input
              v-model="userAccountOAuth.config.authorizationURL"
              placeholder="输入 Authorization URL"
              autofocus
              clearable
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="Token URL" prop="tokenURL">
            <el-input v-model="userAccountOAuth.config.tokenURL" placeholder="输入 Token URL" autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="用户信息 URL" prop="userInfoURL">
            <el-input v-model="userAccountOAuth.config.userInfoURL" placeholder="用户信息 URL" autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="用户名属性（用于登录）" prop="userIDKey">
            <el-input v-model="userAccountOAuth.config.userIDKey" placeholder autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="用户昵称属性" prop="claimMapping.userNameKey">
            <el-input
              v-model="userAccountOAuth.config.claimMapping.userNameKey"
              autofocus
              clearable
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="用户邮箱属性" prop="claimMapping.emailKey">
            <el-input
              v-model="userAccountOAuth.config.claimMapping.emailKey"
              autofocus
              clearable
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="不验证证书" prop="insecureSkipVerify">
            <el-checkbox v-model="userAccountOAuth.config.insecureSkipVerify"></el-checkbox>
          </el-form-item>
        </el-form>
      </template>
      <div slot="footer" class="dialog-footer">
        <el-button
          v-if="userAccount.mode==='add'"
          :disabled="userAccount.name === ''"
          type="primary"
          native-type="submit"
          size="small"
          @click="createAccountUser()"
          class="start-create"
        >保存</el-button>
        <el-button
          v-else-if="userAccount.mode==='edit'"
          :disabled="userAccount.name === ''"
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
            为系统定义用户来源，默认支持 OpenLDAP、Microsoft Active Directory、以及 OAuth 集成，详情可参考
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
      <el-table :data="accounts" style="width: 100%;">
        <el-table-column label="账户类型">
          <template slot-scope="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" plain @click="handleUserAccountEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="mini" @click="handleUserAccountDelete(scope.row)" plain>删除</el-button>
            <el-button
              v-if="scope.row.name === 'OpenLDAP' || scope.row.name === 'Microsoft Active Directory'"
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
import { cloneDeep, omit } from 'lodash'
export default {
  data () {
    return {
      accounts: [],
      dialogUserAccountFormVisible: false,
      syncAccountUserLoading: false,
      userAccount: {
        name: '',
        mode: 'add'
      },
      userAccountAD: {
        type: 'ldap',
        id: 'ad',
        name: 'Microsoft Active Directory',
        config: {
          host: '',
          addr: '',
          port: '',
          insecureNoSSL: true,
          insecureSkipVerify: true,
          startTLS: false,
          // rootCA: '/etc/dex/ldap.ca',
          // rootCAData:'',
          bindDN: '',
          bindPW: '',
          usernamePrompt: 'AD 用户名',
          userSearch: {
            baseDN: '',
            filter: '(cn=*)',
            username: 'cn',
            idAttr: '',
            emailAttr: '',
            nameAttr: 'cn'
          },
          groupSearch: {
            baseDN: '',
            filter: '(objectClass=group)',
            // userMatchers: [
            //   {
            //     userAttr: 'uid',
            //     groupAttr: 'member'
            //   }
            // ],
            nameAttr: 'ou'
          }
        }
      },
      userAccountLDAP: {
        type: 'ldap',
        id: 'ldap',
        name: 'OpenLDAP',
        config: {
          host: '',
          addr: '',
          port: '',
          insecureNoSSL: true,
          insecureSkipVerify: true,
          startTLS: false,
          // rootCA: '/etc/dex/ldap.ca',
          // rootCAData:'',
          bindDN: '',
          bindPW: '',
          usernamePrompt: 'LDAP 用户名',
          userSearch: {
            baseDN: '',
            filter: '(cn=*)',
            username: 'cn',
            idAttr: '',
            emailAttr: '',
            nameAttr: '',
            preferredUsernameAttr: ''
          },
          groupSearch: {
            baseDN: '',
            filter: '(objectClass=group)',
            // userMatchers: [
            //   {
            //     userAttr: 'uid',
            //     groupAttr: 'member'
            //   }
            // ],
            nameAttr: 'ou'
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
      userAccountOAuth: {
        type: 'oauth',
        id: 'oauth',
        name: 'OAuth',
        config: {
          authorizationURL: '',
          claimMapping: {
            emailKey: 'email',
            emailVerifiedKey: '',
            groupsKey: '',
            preferredUsernameKey: 'user_id',
            userNameKey: 'user_name'
          },
          clientID: '',
          clientSecret: '',
          insecureSkipVerify: true,
          redirectURI: '',
          scopes: [],
          tokenURL: '',
          userIDKey: 'user_id',
          userInfoURL: ''
        }
      },
      userAccountRules: {},
      userAccountADRules: {
        addr: {
          required: true,
          message: '请输入 AD 地址',
          trigger: ['blur', 'change']
        },
        port: {
          required: true,
          message: '请输入端口',
          trigger: ['blur', 'change']
        },
        bindDN: {
          required: true,
          message: '请输入管理员账号',
          trigger: ['blur', 'change']
        },
        bindPW: {
          required: true,
          message: '请输入管理员密码',
          trigger: ['blur', 'change']
        },
        'userSearch.baseDN': {
          required: true,
          message: '请输入基础 DN',
          trigger: ['blur', 'change']
        },
        'userSearch.filter': {
          required: true,
          message: '请输入用户过滤器',
          trigger: ['blur', 'change']
        },
        'userSearch.username': {
          required: true,
          message: '请输入用户属性',
          trigger: ['blur', 'change']
        },
        'userSearch.emailAttr': {
          required: true,
          message: '请输入用户邮箱属性',
          trigger: ['blur', 'change']
        },
        'groupSearch.baseDN': {
          required: true,
          message: '请输入组基础 DN',
          trigger: ['blur', 'change']
        },
        'groupSearch.nameAttr': {
          required: true,
          message: '请输入组名称属性',
          trigger: ['blur', 'change']
        }
      },
      userAccountLDAPRules: {
        addr: {
          required: true,
          message: '请输入 LDAP 地址',
          trigger: ['blur', 'change']
        },
        port: {
          required: true,
          message: '请输入端口',
          trigger: ['blur', 'change']
        },
        bindDN: {
          required: true,
          message: '请输入管理员账号',
          trigger: ['blur', 'change']
        },
        bindPW: {
          required: true,
          message: '请输入管理员密码',
          trigger: ['blur', 'change']
        },
        'userSearch.baseDN': {
          required: true,
          message: '请输入基础 DN',
          trigger: ['blur', 'change']
        },
        'userSearch.filter': {
          required: true,
          message: '请输入用户过滤器',
          trigger: ['blur', 'change']
        },
        'userSearch.username': {
          required: true,
          message: '请输入用户属性',
          trigger: ['blur', 'change']
        },
        'userSearch.emailAttr': {
          required: true,
          message: '请输入用户邮箱属性',
          trigger: ['blur', 'change']
        },
        'groupSearch.baseDN': {
          required: true,
          message: '请输入组基础 DN',
          trigger: ['blur', 'change']
        },
        'groupSearch.nameAttr': {
          required: true,
          message: '请输入组名称属性',
          trigger: ['blur', 'change']
        }
      },
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
      },
      userAccountOAuthRules: {
        clientID: {
          required: true,
          message: '请填写 Client ID',
          trigger: ['blur', 'change']
        },
        clientSecret: {
          required: true,
          message: '请填写 Client Secret',
          trigger: ['blur', 'change']
        },
        authorizationURL: {
          required: true,
          message: '请填写 Authorization URL',
          trigger: ['blur', 'change']
        },
        tokenURL: {
          required: true,
          message: '请填写 Token URL',
          trigger: ['blur', 'change']
        },
        userInfoURL: {
          required: true,
          message: '请填写 User Info URL',
          trigger: ['blur', 'change']
        },
        userIDKey: {
          required: true,
          message: '请填写用户名属性',
          trigger: ['blur', 'change']
        },
        'claimMapping.userNameKey': {
          required: true,
          message: '请填写用户昵称属性',
          trigger: ['blur', 'change']
        },
        'claimMapping.emailKey': {
          required: true,
          message: '请填写用户邮箱属性',
          trigger: ['blur', 'change']
        }
      }
    }
  },
  computed: {
    name () {
      return this.userAccount.name
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
        name: '',
        mode: 'add'
      }
    },
    handleUserAccountEdit (row) {
      const name = row.name
      this.userAccount = {
        name: name,
        mode: 'edit'
      }
      this.dialogUserAccountFormVisible = true
      if (name === 'OpenLDAP') {
        row.config.addr = row.config.host.split(':')[0]
        row.config.port = row.config.host.split(':')[1]
        row.config.userSearch.idAttr = row.config.userSearch.username
        row.config.userSearch.preferredUsernameAttr =
          row.config.userSearch.username
        this.userAccountLDAP = cloneDeep(row)
      } else if (name === 'Microsoft Active Directory') {
        row.config.userSearch.idAttr = row.config.userSearch.username
        row.config.userSearch.preferredUsernameAttr =
          row.config.userSearch.username
        row.config.addr = row.config.host.split(':')[0]
        row.config.port = row.config.host.split(':')[1]
        this.userAccountAD = cloneDeep(row)
      } else if (name === 'GitHub') {
        this.userAccountGitHub = cloneDeep(row)
      } else if (name === 'OAuth') {
        this.userAccountOAuth = cloneDeep(row)
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
        }
      }
      if (this.$refs.userAccountLDAPForm) {
        this.userAccountLDAP = {
          type: 'ldap',
          id: 'ldap',
          name: 'OpenLDAP',
          config: {
            host: '',
            addr: '',
            port: '',
            insecureNoSSL: true,
            insecureSkipVerify: true,
            startTLS: false,
            // rootCA: '/etc/dex/ldap.ca',
            // rootCAData:'',
            bindDN: '',
            bindPW: '',
            usernamePrompt: 'LDAP 用户名',
            userSearch: {
              baseDN: '',
              filter: '(cn=*)',
              username: 'cn',
              idAttr: '',
              emailAttr: '',
              nameAttr: 'cn'
            },
            groupSearch: {
              baseDN: '',
              filter: '(objectClass=group)',
              // userMatchers: [
              //   {
              //     userAttr: 'uid',
              //     groupAttr: 'member'
              //   }
              // ],
              nameAttr: 'ou'
            }
          }
        }
      }
      if (this.$refs.userAccountADForm) {
        this.userAccountAD = {
          type: 'ad',
          id: 'ad',
          name: 'Microsoft Active Directory',
          config: {
            host: '',
            addr: '',
            port: '',
            insecureNoSSL: true,
            insecureSkipVerify: true,
            startTLS: false,
            // rootCA: '/etc/dex/ldap.ca',
            // rootCAData:'',
            bindDN: '',
            bindPW: '',
            usernamePrompt: 'AD 用户名',
            userSearch: {
              baseDN: '',
              filter: '(cn=*)',
              username: 'cn',
              idAttr: '',
              emailAttr: '',
              nameAttr: ''
            },
            groupSearch: {
              baseDN: '',
              filter: '(objectClass=group)',
              // userMatchers: [
              //   {
              //     userAttr: 'uid',
              //     groupAttr: 'member'
              //   }
              // ],
              nameAttr: 'ou'
            }
          }
        }
      }
      if (this.$refs.userAccountOAuthForm) {
        this.userAccountOAuth = {
          type: 'oauth',
          id: 'oauth',
          name: 'OAuth',
          config: {
            authorizationURL: '',
            claimMapping: {
              emailKey: 'email',
              emailVerifiedKey: '',
              groupsKey: '',
              preferredUsernameKey: 'user_id',
              userNameKey: 'user_name'
            },
            clientID: '',
            clientSecret: '',
            insecureSkipVerify: true,
            redirectURI: '',
            scopes: [],
            tokenURL: '',
            userIDKey: 'user_id',
            userInfoURL: ''
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
      if (this.name === 'OpenLDAP') {
        this.$refs.userAccountLDAPForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountLDAP
            payload.config.host = `${payload.config.addr}:${payload.config.port}`
            payload.config.userSearch.idAttr =
              payload.config.userSearch.username
            omit(payload.config, ['addr', 'port'])
            createConnectorAPI(payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: '账户数据添加成功',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      } else if (this.name === 'Microsoft Active Directory') {
        this.$refs.userAccountADForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountAD
            payload.config.host = `${payload.config.addr}:${payload.config.port}`
            payload.config.userSearch.idAttr =
              payload.config.userSearch.username
            omit(payload.config, ['addr', 'port'])
            createConnectorAPI(payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: '账户数据添加成功',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      } else if (this.name === 'GitHub') {
        this.$refs.userAccountGitHubForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountGitHub
            payload.config.redirectURI = `${this.$utils.getOrigin()}/dex/callback`
            createConnectorAPI(payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: '账户数据添加成功',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      } else if (this.name === 'OAuth') {
        this.$refs.userAccountOAuthForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountOAuth
            payload.config.redirectURI = `${this.$utils.getOrigin()}/dex/callback`
            payload.config.claimMapping.PreferredUsernameKey =
              payload.config.userIDKey
            payload.config.scopes = [
              payload.config.userIDKey,
              payload.config.claimMapping.userNameKey,
              payload.config.claimMapping.emailKey
            ]
            createConnectorAPI(payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: '账户数据添加成功',
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
      if (this.name === 'OpenLDAP') {
        this.$refs.userAccountLDAPForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountLDAP
            payload.host = `${payload.config.addr}:${payload.config.port}`
            omit(payload, ['addr', 'port'])
            updateConnectorAPI(payload.id, payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: '账户数据修改成功',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      } else if (this.name === 'Microsoft Active Directory') {
        this.$refs.userAccountADForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountAD
            payload.host = `${payload.config.addr}:${payload.config.port}`
            omit(payload, ['addr', 'port'])
            updateConnectorAPI(payload.id, payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: '账户数据修改成功',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      } else if (this.name === 'GitHub') {
        this.$refs.userAccountGitHubForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountGitHub
            payload.config.redirectURI = `${this.$utils.getOrigin()}/dex/callback`
            updateConnectorAPI(payload.id, payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: '账户数据修改成功',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      } else if (this.name === 'OAuth') {
        this.$refs.userAccountOAuthForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountOAuth
            payload.config.redirectURI = `${this.$utils.getOrigin()}/dex/callback`
            updateConnectorAPI(payload.id, payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: '账户数据修改成功',
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
    width: 600px;

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
