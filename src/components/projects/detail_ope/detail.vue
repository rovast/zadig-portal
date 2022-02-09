<template>
  <div
    class="projects-detail-container"
    v-loading="detailLoading"
    element-loading-text="加载中..."
    element-loading-spinner="iconfont iconfont-loading iconxiangmu"
  >
    <div class="project-header">
      <div class="header-start">
        <div class="container">
          <div class="display-mode">
            <div class="btn-container">
              <el-dropdown placement="bottom" @command="selectSystemToDownloadCLI">
                <button type="button" class="display-btn">
                  下载开发者 CLI
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item disabled>选择使用的系统</el-dropdown-item>
                  <el-dropdown-item command="mac">Mac</el-dropdown-item>
                  <el-dropdown-item command="linux">Linux</el-dropdown-item>
                  <el-dropdown-item command="windows">Windows</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <template v-if="isProjectAdmin">
                <router-link :to="`/v1/projects/edit/${projectName}`">
                  <button type="button" class="display-btn">
                    <i class="el-icon-edit-outline"></i>
                    <span class="add-filter-value-title">修改</span>
                  </button>
                </router-link>
                <button type="button" @click="deleteProject" class="display-btn">
                  <i class="el-icon-delete"></i>
                  <span class="add-filter-value-title">删除</span>
                </button>
                <router-link :to="`/v1/projects/detail/${projectName}/rbac`">
                  <button type="button" class="display-btn">
                    <i class="el-icon-lock"></i>
                    <span class="add-filter-value-title">权限</span>
                  </button>
                </router-link>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
    <section class="projects-detail">
      <div v-hasPermi="{projectName: projectName, action: 'get_environment'}" class="env">
        <h4 class="section-title">
          <i class="icon iconfont iconhuanjing"></i>
          环境信息
        </h4>
        <el-table :data="envList" stripe style="width: 100%;">
          <el-table-column label="环境名称">
            <template slot-scope="{ row }">
              <router-link :to="`/v1/projects/detail/${row.projectName}/envs/detail?envName=${row.name}`">
                <span class="env-name">{{`${row.name}`}}</span>
              </router-link>
            </template>
          </el-table-column>
          <el-table-column label="集群归属">
            <template slot-scope="{ row }">
              <span v-if="row.clusterName && row.production">{{`${row.production?'生产':'测试'}`}}</span>
              <span v-else>本地</span>
            </template>
          </el-table-column>
          <el-table-column label="当前状态">
            <template slot-scope="{ row }">
              <span v-if="row.status" :class="[$translate.calcEnvStatusColor(row.status)]">{{getProdStatus(row.status, row.updatable)}}</span>
              <span v-else>
                <i class="el-icon-loading"></i>
              </span>
            </template>
          </el-table-column>
          <el-table-column width="300" align="right" label="更新信息（时间/操作人）">
            <template slot-scope="{ row }">
              <span class="update-time">
                <i class="icon el-icon-time"></i>
                {{ $utils.convertTimestamp(row.updateTime) }}
              </span>
              <span class="update-time">
                <i class="icon el-icon-user"></i>
                {{row.updateBy}}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-hasPermi="{projectName: projectName, action: 'get_workflow'}" class="workflow">
        <h4 class="section-title">
          <i class="icon iconfont icongongzuoliucheng"></i>
          工作流信息
        </h4>
        <el-table :data="workflows" stripe style="width: 100%;">
          <el-table-column label="工作流名称">
            <template slot-scope="{ row }">
              <router-link class="pipeline-name" :to="`/v1/projects/detail/${projectName}/pipelines/multi/${row.name}`">{{row.name}}</router-link>
            </template>
          </el-table-column>
          <el-table-column label="包含步骤">
            <template slot-scope="{ row }">
              <CusTags :values="row.enabledStages.map(stage => wordTranslation(stage, 'workflowStage'))"></CusTags>
            </template>
          </el-table-column>
          <el-table-column label="当前状态">
            <template slot-scope="{ row }">
              <span
                v-if="row.recentTask"
                :class="[`status-${$utils.taskElTagType(row.recentTask.status)}`]"
              >{{ wordTranslation(row.recentTask.status,'pipeline','task')}}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column width="300" align="right" label="更新信息（时间/操作人）">
            <template slot-scope="{ row }">
              <span class="update-time">
                <i class="icon el-icon-time"></i>
                {{ $utils.convertTimestamp(row.updateTime) }}
              </span>
              <span class="update-time">
                <i class="icon el-icon-user"></i>
                {{row.updateBy}}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>
  </div>
