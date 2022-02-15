<template>
  <div>
    <el-form ref="buildEnv" :inline="true" :model="preEnvs" class="variable-form" label-position="top" label-width="80px">
      <span class="item-title" :style="{'margin-bottom': isTest ? '12px' : '0px'}">自定义构建变量</span>
      <el-button v-if="preEnvs.envs.length===0" @click="addFirstBuildEnv()" type="primary" size="mini" plain>新增</el-button>
      <el-row v-for="(app,build_env_index) in preEnvs.envs" :key="build_env_index" :gutter="2">
        <el-col :span="narrowWidth ? 4 : 4">
          <el-form-item class="display-flex">
            <el-select
              v-model="preEnvs.envs[build_env_index].type"
              placeholder="类型"
              size="small"
              :class="{'partial-width': preEnvs.envs[build_env_index].type !== 'string'}"
              style="margin-right: 6px;"
              @change="changeEnvType(build_env_index)"
            >
              <el-option label="字符串" value="string"></el-option>
              <el-option label="枚举" value="choice"></el-option>
            </el-select>
            <i
              v-show="preEnvs.envs[build_env_index].type === 'choice'"
              class="el-icon-edit edit-icon"
              @click="updateParams(build_env_index)"
            ></i>
          </el-form-item>
        </el-col>
        <el-col :span="narrowWidth ? 4 : 4">
          <el-form-item :prop="'envs.' + build_env_index + '.key'" :rules="{required: true, message: '键 不能为空', trigger: 'blur'}">
            <el-input placeholder="键" v-model="preEnvs.envs[build_env_index].key" size="small"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="narrowWidth ? 4 : 4">
          <el-form-item
            :prop="'envs.' + build_env_index + '.value'"
            :rules="{required: true, message: '值 不能为空', trigger: ['blur', 'change']}"
          >
            <el-select
              v-if="preEnvs.envs[build_env_index].type==='choice'"
              v-model="preEnvs.envs[build_env_index].value"
              placeholder="默认值"
              size="small"
              style="max-width: 176px;"
            >
              <el-option v-for="option in preEnvs.envs[build_env_index].choice_option" :key="option" :label="option" :value="option"></el-option>
            </el-select>
            <el-input v-else placeholder="值" v-model="preEnvs.envs[build_env_index].value" size="small"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="narrowWidth ? 4 : 3" v-show="preEnvs.envs[build_env_index].type!=='choice'">
          <el-form-item prop="is_credential">
            <el-checkbox v-model="preEnvs.envs[build_env_index].is_credential">
              敏感信息
              <el-tooltip effect="dark" content="设置为敏感信息变量后，系统会将变量进行加密，使用时进行解密，同时在工作流运行日志里不可见" placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
            </el-checkbox>
          </el-form-item>
        </el-col>
        <el-col :span="narrowWidth ? 8 : 5">
          <el-form-item style="margin-right: 0;">
            <div class="app-operation">
              <el-button v-if="preEnvs.envs.length >= 1" @click="deleteBuildEnv(build_env_index)" type="danger" size="small" plain>删除</el-button>
              <el-button v-if="build_env_index===preEnvs.envs.length-1" @click="addBuildEnv()" type="primary" size="small" plain>新增</el-button>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-dialog :visible.sync="dialogVisible" title="枚举" width="600px" :close-on-click-modal="false" :show-close="false" append-to-body>
      <el-form ref="form" :model="currentVars" label-width="90px">
        <el-form-item label="变量名称">
          <el-input v-model="currentVars.key" size="small"></el-input>
        </el-form-item>
        <el-form-item label="可选值">
          <el-input type="textarea" v-model="currentVars.choice_option" placeholder="可选值之间用英文 “,” 隔开" size="small" rows="4"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="saveVariable" size="small">确 定</el-button>
      </div>
    </el-dialog>
    <section class="inner-variable">
      <div @click="showBuildInEnvVar = !showBuildInEnvVar" class="item-title inner-title">
        内置构建变量
        <i style="margin-left: 10px;" :class="[showBuildInEnvVar ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"></i>
      </div>
      <div v-show="showBuildInEnvVar" class="inner-variable-content">
        <div v-for="variable in buildVars" :key="variable.variable">
          <span class="var-variable">{{ variable.variable }}</span>
          <span class="var-desc">{{ variable.desc }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'
export default {
  props: {
    preEnvs: Object,
    isTest: {
      type: Boolean,
      default: false
    },
    narrowWidth: {
      type: Boolean,
      default: false
    },
    validObj: {
      required: false,
      type: Object,
      default: null
    }
  },
  data () {
    return {
      dialogVisible: false,
      currentVars: {},
      showBuildInEnvVar: false,
      buildVars: [
        {
          variable: '$WORKSPACE',
          desc: '工作目录'
        },
        {
          variable: '$TASK_ID',
          desc: '工作流任务 ID'
        },
        {
          variable: '$IMAGE',
          desc: '输出镜像名称'
        },
        {
          variable: '$SERVICE',
          desc: '构建的服务名称'
        },
        {
          variable: '$DIST_DIR',
          desc: '构建出的 Tar 包的目的目录'
        },
        {
          variable: '$PKG_FILE',
          desc: '构建出的 Tar 包名称'
        },
        {
          variable: '$ENV_NAME',
          desc: '执行的环境名称'
        },
        {
          variable: '$BUILD_URL',
          desc: '构建任务的 URL'
        },
        {
          variable: '$CI',
          desc: '值恒等于 true，表示当前环境是 CI/CD 环境'
        },
        {
          variable: '$ZADIG',
          desc: '值恒等于 true，表示在 Zadig 系统上执行脚本'
        },
        {
          variable: '<REPO>_PR',
          desc: '构建过程中指定代码仓库使用的 Pull Request 信息'
        },
        {
          variable: '<REPO>_BRANCH',
          desc: '构建过程中指定代码仓库使用的分支信息'
        },
        {
          variable: '<REPO>_TAG',
          desc: '构建过程中指定代码仓库使用 Tag 信息'
        },
        {
          variable: '<REPO>_COMMIT_ID',
          desc: '构建过程中指定代码的 commit 信息'
        }
      ]
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  methods: {
    addFirstBuildEnv () {
      this.preEnvs.envs.push({
        key: '',
        value: '',
        type: 'string',
        is_credential: true
      })
    },
    validate () {
      return this.$refs.buildEnv.validate()
    },
    addBuildEnv () {
      this.validate().then(valid => {
        this.preEnvs.envs.push({
          key: '',
          value: '',
          type: 'string',
          is_credential: true
        })
      })
    },
    deleteBuildEnv (index) {
      this.preEnvs.envs.splice(index, 1)
    },
    changeEnvType (index) {
      const current = this.preEnvs.envs[index]
      current.value = ''
      if (current.type === 'string') {
        current.is_credential = true
      } else {
        current.is_credential = false
        this.updateParams(index)
      }
    },
    updateParams (index) {
      this.dialogVisible = true
      const current = this.preEnvs.envs[index]
      this.currentVars = cloneDeep({
        index,
        ...current,
        choice_option: current.choice_option
          ? current.choice_option.join(',')
          : ''
      })
    },
    saveVariable () {
      this.dialogVisible = false
      const index = this.currentVars.index
      const env = this.preEnvs.envs[index]
      const choice_option = this.currentVars.choice_option.split(',')
      env.choice_option = choice_option
      env.key = this.currentVars.key
      if (!choice_option.includes(env.value)) {
        env.value = ''
      }
    }
  },
  watch: {
    'preEnvs.envs' (env) {
      env.forEach(e => {
        if (!e.type) {
          this.$set(e, 'type', 'string')
        }
      })
    }
  },
  created () {
    this.validObj.addValidate({
      name: 'envVariable',
      valid: this.validate
    })
  }
}
</script>

<style lang="less" scoped>
@secondaryColor: #8a8a8a;
@primaryColor: #000;

.item-title {
  display: inline-block;
  width: 117px;
  color: @secondaryColor;
  font-weight: 300;
  font-size: 14px;
  line-height: 28px;

  &.inner-title {
    margin-top: 6px;
    cursor: pointer;
  }
}

.inner-variable {
  .item-title.inner-title {
    margin-top: 6px;
    color: @themeColor;
    cursor: pointer;
  }

  .inner-variable-content {
    margin-top: 8px;
    color: @primaryColor;
    font-weight: 300;
    font-size: 14px;
    line-height: 22px;

    .var-variable {
      display: inline-block;
      width: 150px;
    }
  }
}

.divider {
  width: 100%;
  height: 1px;
  margin: 5px 0 15px 0;
  background-color: #dfe0e6;

  &.item {
    width: 30%;
  }
}

.app-operation {
  .el-button + .el-button {
    margin-left: 2px;
  }
}

.display-flex {
  /deep/.el-form-item__content {
    display: flex;
    align-items: center;

    .el-select.partial-width {
      width: 80%;
    }
  }

  .edit-icon {
    color: @themeColor;
    cursor: pointer;
  }
}

.variable-form {
  /deep/.el-form-item {
    margin-bottom: 8px;
  }
}
</style>
