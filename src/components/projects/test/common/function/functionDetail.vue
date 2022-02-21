<template>
  <div class="function-test-detail">
    <el-form class="basic-info-form"
             :model="test"
             ref="test-form"
             :rules="rules"
             label-width="80px"
             label-position="right">
      <el-form-item prop="name"
                    label="测试名称"
                    class="fixed-width">
        <el-input :disabled="isEdit"
                  size="small"
                  v-model="test.name"></el-input>
      </el-form-item>
      <el-form-item label="描述信息"
                    class="fixed-width">
        <el-input size="small"
                  v-model="test.desc"></el-input>
      </el-form-item>
      <el-form-item label="测试超时">
        <el-input-number size="mini"
                         v-model="test.timeout">
        </el-input-number>
        <span>分钟</span>
      </el-form-item>
      <div class="divider"></div>

      <div class="title">运行时环境</div>
      <el-row>
       <el-col :span="12">
        <BuildEnv :initFlag="configDataLoading" :pre_build="test.pre_test" :isCreate="!isEdit" :title="``" :propPre="`pre_test`"/>
        </el-col>
      </el-row>
      <div class="divider">
      </div>
      <el-form-item label-width="0px">
        <div class="repo dashed-container">
          <RepoSelect :config="test"
                       :validObj="validObj"
                       hidePrimary/>
        </div>
      </el-form-item>
      <div class="divider"></div>
         <EnvVariable :preEnvs="test.pre_test" :isTest="true" :validObj="validObj"/>
      <div class="divider">
      </div>

      <div class="section">
        <el-form ref="cacheDir"
                 :inline="true"
                 :model="test"
                 class="form-container"
                 label-position="left">
          <span class="item-title">缓存策略</span>
          <el-row>
            <el-col :span="4">
              <el-form-item label="开启缓存">
                <el-switch v-model="test.cache_enable"
                           active-color="#409EFF">
                </el-switch>
              </el-form-item>
              <el-radio-group v-if="test.cache_enable" v-model="test.cache_dir_type" class="radio-group">
                <el-radio label="workspace">工作空间 $WORKSPACE</el-radio>
                <el-radio label="user_defined">自定义目录
                  <el-input v-model="test.cache_user_dir"
                            placeholder="请手动输入"
                            size="mini">
                  </el-input>
                </el-radio>
              </el-radio-group>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div class="divider">
      </div>
      <div class="trigger">
        <el-form-item label-width="0px"
                      class="repo">
          <label class="title">
            <slot name="label">
              <span> 触发器</span>
              <el-button @click="addTrigger"
                         type="text">添加</el-button>
            </slot>
          </label>
          <test-trigger ref="trigger"
                        :projectName="projectName"
                        :testName="isEdit?name:test.name"
                        :webhook="test.hook_ctl"
                        :avaliableRepos="test.repos"></test-trigger>
        </el-form-item>
      </div>
      <div class="divider"></div>
      <div class="timer">
        <el-form-item label-width="0px"
                      class="repo">
          <label class="title">
            <slot name="label">
              <span> 定时器</span>
              <el-button @click="addTimer"
                         type="text">添加</el-button>
            </slot>
          </label>
          <TestTimer ref="timer"
                      timerType="test"
                      :projectName="projectName"
                      :testName="isEdit?name:test.name"
                      :schedules="test.schedules"/>
        </el-form-item>
      </div>
      <div class="divider">
      </div>
      <label class="title">
        <span>通知</span>
        <el-button @click="test.notify_ctl.enabled = !test.notify_ctl.enabled"
                    type="text">{{test.notify_ctl.enabled ? '删除': '添加'}}</el-button>
      </label>
      <Notify v-if="test.notify_ctl.enabled"
              ref="notifyComp"
              class="notification"
              :editMode="isEdit"
              :notify="test.notify_ctl"
              :showTitle="false"
              :fromWorkflow="false"/>
      <div class="divider">
      </div>
      <label class="title">
        <slot name="label">
          <span>测试报告</span>
        </slot>
      </label>
      <el-form-item label-width="160px"
                    label="Junit 测试报告目录"
                    prop="test_result_path"
                    class="fixed-width">
        <el-input size="small"
                  v-model="test.test_result_path"
                  style="width: 80%;"
                  placeholder="请输入测试报告目录">
          <template slot="prepend">$WORKSPACE/</template>
        </el-input>
      </el-form-item>
      <el-form-item label-width="160px"
                    class="fixed-width">
        <template slot="label">
          <span>Html 测试报告文件</span>
          <el-tooltip effect="dark"
                      placement="top">
            <div slot="content">Html 测试报告文件将包含在工作流发送的 IM 通知内容中<br /></div>
            <i class="el-icon-question"></i>
          </el-tooltip>
        </template>
        <el-input size="small"
                  v-model="test.test_report_path"
                  style="width: 80%;"
                  placeholder="请输入测试报告文件">
          <template slot="prepend">$WORKSPACE/</template>
        </el-input>
      </el-form-item>
      <el-form-item label-width="160px"
                    class="fixed-width">
        <template slot="label">
          <span>测试文件导出路径</span>
          <el-tooltip effect="dark"
                      placement="top">
            <div slot="content">设置一个或者多个文件目录，构建完成后可以在工作流详情页面进行下载，通常用于测试日志等文件的导出<br /></div>
            <i class="el-icon-question"></i>
          </el-tooltip>
        </template>
        <div>
          <div v-for="(path,index) in test.artifact_paths"
               :key="index"
               class="show-one-line">
            <el-input size="small"
                      v-model="test.artifact_paths[index]"
                      placeholder="文件导出路径">
              <template slot="prepend">$WORKSPACE/</template>
            </el-input>
            <el-button size="small"
                       v-if="index===test.artifact_paths.length-1"
                       type="primary"
                       @click="addArtifactPath(index)"
                       plain>添加</el-button>
            <el-button size="small"
                       v-if="index!==0 || (index===0&&test.artifact_paths.length > 1)"
                       @click="deleteArtifactPath(index)"
                       type="danger"
                       plain>删除</el-button>
          </div>
        </div>
      </el-form-item>
      <div class="divider">
      </div>
      <el-form-item label-width="0px">
        <div class="script dashed-container">
          <span class="title">测试脚本</span>
          <el-tooltip effect="dark"
                      placement="top-start">
            <div slot="content">
              当前可用环境变量如下，可在构建脚本中进行引用<br />
              $WORKSPACE &nbsp; 工作目录<br />
              $LINKED_ENV &nbsp; 被测命名空间<br />
              $ENV_NAME &nbsp;&nbsp;&nbsp;&nbsp; 被测环境名称<br />
              $TEST_URL &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 测试任务的 URL<br>
              $SERVICES &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 通过工作流任务更新的服务组，服务名以“,”分隔，形如 service1,service2,service3。推荐使用array=(${SERVICES//,/ }方式转化成数组<br />
              $CI
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              值恒等于 true，表示当前环境是 CI/CD 环境<br />
              $ZADIG
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              值恒等于 true，表示在 ZADIG 系统上执行脚本<br />
            </div>
            <span class="variable">变量</span>
          </el-tooltip>
          <div class="test-container">
            <div>
              <el-row>
                <el-col :span="24">
                  <Editor v-model="test.scripts"
                          lang="sh"
                          theme="xcode"
                          width="100%"
                          height="200px"/>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </el-form-item>

      <div class="divider"></div>
      <footer class="create-footer">
        <el-row>
          <el-col :span="12">
            <div class="grid-content bg-purple">
              <div class="description">
                <el-tag type="primary">填写相关信息，然后点击保存</el-tag>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="grid-content button-container">
              <router-link :to="`/v1/${basePath}/detail/${projectName}/test/function`">
                <el-button class="btn-primary"
                           type="primary">取消</el-button>
              </router-link>
              <el-button class="btn-primary"
                         @click="saveTest"
                         type="primary">保存</el-button>
            </div>
          </el-col>
        </el-row>
      </footer>

    </el-form>
  </div>
</template>

<script>
import BuildEnv from '@/components/projects/build/buildEnv.vue'
import EnvVariable from '@/components/projects/build/envVariable.vue'
import testTrigger from '@/components/common/testTrigger.vue'
import bus from '@utils/eventBus'
import ValidateSubmit from '@utils/validateAsync'
import Editor from 'vue2-ace-bind'
import Notify from '@/components/projects/edit_pipeline/product_pipeline/switch_tab/notify.vue'
import { getCodeSourceMaskedAPI, createTestAPI, updateTestAPI, singleTestAPI } from '@api'
const validateTestName = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入测试名称'))
  } else {
    if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
      callback(new Error('名称只支持字母和数字，特殊字符只支持中划线和下划线'))
    } else {
      callback()
    }
  }
}
export default {
  data () {
    return {
      allCodeHosts: [],
      test: {
        name: '',
        product_name: '',
        desc: '',
        repos: [],
        timeout: 60,
        cache_enable: false,
        cache_dir_type: '',
        cache_user_dir: '',
        hook_ctl: {
          enabled: false,
          items: []
        },
        schedules: {
          enabled: false,
          items: []
        },
        notify_ctl: {
          enabled: false,
          weChat_webHook: '',
          notify_type: []
        },
        pre_test: {
          enable_proxy: false,
          build_os: 'xenial',
          image_from: '',
          image_id: '',
          res_req: 'low', // high 、medium、low、min、define
          res_req_spec: {
            cpu_limit: 1000,
            memory_limit: 512
          },
          installs: [
            { name: '', version: '' }
          ],
          envs: []
        },
        artifact_paths: [],
        scripts: '#!/bin/bash\nset -e',
        test_result_path: '',
        test_report_path: '',
        threshold: 0,
        post_test: {
          stcov: {
            enable: false
          }
        },
        test_type: 'function'
      },
      rules: {
        name: [
          {
            type: 'string',
            required: true,
            validator: validateTestName,
            trigger: 'change'
          }
        ],
        product_name: [
          {
            type: 'string',
            required: true,
            message: '请选择所属项目',
            trigger: 'change'
          }
        ],
        'pre_test.image_id': [
          {
            type: 'string',
            required: true,
            message: '请选择测试环境',
            trigger: 'change'
          }
        ],
        'pre_test.res_req': [
          {
            type: 'string',
            required: true,
            message: '请选择资源规格',
            trigger: 'change'
          }
        ],
        test_result_path: [
          {
            type: 'string',
            required: true,
            message: '请输入结果地址',
            trigger: 'blur'
          }
        ],
        threshold: [
          {
            type: 'number',
            required: true,
            message: '请输入测试阈值',
            trigger: 'blur'
          }
        ],
        test_type: [
          {
            type: 'string',
            required: true,
            message: '选择测试类型',
            trigger: 'blur'
          }
        ]
      },

      install_items_rules: {
        name: [
          {
            type: 'string',
            required: true,
            message: '请选择应用',
            trigger: 'change'
          }
        ],
        version: [
          {
            type: 'string',
            required: true,
            message: '请选择版本',
            trigger: 'change'
          }
        ]
      },
      env_refs_rules: {
        key: [
          {
            type: 'string',
            required: true,
            message: '请输入key',
            trigger: 'blur'
          }
        ],
        value: [
          {
            type: 'string',
            required: true,
            message: '请输入value',
            trigger: 'blur'
          }
        ]
      },
      validObj: new ValidateSubmit(),
      configDataLoading: true
    }
  },
  props: {
    basePath: {
      request: true,
      type: String
    }
  },
  computed: {
    name () {
      return this.$route.params.test_name
    },
    isEdit () {
      return !!this.name
    },
    projectName () {
      return this.$route.params.project_name
    },
    stcovEnabled: {
      get () {
        return this.test.post_test && this.test.post_test.stcov && this.test.post_test.stcov.enable
      },
      set (val) {
        this.test.post_test = this.test.post_test || {}
        this.test.post_test.stcov = this.test.post_test.stcov || {}
        this.test.post_test.stcov.enable = val
      }
    }
  },
  methods: {
    addTrigger () {
      this.test.repos.forEach(repo => {
        this.allCodeHosts.forEach(codehost => {
          if (repo.codehost_id === codehost.id) {
            repo.source = codehost.type
          }
        })
      })
      this.$refs.trigger.addWebhookBtn()
    },
    addTimer () {
      this.$refs.timer.addTimerBtn()
    },
    addArtifactPath (index) {
      this.test.artifact_paths.push('')
    },
    deleteArtifactPath (index) {
      this.test.artifact_paths.splice(index, 1)
    },
    removeStcov () {
      this.stcovEnabled = false
    },
    addExtra (command) {
      if (command === 'stcov') {
        this.stcovEnabled = true
      }
      this.$nextTick(this.$utils.scrollToBottom)
    },
    async saveTest () {
      const refs = [this.$refs['test-form']]
        .concat(this.$refs.install_items_ref)
        .concat(this.$refs.env_ref)
        .concat(this.$refs.notifyComp && this.$refs.notifyComp.$refs.notify)
        .filter(r => r)
      const res = await this.validObj.validateAll()
      if (!res[1]) {
        return
      }
      Promise.all(refs.map(r => r.validate())).then(() => {
        this.test.repos.forEach(repo => {
          this.allCodeHosts.forEach(codehost => {
            if (repo.codehost_id === codehost.id) {
              repo.source = codehost.type
            }
          })
        })
        const fn = this.isEdit ? updateTestAPI : createTestAPI
        fn(this.projectName, this.test).then(res => {
          this.$message({
            message: '保存成功',
            type: 'success'
          })
          this.$router.push(`/v1/${this.basePath}/detail/${this.projectName}/test/function`)
        })
      })
    },

    makeMapOfArray (arr, namePropName) {
      const map = {}
      for (const obj of arr) {
        if (!map[obj[namePropName]]) {
          map[obj[namePropName]] = [obj]
        } else {
          map[obj[namePropName]].push(obj)
        }
      }
      return map
    }
  },
  created () {
    getCodeSourceMaskedAPI().then((response) => {
      this.allCodeHosts = response
    })
    this.test.product_name = this.projectName
    const topTitle = this.basePath === 'tests'
      ? {
        title: '测试管理',
        projectUrl: `/v1/${this.basePath}/detail/${this.projectName}/test`
      }
      : {
        title: '项目',
        projectUrl: `/v1/${this.basePath}/detail/${this.projectName}`
      }
    if (this.isEdit) {
      this.configDataLoading = true
      bus.$emit(`set-topbar-title`, {
        title: '',
        breadcrumb: [
          { title: topTitle.title, url: `/v1/${this.basePath}` },
          { title: this.projectName, url: topTitle.projectUrl },
          { title: '功能测试', url: `/v1/${this.basePath}/detail/${this.projectName}/test/function` },
          { title: this.name, url: '' }
        ]
      })
      singleTestAPI(this.name, this.projectName).then(res => {
        this.test = res
        if (!res.test_report_path) {
          this.$set(this.test, 'test_report_path', '')
        }
        if (!res.artifact_paths) {
          this.$set(this.test, 'artifact_paths', [])
        }
        if (!res.hook_ctl) {
          this.$set(this.test, 'hook_ctl', {
            enabled: false,
            items: []
          })
        }
        if (!res.schedules) {
          this.$set(this.test, 'schedules', {
            enabled: false,
            items: []
          })
        }
        if (!res.notify_ctl) {
          this.$set(this.test, 'notify_ctl', {
            enabled: false,
            weChat_webHook: '',
            notify_type: []
          })
        }
        if (this.test.artifact_paths.length === 0) {
          this.addArtifactPath()
        }
        if (this.test.pre_test.installs) {
          this.test.pre_test.installs = this.test.pre_test.installs.map(i => {
            i.id = `${i.name}${i.version}`
            return i
          })
        }
        this.configDataLoading = false
      })
    } else {
      bus.$emit(`set-topbar-title`, {
        title: '',
        breadcrumb: [
          { title: topTitle.title, url: `/v1/${this.basePath}` },
          { title: this.projectName, url: topTitle.projectUrl },
          { title: '功能测试', url: `/v1/${this.basePath}/detail/${this.projectName}/test/function` },
          { title: '添加', url: '' }
        ]
      })
      this.addArtifactPath()
      this.configDataLoading = false
    }
  },
  components: {
    Editor,
    testTrigger,
    BuildEnv,
    EnvVariable,
    Notify
  }
}
</script>

