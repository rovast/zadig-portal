<template>
  <div class="cooperation-container">
    <el-alert type="warning" :closable="false" title="管理项目各个角色协作过程中使用功能模块和权限"></el-alert>
    <el-tabs type="card" v-model="activeName">
      <el-tab-pane v-for="mode in allCollaboration" :key="mode.initName" :name="mode.initName">
        <span slot="label" class="policy-title">
          <el-input v-model="mode.name" placeholder="协作模式名称" size="small"></el-input>
          <i class="el-icon-delete icon" @click.stop="deleteMode(mode.initName)"></i>
        </span>
      </el-tab-pane>
      <el-tab-pane disabled>
        <span slot="label" class="policy-title">
          <i class="el-icon-circle-plus add-icon" @click="addMode"></i>
        </span>
      </el-tab-pane>
    </el-tabs>
    <Policy
      ref="policyRef"
      :userList="userList"
      :workflowList="workflowList"
      :envList="envList"
      :policy="policy"
      :collaborationData="currentCollaboration"
      :deleteMode="deleteMode"
      :updateActiveName="updateActiveName"
    ></Policy>
  </div>
</template>

<script>
import Policy from './policy.vue'
import bus from '@utils/eventBus'
import { cloneDeep } from 'lodash'
import {
  usersAPI,
  queryPolicyDefinitionsAPI,
  getProductWorkflowsInProjectAPI,
  getCommonWorkflowListInProjectAPI,
  listProductAPI,
  getAllCollaborationAPI
} from '@api'
const collaborationInfo = {
  project_name: '',
  name: '',
  deploy_type: '',
  members: [],
  workflows: [], // name, collaboration_type, verbs=[]
  products: [] // name, collaboration_type, recycleDay, verbs=[]
}
export default {
  data () {
    return {
      userList: [],
      workflowList: [],
      envList: [],
      policy: {
        workflow: [],
        environment: []
      },
      allCollaboration: [],
      activeName: ''
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    },
    deployType () {
      return this.$store.getters.projectList.find(
        project => project.name === this.projectName
      ).deployType
    },
    currentCollaboration () {
      const res = this.allCollaboration.find(
        collaboration => collaboration.initName === this.activeName
      ) || {
        ...cloneDeep(collaborationInfo),
        initName: ''
      }
      console.log('computed', this.activeName, res)
      return res
    }
  },
  methods: {
    updateActiveName (name) {
      this.activeName = name
    },
    deleteMode (initName) {
      const index = this.allCollaboration.findIndex(
        collaboration => collaboration.initName === initName
      )
      const collaboration = this.allCollaboration[index]
      // the collaboration is not saved
      if (!collaboration.initCollaboration) {
        this.allCollaboration.splice(index, 1)
        if (collaboration.initName === this.activeName) {
          if (this.allCollaboration.length) {
            this.activeName = this.allCollaboration[0].initName
          } else {
            this.addMode()
          }
        }
      } else {
        this.activeName = collaboration.initName
        this.$refs.policyRef.checkDifferent(
          null,
          collaboration.initCollaboration
        )
      }
    },
    addMode () {
      if (!this.allCollaboration.lastLength) {
        this.allCollaboration.lastLength = this.allCollaboration.length - 1
      }
      this.allCollaboration.lastLength++
      const initName = `zadig-add-mode-${this.allCollaboration.lastLength}`
      this.allCollaboration.push({
        ...cloneDeep(collaborationInfo),
        project_name: this.projectName,
        deploy_type: this.deployType,
        initName
      })
      this.activeName = initName
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
      res = await getProductWorkflowsInProjectAPI(this.projectName).catch(err => {
        console.log(err)
        return []
      })
      const workflowList = await getCommonWorkflowListInProjectAPI(
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
    async getAllCollaboration () {
      const res = await getAllCollaborationAPI(this.projectName).catch(err =>
        console.log(err)
      )
      if (res) {
        this.allCollaboration = res.collaborations.map(col => {
          return {
            ...col,
            initName: col.name,
            initCollaboration: cloneDeep(col)
          }
        })
        if (!this.allCollaboration.length) {
          this.addMode()
        } else {
          this.activeName = this.allCollaboration[0].initName
        }
      }
    }
  },
  components: {
    Policy
  },
  created () {
    this.getUsers()
    this.getPolicyDefinitions()
    this.getWorkflows()
    this.getEnvNameList()
    this.getAllCollaboration()
    bus.$emit(`set-topbar-title`, {
      title: '',
      breadcrumb: [
        { title: '项目', url: '/v1/projects' },
        {
          title: this.projectName,
          url: `/v1/projects/detail/${this.projectName}`
        },
        { title: '协作模式', url: '' }
      ]
    })
    bus.$emit(`set-sub-sidebar-title`, {
      title: this.projectName,
      url: `/v1/projects/detail/${this.projectName}`,
      routerList: [
        {
          name: '工作流',
          url: `/v1/projects/detail/${this.projectName}/pipelines`
        },
        {
          name: '集成环境',
          url: `/v1/projects/detail/${this.projectName}/envs`
        },
        {
          name: '服务',
          url: `/v1/projects/detail/${this.projectName}/services`
        },
        { name: '构建', url: `/v1/projects/detail/${this.projectName}/builds` },
        { name: '测试', url: `/v1/projects/detail/${this.projectName}/test` }
      ]
    })
  }
}
</script>

<style lang="less" scoped>
.cooperation-container {
  padding: 15px 20px;

  /deep/.el-tabs {
    margin-top: 10px;

    .el-tabs__item {
      padding: 0 10px;

      &:last-child {
        padding: 0 15px;
      }

      .policy-title {
        display: inline-flex;
        align-items: center;
        justify-content: space-between;

        .el-input {
          width: calc(~'100% - 25px');
        }

        .icon {
          font-size: 16px;
        }

        .add-icon {
          position: relative;
          top: 7px;
          color: #409eff;
          font-size: 26px;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
