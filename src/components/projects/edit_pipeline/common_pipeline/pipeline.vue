<template>
  <div class="common-pipeline">
    <SideMenu class="side" :validObj="validObj"></SideMenu>
    <div class="middle">
      <TabMenu class="top" :validObj="validObj"></TabMenu>
      <el-card class="content">
        <keep-alive>
          <component :is="isComp" :validObj="validObj" ref="commonStep" :isEdit="!!pipelineId"></component>
        </keep-alive>
      </el-card>
    </div>
    <footer class="footer">
      <el-tag>填写相关信息，然后点击保存</el-tag>
      <el-button type="primary" plain @click="$router.go(-1)">取消</el-button>
      <el-button type="primary" plain @click="saveCommonWorkflow">保存</el-button>
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
import { cloneDeep, get } from 'lodash'
import {
  createCommonWorkflowAPI,
  getCommonWorkflowAPI,
  updateCommonWorkflowAPI
} from '@api'
export default {
  data () {
    return {
      validObj: new ValidateSubmit()
    }
  },
  computed: {
    ...mapGetters(['currentTab', 'selectedTabs']),
    ...mapState({
      commonInfo: state => state.common_workflow.commonInfo
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
    },
    pipelineId () {
      return this.$route.query.id
    }
  },
  methods: {
    saveCommonWorkflow () {
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

          if (commonInfo.buildv3.job_ctx) {
            commonInfo.buildv3.job_ctx.clean_workspace = !commonInfo.buildv3
              .job_ctx.clean_workspace
          }

          // if (commonInfo.buildv3.enabled) {
          //   commonInfo.sub_tasks.push(commonInfo.buildv3)
          // }

          // if (commonInfo.trigger.enabled) {
          //   commonInfo.sub_tasks.push(commonInfo.trigger)
          // }

          this.selectedTabs.forEach(tab => {
            if (tab.type) {
              commonInfo.sub_tasks.push(commonInfo[tab.type])
            }
          })

          delete commonInfo.buildv3
          delete commonInfo.trigger

          const projectName = commonInfo.project_name

          const fn = this.pipelineId
            ? updateCommonWorkflowAPI(projectName, this.pipelineId, commonInfo)
            : createCommonWorkflowAPI(projectName, commonInfo)

          fn.then(res => {
            this.$message.success(
              `${commonInfo.name} ${this.pipelineId ? '修改' : '创建'}成功！`
            )
            this.$router.push(
              `/v1/projects/detail/${
                commonInfo.project_name
              }/pipelines/common/${commonInfo.name}?id=${this.pipelineId ||
                res.id}`
            )
          })
        }
      })
    }
  },
  components: {
    SideMenu,
    TabMenu
  },
  created () {
    if (this.pipelineId) {
      const projectName = this.$route.query.projectName
      getCommonWorkflowAPI(projectName, this.pipelineId).then(res => {
        let length = res.sub_tasks.length
        let task = {}
        while (length--) {
          task = res.sub_tasks.shift()
          res[task.type] = task
          this.$store.commit('UPDATE_TABS', { type: 'add', tabType: task.type })
        }

        this.$store.commit('UPDATE_TABS', { type: 'add', tab: '基本信息' })

        if (get(res.buildv3, 'job_ctx')) {
          res.buildv3.job_ctx.clean_workspace = !res.buildv3.job_ctx
            .clean_workspace
        }
        this.$store.commit('UPDATE_COMMON_INFO', res)
      })
    }
  },
  destroyed () {
    this.$store.commit('RESET_COMMON_WORKFLOW')
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
    margin: 50px 5% 0;
    margin-left: 30px;

    .content {
      max-height: calc(~'100% - 35px');
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
