<template>
  <div class="pipeline-info">
    <div class="pipeline-info-container">
      <!--start of pipelineinfo-->
      <el-card class="box-card wide"
               :body-style="{ padding: '0px', margin: '15px 0 0 0' }">
        <div slot="header"
             class="clearfix">
          <span>基本信息</span>
        </div>
        <div class="text item">
          <el-row :gutter="0">
            <el-col :span="4">
              <div class="grid-content item-title">修改人</div>
            </el-col>
            <el-col :span="4">
              <div class="grid-content item-desc">{{pipeLineInfo.update_by}}</div>
            </el-col>
          </el-row>
          <el-row v-if="pipeLineInfo.description"
                  :gutter="0">
            <el-col :span="4">
              <div class="grid-content item-title">描述</div>
            </el-col>
            <el-col :span="8">
              <div class="grid-content item-desc">{{pipeLineInfo.description}}</div>
            </el-col>
          </el-row>
          <el-row :gutter="0">
            <el-col :span="4">
              <div class="grid-content item-title">更新时间</div>
            </el-col>
            <el-col :span="6">
              <div class="grid-content item-desc">
                {{$utils.convertTimestamp(pipeLineInfo.update_time)}}
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="0">
            <el-col :span="4">
              <div class="grid-content item-title process">包含流程</div>
            </el-col>
            <el-col :span="20">
              <div class="grid-content process">
                <ul>
                  <el-tag size="small"
                          v-if="pipeLineInfo.target!=='' && pipeLineInfo.build_module_ver!==''"
                          type="primary">构建</el-tag>
                  <el-tag size="small"
                          v-if="(typeof pipeLineInfo.buildv2)!=='undefined' && pipeLineInfo.buildv2.enabled"
                          type="primary">构建</el-tag>
                  <el-tag size="small"
                          v-if="(typeof pipeLineInfo.deploy)!=='undefined' && pipeLineInfo.deploy.enabled "
                          type="primary">部署</el-tag>
                  <el-tag size="small"
                          v-if="(typeof pipeLineInfo.testingv2)!=='undefined' && pipeLineInfo.testingv2.enabled"
                          type="primary">测试</el-tag>
                  <el-tag size="small"
                          v-if="(typeof pipeLineInfo.distribute2kodo) !=='undefined' && pipeLineInfo.distribute2kodo.enabled "
                          type="primary">存储空间分发</el-tag>
                  <el-tag size="small"
                          v-if="(typeof pipeLineInfo.release_image) !=='undefined' && pipeLineInfo.release_image.enabled "
                          type="primary">镜像分发</el-tag>
                </ul>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="0">
            <el-col :span="4">
              <div class="grid-content item-title operation">操作</div>
            </el-col>
            <el-col :span="8">
              <div class="grid-content item-desc">
                <el-tooltip v-hasPermi="{projectName: pipeLineInfo.product_name, uuid: '30001'}"
                            effect="dark"
                            content="执行"
                            placement="top">
                  <span @click="pipelineOperation('start',pipeLineInfo)"
                        class="el-icon-video-play start-build"></span>
                </el-tooltip>
                <el-tooltip v-hasPermi="{projectName: pipeLineInfo.product_name, uuid: '30002'}"
                            effect="dark"
                            content="编辑工作流"
                            placement="top">
                  <span @click="pipelineOperation('edit',pipeLineInfo)"
                        class="el-icon-edit-outline edit-pipeline"></span>
                </el-tooltip>
                <el-tooltip v-hasPermi="{projectName: pipeLineInfo.product_name, uuid: '30004'}"
                            effect="dark"
                            content="删除工作流"
                            placement="top">
                  <span @click="pipelineOperation('delete',pipeLineInfo)"
                        class="el-icon-delete edit-pipeline"></span>
                </el-tooltip>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
      <!--end of basic info-->
      <el-card class="box-card full"
               :body-style="{ padding: '0px', margin: '15px 0 30px 0' }">
        <div slot="header"
             class="clearfix">
          <span>历史任务</span>
        </div>
        <task-list :taskList="pipeLineHistory.data"
                   :total="pipeLineHistory.total"
                   :pageSize="pageSize"
                   :projectName="projectName"
                   :baseUrl="`/v1/projects/detail/${projectName}/pipelines/single/${workflowName}`"
                   :workflowName="workflowName"
                   @cloneTask="rerun"
                   @currentChange="changeTaskPage"
                   showEnv
                   showServiceNames
                   showOperation>
        </task-list>
      </el-card>
    </div>
    <service-pipelines-build :pipelineName="startBuildName"
                             @hide="hideDialog"
                             @successful="buildStarted"
                             :dialogBuildv2Visible.sync="showStartBuild"
                             :forcedUserInput="forcedUserInput"></service-pipelines-build>
  </div>
</template>

