<template>
  <div class="init-resource">
    <header>资源确认</header>
    <section>
      <article v-if="collaborationData.workflow.length">
        <div class="title">
          <i class="iconfont icongongzuoliucheng"></i>工作流
        </div>
        <div v-for="(workflow, index) in collaborationData.workflow" :key="index" class="detail-item">
          <div class="item-name">
            {{ workflow.name }}
            <el-tag effect="plain" size="mini">{{ workflow.collaboration_type === 'share' ? '共享' : '新建' }}</el-tag>
          </div>
        </div>
      </article>
      <article v-if="collaborationData.product.length">
        <div class="title">
          <i class="iconfont iconrongqi"></i>环境
        </div>
        <div v-for="(env, index) in collaborationData.product" :key="index" class="detail-item display-flex">
          <div>
            <div class="item-name">
              {{ env.name }}
              <el-tag effect="plain" size="mini">{{ env.collaboration_type === 'share' ? '共享' : '新建' }}</el-tag>
            </div>
          </div>
          <el-button v-if="env.collaboration_type === 'new'" type="primary" plain size="small" @click="editEnvInfo(env)">环境变量</el-button>
        </div>
      </article>
    </section>
    <footer>
      <el-button type="primary" size="small" icon="el-icon-finished" @click="createEnvAndWorkflow">确认</el-button>
    </footer>

    <InitEnvDialog
      ref="envDialogRef"
      :visible="dialogVisible"
      @resetVisible="initEnvInfo"
      :currentEnv="currentEnv"
      :currentInfo="currentInfo"
    ></InitEnvDialog>
  </div>
</template>

<script>
import InitEnvDialog from './components/initEnvDialog.vue'
import bus from '@utils/eventBus'
import { getNewCollaborationAPI, initializeCollaborationAPI } from '@api'
export default {
  data () {
    return {
      collaborationData: {
        workflow: [],
        product: []
      },
      dialogVisible: false,
      currentEnv: '',
      currentInfo: null
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  methods: {
    createEnvAndWorkflow () {
      const payload = this.collaborationData.product.filter(
        product => product.collaboration_type === 'new'
      )
      console.log('payload', payload)
      initializeCollaborationAPI(this.projectName, payload).then(res => {
        this.$message.success(`用户初始环境创建成功！`)
        this.$router.go(-1)
      })
    },
    getNewCollaboration () {
      getNewCollaborationAPI(this.projectName).then(res => {
        res.product.forEach(product => {
          if (
            product.collaboration_type === 'new' &&
            product.deploy_type === 'helm'
          ) {
            product.chartValues.forEach(chart => {
              chart.envName = product.name
            })
          }
        })
        this.collaborationData = res
      })
    },
    editEnvInfo (env) {
      this.dialogVisible = true
      this.currentEnv = env.name
      this.currentInfo = env
    },
    initEnvInfo () {
      this.dialogVisible = false
      this.currentEnv = ''
      this.currentInfo = null
    },
    closeSubSide () {
      // other page will trigger sub side after the page
      setTimeout(() => {
        bus.$emit('set-sub-sidebar-title', {
          title: '',
          routerList: []
        })
      }, 80)
    }
  },
  created () {
    bus.$emit('show-sidebar', true)
    bus.$emit('set-topbar-title', {
      title: '',
      breadcrumb: [
        { title: '项目', url: '/v1/projects' },
        { title: this.projectName, url: '' },
        { title: '项目资源', url: '' }
      ]
    })
    bus.$emit('set-sub-sidebar-title', {
      title: '',
      routerList: []
    })
    this.closeSubSide()
    this.getNewCollaboration()
  },
  components: {
    InitEnvDialog
  }
}
</script>

<style lang="less" scoped>
.init-resource {
  flex: 1;
  padding: 15px 20px;
  color: #4c4c4c;
  line-height: 2;
  background-color: #f5f7f7;

  header {
    margin-bottom: 25px;
    color: black;
    font-size: 15px;
    text-align: center;
  }

  section {
    article {
      .title {
        margin: 12px 0 8px;
        font-size: 15px;

        .iconfont {
          margin-right: 10px;
          color: #ff2868;
        }
      }

      .detail-item {
        margin-bottom: 1px;
        padding: 8px 20px;
        background-color: #fff;

        .item-name {
          color: #5e6d82;
          font-weight: 200;
          line-height: 3;

          /deep/.el-tag {
            margin-left: 5px;
          }
        }

        .item-desc {
          color: #c0c4cc;
        }
      }

      .display-flex {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }

  footer {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 20px 60px;
    text-align: right;
  }
}
</style>