</template>
<script>
import {
  getProjectInfoAPI,
  productEnvInfoAPI,
  queryUserBindingsAPI,
  deleteProjectAPI,
  getProductWorkflowsInProjectAPI,
  listProductAPI,
  getServiceTemplatesAPI,
  getBuildConfigsAPI,
  downloadDevelopCLIAPI
} from '@api'
import { translateEnvStatus } from '@utils/wordTranslate'
import { wordTranslate } from '@utils/wordTranslate.js'
import { whetherOnboarding } from '@utils/onboardingRoute'
import { get } from 'lodash'
import bus from '@utils/eventBus'
import store from 'storejs'
export default {
  data () {
    return {
      currentProject: {},
      envList: [],
      workflows: [],
      userBindings: [],
      detailLoading: true
    }
  },
  methods: {
    getProdStatus (status, updateble) {
      return translateEnvStatus(status, updateble)
    },
    async getWorkflows (projectName) {
      const res = await getProductWorkflowsInProjectAPI(projectName)
      if (res) {
        this.workflows = res.filter(item => item.projectName === projectName)
      }
    },
    getEnvList () {
      const projectName = this.projectName
      listProductAPI(projectName).then(res => {
        this.envList = res.map(element => {
          productEnvInfoAPI(projectName, element.name).then(res => {
            element.status = res.status
          })
          return element
        })
      })
    },
    async deleteProject () {
      const projectName = this.projectName
      const externalFlag = get(
        this.currentProject,
        'product_feature.create_env_type',
        ''
      )
      const workflows = this.workflows.map(element => {
        return element.name
      })
      const envNames = this.envList.map(element => {
        return element.name
      })
      const result = await Promise.all([
        getServiceTemplatesAPI(projectName),
        getBuildConfigsAPI(projectName)
      ])
      const services = result[0].data
        .filter(element => element.product_name === projectName)
        .map(element => {
          return element.service_name
        })
      const buildConfigs = result[1].map(element => {
        return element.name
      })
      const htmlTemplate =
        externalFlag === 'external'
          ? `
        <p>该项目下的以下资源会被取消托管，<span style="color:red">请谨慎操作！！</span></p>
        <span><b>服务：</b>${
  services.length > 0 ? services.join(', ') : '无'
}</span><br>
        <span><b>环境：</b>${
  envNames.length > 0 ? envNames.join(', ') : '无'
}</span><br>
        <p>该项目下的以下资源会同时被删除，<span style="color:red">请谨慎操作！！</span></p>
        <span><b>构建：</b>${
  buildConfigs.length > 0 ? buildConfigs.join(', ') : '无'
}</span><br>
        <span><b>工作流：</b>${
  workflows.length > 0 ? workflows.join(', ') : '无'
}</span>
      `
          : `
        该项目下的资源会同时被删除<span style="color:red">请谨慎操作！！</span><br>
        <span><b>服务：</b>${
  services.length > 0 ? services.join(', ') : '无'
}</span><br>
        <span><b>构建：</b>${
  buildConfigs.length > 0 ? buildConfigs.join(', ') : '无'
}</span><br>
        <span><b>环境：</b>${
  envNames.length > 0 ? envNames.join(', ') : '无'
}</span><br>
        <span><b>工作流：</b>${
  workflows.length > 0 ? workflows.join(', ') : '无'
}</span>
        `
      this.$prompt(htmlTemplate, `请输入项目名 ${projectName} 确认删除`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        customClass: 'product-prompt',
        confirmButtonClass: 'el-button el-button--danger',
        inputValidator: project_name => {
          if (project_name === projectName) {
            return true
          } else if (project_name === '') {
            return '请输入项目名'
          } else {
            return '项目名不相符'
          }
        }
      })
        .then(({ value }) => {
          deleteProjectAPI(projectName).then(response => {
            this.$message({
              type: 'success',
              message: '项目删除成功'
            })
            this.$router.push('/v1/projects')
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消删除'
          })
        })
    },
    wordTranslation (word, category, subitem) {
      return wordTranslate(word, category, subitem)
    },
    async getProject (projectName) {
      const userInfo = store.get('userInfo')
      const projectInfo = await getProjectInfoAPI(projectName).catch(error =>
        console.log(error)
      )
      const userBindings = await queryUserBindingsAPI(
        userInfo.uid,
        projectName
      ).catch(error => console.log(error))
      if (projectInfo && userBindings) {
        this.currentProject = projectInfo
        this.userBindings = userBindings
        if (projectInfo.onboarding_status) {
          this.$router.push(whetherOnboarding(projectInfo))
        }
        bus.$emit('set-sub-sidebar-title', {
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
            {
              name: '构建',
              url: `/v1/projects/detail/${this.projectName}/builds`
            },
            {
              name: '测试',
              url: `/v1/projects/detail/${this.projectName}/test`
            }
          ]
        })
        this.detailLoading = false
      }
    },
    selectSystemToDownloadCLI (check) {
      downloadDevelopCLIAPI(check).then(res => {
        const aEle = document.createElement('a')
        if (aEle.download !== undefined) {
          aEle.setAttribute('href', res)
          aEle.setAttribute('download', true)
          document.body.appendChild(aEle)
          aEle.click()
          document.body.removeChild(aEle)
        }
      })
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    },
    isProjectAdmin () {
      if (this.$utils.roleCheck('admin')) {
        return true
      } else if (this.userBindings.length > 0) {
        return this.userBindings.some(item => item.role === 'project-admin')
      } else {
        return false
      }
    }
  },
  mounted () {
    this.getProject(this.projectName)
    this.getWorkflows(this.projectName)
    this.getEnvList()
    bus.$emit('show-sidebar', true)
    bus.$emit('set-topbar-title', {
      title: '',
      breadcrumb: [
        { title: '项目', url: '/v1/projects' },
        { title: this.projectName, url: '' }
      ]
    })
    bus.$emit('set-sub-sidebar-title', {
      title: '',
      routerList: []
    })
  }
}
</script>

