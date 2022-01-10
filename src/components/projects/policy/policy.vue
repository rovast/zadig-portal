<template>
  <section class="policy-content">
    <div class="top">
      <span class="top-title">选择参与成员</span>
      <el-select v-model="collaborationData.members" placeholder="搜寻或邀请（默认为全部用户）" multiple clearable filterable collapse-tags size="small">
        <template slot="prefix">
          <i class="el-icon-search prefix-icon"></i>
        </template>
        <el-option label="all-users" value="all-users">
          <span>all-users(所有用户包括新建用户)</span>
        </el-option>
        <el-option v-for="user in userList" :key="user.uid" :label="user.name" :value="user.uid">
          <i class="iconfont iconsystem option-icon"></i>
          {{user.name}} ({{user.account}})
        </el-option>
      </el-select>
    </div>

    <div class="level-one-title">配置协作规则</div>

    <div class="level-two-title">工作流</div>
    <el-table :data="collaborationData.workflows" style="width: 100%;">
      <el-table-column label="基准工作流">
        <template slot-scope="{ row }">
          <el-select v-model="row.name" placeholder="请选择基准工作流" filterable size="small" :disabled="!!row.name">
            <el-option v-for="workflow in lastBaseWorkflows" :key="workflow" :label="workflow" :value="workflow"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="配置">
        <template slot-scope="{ row }">
          <el-radio-group v-model="row.collaboration_type">
            <el-radio label="new">新建</el-radio>
            <el-radio label="share">共享</el-radio>
          </el-radio-group>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{ row }">
          <el-popover ref="workflowPopoverRef" placement="right" width="150" trigger="click">
            <div class="auth-list">
              <div class="title">
                <el-checkbox
                  :indeterminate="isIndeterminate(row, 'workflow')"
                  :value="checkAll(row, 'workflow')"
                  @change="handleCheckAllChange($event, row, 'workflow')"
                ></el-checkbox>
                <i></i>
                所有权限
              </div>
              <el-checkbox-group v-model="row.verbs">
                <el-checkbox v-for="workflow in policy.workflow" :key="workflow.action" :label="workflow.action">
                  <i :class="[workflow.icon]"></i>
                  {{workflow.alias}}
                </el-checkbox>
              </el-checkbox-group>
            </div>
            <el-button type="primary" slot="reference" size="mini" plain>权限</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column width="90px">
        <template slot-scope="{ $index }">
          <el-button type="primary" icon="el-icon-minus" size="mini" circle plain @click="deleteWorkflow($index)"></el-button>
          <el-button type="primary" icon="el-icon-plus" size="mini" circle plain @click="addWorkflow"></el-button>
        </template>
      </el-table-column>
      <div slot="empty">
        <el-button type="primary" icon="el-icon-plus" size="small" plain @click="addWorkflow"></el-button>
        <el-tag effect="dark">删除工作流将影响参与成员操作权限</el-tag>
      </div>
    </el-table>

    <div class="level-two-title">集成环境</div>
    <el-table :data="collaborationData.products" style="width: 100%;">
      <el-table-column label="基准环境">
        <template slot-scope="{ row }">
          <el-select v-model="row.name" placeholder="请选择基准环境" filterable size="small" :disabled="!!row.name">
            <el-option v-for="env in lastBaseEnvironments" :key="env" :label="env" :value="env"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="配置">
        <template slot-scope="{ row }">
          <el-radio-group v-model="row.collaboration_type">
            <el-radio label="new">新建</el-radio>
            <el-radio label="share">共享</el-radio>
          </el-radio-group>
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="操作">
        <template slot-scope="{ row }">
          <el-popover ref="envPopoverRef" placement="right" width="160" trigger="click">
            <div class="auth-list">
              <div class="title">
                <el-checkbox
                  :indeterminate="isIndeterminate(row, 'environment')"
                  :value="checkAll(row, 'environment')"
                  @change="handleCheckAllChange($event, row, 'environment')"
                ></el-checkbox>
                <i></i>
                所有权限
              </div>
              <el-checkbox-group v-model="row.verbs">
                <el-checkbox v-for="environment in policy.environment" :key="environment.action" :label="environment.action">
                  <i :class="[environment.icon]"></i>
                  {{environment.alias}}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </el-popover>
          <el-popover ref="recoverPopoverRef" placement="right" width="300" trigger="click">
            <div class="auth-list">
              <div class="title">回收策略</div>
              <div class="content">
                <div>
                  环境将在
                  <el-input-number v-model="row.recycleDay" size="small" :min="0"></el-input-number>天后自动回收
                </div>
                <div class="tooltip">默认设置为 0 永久不回收</div>
              </div>
            </div>
          </el-popover>
          <el-button type="primary" v-popover:envPopoverRef size="mini" plain>权限</el-button>
          <el-button
            :type="row.collaboration_type === 'share' ? '' : 'primary'"
            v-popover:recoverPopoverRef
            size="mini"
            plain
            :disabled="row.collaboration_type === 'share'"
          >回收策略</el-button>
        </template>
      </el-table-column>
      <el-table-column width="90px">
        <template slot-scope="{ $index }">
          <el-button type="primary" icon="el-icon-minus" size="mini" circle plain @click="deleteEnvironment($index)"></el-button>
          <el-button type="primary" icon="el-icon-plus" size="mini" circle plain @click="addEnvironment"></el-button>
        </template>
      </el-table-column>
      <div slot="empty">
        <el-button type="primary" icon="el-icon-plus" size="small" plain @click="addEnvironment"></el-button>
        <el-tag effect="dark">删除环境将影响参与成员操作权限</el-tag>
      </div>
    </el-table>
    <div class="bottom">
      <el-button type="primary" size="small" @click="handleCollaboration">确认生成</el-button>
    </div>
  </section>
