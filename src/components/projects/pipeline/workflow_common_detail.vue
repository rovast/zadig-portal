<template>
  <div class="common-workflow-detail">
    <el-card class="box-card wide" :body-style="{ padding: '0px', margin: '15px 0 0 0' }">
      <div slot="header" class="block-title">基本信息</div>
      <div class="text item">
        <!-- <el-row :gutter="0">
          <el-col :span="4">
            <div class="grid-content item-title">
              <i class="el-icon-user-solid"></i> 修改人
            </div>
          </el-col>
          <el-col :span="4">
            <div class="grid-content item-desc">{{ workflow.update_by }}</div>
          </el-col>
        </el-row> -->
        <el-row v-if="workflow.description" :gutter="0">
          <el-col :span="4">
            <div class="grid-content item-title">
              <i class="el-icon-chat-line-square"></i> 描述
            </div>
          </el-col>
          <el-col :span="8">
            <div class="grid-content item-desc">{{ workflow.description }}</div>
          </el-col>
        </el-row>
        <!-- <el-row :gutter="0">
          <el-col :span="4">
            <div class="grid-content item-title">
              <i class="el-icon-time"></i> 更新时间
            </div>
          </el-col>
          <el-col :span="6">
            <div class="grid-content item-desc">{{ $utils.convertTimestamp(workflow.update_time) }}</div>
          </el-col>
        </el-row> -->
        <el-row :gutter="0">
          <el-col :span="4">
            <div class="grid-content item-title process">
              <i class="el-icon-finished"></i> 流程
            </div>
          </el-col>
          <el-col :span="20">
            <div class="grid-content process">
              <ul>
                <span v-if="checkStage('buildv3')">
                  <el-tag size="small">构建</el-tag>
                </span>
                <span v-if="checkStage('trigger')">
                  <el-tag size="small">扩展</el-tag>
                </span>
              </ul>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="0">
          <el-col :span="4">
            <div class="grid-content item-title operation">
              <i class="el-icon-s-operation"></i> 操作
            </div>
          </el-col>
          <el-col :span="8">
            <div class="grid-content item-desc">
              <el-tooltip effect="dark" content="执行" placement="top">
                <i @click="startTask" class="el-icon-video-play start-build"></i>
              </el-tooltip>
              <template>
                <el-tooltip effect="dark" content="编辑工作流" placement="top">
                  <router-link :to="`/workflows/common/edit/${workflowName}?projectName=${projectName}&id=${workflowID}`" class="not-anchor">
                    <i class="el-icon-edit-outline edit-pipeline"></i>
                  </router-link>
                </el-tooltip>
                <el-tooltip effect="dark" content="删除工作流" placement="top">
                  <i @click="removeWorkflow" class="el-icon-delete edit-pipeline"></i>
                </el-tooltip>
              </template>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-card class="box-card full" :body-style="{ padding: '0px', margin: '15px 0 30px 0' }">
      <div slot="header" class="block-title">历史任务</div>
      <TaskList
        :taskList="workflowTasks"
        :total="total"
        :pageSize="pageSize"
        :projectName="projectName"
        :baseUrl="`/v1/projects/detail/${projectName}/pipelines/common/${workflowName}`"
        :workflowName="workflowName"
        :workflowID="workflowID"
        @currentChange="changeTaskPage"
      ></TaskList>
    </el-card>

    <el-dialog :visible.sync="taskDialogVisible" title="运行 通用-工作流" custom-class="run-workflow" width="60%" class="dialog">
      <RunCommonWorkflow :value="taskDialogVisible" :workflow="commonToRun"></RunCommonWorkflow>
    </el-dialog>
  </div>
</template>