<style lang="less" scoped>
@titleColor: #44447e;

.projects-detail-container {
  position: relative;
  overflow: auto;
  background-color: #f5f7f7;

  .project-header {
    display: flex;
    align-items: stretch;
    justify-content: flex-start;

    .header-start {
      flex: 1;

      .container {
        min-height: 40px;
        margin: 0;
        padding: 5px 20px 0 20px;
        font-size: 13px;

        .display-mode {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          justify-content: flex-end;
          min-height: 46px;

          .btn-container {
            position: relative;
            height: 44px;
            margin-top: 1px;
            margin-right: 5px;

            .display-btn {
              padding: 13px 17px;
              color: @themeColor;
              font-size: 13px;
              text-decoration: none;
              background-color: #fff;
              border: none;
              border-color: #fff;
              border-style: none;
              border-radius: 2px;
              box-shadow: 0 4px 4px rgba(0, 0, 0, 0.05);
              cursor: pointer;

              &:hover {
                color: @themeColor;
                background-color: #fff;
                border-color: @themeColor;
              }

              &.active {
                color: #fff;
                background-color: @themeColor;
                border-color: @themeColor;
              }
            }
          }
        }
      }
    }

    .header-end {
      .add-project-btn {
        width: 165px;
        height: 100%;
        padding: 10px 17px;
        color: #fff;
        font-size: 13px;
        text-decoration: none;
        background-color: @themeColor;
        border: 1px solid @themeColor;
        cursor: pointer;
      }
    }
  }

  .projects-detail {
    padding: 0 20px 50px 20px;

    .env,
    .workflow {
      margin-bottom: 32px;
    }

    .section-title {
      margin: 0 0 16px;
      color: @titleColor;
      font-weight: 300;
      font-size: 18px;
      line-height: 22px;

      .icon {
        margin-right: 8px;
      }
    }

    /deep/.el-table {
      border-radius: 6px;

      th.el-table__cell {
        padding: 5px 0;
      }

      .pipeline-name,
      .env-name {
        color: @themeColor;
      }
    }

    .update-time {
      display: inline-block;

      &:not(:last-child) {
        margin-right: 20px;
      }

      .icon {
        margin-right: 5px;
      }
    }
  }
}
</style>
