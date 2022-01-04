<template>
  <div class="init-resource">
    <header>项目资源</header>
    <section>
      <div class="desc">您将获取以下资源</div>
      <article>
        <div class="title">
          <i class="iconfont icongongzuoliucheng"></i>工作流
        </div>
        <div v-for="(workflow, index) in collaborationData.workflow" :key="index" class="detail-item">
          <div class="item-name">{{workflow.name}}</div>
          <div class="item-desc">{{workflow.description || placeholder}}</div>
        </div>
      </article>
      <article>
        <div class="title">
          <i class="iconfont iconrongqi"></i>环境
        </div>
        <div v-for="(env, index) in collaborationData.product" :key="index" class="detail-item display-flex">
          <div>
            <div class="item-name">{{env.name}}</div>
            <div class="item-desc">{{env.description || placeholder}}</div>
          </div>
          <el-button type="primary" plain size="small" @click="dialogVisible=true; currentEnv=env.name;">环境变量</el-button>
        </div>
      </article>
    </section>
    <footer>
      <el-button type="text" size="small" icon="el-icon-finished">确认</el-button>
    </footer>

    <InitEnvDialog :visible.sync="dialogVisible" :currentEnv="currentEnv" :envObj="collaborationData.product"></InitEnvDialog>
  </div>
</template>

<script>
import InitEnvDialog from './components/initEnvDialog.vue'
import bus from '@utils/event_bus'
export default {
  data () {
    return {
      collaborationData: {
        workflow: [
          {
            name: 'workflow1',
            description: ''
          },
          {
            name: 'workflow2',
            description: 'xxxx'
          }
        ],
        product: [
          {
            name: 'environment1-dev',
            base_name: 'dev',
            description: 'xxxx'
          },
          {
            name: 'environment2-dev',
            base_name: 'dev',
            description: 'xxxx'
          },
          {
            name: 'environment3-qa',
            base_name: 'qa',
            description: 'xxxx'
          },
          {
            name: 'environment4-qa',
            base_name: 'qa',
            description: 'xxxx'
          }
        ]
      },
      placeholder: 'There is no description.',
      dialogVisible: false,
      currentEnv: ''
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
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
    font-size: 18px;
    text-align: center;
  }

  section {
    .desc {
      color: #8a8a8a;
      text-align: center;
    }

    article {
      .title {
        font-size: 15px;

        .iconfont {
          margin-right: 10px;
          color: #ff2868;
        }
      }

      .detail-item {
        margin-bottom: 1px;
        padding: 8px 20px;
        line-height: 1.7;
        background-color: #fff;

        .item-name {
          color: #5e6d82;
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
    padding: 12px 60px;
    text-align: right;
    background-color: #fff;

    /deep/.el-button {
      font-size: 16px;
    }
  }
}
</style>
