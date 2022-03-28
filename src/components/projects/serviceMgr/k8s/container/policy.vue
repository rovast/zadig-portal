<template>
  <div class="policy-container">
    <div class="form-container">
      <el-form :model="projectForm" :rules="rules" label-position="top" ref="projectForm" label-width="100px">
        <el-form-item label="服务部署超时设置（分钟）" prop="timeout">
          <el-input v-model.number="projectForm.timeout"></el-input>
        </el-form-item>
        <el-form-item label="交付物命名规则设置">
          <span slot="label">
            交付物命名规则设置
            <el-tooltip effect="dark" placement="top">
              <div slot="content">
                镜像和 TAR 包规则可以通过变量和常量组装生成：
                <br />
                <span class="tooltip-key" v-html="'{{.TIMESTAMP}}'"></span> 时间戳
                <br />
                <span class="tooltip-key" v-html="'{{.TASK_ID}}'"></span> 工作流任务 ID
                <br />
                <span class="tooltip-key" v-html="'{{.REPO_BRANCH}}'"></span> 代码分支名称
                <br />
                <span class="tooltip-key" v-html="'{{.REPO_PR}}'"></span> 代码 PR ID
                <br />
                <span class="tooltip-key" v-html="'{{.REPO_TAG}}'"></span> 代码 TAG
                <br />
                <span class="tooltip-key" v-html="'{{.REPO_COMMIT_ID}}'"></span> 代码 Commit ID
                <br />
                <span class="tooltip-key" v-html="'{{.PROJECT}}'"></span> 项目名称
                <br />
                <span class="tooltip-key" v-html="'{{.SERVICE}}'"></span> 服务名称
                <br />
                <span class="tooltip-key" v-html="'{{.IMAGE_NAME}}'"></span> 镜像名称
                <br />
                <span class="tooltip-key" v-html="'{{.ENV_NAME}}'">${ENV_NAME}</span> 环境名称
                <br />注意：常量字符只能是大小写字母、数字、中划线、下划线和点，即 [a-zA-Z0-9_.-]，首个字符不能是&nbsp;.&nbsp;或&nbsp;-。不能超过 127 个字符
              </div>
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <CusDeliverable
            :customImageRule="projectForm.custom_image_rule"
            :customTarRule="projectForm.custom_tar_rule"
            ref="cusDeliverable"
            :useTar="useTar"
          />
        </el-form-item>
      </el-form>
    </div>
    <div class="operation-container">
      <el-button type="primary" size="small" @click="submitForm('projectForm')">保存策略</el-button>
    </div>
  </div>
</template>
<script>
import { getSingleProjectAPI, updateSingleProjectAPI } from '@api'
import CusDeliverable from '../../../detail_ope/components/cusDeliverable.vue'
const validateDeployTimeout = (rule, value, callback) => {
  const reg = /^[0-9]+.?[0-9]*/
  if (!reg.test(value)) {
    callback(new Error('时间应为数字'))
  } else {
    if (value > 0) {
      callback()
    } else {
      callback(new Error('请输入正确的时间范围'))
    }
  }
}
export default {
  components: {
    CusDeliverable
  },
  props: {
    useTar: {
      default: true,
      type: Boolean
    }
  },
  data () {
    return {
      projectForm: {
        timeout: null,
        custom_image_rule: {}
      },
      rules: {
        timeout: [
          {
            required: true,
            trigger: 'change',
            validator: validateDeployTimeout
          }
        ]
      }
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  methods: {
    getPolicy (projectName) {
      getSingleProjectAPI(projectName).then(res => {
        this.projectForm = res
        if (!res.timeout) {
          this.$set(this.projectForm, 'timeout', 10)
        }
      })
    },
    updatePolicy (projectName, payload) {
      updateSingleProjectAPI(projectName, payload).then(res => {
        this.$message({
          type: 'success',
          message: '策略更新成功'
        })
      })
    },
    submitForm (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$refs.cusDeliverable.saveConfig()
          this.projectForm.custom_image_rule = this.$refs.cusDeliverable.custom_image_rule
          this.projectForm.custom_tar_rule = this.$refs.cusDeliverable.custom_tar_rule
          this.updatePolicy(this.projectForm.product_name, this.projectForm)
        } else {
          return false
        }
      })
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    }
  },
  mounted () {
    this.getPolicy(this.projectName)
  }
}
</script>
<style lang="less">
.policy-container {
  display: flex;
  flex-direction: column;
  height: 100%;

  .form-container {
    display: flex;
    flex: 1;
    box-sizing: border-box;
    width: 100%;
    margin-bottom: 10px;
    padding: 10px;
    overflow: auto;

    .el-form {
      width: 100%;
    }
  }

  .operation-container {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    height: 32px;
  }
}
</style>
