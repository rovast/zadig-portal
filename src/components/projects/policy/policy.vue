<template>
  <section class="policy-content">
    <el-form ref="policyFormRef" :rules="rules" :model="collaborationData" label-width="120px" label-position="left">
      <div class="top">
        <el-form-item label="选择参与成员" prop="members">
          <el-select
            v-model="collaborationData.members"
            placeholder="搜寻或邀请（默认为全部用户）"
            multiple
            clearable
            filterable
            collapse-tags
            size="small"
          >
            <template slot="prefix">
              <i class="el-icon-search prefix-icon"></i>
            </template>
            <el-option label="all-users" value="*">
              <span>all-users(所有用户包括新建用户)</span>
            </el-option>
            <el-option v-for="user in userList" :key="user.uid" :label="user.name" :value="user.uid">
              <i class="iconfont iconsystem option-icon"></i>
              {{user.name}} ({{user.account}})
            </el-option>
          </el-select>
        </el-form-item>
      </div>

      <div class="primary-title">配置协作规则</div>

      <div class="secondary-title">工作流</div>
      <el-table :data="collaborationData.workflows" style="width: 100%;">
        <el-table-column label="基准工作流">
          <template slot-scope="{ row, $index }">
            <el-form-item class="base-item" :prop="`workflows[${$index}].name`" label-width="0px" required>
              <el-select v-model="row.name" placeholder="请选择基准工作流" filterable size="small" :disabled="!!row.name">
                <el-option v-for="workflow in lastBaseWorkflows" :key="workflow" :label="workflow" :value="workflow"></el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column label="配置">
          <template slot-scope="{ row }">
            <el-radio-group v-model="row.collaboration_type">
              <el-tooltip effect="dark" content="成员基于此基准工作流新建一个工作流" placement="top">
                <el-radio label="new">新建</el-radio>
              </el-tooltip>
              <el-tooltip effect="dark" content="成员共享一个基准工作流" placement="top">
                <el-radio label="share">共享</el-radio>
              </el-tooltip>
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

      <div class="secondary-title">集成环境</div>
      <el-table :data="collaborationData.products" style="width: 100%;">
        <el-table-column label="基准环境">
          <template slot-scope="{ row, $index }">
            <el-form-item class="base-item" :prop="`products[${$index}].name`" label-width="0px" required>
              <el-select v-model="row.name" placeholder="请选择基准环境" filterable size="small" :disabled="!!row.name">
                <el-option v-for="env in lastBaseEnvironments" :key="env" :label="env" :value="env"></el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column label="配置">
          <template slot-scope="{ row }">
            <el-radio-group v-model="row.collaboration_type">
              <el-tooltip effect="dark" content="成员基于此基准环境新建一个环境" placement="top">
                <el-radio label="new">新建</el-radio>
              </el-tooltip>
              <el-tooltip effect="dark" content="成员共享一个基准环境" placement="top">
                <el-radio label="share">共享</el-radio>
              </el-tooltip>
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
              <el-button type="primary" slot="reference" size="mini" plain style="margin-right: 10px;">权限</el-button>
            </el-popover>
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

      <div class="recycle-resources">
        <span class="primary-title recycle-title">
          资源回收策略
          <el-tooltip effect="dark" content="如果成员在一段时间内（配置的资源回收时间）没有访问项目，那么该成员的资源将会被回收，默认 0 天表示不回收。成员重新访问项目将会再次获得资源。" placement="top">
            <i class="el-icon-question"></i>
          </el-tooltip>
        </span>
        <el-input-number v-model="collaborationData.recycle_day" size="small" :min="0"></el-input-number>天
      </div>
    </el-form>
    <div class="bottom">
      <el-button type="primary" @click="handleCollaboration">确认生成</el-button>
    </div>
    <PolicyDialog
      :changedInfo="changedInfo"
      :visible.sync="visible"
      :policyMap="policyMap"
      :collaborationData="collaborationData"
      :mode="mode"
      :deleteMode="deleteMode"
      :updateActiveName="updateActiveName"
    ></PolicyDialog>
  </section>
</template>