<style lang="less" scoped>
.function-test-detail {
  position: relative;
  flex: 1;
  padding: 15px 20px;
  overflow: auto;

  .el-row {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .basic-info-form {
    margin: 20px 0 50px;

    .el-form-item {
      margin-bottom: 20px;
    }

    .fixed-width {
      /deep/ .el-input__inner {
        width: 300px;
      }
    }

    .el-form-item__label {
      text-align: left;
    }

    .notification {
      /deep/.el-card__body {
        padding: 0 20px 6px;
      }
    }
  }

  .show-one-line {
    display: flex;
    margin-bottom: 20px;

    .el-input-group {
      width: auto;
      margin-right: 10px;
    }
  }

  .divider {
    width: 100%;
    height: 1px;
    margin: 13px 0;
    background-color: #dfe0e6;
  }

  .title {
    padding-top: 6px;
    color: #000;
    font-size: 15px;
    line-height: 40px;
  }

  .repo {
    /* padding: 5px 8px; */
    .repo-operation-container {
      display: inline-block;

      .delete {
        color: #ff4949;
      }

      .add {
        color: @themeColor;
      }
    }
  }

  .script,
  .stcov {
    /* padding: 5px 8px; */
    .title {
      display: inline-block;
      font-size: 15px;
      line-height: 40px;
    }

    .item-title {
      margin-left: 5px;
      color: #909399;
    }

    .test-container {
      .operation-container {
        margin-left: 40px;
        padding-top: 30px;

        .delete {
          color: #ff4949;
        }
      }

      .add-test {
        margin-top: 5px;
      }
    }
  }

  .stcov {
    .title {
      margin: 10px 0 15px 0;
    }

    .el-form-item__content {
      height: 40px;
    }
  }

  .el-form.label-at-left .el-form-item__label {
    float: left;
  }

  .el-input-group__prepend {
    padding-right: 3px;
  }

  .el-input-group__append {
    padding-left: 3px;
  }

  .el-select.appended {
    /deep/ .el-input__inner {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }

  .select-append {
    position: relative;
    top: -2px;
    display: inline-block;
    padding: 0 20px 0 3px;
    color: #909399;
    font-size: 14px;
    line-height: 38px;
    white-space: nowrap;
    vertical-align: middle;
    background-color: #f5f7fa;
    border: 1px solid #dcdfe6;
    border-left: 0;
    border-radius: 4px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .text {
    font-size: 13px;
  }

  .text-title {
    color: #8d9199;
  }

  .visibility {
    display: inline-block;
  }

  .item {
    padding: 10px 0;
    padding-left: 1px;

    .edit-icon {
      margin-left: 15px;
    }

    .icon-color {
      color: #2d2f33;
      font-size: 15px;
      cursor: pointer;

      &:hover {
        color: @themeColor;
      }
    }

    .icon-color-cancel {
      color: #ff4949;
      font-size: 15px;
      cursor: pointer;
    }

    .visibility-control {
      display: inline-block;
      width: 100px;
    }
  }

  .clearfix::before,
  .clearfix::after {
    display: table;
    content: "";
  }

  .clearfix::after {
    clear: both;
  }

  .box-card,
  .box-card-service {
    width: 100%;
    border: none;
    box-shadow: none;

    .services-container {
      .edit-operation {
        .title {
          font-size: 14px;
          line-height: 14px;
        }

        .operation-btns {
          margin-left: 25px;
        }
      }
    }
  }

  .wide-for-screen {
    width: 100%;
  }

  .el-card__header {
    padding-left: 0;
  }

  .add-extra {
    margin: 0 0 30px 0;
  }

  .artifact-form-inline {
    vertical-align: sub;
  }

  .create-footer {
    position: fixed;
    right: 130px;
    bottom: 0;
    z-index: 5;
    box-sizing: border-box;
    width: 400px;
    padding: 10px 10px 10px 10px;
    text-align: left;
    background-color: transparent;
    border-radius: 4px;

    .btn-primary {
      color: @themeColor;
      background-color: rgba(25, 137, 250, 0.04);
      border-color: rgba(25, 137, 250, 0.4);

      &:hover {
        color: #fff;
        background-color: @themeColor;
        border-color: @themeColor;
      }
    }

    .grid-content {
      min-height: 36px;
      border-radius: 4px;

      .description {
        line-height: 36px;

        p {
          margin: 0;
          color: #676767;
          font-size: 16px;
          line-height: 36px;
          text-align: left;
        }
      }

      &.button-container {
        float: right;
      }
    }
  }

  .variable {
    color: #409eff;
    font-size: 13px;
  }
}

.radio-group {
  margin: -8px 0 0 10px;

  /deep/.el-radio {
    padding: 5px 0;
    font-weight: 400;

    .el-input {
      margin-left: 8px;
    }
  }
}
</style>
