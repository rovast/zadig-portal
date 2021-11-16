<template>
  <div class="task-detail-container" ref="task-detail-container">
    <!--start of taskinfo-->
    <el-card class="box-card" :body-style="{ padding: '0px', margin: '15px 0 0 0' }">
      <div slot="header" class="clearfix">
        <span>基本信息</span>
      </div>
      <div class="text item">
        <el-row>
          <el-col :span="6">
            <div class="bg-purple">
              <el-row :gutter="0">
                <el-col :span="5">
                  <div class="status item-title">状态</div>
                </el-col>
                <el-col :span="4">
                  <div class>
                    <el-tag :type="statusTag(taskDetail.status)" size="small" close-transition>{{myTranslate(taskDetail.status)}}</el-tag>
                  </div>
                </el-col>
              </el-row>
              <el-row :gutter="0">
                <el-col :span="5">
                  <div class="item-title">创建者</div>
                </el-col>
                <el-col :span="4">
                  <div class="item-desc">{{taskDetail.task_creator}}</div>
                </el-col>
              </el-row>
              <el-row v-if="taskDetail.task_revoker" :gutter="0">
                <el-col :span="5">
                  <div class="item-title">取消者</div>
                </el-col>
                <el-col :span="4">
                  <div class="item-desc">{{taskDetail.task_revoker}}</div>
                </el-col>
              </el-row>
              <el-row v-if="!$utils.isEmpty(taskDetail.deploy) && taskDetail.deploy.enabled" :gutter="0">
                <el-col :span="5">
                  <div class="item-title">部署环境</div>
                </el-col>
                <el-col :span="19">
                  <div class="item-desc">{{taskDetail.deploy.namespace}}</div>
                </el-col>
              </el-row>
              <el-row :gutter="0">
                <el-col :span="5">
                  <div class="item-title">持续时间</div>
                </el-col>
                <el-col :span="4">
                  <div v-if="taskDetail.status!=='running'" class="item-desc">
                    {{ $utils.timeFormat(taskDetail.end_time -
                    taskDetail.start_time) }}
                  </div>
                  <div v-else class="item-desc">
                    {{
                    taskDuration(taskDetail.task_id,taskDetail.start_time) +
                    $utils.timeFormat(durationSet[taskDetail.task_id])}}
                    <el-tooltip v-if="durationSet[taskDetail.task_id]<0" content="本地系统时间和服务端可能存在不一致，请同步。" placement="top">
                      <i class="el-icon-warning" style="color: red;"></i>
                    </el-tooltip>
                  </div>
                </el-col>
              </el-row>
              <el-row v-if="showOperation()" :gutter="0">
                <el-col :span="5">
                  <div class="item-title operation">操作</div>
                </el-col>
                <el-col :span="10">
                  <div v-hasPermi="{projectName: taskDetail.product_name, uuid: '30001'}" class="item-desc">
                    <el-tooltip
                      v-if="taskDetail.status!=='running' && taskDetail.status!=='passed'"
                      effect="dark"
                      content="失败重试"
                      placement="top"
                    >
                      <span @click="taskOperation('restart',taskDetail.task_id,taskDetail.pipeline_name)" class="start-build">失败重试</span>
                    </el-tooltip>
                    <el-tooltip v-if="taskDetail.status==='running'" effect="dark" content="取消任务" placement="top">
                      <span @click="taskOperation('cancel',taskDetail.task_id,taskDetail.pipeline_name)" class="start-build">取消任务</span>
                    </el-tooltip>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-col>
          <el-col :span="14">
            <div class="section-head">变量列表</div>
            <el-table :data="varList" style="width: 100%;" max-height="200">
              <el-table-column prop="key" label="变量"></el-table-column>
              <el-table-column prop="value" label="值"></el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </div>
    </el-card>
    <!--end of basic info-->

    <!-- start of buildv2 -->
    <el-card
      v-if="!$utils.isEmpty(taskDetail.buildv2) && taskDetail.buildv2.enabled"
      class="box-card task-process"
      :body-style="{ padding: '0px', margin: '15px 0 0 0' }"
    >
      <div slot="header" class="clearfix">
        <span>构建</span>
        <div v-if="taskDetail.buildv2.status==='running'" class="loader">
          <div class="ball-scale-multiple">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
      <el-alert v-if="taskDetail.buildv2.error" title="错误信息" :description="taskDetail.buildv2.error" type="error" close-text="知道了"></el-alert>
      <div class="text item">
        <el-row :gutter="0">
          <el-col :span="6">
            <div class="item-title">
              <i class="iconfont iconzhuangtai"></i> 构建状态
            </div>
          </el-col>
          <el-col :span="6">
            <div class="item-desc">
              <a :class="buildOverallColor" href="#buildv2-log">{{taskDetail.buildv2.status?buildOverallStatusZh:"未运行"}}</a>
            </div>
          </el-col>
          <el-col v-if="taskDetail.buildv2.status!=='running'" :span="6">
            <div class="item-title">
              <i class="iconfont iconshijian"></i> 持续时间
            </div>
          </el-col>
          <el-col v-if="taskDetail.buildv2.status!=='running'" :span="6">
            <span class="item-desc">
              {{$utils.timeFormat(taskDetail.buildv2.end_time -
              taskDetail.buildv2.start_time)}}
            </span>
          </el-col>
        </el-row>
        <el-row :gutter="0" v-for="(build,index) in taskDetail.buildv2.job_ctx.builds" :key="index">
          <el-col :span="6">
            <div class="item-title">
              <i class="iconfont icondaima"></i>
              代码库({{build.source}})
            </div>
          </el-col>
          <el-col :span="6">
            <div class="item-desc">{{build.repo_name}}</div>
          </el-col>
          <el-col :span="6">
            <div class="item-title">
              <i class="iconfont iconinfo"></i> 构建信息
            </div>
          </el-col>
          <el-col :span="6">
            <el-tooltip :content="`在 ${build.source} 上查看 Release`" placement="top" effect="dark">
              <span v-if="build.tag" class="link">
                <a :href="`${build.address}/${build.repo_owner}/${build.repo_name}/releases/tag/${build.tag}`" target="_blank">{{build.tag}}</a>
              </span>
            </el-tooltip>
            <el-tooltip :content="`在 ${build.source} 上查看 Branch`" placement="top" effect="dark">
              <span v-if="build.branch" class="link">
                <a
                  v-if="build.source==='github'"
                  :href="`${build.address}/${build.repo_owner}/${build.repo_name}/tree/${build.branch}`"
                  target="_blank"
                >{{"Branch-"+build.branch}}</a>
                <a
                  v-if="build.source==='gitlab'"
                  :href="`${build.address}/${build.repo_owner}/${build.repo_name}/tree/${build.branch}`"
                  target="_blank"
                >{{"Branch-"+build.branch}}</a>
                <a
                  v-if="!build.source"
                  :href="`${build.address}/${build.repo_owner}/${build.repo_name}/tree/${build.branch}`"
                  target="_blank"
                >{{"Branch-"+build.branch}}</a>
              </span>
            </el-tooltip>
            <el-tooltip :content="`在 ${build.source} 上查看 PR`" placement="top" effect="dark">
              <span v-if="build.pr && build.pr>0" class="link">
                <a
                  v-if="build.source==='github'"
                  :href="`${build.address}/${build.repo_owner}/${build.repo_name}/pull/${build.pr}`"
                  target="_blank"
                >{{"PR-"+build.pr}}</a>
                <a
                  v-if="build.source==='gitlab'"
                  :href="`${build.address}/${build.repo_owner}/${build.repo_name}/merge_requests/${build.pr}`"
                  target="_blank"
                >{{"PR-"+build.pr}}</a>
                <a
                  v-if="!build.source"
                  :href="`${build.address}/${build.repo_owner}/${build.repo_name}/pull/${build.pr}`"
                  target="_blank"
                >{{"PR-"+build.pr}}</a>
              </span>
            </el-tooltip>
            <el-tooltip :content="`在 ${build.source} 上查看 Commit`" placement="top" effect="dark">
              <span v-if="build.commit_id" class="link">
                <a
                  :href="`${build.address}/${build.repo_owner}/${build.repo_name}/commit/${build.commit_id}`"
                  target="_blank"
                >{{"Commit-"+build.commit_id.substring(0, 10)}}</a>
              </span>
            </el-tooltip>
          </el-col>
        </el-row>
        <el-row v-if="!$utils.isEmpty(taskDetail.buildv2)" :gutter="0">
          <el-col :span="6">
            <div class="item-title">
              <i class="iconfont iconfuwu"></i> 服务名称
            </div>
          </el-col>
          <el-col :span="6">
            <span class="item-desc">{{taskDetail.buildv2.service_name}}</span>
          </el-col>
          <el-col :span="6">
            <div class="item-title">
              <i class="iconfont iconSliceCopy"></i> 镜像信息
            </div>
          </el-col>
          <el-col :span="6">
            <span class="item-desc">{{taskDetail.buildv2.job_ctx.image.split('/').pop()}}</span>
          </el-col>
        </el-row>
        <el-row v-if="!$utils.isEmpty(taskDetail.buildv2) && taskDetail.buildv2.job_ctx.upload_pkg" :gutter="0">
          <el-col :span="6">
            <div class="item-title">
              <i class="iconfont icongithub"></i> Package File
            </div>
          </el-col>
          <el-col :span="6">
            <a
              :href="`/api/aslan/workflow/v2/tasks/file?pipelineName=${taskDetail.pipeline_name}&taskId=${taskDetail.task_id}`"
              target="_blank"
              class="item-desc"
            >{{taskDetail.buildv2.job_ctx.package_file}}</a>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-card
      id="buildv2-log"
      v-if="!$utils.isEmpty(taskDetail.buildv2)&&taskDetail.buildv2.enabled"
      class="box-card task-process"
      :body-style="{ padding: '0px', margin: '15px 0 0 0' }"
    >
      <div class="log-container">
        <div class="log-content">
          <el-collapse @change="getBuildv2Log">
            <el-collapse-item id="log-container" title="查看构建日志">
              <xterm-log v-if="buildLogStarted" @mouseleave.native="leaveLog" :id="taskDetail.buildv2.job_ctx.image" :logs="buildv2AnyLog"></xterm-log>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-card>

    <el-card
      v-if="!$utils.isEmpty(taskDetail.release_image) && taskDetail.release_image.enabled"
      class="box-card task-process"
      :body-style="{ padding: '0px', margin: '15px 0 0 0' }"
    >
      <div slot="header">
        <span>扩展</span>
      </div>
      <div>
        <el-row>
          <el-col :span="6">状态</el-col>
          <el-col :span="6"></el-col>
          <el-col :span="6">持续时间</el-col>
          <el-col :span="6"></el-col>
        </el-row>
        <el-row>
          <el-col :span="6">AppID</el-col>
          <el-col :span="6"></el-col>
          <el-col :span="6">版本号</el-col>
          <el-col :span="6"></el-col>
        </el-row>
        <el-row>
          <el-col :span="6">体验码</el-col>
          <el-col :span="18"></el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