</template>

<script>
import {
  usersAPI,
  createNewCollaborationAPI,
  queryPolicyDefinitionsAPI,
  getWorkflowsInProjectAPI,
  getCommonWorkflowListAPI,
  listProductAPI
} from '@api'
export default {
  data () {
    return {
      workflowList: [],
      envList: [],
      userList: [],
      collaborationData: {
        project_name: '',
        name: '',
        deploy_type: '',
        members: [],
        workflows: [
          {
            name: 'base-workflow2022',
            collaboration_type: 'share',
            verbs: ['get_workflow', 'edit_workflow']
          }
        ],
        products: [
          {
            name: 'dev',
            collaboration_type: 'new',
            recycleDay: 14,
            verbs: ['get_environment', 'delete_environment']
          }
        ]
      },
      policy: {
        workflow: [],
        environment: []
      }
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    },
    lastBaseWorkflows () {
      const usedWorkflows = this.collaborationData.workflows.map(
        workflow => workflow.name
      )
      return this.workflowList.filter(
        workflow => !usedWorkflows.includes(workflow)
      )
    },
    lastBaseEnvironments () {
      const usedEnvs = this.collaborationData.products.map(
        workflow => workflow.name
      )
      return this.envList.filter(env => !usedEnvs.includes(env))
    }
  },
  methods: {
    isIndeterminate (row, type) {
      return row.verbs.length > 0 && row.verbs.length < this.policy[type].length
    },
    checkAll (row, type) {
      return row.verbs.length === this.policy[type].length
    },
    handleCheckAllChange (val, row, type) {
      row.verbs = val ? this.policy[type].map(data => data.action) : []
    },
    getUsers () {
      const projectName = this.projectName
      const payload = {
        name: '',
        page: 1,
        per_page: 1000000
      }
      usersAPI(payload, projectName).then(res => {
        this.userList = _.uniqBy(res.users, 'uid')
      })
    },
    deleteWorkflow (index) {
      this.collaborationData.workflows.splice(index, 1)
    },
    addWorkflow () {
      this.collaborationData.workflows.push({
        name: '',
        collaboration_type: 'share',
        verbs: this.policy.workflow.map(data => data.action)
      })
    },
    deleteEnvironment (index) {
      this.collaborationData.products.splice(index, 1)
    },
    addEnvironment () {
      this.collaborationData.products.push({
        name: '',
        collaboration_type: 'share',
        recycleDay: 0,
        verbs: this.policy.environment.map(data => data.action)
      })
    },
    async getPolicyDefinitions () {
      const res = await queryPolicyDefinitionsAPI(
        this.projectName
      ).catch(error => console.log(error))
      if (res) {
        Object.keys(this.policy).forEach(key => {
          this.policy[key] = res
            .find(group => group.resource.toLowerCase() === key)
            .rules.filter(rule => !rule.action.startsWith('create_'))
            .map(rule => {
              return {
                ...rule,
                icon: this.selectIcon(rule.action)
              }
            })
        })
      }
    },
    selectIcon (rule) {
      const iconEnum = {
        get_: 'el-icon-view',
        edit_: 'el-icon-edit-outline',
        delete_: 'el-icon-delete',
        run_: 'el-icon-video-play',
        config_: 'el-icon-setting',
        manage_: 'el-icon-menu'
      }
      const icon = Object.keys(iconEnum).find(key => rule.startsWith(key))
      return icon ? iconEnum[icon] : ''
    },
    async getWorkflows () {
      let res = []
      res = await getWorkflowsInProjectAPI(this.projectName).catch(err => {
        console.log(err)
        return []
      })
      const workflowList = await getCommonWorkflowListAPI(
        this.projectName
      ).catch(err => {
        console.log(err)
        return []
      })
      workflowList.workflow_list.forEach(list => {
        list.type = 'common'
      })
      this.workflowList = [...res, ...workflowList.workflow_list]
        .filter(workflow => !workflow.base_name)
        .map(workflow => workflow.name)
    },
    async getEnvNameList () {
      const res = await listProductAPI(this.projectName).catch(err =>
        console.log(err)
      )
      if (res) {
        this.envList = res.filter(env => !env.base_name).map(env => env.name)
      }
    },
    handleCollaboration () {
      // const payload = {
      //   name: ''
      // }
      // createNewCollaborationAPI(this.projectName, payload).then(res => {
      //   this.$message.success(`您成功生成了一条 ${payload.name} 的协作模式！`)
      // })
      console.log('确定生成', this.collaborationData)
    }
  },
  created () {
    this.getUsers()
    this.getPolicyDefinitions()
    this.getWorkflows()
    this.getEnvNameList()
  }
}
</script>