<script>
import servicePipelinesBuild from './common/service_pipelines_build/service_pipelines_build'
import { wordTranslate } from '@utils/word_translate.js'
import { deletePipelineAPI, getPipelineInfoAPI, getPipelineTaskAPI } from '@api'
import moment from 'moment'
import bus from '@utils/event_bus'
export default {
  data () {
    return {
      pipeLineHistory: {
        data: [],
        total: 0
      },
      pipeLineInfo: {
        create_time: 0,
        name: '*',
        update_by: '*',
        update_time: 0,
        description: '*'
      },
      pageSize: 50,
      startBuildName: '',
      showStartBuild: false,
      forcedUserInput: {},
      pageStart: 0,
      timerId: null,
      timeTimeoutFinishFlag: false
    }
  },
  methods: {
    async refreshHistoryTask () {
      const data = await getPipelineTaskAPI(this.pageStart, this.pageSize, this.workflowName)
      this.pipeLineHistory = data
      if (!this.timeTimeoutFinishFlag) {
        this.timerId = setTimeout(this.refreshHistoryTask, 3000)
      }
    },
    getPipelineInfo (pipelineName) {
      getPipelineInfoAPI(pipelineName).then((res) => {
        this.separateProcess(res)
      })
    },
    getPipelineTask (start, size, pipelineName) {
      getPipelineTaskAPI(start, size, pipelineName).then((res) => {
        this.pipeLineHistory = res
      })
    },
    convertTimestamp (value) {
      return moment.unix(value).format('MM-DD HH:mm')
    },
    hideDialog () {
      this.showStartBuild = false
    },
    buildStarted () {
      this.getPipelineTask(0, this.pageSize, this.workflowName)
    },
    separateProcess (pipeline) {
      for (const key in pipeline) {
        if (Object.prototype.hasOwnProperty.call(pipeline, key)) {
          this.$set(this.pipeLineInfo, key, pipeline[key])
        }
      }
      pipeline.sub_tasks.forEach(task => {
        this.pipeLineInfo[task.type] = task
        if (task.type === 'buildv2') {
          this.buildv2Info = task.job_ctx.builds
        }
      })
      delete this.pipeLineInfo.sub_tasks
    },
    pipelineOperation (operation, pipeline) {
      if (operation === 'start') {
        this.startBuildName = pipeline.name
        this.showStartBuild = true
        // fix: 可能点了clone后再点start，所以start时要清空
        this.forcedUserInput = {}
      } else if (operation === 'edit') {
        this.$router.push('/servicepipelines/edit/' + this.workflowName)
      } else if (operation === 'delete') {
        this.deletePipeline(pipeline.name)
      }
    },
    deletePipeline (pipeline_name) {
      this.$prompt('输入工作流名称确认', '删除工作流 ' + pipeline_name, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button el-button--danger',
        inputValidator: pipe_name => {
          if (pipe_name === pipeline_name) {
            return true
          } else if (pipe_name === '') {
            return '请输入工作流名称'
          } else {
            return '名称不相符'
          }
        }
      })
        .then(({ value }) => {
          this.deletePipelineReq(value)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消删除'
          })
        })
    },
    deletePipelineReq (pipeline_name) {
      deletePipelineAPI(pipeline_name).then(() => {
        this.$message.success('删除成功')
        this.$store.dispatch('refreshPipelineList').then(() => { })
        this.$router.push({
          path: '/v1/pipelines'
        })
      })
    },
    changeTaskPage (val) {
      const start = (val - 1) * this.pageSize
      this.pageStart = start
      const pipelineName = this.workflowName
      this.getPipelineTask(start, this.pageSize, pipelineName)
    },
    filterStatusTag (value, row) {
      return row.status === value
    },

    rerun (task) {
      this.startBuildName = task.task_args.pipeline_name
      this.showStartBuild = true

      const args = task.task_args
      this.forcedUserInput = {
        builds: args.builds,
        testBuilds: args.test.builds,
        env: args.deploy && args.deploy.namespace,
        testEnv: args.test && args.test.namespace,
        stcov_enabled: args.stcov_enabled
      }
    },

    wordTranslation (word, category, subitem) {
      return wordTranslate(word, category, subitem)
    }
  },
  computed: {
    workflowName () {
      return this.$route.params.workflow_name
    },
    projectName () {
      return this.$route.params.project_name
    }
  },
  mounted () {
    this.getPipelineInfo(this.workflowName)
    this.refreshHistoryTask()
    bus.$emit(`set-topbar-title`, {
      title: '',
      breadcrumb: [
        { title: '项目', url: '/v1/projects' },
        { title: this.projectName, url: `/v1/projects/detail/${this.projectName}` },
        { title: '工作流', url: `/v1/projects/detail/${this.projectName}/pipelines` },
        { title: this.workflowName, url: '' }]
    })
    bus.$emit(`set-sub-sidebar-title`, {
      title: this.projectName,
      url: `/v1/projects/detail/${this.projectName}`,
      routerList: [
        { name: '工作流', url: `/v1/projects/detail/${this.projectName}/pipelines` },
        { name: '集成环境', url: `/v1/projects/detail/${this.projectName}/envs` },
        { name: '服务', url: `/v1/projects/detail/${this.projectName}/services` },
        { name: '构建', url: `/v1/projects/detail/${this.projectName}/builds` },
        { name: '测试', url: `/v1/projects/detail/${this.projectName}/test` }]
    })
  },
  components: {
    servicePipelinesBuild
  },
  beforeDestroy () {
    this.timeTimeoutFinishFlag = true
    clearTimeout(this.timerId)
  }
}
</script>

<style lang="less">
.pipeline-info {
  overflow-y: scroll;

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

  .pipeline-info-container {
    position: relative;
    flex: 1;
    padding: 0 30px;
    overflow: auto;
    font-size: 13px;
    background-color: #fff;

    .el-breadcrumb {
      font-size: 16px;
      line-height: 1.35;

      .el-breadcrumb__item__inner a:hover,
      .el-breadcrumb__item__inner:hover {
        color: #1989fa;
        cursor: pointer;
      }
    }

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
      content: "";
    }

    .clearfix {
      span {
        color: #999;
        font-size: 16px;
        line-height: 20px;
      }

      span.count {
        color: #303133;
        font-size: 13px;
      }

      span.pass-rate {
        color: #303133;
        font-size: 13px;
      }

      span.count-daily {
        color: #303133;
        font-size: 13px;
      }
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
          font-size: 1.43rem;
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

      .task-id {
        color: #1989fa;
      }

      .process {
        line-height: 20px;

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
  }
}
</style>
