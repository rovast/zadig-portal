<template>
  <div class="common-pipeline">
    <SideMenu class="side" :validObj="validObj"></SideMenu>
    <div class="middle">
      <TabMenu class="top" :validObj="validObj"></TabMenu>
      <el-card class="content">
        <keep-alive>
          <component :is="isComp" :validObj="validObj" ref="commonStep"></component>
        </keep-alive>
      </el-card>
    </div>
    <footer class="footer">
      <el-tag>填写相关信息，然后点击保存</el-tag>
      <el-button type="primary" plain @click="$router.go(-1)">取消</el-button>
      <el-button type="primary" plain @click="saveCommonPipeline">保存</el-button>
    </footer>
  </div>
</template>

<script>
import SideMenu from './side_menu.vue'
import TabMenu from './tab_menu.vue'
import BasicInfo from './switch_tab/basic_info.vue'
import Build from './switch_tab/build.vue'
import External from './switch_tab/external.vue'
import ValidateSubmit from '@utils/validate_async'

import { mapGetters, mapState } from 'vuex'
import { cloneDeep } from 'lodash'
import { createCommonPipelineAPI } from '@api'
export default {
  data () {
    return {
      validObj: new ValidateSubmit()
    }
  },
  computed: {
    ...mapGetters(['currentTab']),
    ...mapState({
      commonInfo: state => state.common_pipeline.commonInfo
    }),
    isComp () {
      let res = BasicInfo
      const currentTab = this.currentTab
      switch (currentTab) {
        case '基本信息':
          res = BasicInfo
          break
        case '构建':
          res = Build
          break
        case '扩展':
          res = External
          break
      }
      return res
    }
  },
  methods: {
    saveCommonPipeline () {
      this.validObj.validateAll().then(res => {
        if (res[1]) {
          this.$refs.commonStep.updateCommonInfo()

          const commonInfo = cloneDeep(this.commonInfo)

          commonInfo.parameters.forEach(param => {
            if (param.type === 'string') {
              delete param.choice_option
              delete param.external_setting
            } else if (param.type === 'choice') {
              delete param.external_setting
            } else if (param.type === 'external') {
              delete param.choice_option
            }
          })

          if (
            commonInfo.buildv3.job_ctx &&
            commonInfo.buildv3.job_ctx.clean_workspace
          ) {
            commonInfo.buildv3.job_ctx.clean_workspace = !commonInfo.buildv3
              .job_ctx.clean_workspace
          }

          commonInfo.sub_tasks.push(commonInfo.buildv3)
          commonInfo.sub_tasks.push(commonInfo.trigger)

          delete commonInfo.buildv3
          delete commonInfo.trigger

          console.log('保存', commonInfo)
          createCommonPipelineAPI(commonInfo).then(res => {
            this.$message.success(`${commonInfo.project_name}创建成功`)
          })
        }
      })
    }
  },
  components: {
    SideMenu,
    TabMenu
  },
  destroyed () {
    this.$store.commit('RESET_COMMON_PIPELINE')
  }
}
</script>

<style lang="less" scoped>
.common-pipeline {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  font-size: 14px;
  background-color: #f0f2f5;

  .side {
    flex: 0 0 auto;
    align-self: center;
    width: 90px;
    padding: 15px;
    background-color: #fff;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
    box-shadow:
      0 1px 6px rgba(0, 0, 0, 0.117647),
      0 1px 4px rgba(0, 0, 0, 0.117647);
  }

  .middle {
    flex: 1 1 auto;
    width: 70%;
    margin: 5%;
    margin-left: 30px;

    .content {
      max-height: 90%;
      overflow: auto;
      background-color: #fff;
      border-radius: 6px;
      box-shadow:
        0 1px 6px rgba(0, 0, 0, 0.117647),
        0 1px 4px rgba(0, 0, 0, 0.117647);
    }
  }

  .footer {
    position: absolute;
    right: 10%;
    bottom: 20px;

    /deep/.el-tag {
      margin-right: 20px;
    }
  }
}
</style>
