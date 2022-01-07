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
          <el-select v-model="row.name" placeholder="请选择基准工作流" clearable filterable size="small">
            <el-option v-for="workflow in workflowList" :key="workflow.value" :label="workflow.label" :value="workflow.value"></el-option>
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
          <el-popover ref="workflowPopoverRef" placement="top-start" width="200" trigger="click">
            <div>
              <div class="title">
                <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange"></el-checkbox>
                <i></i>
                所有权限
              </div>
              <el-checkbox-group v-model="row.verbs" @change="handleCheckedCitiesChange">
                <el-checkbox v-for="workflow in policy.workflow" :key="workflow.action" :label="workflow.action">
                  <i :class="[workflow.icon]"></i> {{workflow.alias}}
                </el-checkbox>
                <el-checkbox label="add">
                  <i class="iconfont iconinformation_add icon"></i> 新建
                </el-checkbox>
                <el-checkbox label="delete">
                  <i class="el-icon-delete"></i> 删除
                </el-checkbox>
                <el-checkbox label="edit">
                  <i class="el-icon-edit-outline"></i> 编辑
                </el-checkbox>
                <el-checkbox label="look">
                  <i class="el-icon-view"></i> 查看
                </el-checkbox>
                <el-checkbox label="run">
                  <i class="el-icon-video-play"></i> 执行
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
          <el-select v-model="row.name" placeholder="请选择基准环境" clearable filterable size="small">
            <el-option v-for="env in envList" :key="env.value" :label="env.label" :value="env.value"></el-option>
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
        <template slot-scope="{  }">
          <el-button type="primary" size="mini" plain>权限</el-button>
          <el-button type="primary" size="mini" plain>回收策略</el-button>
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
  queryPolicyDefinitionsAPI
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
    }
  },
  methods: {
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
        verbs: []
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
        verbs: []
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
        })
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
</style>
