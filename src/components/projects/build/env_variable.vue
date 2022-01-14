<template>
  <el-form ref="buildEnv" :inline="true" :model="preEnvs" class="form-bottom-0" label-position="top" label-width="80px">
    <span class="item-title" :style="{'margin-bottom': isTest ? '12px' : '0px'}">环境变量</span>
    <el-button v-if="preEnvs.envs.length===0" style="padding: 0;" @click="addFirstBuildEnv()" type="text">新增</el-button>
    <div class="divider item" :style="{ display: isTest ? 'none' : 'block'}"></div>
    <el-row v-for="(app,build_env_index) in preEnvs.envs" :key="build_env_index">
      <el-col :span="narrowWidth ? 5 : 4">
        <el-form-item :prop="'envs.' + build_env_index + '.key'" :rules="{required: true, message: '键 不能为空', trigger: 'blur'}">
          <el-input placeholder="键" v-model="preEnvs.envs[build_env_index].key" size="small"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="narrowWidth ? 5 : 4">
        <el-form-item :prop="'envs.' + build_env_index + '.value'" :rules="{required: true, message: '值 不能为空', trigger: 'blur'}">
          <el-input placeholder="值" v-model="preEnvs.envs[build_env_index].value" size="small"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="narrowWidth ? 5 : 3">
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
        <el-form-item>
          <div class="app-operation">
            <el-button v-if="preEnvs.envs.length >= 1" @click="deleteBuildEnv(build_env_index)" type="danger" size="small" plain>删除</el-button>
            <el-button v-if="build_env_index===preEnvs.envs.length-1" @click="addBuildEnv()" type="primary" size="small" plain>新增</el-button>
          </div>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
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
    }
  },
  data () {
    return {}
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
        is_credential: true
      })
    },
    addBuildEnv () {
      this.$refs.buildEnv.validate(valid => {
        if (valid) {
          this.preEnvs.envs.push({
            key: '',
            value: '',
            is_credential: true
          })
        } else {
          return false
        }
      })
    },
    deleteBuildEnv (index) {
      this.preEnvs.envs.splice(index, 1)
    }
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
    margin-left: 0;
  }
}
</style>