<script>
import { difference, intersection, cloneDeep } from 'lodash'
import PolicyDialog from './policyDialog.vue'
export default {
  props: {
    userList: Array,
    workflowList: Array,
    envList: Array,
    policy: Object,
    collaborationData: Object,
    deleteMode: Function,
    updateActiveName: Function
  },
  data () {
    this.rules = {
      members: {
        required: true,
        type: 'array',
        message: '请选择参与成员',
        trigger: 'blur'
      }
    }
    return {
      changedInfo: {},
      visible: false,
      mode: ''
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
    },
    policyMap () {
      const policy = this.policy
      const workflow = {}
      const environment = {}
      policy.workflow.forEach(work => {
        workflow[work.action] = work.alias
      })
      policy.environment.forEach(env => {
        environment[env.action] = env.alias
      })
      return {
        workflow,
        environment
      }
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

    deleteWorkflow (index) {
      this.collaborationData.workflows.splice(index, 1)
    },
    addWorkflow () {
      this.validate().then(res => {
        this.collaborationData.workflows.push({
          name: '',
          collaboration_type: 'share',
          verbs: this.policy.workflow.map(data => data.action)
        })
      })
    },
    deleteEnvironment (index) {
      this.collaborationData.products.splice(index, 1)
    },
    addEnvironment () {
      this.validate().then(res => {
        this.collaborationData.products.push({
          name: '',
          collaboration_type: 'share',
          recycle_day: 0,
          verbs: this.policy.environment.map(data => data.action)
        })
      })
    },
    handleCollaboration () {
      if (!this.collaborationData.name) {
        this.$message({
          type: 'error',
          message: '请输入协作模式的名称!'
        })
        return
      }
      this.validate().then(() => {
        const data = this.collaborationData
        if (!data.workflows.length && !data.products.length) {
          this.$message({
            type: 'info',
            message: '请选择将要赋予用户的权限!'
          })
          return
        }
        this.checkDifferent(data, data.initCollaboration)
      })
    },
    validate () {
      return this.$refs.policyFormRef.validate()
    },
    checkDifferent (current, initial) {
      this.changedInfo = {}
      let changedInfo = {} //  added: {}, deleted: {}, updated: {}

      const allUsers = this.userList.map(user => user.uid)
      const isAllMemberCurr = current ? current.members.includes('*') : false
      const isAllMemberInit = initial ? initial.members.includes('*') : false

      if (!initial) {
        this.changedInfo = {
          added: {
            members: isAllMemberCurr
              ? this.userList.map(user => user.name)
              : this.transformUidToName(current.members),
            workflows: cloneDeep(current.workflows),
            products: cloneDeep(current.products)
          }
        }
        this.mode = 'added'
      } else if (!current) {
        this.changedInfo = {
          deleted: {
            members: isAllMemberInit
              ? this.userList.map(user => user.name)
              : this.transformUidToName(initial.members),
            workflows: cloneDeep(initial.workflows),
            products: cloneDeep(initial.products)
          }
        }
        this.mode = 'deleted'
      } else {
        // different user
        if (isAllMemberCurr && isAllMemberInit) {
          changedInfo = {
            updated: {
              members: this.userList.map(user => user.name)
            }
          }
        } else if (isAllMemberCurr) {
          changedInfo = {
            added: {
              members: this.transformUidToName(
                difference(allUsers, initial.members)
              )
            },
            updated: {
              members: intersection(allUsers, initial.members)
            }
          }
        } else if (isAllMemberInit) {
          changedInfo = {
            deleted: {
              members: this.transformUidToName(
                difference(allUsers, current.members)
              )
            },
            updated: {
              members: intersection(allUsers, current.members)
            }
          }
        } else {
          const members = this.getArraySet(initial.members, current.members)
          if (members.left.length) {
            changedInfo.deleted = {}
            changedInfo.deleted.members = this.transformUidToName(members.left)
          }
          if (members.right.length) {
            changedInfo.added = {}
            changedInfo.added.members = this.transformUidToName(members.right)
          }
          changedInfo = {
            ...changedInfo,
            updated: {
              members: this.transformUidToName(members.intersection)
            }
          }
        }
        // different workflow and product
        if (changedInfo.added) {
          changedInfo.added.workflows = cloneDeep(current.workflows)
          changedInfo.added.products = cloneDeep(current.products)
        }
        if (changedInfo.deleted) {
          changedInfo.deleted.workflows = cloneDeep(initial.workflows)
          changedInfo.deleted.products = cloneDeep(initial.products)
        }
        if (changedInfo.updated) {
          const workflows = this.getArraySet(
            initial.workflows,
            current.workflows,
            'name'
          )
          const products = this.getArraySet(
            initial.products,
            current.products,
            'name'
          )
          if (workflows.length || products.length) {
            changedInfo.updated.workflows = workflows.all
            changedInfo.updated.products = products.all
          } else {
            delete changedInfo.updated
          }
        }
        this.mode = 'updated'
        this.changedInfo = changedInfo
      }
      if (
        Object.keys(this.changedInfo).length ||
        current.name !== current.initName
      ) {
        this.visible = true
      } else {
        this.$message.info('协作模式信息无变动！')
      }
    },
    transformUidToName (userIds) {
      if (!userIds.length) {
        return []
      }
      return this.userList
        .filter(user => userIds.includes(user.uid))
        .map(user => user.name)
    },
    getArraySet (arr1, arr2, key = '') {
      const a1 = cloneDeep(arr1)
      const a2 = cloneDeep(arr2)
      const res = {
        intersection: [],
        left: [],
        right: [],
        all: [],
        length: 0
      }
      a1.forEach(data => {
        const d = data[key] || data
        const id = a2.findIndex(data => (data[key] || data) === d)
        if (id !== -1) {
          const del = a2.splice(id, 1)[0]
          if (key) {
            let updated = false
            Object.keys(del).forEach(k => {
              if (
                (Array.isArray(del[k]) && del[k].length !== data[k].length) ||
                (!Array.isArray(del[k]) && del[k] !== data[k])
              ) {
                updated = true
              }
            })
            if (updated) {
              res.intersection.push({ ...del, type: 'updated' })
            }
          } else {
            res.intersection.push(del)
          }
        } else {
          res.left.push(key ? { ...data, type: 'deleted' } : data)
        }
      })
      res.right = key
        ? a2.map(a => {
          return { ...a, type: 'added' }
        })
        : a2
      res.length = res.intersection.length + res.left.length + res.right.length
      res.all = [].concat(res.intersection, res.left, res.right)
      return res
    }
  },
  components: {
    PolicyDialog
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

  .primary-title,
  .secondary-title {
    margin: 24px 0 14px;
    font-weight: 300;
    font-size: 14px;
    line-height: 24px;
  }

  .primary-title {
    color: #000;
  }

  .secondary-title {
    color: #8a8a8a;
  }

  .top {
    /deep/.el-select {
      width: calc(~'100% - 110px');
    }

    .prefix-icon {
      width: 30px;
      line-height: 30px;
    }
  }

  /deep/.el-form {
    .base-item {
      margin-bottom: 0;
    }
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

  .recycle-resources {
    .recycle-title {
      display: inline-block;
      width: 120px;
    }
  }

  .bottom {
    margin: 26px 0 16px;
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