// import { wordTranslate, colorTranslate } from '@utils/word_translate.js'
// import {
//   taskDetailSSEAPI,
//   fetchOldTaskDetailAPI,
//   restartPipelineAPI,
//   cancelPipelineAPI,
//   getHistoryBuildLogAPI
// } from '@api'
// import bus from '@utils/event_bus'
export default {
  data () {
    return {
      taskDetail: {
        buildv2: {}
      },
      scrollTop: 0,
      buildv2AnyLog: [],
      wsBuildDataBuffer: [],
      buildLogStarted: false,

      durationSet: {},

      varList: [
        {
          key: 'key-test',
          value: 'value-test'
        }
      ],
      external: {}
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    },

    workflowName () {
      return this.$route.params.workflow_name
    },
    serviceName () {
      return this.taskDetail.buildv2 && this.taskDetail.buildv2.service_name
    },
    taskID () {
      return this.$route.params.task_id
    },
    build_running () {
      return (
        this.taskDetail.buildv2 && this.taskDetail.buildv2.status === 'running'
      )
    },
    build_done () {
      return this.isSubTaskDone('buildv2')
    },
    docker_build_running () {
      return (
        this.taskDetail.docker_build &&
        this.taskDetail.docker_build.status === 'running'
      )
    },
    buildOverallStatus () {
      return this.$utils.calcOverallBuildStatus(
        this.taskDetail.buildv2,
        this.taskDetail.docker_build
      )
    },
    buildOverallStatusZh () {
      return this.myTranslate(this.buildOverallStatus)
    },
    buildOverallColor () {
      return this.colorTranslation(this.buildOverallStatus, 'pipeline', 'task')
    }
  }
  // methods: {
  //   fetchTaskDetail (pipeline_name, id) {
  //     return taskDetailSSEAPI(pipeline_name, id)
  //       .then(res => {
  //         this.taskDetail = this.separateProcess(res.data)
  //       })
  //       .closeWhenDestroy(this)
  //   },
  //   fetchOldTaskDetail (pipeline_name, id) {
  //     fetchOldTaskDetailAPI(pipeline_name, id).then(response => {
  //       this.taskDetail = this.separateProcess(response)
  //     })
  //   },
  //   showOperation () {
  //     if (
  //       this.taskDetail.status !== 'running' &&
  //       this.taskDetail.status !== 'passed'
  //     ) {
  //       return true
  //     }
  //     if (this.taskDetail.status === 'running') {
  //       return true
  //     }
  //     return false
  //   },
  //   taskDuration (task_id, started) {
  //     const refresh = () => {
  //       const duration = Math.floor(Date.now() / 1000) - started
  //       this.$set(this.durationSet, task_id, duration)
  //     }
  //     setInterval(refresh, 1000)
  //     return ''
  //   },
  //   taskOperation (operation, task_id, pipeline_name) {
  //     if (operation === 'restart') {
  //       const taskUrl = `/v1/projects/detail/${this.projectName}/pipelines/single/${this.workflowName}/${this.taskID}`
  //       restartPipelineAPI(pipeline_name, task_id).then(response => {
  //         this.$message({
  //           message: '任务已重新启动',
  //           type: 'success'
  //         })
  //         this.$router.push(taskUrl)
  //       })
  //     } else if (operation === 'cancel') {
  //       cancelPipelineAPI(pipeline_name, task_id).then(response => {
  //         this.$notify({
  //           title: '成功',
  //           message: '任务取消成功',
  //           type: 'success',
  //           offset: 50
  //         })
  //       })
  //     }
  //   },
  //   getBuildv2Log () {
  //     this.buildLogStarted = true
  //   },
  //   separateProcess (pipeline) {
  //     pipeline.sub_tasks.forEach(task => {
  //       pipeline[task.type] = task
  //     })
  //     delete pipeline.sub_tasks
  //     return pipeline
  //   },
  //   myTranslate (word) {
  //     return wordTranslate(word, 'pipeline', 'task')
  //   },
  //   colorTranslation (word, category, subitem) {
  //     return colorTranslate(word, category, subitem)
  //   },
  //   statusTag (status) {
  //     if (status === 'created') {
  //       return ''
  //     } else if (status === 'running') {
  //       return 'primary'
  //     } else if (status === 'timeout') {
  //       return 'warning'
  //     } else if (status === 'cancelled') {
  //       return 'gray'
  //     } else if (status === 'passed') {
  //       return 'success'
  //     } else if (status === 'failed') {
  //       return 'danger'
  //     }
  //   },
  //   leaveLog () {
  //     const el = document.querySelector('.task-detail-container').style
  //     el.overflow = 'auto'
  //   },
  //   openBuildLog (buildType) {
  //     const url = `/api/aslan/logs/sse/build/${this.workflowName}/${this.taskID}/999999?subTask=${buildType}`
  //     if (typeof window.msgServer === 'undefined') {
  //       this[`${buildType}IntervalHandle`] = setInterval(() => {
  //         if (this.hasNewMsg) {
  //           this.buildv2AnyLog = this.buildv2AnyLog.concat(
  //             this.wsBuildDataBuffer
  //           )
  //           this.wsBuildDataBuffer = []
  //           const len = this.buildv2AnyLog.length
  //         }
  //         this.hasNewMsg = false
  //       }, 500)
  //       this.$sse(url, { format: 'plain' })
  //         .then(sse => {
  //           // Store SSE object at a higher scope
  //           window.msgServer = sse
  //           sse.onError(e => {
  //             console.error('lost connection; giving up!', e)
  //             this.$message({
  //               message: `${buildType}日志获取失败`,
  //               type: 'error'
  //             })
  //             sse.close()
  //             this.killLog(buildType)
  //           })
  //           // Listen for messages without a specified event
  //           sse.subscribe('', data => {
  //             this.hasNewMsg = true
  //             this.wsBuildDataBuffer = this.wsBuildDataBuffer.concat(
  //               Object.freeze(data + '\n')
  //             )
  //           })
  //         })
  //         .catch(err => {
  //           console.error('Failed to connect to server', err)
  //           this.$message({
  //             message: `${buildType}日志获取失败`,
  //             type: 'error'
  //           })
  //           this.killLog(buildType)
  //         })
  //     }
  //   },
  //   killTestLog () {
  //     this.killLog('test')
  //   },
  //   killLog (type) {
  //     clearInterval(this[`${type}IntervalHandle`])
  //     if (typeof msgServer !== 'undefined' && msgServer) {
  //       msgServer.close()
  //       delete window.msgServer
  //     }
  //   },
  //   getHistoryBuildLog () {
  //     return getHistoryBuildLogAPI(
  //       this.workflowName,
  //       this.taskID,
  //       this.serviceName
  //     ).then(response => {
  //       this.buildv2AnyLog = response.split('\n').map(element => {
  //         return element + '\n'
  //       })
  //     })
  //   },
  //   isSubTaskDone (name) {
  //     return (
  //       this.taskDetail[name] &&
  //       this.taskDetail[name].status in
  //         {
  //           passed: 1,
  //           skipped: 1,
  //           failed: 1,
  //           timeout: 1,
  //           cancelled: 1
  //         }
  //     )
  //   },

  //   scrollToTop () {
  //     this.$refs['task-detail-container'].scrollTop = 0
  //   }
  // },
  // created () {
  //   bus.$emit(`set-topbar-title`, {
  //     title: '',
  //     breadcrumb: [
  //       { title: '项目', url: '/v1/projects' },
  //       {
  //         title: this.projectName,
  //         url: `/v1/projects/detail/${this.projectName}`
  //       },
  //       {
  //         title: '工作流',
  //         url: `/v1/projects/detail/${this.projectName}/pipelines`
  //       },
  //       {
  //         title: this.workflowName,
  //         url: `/v1/projects/detail/${this.projectName}/pipelines/single/${this.workflowName}`
  //       },
  //       { title: `#${this.taskID}`, url: '' }
  //     ]
  //   })
  //   bus.$emit(`set-sub-sidebar-title`, {
  //     title: this.projectName,
  //     url: `/v1/projects/detail/${this.projectName}`,
  //     routerList: [
  //       {
  //         name: '工作流',
  //         url: `/v1/projects/detail/${this.projectName}/pipelines`
  //       },
  //       {
  //         name: '集成环境',
  //         url: `/v1/projects/detail/${this.projectName}/envs`
  //       },
  //       {
  //         name: '服务',
  //         url: `/v1/projects/detail/${this.projectName}/services`
  //       },
  //       { name: '构建', url: `/v1/projects/detail/${this.projectName}/builds` },
  //       { name: '测试', url: `/v1/projects/detail/${this.projectName}/test` }
  //     ]
  //   })
  //   if (
  //     this.$route.query.status === 'passed' ||
  //     this.$route.query.status === 'failed' ||
  //     this.$route.query.status === 'timeout' ||
  //     this.$route.query.status === 'cancelled'
  //   ) {
  //     this.fetchOldTaskDetail(this.workflowName, this.taskID)
  //   } else {
  //     this.fetchTaskDetail(this.workflowName, this.taskID)
  //   }
  // },
  // watch: {
  //   $route (to, from) {
  //     if (
  //       this.$route.query.status === 'passed' ||
  //       this.$route.query.status === 'failed' ||
  //       this.$route.query.status === 'timeout' ||
  //       this.$route.query.status === 'cancelled'
  //     ) {
  //       this.fetchOldTaskDetail(this.workflowName, this.taskID)
  //     } else {
  //       this.fetchTaskDetail(this.workflowName, this.taskID)
  //     }
  //   },

  //   build_running (val, oldVal) {
  //     if (!oldVal && val && this.buildLogStarted) {
  //       this.openBuildLog('buildv2')
  //     }
  //     if (oldVal && !val) {
  //       this.killLog('buildv2')
  //     }
  //   },
  //   docker_build_running (val, oldVal) {
  //     if (!oldVal && val && this.buildLogStarted) {
  //       this.openBuildLog('docker_build')
  //     }
  //     if (oldVal && !val) {
  //       this.killLog('docker_build')
  //     }
  //   },
  //   buildLogStarted (val, oldVal) {
  //     if (!oldVal && val) {
  //       if (this.build_running) {
  //         this.openBuildLog('buildv2')
  //       } else {
  //         if (this.build_done) {
  //           if (this.docker_build_running) {
  //             this.getHistoryBuildLog().then(() => {
  //               this.openBuildLog('docker_build')
  //             })
  //           } else {
  //             this.getHistoryBuildLog()
  //           }
  //         }
  //       }
  //     }
  //   }
  // },
  // beforeDestroy () {
  //   this.killTestLog()
  //   this.killLog('buildv2')
  //   this.killLog('docker_build')
  // }
}
</script>

