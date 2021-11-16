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
          <el-col v-if="!$utils.isEmpty(taskDetail.jira) && (typeof taskDetail.jira.issues)!=='undefined'" :span="17">
            <el-row :gutter="30">
              <el-col :span="16">
                <div class="bg-purple-light">
                  <el-row :gutter="0">
                    <el-col :span="5">
                      <div class="item-title">问题数量</div>
                    </el-col>
                    <el-col :span="4">
                      <div class="item-desc">{{taskDetail.jira.issues.length}}</div>
                    </el-col>
                  </el-row>
                  <el-row :gutter="0">
                    <el-col :span="4">
                      <div class="status item-title">关联问题</div>
                    </el-col>
                    <el-col :span="20">
                      <div class>
                        <el-popover
                          v-for="(issue,index) in taskDetail.jira.issues"
                          :key="index"
                          trigger="hover"
                          placement="top"
                          popper-class="issue-popper"
                        >
                          <p>
                            问题:
                            <span>
                              <a :href="issue.url" class="issue-url" target="_blank">{{issue.key}}</a>
                            </span>
                          </p>
                          <p>标题: {{issue.summary}}</p>
                          <p>报告人: {{issue.reporter}}</p>
                          <p>分配给: {{issue.assignee}}</p>
                          <p>优先级: {{issue.priority}}</p>
                          <div slot="reference" class="issue-name-wrapper text-center">
                            <a :href="issue.url" target="_blank">{{issue.key}}</a>
                          </div>
                        </el-popover>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="section-head">变量列表</div>
                <el-table :data="varList" style="width: 100%;" max-height="200">
                  <el-table-column prop="key" label="变量"></el-table-column>
                  <el-table-column prop="value" label="值"></el-table-column>
                </el-table>
              </el-col>
            </el-row>
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

    <!-- end of buildv2 -->
    <el-card
      v-if="!$utils.isEmpty(taskDetail.deploy) && taskDetail.deploy.enabled"
      class="box-card task-process"
      :body-style="{ padding: '0px', margin: '15px 0 0 0' }"
    >
      <el-alert v-if="taskDetail.deploy.error" title="错误信息" :description="taskDetail.deploy.error" type="error" close-text="知道了"></el-alert>
      <div slot="header" class="clearfix">
        <span>容器部署</span>
        <div v-if="taskDetail.deploy.status==='running'" class="loader">
          <div class="ball-scale-multiple">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
      <div class="text item">
        <el-row :gutter="0">
          <el-col :span="6">
            <div class="item-title">
              <i class="iconfont iconzhuangtai"></i> 部署状态
            </div>
          </el-col>
          <el-col :span="6">
            <div
              class="item-desc"
              :class="colorTranslation(taskDetail.deploy.status,'pipeline','task')"
            >{{taskDetail.deploy.status?myTranslate(taskDetail.deploy.status):"未运行"}}</div>
          </el-col>
          <el-col :span="6">
            <div class="item-title">
              <i class="iconfont iconjiqun1"></i> 部署环境
            </div>
          </el-col>
          <el-col :span="6">
            <div class="item-desc">{{taskDetail.deploy.namespace}}</div>
          </el-col>
        </el-row>
        <el-row :gutter="0">
          <el-col :span="6">
            <div class="item-title">
              <i class="iconfont iconSliceCopy"></i> 镜像信息
            </div>
          </el-col>
          <el-col :span="6">
            <div class="item-desc">{{taskDetail.deploy.image?taskDetail.deploy.image.split('/')[2]:"*"}}</div>
          </el-col>
          <el-col :span="6">
            <div class="item-title">
              <i class="iconfont iconfuwu"></i> 服务信息
            </div>
          </el-col>
          <el-col :span="6">
            <div class="item-desc">{{ redirectToText }}</div>
          </el-col>
        </el-row>
      </div>
    </el-card>
    <el-card
      v-if="!$utils.isEmpty(taskDetail.testingv2) && taskDetail.testingv2.enabled"
      class="box-card task-process"
      :body-style="{ padding: '0px', margin: '15px 0 0 0' }"
    >
      <el-alert v-if="taskDetail.testingv2.error" title="错误信息" :description="taskDetail.testingv2.error" type="error" close-text="知道了"></el-alert>
      <div slot="header" class="clearfix">
        <span>测试</span>
        <div v-if="taskDetail.testingv2.status==='running'" class="loader">
          <div class="ball-scale-multiple">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
      <div class="text item">
        <el-row :gutter="0">
          <el-col :span="6">
            <div class="item-title">
              <i class="iconfont iconzhuangtai"></i> 任务状态
            </div>
          </el-col>
          <el-col :span="6">
            <div class="item-desc">
              <a
                href="#testv2-log"
                :class="colorTranslation(taskDetail.testingv2.status,'pipeline','task')"
              >{{taskDetail.testingv2.status?myTranslate(taskDetail.testingv2.status):"未运行"}}</a>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="item-title">
              <i class="iconfont icontest"></i> 测试任务
            </div>
          </el-col>
          <el-col :span="6">
            <div class="item-desc">{{ testName }}</div>
          </el-col>
        </el-row>
        <el-row :gutter="0" v-for="(build,index) in taskDetail.testingv2.job_ctx.builds" :key="index">
          <el-col :span="6">
            <div class="item-title">
              <i class="iconfont icondaima"></i> 代码库
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
        <el-row :gutter="0">
          <template
            v-if="taskDetail.testingv2.status && taskDetail.testingv2.status!=='running' && taskDetail.testingv2.status!=='cancelled' && taskDetail.testingv2.status!=='queued'"
          >
            <el-col :span="6">
              <div class="item-title">
                <i class="iconfont iconiconlog"></i> 查看测试报告
              </div>
            </el-col>
            <el-col :span="6">
              <span
                class="show-test-result"
                @click="getTestReport(taskDetail.pipeline_name,taskDetail.task_id,taskDetail.testingv2.test_name)"
              >查看</span>
            </el-col>
          </template>
          <el-col v-if="taskDetail.testingv2.status!=='running'" :span="6">
            <div class="item-title">
              <i class="iconfont iconshijian"></i> 持续时间
            </div>
          </el-col>
          <el-col v-if="taskDetail.testingv2.status!=='running'" :span="6">
            <span class="item-desc">
              {{$utils.timeFormat(taskDetail.testingv2.end_time -
              taskDetail.testingv2.start_time)}}
            </span>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-card
      id="testv2-log"
      v-if="!$utils.isEmpty(taskDetail.testingv2)&&taskDetail.testingv2.enabled"
      class="box-card task-process"
      :body-style="{ padding: '0px', margin: '15px 0 0 0' }"
    >
      <div class="log-container">
        <div class="log-content test">
          <el-collapse @change="getTestLog">
            <el-collapse-item title="查看测试日志">
              <xterm-log
                v-if="testLogStarted"
                @mouseleave.native="leaveLog"
                :id="`test-${taskDetail.testingv2.test_name}`"
                :logs="testAnyLog"
              ></xterm-log>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-card>

    <el-card
      v-if="!$utils.isEmpty(taskDetail.distribute2kodo) && taskDetail.distribute2kodo.enabled"
      class="box-card task-process"
      :body-style="{ padding: '0px', margin: '15px 0 0 0' }"
    >
      <el-alert
        v-if="taskDetail.distribute2kodo.error"
        title="错误信息"
        :description="taskDetail.distribute2kodo.error"
        type="error"
        close-text="知道了"
      ></el-alert>
      <div slot="header" class="clearfix">
        <span>存储空间分发</span>
        <div v-if="taskDetail.distribute2kodo.status==='running'" class="loader">
          <div class="ball-scale-multiple">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
      <div class="text item">
        <el-row :gutter="0">
          <el-col :span="6">
            <div class="item-title">
              <i class="iconfont iconzhuangtai"></i> 分发状态
            </div>
          </el-col>
          <el-col :span="6">
            <div
              class="item-desc"
              :class="colorTranslation(taskDetail.distribute2kodo.status,'pipeline','task')"
            >{{taskDetail.distribute2kodo.status?myTranslate(taskDetail.distribute2kodo.status):"未运行"}}</div>
          </el-col>
          <el-col :span="6">
            <div class="item-title">
              <i class="iconfont iconweizhi"></i> 存储路径
            </div>
          </el-col>
          <el-col :span="6">
            <div class="item-desc">{{ distribute2kodoPath }}</div>
          </el-col>
        </el-row>
        <el-row :gutter="0">
          <el-col :span="6">
            <div class="item-title">
              <i class="el-icon-files"></i> Package File
            </div>
          </el-col>
          <el-col :span="8">
            <a
              :href="`/api/aslan/workflow/v2/tasks/file?pipelineName=${taskDetail.pipeline_name}&taskId=${taskDetail.task_id}`"
              target="_blank"
              class="item-desc"
            >{{taskDetail.distribute2kodo.package_file}}</a>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-card
      v-if="!$utils.isEmpty(taskDetail.release_image) && taskDetail.release_image.enabled"
      class="box-card task-process"
      :body-style="{ padding: '0px', margin: '15px 0 0 0' }"
    >
      <el-alert
        v-if="taskDetail.release_image.error"
        title="错误信息"
        :description="taskDetail.release_image.error"
        type="error"
        close-text="知道了"
      ></el-alert>
      <div slot="header" class="clearfix">
        <span>镜像分发</span>
        <div v-if="taskDetail.release_image.status==='running'" class="loader">
          <div class="ball-scale-multiple">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
      <div class="text item">
        <el-row :gutter="0">
          <el-col :span="6">
            <div class="item-title">
              <i class="iconfont iconzhuangtai"></i> 部署状态
            </div>
          </el-col>
          <el-col :span="6">
            <div
              class="item-desc"
              :class="colorTranslation(taskDetail.release_image.status,'pipeline','task')"
            >{{taskDetail.release_image.status?myTranslate(taskDetail.release_image.status):"未运行"}}</div>
          </el-col>
          <el-col v-if="taskDetail.release_image.status!=='running'" :span="6">
            <div class="item-title">
              <i class="iconfont iconshijian"></i> 持续时间
            </div>
          </el-col>
          <el-col v-if="taskDetail.release_image.status!=='running'" :span="6">
            <span class="item-desc">
              {{$utils.timeFormat(taskDetail.release_image.end_time -
              taskDetail.release_image.start_time)}}
            </span>
          </el-col>
        </el-row>
        <el-row :gutter="0">
          <el-col :span="4">
            <div class="item-title">
              <i class="iconfont iconSliceCopy"></i> 镜像列表
            </div>
          </el-col>
          <el-col :span="8">
            <div class="item-desc">
              <template v-if="taskDetail.release_image.releases">
                <span style="display: block;" v-for="(item,index) in taskDetail.release_image.releases" :key="index">{{ item.name }}</span>
              </template>
              <span v-else-if="taskDetail.release_image.repo">{{taskDetail.release_image.image_repo}}</span>
            </div>
          </el-col>
        </el-row>
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
import { wordTranslate, colorTranslate } from '@utils/word_translate.js'
import {
  taskDetailSSEAPI,
  fetchOldTaskDetailAPI,
  restartPipelineAPI,
  cancelPipelineAPI,
  getHistoryBuildLogAPI,
  getTestNameAPI
} from '@api'
import bus from '@utils/event_bus'
export default {
  data () {
    return {
      fullDetail: {},
      taskDetail: {
        deploy: {
          namespace: '',
          image: ''
        },
        testingv2: {},
        distribute: {},
        jira: {},
        buildv2: {}
      },
      switchScroll: true,
      scrollTop: 0,
      historyTestLog: '',
      buildv2AnyLog: [],
      testAnyLog: [],
      wsBuildDataBuffer: [],
      buildLogStarted: false,
      wsTestDataBuffer: [],
      testLogStarted: false,

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
    distribute2kodoPath () {
      return this.taskDetail.distribute2kodo.remote_file_key
        ? this.taskDetail.distribute2kodo.remote_file_key
        : '*'
    },
    redirectToText () {
      const { product_name, service_name } = this.taskDetail.deploy
      return product_name + '/' + service_name
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
    no_docker_build () {
      return !this.taskDetail.docker_build
    },
    test_running () {
      return (
        this.taskDetail.testingv2 &&
        this.taskDetail.testingv2.status === 'running'
      )
    },
    test_done () {
      return this.isSubTaskDone('testingv2')
    },
    testName () {
      if (this.taskDetail.testingv2) {
        if (
          !this.$utils.isEmpty(this.taskDetail.buildv2) &&
          this.taskDetail.buildv2.enabled
        ) {
          return this.serviceName
        } else {
          return this.taskDetail.testingv2.test_name
        }
      }
      return ''
    },
    securityCheckDone () {
      return this.isSubTaskDone('security')
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
  },
  methods: {
    fetchTaskDetail (pipeline_name, id) {
      const atFirst = true
      return taskDetailSSEAPI(pipeline_name, id)
        .then(res => {
          this.fullDetail = res.data
          this.taskDetail = this.separateProcess(res.data)
        })
        .closeWhenDestroy(this)
    },
    fetchOldTaskDetail (pipeline_name, id) {
      fetchOldTaskDetailAPI(pipeline_name, id).then(response => {
        this.fullDetail = response
        this.taskDetail = this.separateProcess(response)
      })
    },
    showOperation () {
      if (
        this.taskDetail.status !== 'running' &&
        this.taskDetail.status !== 'passed'
      ) {
        return true
      }
      if (this.taskDetail.status === 'running') {
        return true
      }
      return false
    },
    taskDuration (task_id, started) {
      const refresh = () => {
        const duration = Math.floor(Date.now() / 1000) - started
        this.$set(this.durationSet, task_id, duration)
      }
      setInterval(refresh, 1000)
      return ''
    },
    taskOperation (operation, task_id, pipeline_name) {
      if (operation === 'restart') {
        const taskUrl = `/v1/projects/detail/${this.projectName}/pipelines/single/${this.workflowName}/${this.taskID}`
        restartPipelineAPI(pipeline_name, task_id).then(response => {
          this.$message({
            message: '任务已重新启动',
            type: 'success'
          })
          this.$router.push(taskUrl)
        })
      } else if (operation === 'cancel') {
        cancelPipelineAPI(pipeline_name, task_id).then(response => {
          this.$notify({
            title: '成功',
            message: '任务取消成功',
            type: 'success',
            offset: 50
          })
        })
      }
    },
    getBuildv2Log () {
      this.buildLogStarted = true
    },
    getTestLog () {
      this.testLogStarted = true
    },
    getTestReport (pipeline_name, task_id, test_name) {
      const test_job_name = this.testName
      const projectName = this.projectName
      this.$router.push(
        `/v1/projects/detail/${projectName}/pipelines/single/testcase/${pipeline_name}/${task_id}/${test_name}/${test_job_name}`
      )
    },
    separateProcess (pipeline) {
      pipeline.sub_tasks.forEach(task => {
        pipeline[task.type] = task
      })
      delete pipeline.sub_tasks
      return pipeline
    },
    myTranslate (word) {
      return wordTranslate(word, 'pipeline', 'task')
    },
    colorTranslation (word, category, subitem) {
      return colorTranslate(word, category, subitem)
    },
    statusTag (status) {
      if (status === 'created') {
        return ''
      } else if (status === 'running') {
        return 'primary'
      } else if (status === 'timeout') {
        return 'warning'
      } else if (status === 'cancelled') {
        return 'gray'
      } else if (status === 'passed') {
        return 'success'
      } else if (status === 'failed') {
        return 'danger'
      }
    },
    leaveLog () {
      const el = document.querySelector('.task-detail-container').style
      el.overflow = 'auto'
    },
    openBuildLog (buildType) {
      const url = `/api/aslan/logs/sse/build/${this.workflowName}/${this.taskID}/999999?subTask=${buildType}`
      if (typeof window.msgServer === 'undefined') {
        this[`${buildType}IntervalHandle`] = setInterval(() => {
          if (this.hasNewMsg) {
            this.buildv2AnyLog = this.buildv2AnyLog.concat(
              this.wsBuildDataBuffer
            )
            this.wsBuildDataBuffer = []
            const len = this.buildv2AnyLog.length
          }
          this.hasNewMsg = false
        }, 500)
        this.$sse(url, { format: 'plain' })
          .then(sse => {
            // Store SSE object at a higher scope
            window.msgServer = sse
            sse.onError(e => {
              console.error('lost connection; giving up!', e)
              this.$message({
                message: `${buildType}日志获取失败`,
                type: 'error'
              })
              sse.close()
              this.killLog(buildType)
            })
            // Listen for messages without a specified event
            sse.subscribe('', data => {
              this.hasNewMsg = true
              this.wsBuildDataBuffer = this.wsBuildDataBuffer.concat(
                Object.freeze(data + '\n')
              )
            })
          })
          .catch(err => {
            console.error('Failed to connect to server', err)
            this.$message({
              message: `${buildType}日志获取失败`,
              type: 'error'
            })
            this.killLog(buildType)
          })
      }
    },
    openRunningTestLog () {
      const url = `/api/aslan/logs/sse/test/${this.workflowName}/${this.taskID}/${this.testName}/999999`
      if (typeof window.msgServer === 'undefined') {
        this.testIntervalHandle = setInterval(() => {
          if (this.hasNewTestMsg) {
            this.testAnyLog = this.testAnyLog.concat(this.wsTestDataBuffer)
            this.wsTestDataBuffer = []
            const len = this.testAnyLog.length
          }
          this.hasNewTestMsg = false
        }, 500)
        this.$sse(url, { format: 'plain' })
          .then(sse => {
            // Store SSE object at a higher scope
            window.msgServer = sse
            sse.onError(e => {
              console.error('lost connection; giving up!', e)
              this.$message({
                message: `测试日志获取失败`,
                type: 'error'
              })
              sse.close()
              this.killTestLog()
            })
            // Listen for messages without a specified event
            sse.subscribe('', data => {
              this.hasNewTestMsg = true
              this.wsTestDataBuffer = this.wsTestDataBuffer.concat(
                Object.freeze(data + '\n')
              )
            })
          })
          .catch(err => {
            console.error('Failed to connect to server', err)
            delete window.msgServer
            clearInterval(this.testIntervalHandle)
          })
      }
    },
    killTestLog () {
      this.killLog('test')
    },
    killLog (type) {
      clearInterval(this[`${type}IntervalHandle`])
      if (typeof msgServer !== 'undefined' && msgServer) {
        msgServer.close()
        delete window.msgServer
      }
    },
    getHistoryBuildLog () {
      return getHistoryBuildLogAPI(
        this.workflowName,
        this.taskID,
        this.serviceName
      ).then(response => {
        this.buildv2AnyLog = response.split('\n').map(element => {
          return element + '\n'
        })
      })
    },
    isSubTaskDone (name) {
      return (
        this.taskDetail[name] &&
        this.taskDetail[name].status in
          {
            passed: 1,
            skipped: 1,
            failed: 1,
            timeout: 1,
            cancelled: 1
          }
      )
    },

    scrollToTop () {
      this.$refs['task-detail-container'].scrollTop = 0
    }
  },
  created () {
    bus.$emit(`set-topbar-title`, {
      title: '',
      breadcrumb: [
        { title: '项目', url: '/v1/projects' },
        {
          title: this.projectName,
          url: `/v1/projects/detail/${this.projectName}`
        },
        {
          title: '工作流',
          url: `/v1/projects/detail/${this.projectName}/pipelines`
        },
        {
          title: this.workflowName,
          url: `/v1/projects/detail/${this.projectName}/pipelines/single/${this.workflowName}`
        },
        { title: `#${this.taskID}`, url: '' }
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
    if (
      this.$route.query.status === 'passed' ||
      this.$route.query.status === 'failed' ||
      this.$route.query.status === 'timeout' ||
      this.$route.query.status === 'cancelled'
    ) {
      this.fetchOldTaskDetail(this.workflowName, this.taskID)
    } else {
      this.fetchTaskDetail(this.workflowName, this.taskID)
    }
  },
  watch: {
    $route (to, from) {
      if (
        this.$route.query.status === 'passed' ||
        this.$route.query.status === 'failed' ||
        this.$route.query.status === 'timeout' ||
        this.$route.query.status === 'cancelled'
      ) {
        this.fetchOldTaskDetail(this.workflowName, this.taskID)
      } else {
        this.fetchTaskDetail(this.workflowName, this.taskID)
      }
    },

    build_running (val, oldVal) {
      if (!oldVal && val && this.buildLogStarted) {
        this.openBuildLog('buildv2')
      }
      if (oldVal && !val) {
        this.killLog('buildv2')
      }
    },
    docker_build_running (val, oldVal) {
      if (!oldVal && val && this.buildLogStarted) {
        this.openBuildLog('docker_build')
      }
      if (oldVal && !val) {
        this.killLog('docker_build')
      }
    },
    buildLogStarted (val, oldVal) {
      if (!oldVal && val) {
        if (this.build_running) {
          this.openBuildLog('buildv2')
        } else {
          if (this.build_done) {
            if (this.docker_build_running) {
              this.getHistoryBuildLog().then(() => {
                this.openBuildLog('docker_build')
              })
            } else {
              this.getHistoryBuildLog()
            }
          }
        }
      }
    },
    test_running (val, oldVal) {
      if (!oldVal && val && this.testLogStarted) {
        this.openRunningTestLog()
      }
      if (oldVal && !val) {
        this.killTestLog()
      }
    },
    testLogStarted (val, oldVal) {
      if (this.test_running) {
        this.openRunningTestLog()
      }
      if (this.test_done) {
        getTestNameAPI(this.workflowName, this.taskID, this.testName).then(
          response => {
            this.testAnyLog = response.split('\n').map(element => {
              return element + '\n'
            })
          }
        )
      }
    },
    securityCheckDone (val, oldVal) {
      if (this.securityCheckDone) {
        console.log('done')
      }
    }
  },
  beforeDestroy () {
    this.killTestLog()
    this.killLog('buildv2')
    this.killLog('docker_build')
  }
}
</script>

<style lang="less">
.issue-popper {
  display: inline-block;
  font-size: 14px;

  p {
    margin: 0.5em 0;
  }

  .issue-url {
    color: #1989fa;
    cursor: pointer;
  }
}

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

    .status {
      line-height: 24px;
    }
  }

  .clearfix::before,
  .clearfix::after {
    display: table;
    content: '';
  }

  .clearfix {
    span {
      color: #303133;
      font-size: 16px;
      line-height: 20px;
    }
  }

  .clearfix::after {
    clear: both;
  }

  .box-card {
    background-color: #fff;

    .item-title {
      color: #8d9199;
    }

    .item-desc {
      .start-build,
      .edit-pipeline {
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

      .el-collapse-item__content {
        padding-bottom: 0;
      }

      .el-collapse-item__arrow {
        margin-right: 16px;
      }

      &.test {
        margin-bottom: 80px;
      }
    }
  }

  .pointer {
    cursor: pointer;
  }

  .issue-name-wrapper {
    display: inline-block;
    margin-right: 6px;
    line-height: 24px;

    a {
      color: #1989fa;
    }
  }

  .el-breadcrumb {
    font-size: 16px;
    line-height: 1.35;

    .el-breadcrumb__item__inner a:hover,
    .el-breadcrumb__item__inner:hover {
      color: #1989fa;
      cursor: pointer;
    }
  }
}
</style>
