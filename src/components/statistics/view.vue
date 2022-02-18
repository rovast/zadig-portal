<template>
  <div class="system-statistics-container">
    <section class="overview">
      <div>
        <h3>概览</h3>
        <div class="divider"></div>
        <el-row :gutter="20" class="number-container">
          <el-col class="container-block" :span="4">
            <div>
              <h2>
                <ICountUp :delay="delay" :endVal="overview.cluster_count" class="counter-number" :options="options" />
              </h2>
              <p>个</p>
              <span>
                <i class="icon iconfont iconjiqun"></i> 集群
              </span>
            </div>
          </el-col>
          <el-col class="container-block" :span="4">
            <div>
              <h2>
                <ICountUp :delay="delay" :endVal="overview.project_count" class="counter-number" :options="options" />
              </h2>
              <p>个</p>
              <span>
                <i class="icon iconfont iconxiangmu"></i> 项目
              </span>
            </div>
          </el-col>
          <el-col class="container-block" :span="4">
            <div>
              <h2>
                <ICountUp :delay="delay" :endVal="overview.service_count" class="counter-number" :options="options" />
              </h2>
              <p>个</p>
              <span>
                <i class="icon iconfont iconrongqifuwu"></i> 微服务
              </span>
            </div>
          </el-col>
          <el-col class="container-block" :span="4">
            <div>
              <h2>
                <ICountUp :delay="delay" :endVal="overview.workflow_count" class="counter-number" :options="options" />
              </h2>
              <p>条</p>
              <span>
                <i class="icon iconfont icongongzuoliucheng"></i> 工作流
              </span>
            </div>
          </el-col>
          <el-col class="container-block" :span="4">
            <div>
              <h2>
                <ICountUp :delay="delay" :endVal="overview.env_count" class="counter-number" :options="options" />
              </h2>
              <p>个</p>
              <span>
                <i class="icon iconfont iconrongqi"></i> 环境
              </span>
            </div>
          </el-col>
          <el-col class="container-block" :span="4">
            <div>
              <h2>
                <ICountUp :delay="delay" :endVal="overview.artifact_count" class="counter-number" :options="options" />
              </h2>
              <p>个</p>
              <span>
                <i class="icon iconfont iconjiaofu"></i> 交付物
              </span>
            </div>
          </el-col>
        </el-row>
      </div>
    </section>
    <section class="overview">
      <div>
        <h3>自动化流程</h3>
        <div class="divider"></div>
        <Build class="build-container" />
        <Deploy class="deploy-container" />
        <Test class="deploy-container" />
      </div>
    </section>
  </div>
</template>
<script>
import bus from '@utils/eventBus'
import Build from './constainer/build'
import Deploy from './constainer/deploy'
import Test from './constainer/test'
import ICountUp from 'vue-countup-v2'
import { getStatisticsOverviewAPI } from '@api'
export default {
  data () {
    return {
      overview: {
        project_count: 0,
        cluster_count: 0,
        service_count: 0,
        workflow_count: 0,
        env_count: 0,
        artifact_count: 0
      },
      delay: 1000,
      options: {
        useEasing: true,
        useGrouping: true,
        separator: '',
        decimal: '.',
        prefix: '',
        suffix: ''
      }
    }
  },
  methods: {
    async getStatisticsOverview () {
      this.overview = await getStatisticsOverviewAPI()
    }
  },
  components: {
    Build,
    Deploy,
    Test,
    ICountUp
  },
  mounted () {
    bus.$emit(`set-topbar-title`, {
      title: '',
      breadcrumb: [
        { title: '数据概览', url: '' }
      ]
    })
    this.getStatisticsOverview()
  }
}
</script>
<style lang="less">
.system-statistics-container {
  padding: 0 30px;

  .divider {
    width: 100%;
    height: 1px;
    background-color: #ccc;
  }

  h3 {
    color: #646566;
  }

  .number-container {
    margin: 20px 0;
    background-color: #f2f3f5;
  }

  .container-block {
    padding: 15px 20px;
    text-align: center;
    border-right: 1px solid #ccc;

    h2,
    .counter-number {
      display: inline-block;
      padding-right: 0;
      color: #333;
      font-weight: 200;
      font-size: 50px;
      line-height: 50px;
      letter-spacing: 0;
    }

    h2,
    h3,
    h4,
    h5,
    h6,
    p {
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }

    p {
      display: inline-block;
      color: #969799;
      font-size: 25px;
      letter-spacing: 0;
    }

    span {
      display: block;
      padding-top: 10px;
      padding-right: 20px;
      color: #a3a3a3;
    }

    .icon {
      color: #646566;
    }

    &:last-child {
      border-right: none;
    }
  }

  .build-container,
  .deploy-container {
    padding: 10px 25px;
  }
}
</style>
