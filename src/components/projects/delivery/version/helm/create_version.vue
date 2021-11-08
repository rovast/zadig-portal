<template>
  <div class="create-helm-version">
    <el-dialog title="创建版本" :visible.sync="dialogVisible" width="70%" :close-on-click-modal="false">
      <div class="helm-version-content">
        <el-steps :active="activeStep" finish-status="success" align-center>
          <el-step title="填写信息"></el-step>
          <el-step title="检查配置"></el-step>
          <el-step title="推送仓库"></el-step>
        </el-steps>
        <keep-alive>
          <component ref="versionComp" class="step-content" :is="isComp"></component>
        </keep-alive>
      </div>
      <div slot="footer">
        <el-button size="small" v-show="activeStep !== 0" @click="activeStep -= 1">上一步</el-button>
        <el-button size="small" type="primary" @click="nextStep">{{activeStep - 2 ? '下一步' : '完成' }}</el-button>
        <el-button size="small" type="text" @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Info from './create_version/info.vue'
import Config from './create_version/config.vue'
import Push from './create_version/push.vue'
export default {
  props: {
    value: Boolean
  },
  data () {
    return {
      activeStep: 2 // 0
    }
  },
  computed: {
    dialogVisible: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('update:value', val)
      }
    },
    isComp () {
      let comp = null
      switch (this.activeStep) {
        case 0:
          comp = Info
          break
        case 1:
          comp = Config
          break
        case 2:
          comp = Push
          break
      }
      return comp
    }
  },
  methods: {
    async nextStep () {
      const res = await this.$refs.versionComp
        .validate()
        .catch(error => console.log(error))
      if (res) {
        if (this.activeStep === 2) {
          this.activeStep = 0
          this.dialogVisible = false
        } else {
          this.activeStep += 1
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import url('~@assets/css/common/scroll-bar.less');

.create-helm-version {
  background: goldenrod;

  /deep/.el-dialog__body {
    padding-bottom: 6px;
  }

  /deep/.el-dialog__footer {
    padding: 10px 10% 30px;

    .el-button--text {
      color: #606266;
    }
  }

  .helm-version-content {
    .step-content {
      min-height: 40vh;
      margin: 30px 10% 20px;
    }
  }
}
</style>
