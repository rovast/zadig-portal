<template>
  <div class="task-detail-distribute">
    <el-card class="box-card task-process" :body-style="{ margin: '15px 0 0 0' }">
      <div slot="header" class="clearfix subtask-header">
        <span>分发</span>
        <div class="loader">
          <div class="ball-scale-multiple">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
      <div class="deploy-item">
        <div class="error-wrapper">
          <el-alert v-if="distributeDeploy.error" title="错误信息" :description="distributeDeploy.error" type="error" close-text="知道了"></el-alert>
        </div>
        <el-row :gutter="0">
          <el-col :span="6">
            <div class="grid-content item-title">
              <i class="iconfont iconzhuangtai"></i> 分发状态
            </div>
          </el-col>
          <el-col :span="6">
            <div
              class="grid-content item-desc"
              :class="$translate.calcTaskStatusColor(distributeDeploy.status)"
            >{{distributeDeploy.status?$translate.translateTaskStatus(distributeDeploy.status):"未运行"}}</div>
          </el-col>
          <el-col :span="6">
            <div class="grid-content item-title">
              <i class="iconfont iconjiqun1"></i> 分发方式
            </div>
          </el-col>
          <el-col :span="6">
            <div class="grid-content item-desc"></div>
          </el-col>
        </el-row>
        <el-row :gutter="0">
          <el-col :span="6">
            <div class="grid-content item-title">
              <i class="iconfont iconSliceCopy"></i> 镜像信息
            </div>
          </el-col>
          <el-col :span="6">
            <el-tooltip effect="dark" :content="distributeDeploy.image" placement="top">
              <!-- <div class="grid-content item-desc">{{distributeDeploy.image?distributeDeploy.image.split('/')[2]:"*"}}</div> -->
            </el-tooltip>
          </el-col>
          <el-col :span="6">
            <div class="grid-content item-title">
              <i class="iconfont iconfuwu"></i> 服务名称
            </div>
          </el-col>
          <el-col :span="6">
            <div class="grid-content item-desc">
              <!-- <span v-if="distributeDeploy.service_type==='helm'">{{`${$utils.showServiceName(distributeDeploy.container_name)}`}}</span>
              <router-link v-else class="env-link" :to="serviceUrl(deploy)">{{distributeDeploy.service_name}}</router-link>-->
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
    <el-card class="box-card task-process" :body-style="{ margin: '15px 0 0 0' }">
      <div slot="header" class="clearfix subtask-header">
        <span>部署</span>
        <div class="loader">
          <div class="ball-scale-multiple">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
      <div class="deploy-item">
        <div class="error-wrapper">
          <el-alert v-if="distributeDeploy.error" title="错误信息" :description="distributeDeploy.error" type="error" close-text="知道了"></el-alert>
        </div>
        <el-row :gutter="0">
          <el-col :span="6">
            <div class="grid-content item-title">
              <i class="iconfont iconzhuangtai"></i> 部署状态
            </div>
          </el-col>
          <el-col :span="6">
            <div
              class="grid-content item-desc"
              :class="$translate.calcTaskStatusColor(distributeDeploy.status)"
            >{{distributeDeploy.status?$translate.translateTaskStatus(distributeDeploy.status):"未运行"}}</div>
          </el-col>
          <el-col :span="6">
            <div class="grid-content item-title">
              <i class="iconfont iconjiqun1"></i> 部署环境
            </div>
          </el-col>
          <el-col :span="6">
            <div class="grid-content item-desc"></div>
          </el-col>
        </el-row>
        <el-row :gutter="0">
          <el-col :span="6">
            <div class="grid-content item-title">
              <i class="iconfont iconfuwu "></i> 服务名称
            </div>
          </el-col>
          <el-col :span="6">
            <el-tooltip effect="dark" :content="distributeDeploy.image" placement="top">
              <!-- <div class="grid-content item-desc">{{distributeDeploy.image?distributeDeploy.image.split('/')[2]:"*"}}</div> -->
            </el-tooltip>
          </el-col>
          <el-col :span="6">
            <div class="grid-content item-title">
              <i class="iconfont iconSliceCopy"></i> 镜像信息
            </div>
          </el-col>
          <el-col :span="6">
            <div class="grid-content item-desc">
              <!-- <span v-if="distributeDeploy.service_type==='helm'">{{`${$utils.showServiceName(distributeDeploy.container_name)}`}}</span>
              <router-link v-else class="env-link" :to="serviceUrl(deploy)">{{distributeDeploy.service_name}}</router-link>-->
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
import qs from 'qs'

export default {
  data () {
    return {}
  },
  methods: {
    // serviceUrl (deploy) {
    //   const path = `/v1/projects/detail/${distributeDeploy.product_name}/envs/detail/${distributeDeploy.service_name}`
    //   const query = {
    //     envName: distributeDeploy.env_name,
    //     projectName: distributeDeploy.product_name,
    //     namespace: distributeDeploy.namespace,
    //     clusterId: distributeDeploy.cluster_id ? distributeDeploy.cluster_id : ''
    //   }
    //   return path + '?' + qs.stringify(query)
    // }
  },
  props: {
    distributeDeploy: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="less">
@import '~@assets/css/component/subtask.less';

.task-detail-distribute {
  .deploy-item {
    margin-bottom: 15px;
  }

  .env-link {
    color: @themeColor;
  }
}
</style>