<style lang="less" scoped>
.task-detail-container {
  position: relative;
  flex: 1;
  padding: 0 20px;
  overflow: auto;
  font-size: 13px;

  .text {
    font-size: 14px;
  }

  .item {
    padding: 10px 0;
    padding-left: 1px;

    .status {
      line-height: 24px;
    }
  }

  .clearfix {
    span {
      color: #303133;
      font-size: 16px;
      line-height: 20px;
    }
  }

  .box-card {
    background-color: #fff;

    .item-title {
      color: #8d9199;
    }

    .item-desc {
      .start-build {
        color: #1989fa;
        font-size: 13px;
        cursor: pointer;
      }
    }

    .color-passed {
      color: #6ac73c;
      font-weight: 500;
    }

    .color-failed {
      color: #ff1949;
      font-weight: 500;
    }

    .color-cancelled {
      color: #909399;
      font-weight: 500;
    }

    .color-timeout {
      color: #e6a23c;
      font-weight: 500;
    }

    .color-running {
      color: #1989fa;
      font-weight: 500;
    }

    .color-created {
      color: #cdb62c;
      font-weight: 500;
    }

    .color-notrunning {
      color: #303133;
      font-weight: 500;
    }

    .issue-tag {
      margin-right: 5px;
      margin-bottom: 5px;
      cursor: pointer;
    }

    .deploy_env {
      color: #1989fa;
    }

    .error-color {
      color: #fa6464;
    }

    .show-log {
      font-size: 1.33rem;
      cursor: pointer;

      &:hover {
        color: #1989fa;
      }
    }

    .show-test-result {
      color: #1989fa;
      cursor: pointer;
    }

    .show-log-title {
      line-height: 17px;
    }

    .operation {
      line-height: 16px;
    }
  }

  .box-card,
  .task-process {
    margin-top: 15px;
    border: none;
    box-shadow: none;
  }

  .task-process {
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

  .link {
    a {
      color: #1989fa;
      cursor: pointer;
    }
  }

  a.item-desc {
    color: #1989fa;
    cursor: pointer;
  }

  .loader {
    display: inline-block;

    /* background: black; */
    width: 25px;
    height: 25px;
    vertical-align: middle;

    .ball-scale-multiple {
      transform: none;

      div {
        top: 0;
        left: 0;
        width: 25px;
        height: 25px;
        background-color: #1989fa;
      }
    }
  }

  .log-container {
    padding-bottom: 15px;

    .log-content {
      .xterm {
        padding: 15px 10px;
      }

      /deep/.el-collapse-item__content {
        padding-bottom: 0;
      }

      /deep/.el-collapse-item__arrow {
        margin-right: 16px;
      }
    }
  }
}
</style>
