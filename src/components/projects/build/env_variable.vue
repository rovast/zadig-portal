<template>
  <div>
    <el-form ref="buildEnv" :inline="true" :model="preEnvs" class="form-bottom-0" label-position="top" label-width="80px">
      <span class="item-title" :style="{'margin-bottom': isTest ? '12px' : '0px'}">环境变量</span>
      <el-button v-if="preEnvs.envs.length===0" style="padding: 0;" @click="addFirstBuildEnv()" type="text">新增</el-button>
      <div class="divider item" :style="{ display: isTest ? 'none' : 'block'}"></div>
      <el-row v-for="(app,build_env_index) in preEnvs.envs" :key="build_env_index" :gutter="2">
        <el-col :span="narrowWidth ? 4 : 4">
          <el-form-item :prop="'envs.' + build_env_index + '.key'" :rules="{required: true, message: '键 不能为空', trigger: 'blur'}">
            <el-input placeholder="键" v-model="preEnvs.envs[build_env_index].key" size="small"></el-input>
          </el-form-item>
        </el-col>
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
              class="el-icon-edit"
              style=" color: #409eff; cursor: pointer;"
              @click="updateParams(build_env_index)"
            ></i>
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
              <el-tooltip effect="dark" content="在日志中将被隐藏" placement="top">
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
          <el-input v-model="currentVars.key" disabled size="small"></el-input>
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
      currentVars: {}
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
.item-title {
  display: inline-block;
  font-size: 15px;
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
}
</style>