<script>
import {
  getCommonWorkflowAPI,
  deleteCommonWorkflowAPI,
  getCommonWorkflowTasksAPI
} from '@api'
import TaskList from '@/components/projects/common/task_list.vue'
import RunCommonWorkflow from './common/runCommonWorkflow.vue'
import bus from '@utils/eventBus'
export default {
  data () {
    return {
      workflow: {},
      workflowTasks: [],
      total: 0,
      pageSize: 50,
      taskDialogVisible: false,
      durationSet: {},
      pageStart: 0,
      timerId: null,
      timeTimeoutFinishFlag: false,
      commonToRun: {}
    }
  },
  computed: {
    workflowName () {
      return this.$route.params.workflow_name
    },
    workflowID () {
      return this.$route.query.id
    },
    projectName () {
      return this.$route.params.project_name
    }
  },
  methods: {
    async autoRefreshHistoryTask () {
      const projectName = this.$route.params.project_name
      const workflowName = this.$route.params.workflow_name
      const pageStart = this.pageStart
      const pageSize = this.pageSize
      const res = await getCommonWorkflowTasksAPI(
        projectName,
        workflowName,
        pageStart,
        pageSize
      )
      this.workflowTasks = res.data
      this.total = res.total
      if (!this.timeTimeoutFinishFlag) {
        this.timerId = setTimeout(this.autoRefreshHistoryTask, 3000) // Keep only one timer
      }
    },
    getCommonWorkflowTasks (start, max) {
      const projectName = this.projectName
      const workflowName = this.workflowName
      getCommonWorkflowTasksAPI(projectName, workflowName, start, max).then(
        res => {
          this.workflowTasks = res.data
          this.total = res.total
        }
      )
      this.workflowTasks = res.data
      this.total = res.total
    },
    changeTaskPage (val) {
      const start = (val - 1) * this.pageSize
      this.pageStart = start
      this.getCommonWorkflowTasks(start, this.pageSize)
    },
    startTask () {
      this.taskDialogVisible = true
      this.forcedUserInput = {}
      this.commonToRun = {
        project_name: this.projectName,
        id: this.workflowID
      }
    },
    removeWorkflow () {
      const workflowName = this.workflowName
      const workflowID = this.workflowID
      const projectName = this.projectName
      this.$prompt('输入工作流名称确认', '删除工作流 ' + workflowName, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button el-button--danger',
        inputValidator: input => {
          if (input === workflowName) {
            return true
          } else if (input === '') {
            return '请输入工作流名称'
          } else {
            return '名称不相符'
          }
        }
      }).then(({ value }) => {
        deleteCommonWorkflowAPI(projectName, workflowID).then(() => {
          this.$message.success('删除成功')
          this.$router.push(`/v1/projects/detail/${this.projectName}/pipelines`)
        })
      })
    },
    rerun (task) {
      this.taskDialogVisible = true
      this.forcedUserInput = task.workflow_args
    },
    checkStage (stage) {
      if (stage && this.workflow.sub_tasks) {
        const result = this.workflow.sub_tasks.find(item => {
          return item.type === stage
        })
        if (result) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    }
  },
  beforeDestroy () {
    this.timeTimeoutFinishFlag = true
    clearTimeout(this.timerId)
  },
  mounted () {
    const projectName = this.projectName
    const workflowID = this.workflowID
    const workflowName = this.workflowName
    getCommonWorkflowAPI(projectName, workflowID).then(res => {
      this.workflow = res
    })
    this.autoRefreshHistoryTask()
    bus.$emit('set-topbar-title', {
      title: '',
      breadcrumb: [
        { title: '项目', url: '/v1/projects' },
        {
          title: projectName,
          url: `/v1/projects/detail/${projectName}`
        },
        {
          title: '工作流',
          url: `/v1/projects/detail/${projectName}/pipelines`
        },
        { title: workflowName, url: '' }
      ]
    })
    bus.$emit('set-sub-sidebar-title', {
      title: projectName,
      url: `/v1/projects/detail/${projectName}`,
      routerList: [
        {
          name: '工作流',
          url: `/v1/projects/detail/${projectName}/pipelines`
        },
        {
          name: '集成环境',
          url: `/v1/projects/detail/${projectName}/envs`
        },
        {
          name: '服务',
          url: `/v1/projects/detail/${projectName}/services`
        },
        { name: '构建', url: `/v1/projects/detail/${projectName}/builds` },
        { name: '测试', url: `/v1/projects/detail/${projectName}/test` }
      ]
    })
  },
  components: {
    RunCommonWorkflow,
    TaskList
  }
}
</script>

<style lang="less">
.common-workflow-detail {
  position: relative;
  flex: 1;
  padding: 0 30px;
  overflow: auto;
  font-size: 13px;
  background-color: #fff;

  .text {
    font-size: 13px;
  }

  .item {
    padding: 10px 0;
    padding-left: 1px;

    .icon-color {
      color: #9ea3a9;
      cursor: pointer;

      &:hover {
        color: #1989fa;
      }
    }

    .icon-color-cancel {
      color: #ff4949;
      cursor: pointer;
    }
  }

  .clearfix::before,
  .clearfix::after {
    display: table;
    content: '';
  }

  .block-title {
    color: #999;
    font-size: 16px;
    line-height: 20px;
  }

  .clearfix::after {
    clear: both;
  }

  .box-card {
    width: 600px;
    background-color: #fff;

    .item-title {
      color: #8d9199;
    }

    .operation {
      line-height: 18px;
    }

    .item-desc {
      .start-build,
      .edit-pipeline {
        margin-right: 0.3em;
        font-size: 1.3rem;
        cursor: pointer;

        &:hover {
          color: #1989fa;
        }
      }

      .favorite {
        display: inline-block;
        color: #69696bb3;
        cursor: pointer;

        &.liked {
          color: #f4e118;
        }

        &:hover {
          color: #f4e118;
        }
      }
    }

    .task-id,
    .report-link {
      color: #1989fa;
    }

    .process {
      line-height: 24px;

      ul {
        margin: 0;
        padding: 0;
        line-height: 1;

        li {
          display: inline-block;
          line-height: 24px;
          list-style: none;
          cursor: pointer;
        }

        .step-arrow {
          color: #409eff;
        }
      }

      .dot {
        width: 12px;
        height: 12px;
        vertical-align: middle;
        background: #d1d9e5;
        border-radius: 50%;
      }

      .active {
        background-color: #1989fa;
      }

      .build {
        background-color: #fa4c7e;
      }

      .deploy {
        background-color: #fdd243;
      }

      .test {
        background-color: #78da59;
      }

      .distribution {
        background-color: #166cd6;
      }
    }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 20px;
    }
  }

  .box-card,
  .box-card-stack {
    margin-top: 15px;
    border: none;
    box-shadow: none;
  }

  .wide {
    width: 65%;
  }

  .full {
    width: 100%;
  }

  .el-card__header {
    padding-left: 0;
  }

  .el-row {
    margin-bottom: 15px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .pipeline-edit {
    .el-dialog__body {
      padding: 15px 20px;

      .el-form {
        .el-form-item {
          margin-bottom: 15px;
        }
      }
    }
  }

  .fileTree-dialog {
    .el-dialog__body {
      padding: 0 5px;
    }
  }

  .buildv2-edit-form {
    .el-form-item__label {
      padding: 0;
      font-size: 13px;
      line-height: 25px;
    }
  }

  .not-anchor {
    color: unset;
  }

  .run-workflow {
    .el-dialog__body {
      padding: 8px 10px;
      color: #606266;
      font-size: 14px;
    }
  }
}
</style>
