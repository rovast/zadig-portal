<template>
  <li class="product-workflow-row" :class="recentTaskStatus">
    <section @click="setFavorite(projectName,name,type)" class="favorite el-icon-star-on" :class="{'liked':isFavorite}"></section>
    <section class="product-header">
      <router-link :to="pipelineLink">{{ name }}</router-link>
      <el-tag v-if="type === 'common'" size="mini">通用</el-tag>
    </section>
    <section class="stages">
      <CusTags :values="stages"></CusTags>
    </section>
    <section class="desc">{{ description }}</section>
    <section class="recent-task">
      <el-tooltip effect="dark" content="最近成功" placement="top">
        <div v-if="recentSuccessID">
          <i class="icon el-icon-success passed"></i>
          <router-link v-if="recentSuccessID" :to="recentSuccessLink" class="passed">{{ recentSuccessID }}</router-link>
        </div>
      </el-tooltip>
      <el-tooltip effect="dark" content="最近失败" placement="top">
        <div v-if="recentFailID">
          <i class="icon el-icon-warning failed"></i>
          <router-link :to="recentFailLink" class="failed">{{ recentFailID }}</router-link>
        </div>
      </el-tooltip>
    </section>
    <section class="time-rate">
      <el-tooltip effect="dark" content="平均执行时间" placement="top">
        <div class="value">{{ avgRuntime }}</div>
      </el-tooltip>
      <el-tooltip effect="dark" content="成功率" placement="top">
        <div class="value">{{avgSuccessRate}}</div>
      </el-tooltip>
    </section>
    <section class="operations">
      <slot name="operations"></slot>
    </section>
  </li>
</template>

<script>
import { setFavoriteAPI, deleteFavoriteAPI } from '@api'
export default {
  data () {
    return {}
  },
  props: {
    workflowInfo: {
      type: Object,
      required: true
    },
    projectName: {
      type: String,
      required: true
    },

    type: {
      type: String,
      required: true
    },

    isFavorite: {
      type: Boolean,
      required: true
    },

    name: {
      type: String,
      required: true
    },

    stages: {
      type: Array,
      required: true
    },

    recentTaskStatus: {
      type: String,
      required: true
    },

    recentSuccessID: {
      type: String,
      required: true
    },

    recentSuccessLink: {
      type: String,
      required: true
    },
    recentFailID: {
      type: String,
      required: true
    },
    recentFailLink: {
      type: String,
      required: true
    },
    updateTime: {
      type: String,
      required: true
    },
    avgRuntime: {
      type: String,
      required: true
    },
    avgSuccessRate: {
      type: String,
      required: false
    },
    description: {
      type: String,
      required: false
    }
  },
  computed: {
    workflowBelongToProject () {
      return this.$route.params.project_name
    },
    pipelineLink () {
      return this.type === 'common'
        ? `/v1/projects/detail/${this.projectName}/pipelines/common/${this.name}?id=${this.workflowInfo.id}`
        : `/v1/projects/detail/${this.projectName}/pipelines/multi/${this.name}`
    }
  },
  methods: {
    setFavorite (projectName, workflowName, type) {
      if (type === 'common') {
        this.$message.info('通用工作流暂不支持收藏！')
        return
      }
      const payload = {
        product_name: projectName,
        name: workflowName,
        type: type
      }
      if (this.isFavorite) {
        deleteFavoriteAPI(projectName, workflowName, type).then(res => {
          if (type === 'workflow') {
            // Refresh the workflow list
            this.$emit('refreshWorkflow', this.workflowBelongToProject)
          }
          this.$message({
            type: 'success',
            message: '取消收藏成功'
          })
        })
      } else {
        setFavoriteAPI(payload).then(res => {
          if (type === 'workflow') {
            // Refresh the workflow list
            this.$emit('refreshWorkflow', this.workflowBelongToProject)
          }
          this.$message({
            type: 'success',
            message: '添加收藏成功'
          })
        })
      }
    }
  }
}
</script>

<style lang="less">
@startColor: #ff2868;

.product-workflow-row {
  display: flex;
  flex-flow: row nowrap;
  flex-grow: 1;
  align-items: center;
  justify-content: space-between;
  height: 80px;
  margin-bottom: -1px;
  font-size: 14px;
  line-height: 22px;
  border: 1px solid #d2d7dc;
  border-left: 6px solid #77797d;

  &.running,
  &.elected {
    border-left-color: #1989fa;
    animation: blink 1.5s infinite;
  }

  &.passed,
  &.success {
    border-left-color: #67c23a;
  }

  &.failed,
  &.failure,
  &.timeout {
    border-left-color: #ff1949;
  }

  &.cancelled,
  &.terminated {
    border-left-color: #77797d;
  }

  & > section:not(:last-child) {
    margin-right: 15px;
  }

  .favorite {
    display: inline-block;
    flex: 0 0 30px;
    margin: 0 15px;
    color: #ebebf0;
    font-size: 20px;
    text-align: center;
    cursor: pointer;

    &.liked,
    &:hover {
      color: @startColor;
    }
  }

  .product-header {
    flex: 0 0 15%;

    a {
      color: @themeColor;
      font-weight: 500;
    }
  }

  .stages {
    flex: 0 0 18%;
  }

  .desc {
    flex: 1 0 20%;
    color: #a0a0a0;
  }

  .recent-task {
    flex: 0 0 80px;
    line-height: 28px;
    white-space: nowrap;

    .icon {
      margin-right: 4px;
      font-size: 15px;
    }

    .failed {
      color: #f56c6c;
    }

    .passed {
      color: #67c23a;
    }
  }

  .time-rate {
    flex: 0 0 80px;
    margin-right: 20px;
    white-space: nowrap;

    .value {
      padding: 0 10px;
      color: #4a4a4a;
      line-height: 28px;
      text-align: center;
      background: #f8f8f8;
      border-radius: 4px;
      cursor: auto;

      &:first-child {
        margin-bottom: 4px;
      }
    }
  }

  .operations {
    display: flex;
    flex: 0 0 180px;
    align-items: center;
    justify-content: space-around;
    font-size: 23px;
  }
}
</style>