<style lang="less" scoped>
.policy-content {
  width: 70%;
  min-width: 600px;
  padding: 10px;
  color: #8a8a8a;
  font-size: 16px;
  line-height: 22px;

  .top {
    .top-title {
      display: inline-block;
      width: 100px;
      font-size: 14px;
    }

    /deep/.el-select {
      width: calc(~'100% - 110px');
    }

    .prefix-icon {
      width: 30px;
      line-height: 30px;
    }
  }

  .level-one-title {
    padding-top: 24px;
  }

  .level-two-title {
    padding: 20px 0 16px;
    color: #434548;
    font-weight: 500;
    font-size: 14px;
  }

  /deep/.el-table {
    .el-table__empty-block {
      text-align: left;

      .el-table__empty-text {
        width: 100%;

        .el-button {
          margin-right: 10px;
        }
      }
    }
  }

  .bottom {
    margin: 20px 0;
  }

  .icon {
    font-size: 14px;
  }
}

.option-icon {
  margin-right: 3px;
}

.auth-list {
  text-align: center;

  .title {
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e4e7ed;
  }

  .content {
    .tooltip {
      margin-top: 15px;
      color: #bcbec2;
    }
  }

  .el-checkbox-group {
    .el-checkbox {
      margin-right: 0;
      margin-bottom: 15px;

      &:last-child {
        margin-bottom: 2px;
      }
    }
  }
}
</style>
