<template>
  <div class="common-row">
    <div class="row-content">
      <div class="favorite">
        <i class="el-icon-star-on" :style="{color: favorite ? '#f4e118' : 'inherit'}"></i>
      </div>
      <div class="info">
        <div class="top">
          <router-link
            :to="`/v1/projects/detail/${workflow.project_name}/pipelines/common/${workflow.name}?id=${workflow.id}`"
          >{{workflow.name}}</router-link>
          <el-tag size="mini">通用</el-tag>
        </div>
        <div class="bottom">
          <span>
            <i class="success-color el-icon-success"></i>
            最近成功 *
            <!-- <router-link
              class="success-color"
              :to="`/v1/projects/detail/${workflow.project_name}/pipelines/common/${workflow.name}/${testId}?status=`"
            >{{}}</router-link>-->
          </span>
          <span>
            <i class="fail-color el-icon-error"></i>
            最近失败 *
            <!-- <router-link
              class="fail-color"
              :to="`/v1/projects/detail/${workflow.project_name}/pipelines/common/${workflow.name}/${testId}?status=`"
            >{{}}</router-link>-->
          </span>
        </div>
      </div>
      <div class="step">
        <!-- <el-tag size="mini">{{}}</el-tag> -->
      </div>
      <div class="desc">
          <!-- {{desc}} -->
      </div>
      <div class="average font">
        <div>平均执行时间</div>
        <div>-</div>
      </div>
      <div class="success-rate font">
        <div>成功率</div>
        <div>-</div>
      </div>
      <div class="operate">
        <el-button type="success" icon="el-icon-video-play" @click="startCommonBuild(workflow)">执行</el-button>
        <i
          class="icon el-icon-setting"
          @click="$router.push(`/workflows/common/edit/${workflow.name}?projectName=${workflow.project_name}&id=${workflow.id}`)"
        ></i>
        <el-dropdown @command="deleteCommonPipeline">
          <i class="icon el-icon-s-operation"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="delete">删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      favorite: false,
      testId: '1'
    }
  },
  props: {
    workflow: Object
  },
  inject: ['startCommonBuild', 'deleteCommon'],
  methods: {
    deleteCommonPipeline (command) {
      if (command === 'delete') {
        this.deleteCommon(this.workflow)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.common-row {
  margin-bottom: 16px;
  color: #7987a8;
  border: 1px solid #eaeaea;
  border-radius: 2px;

  .row-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    padding-left: 0.8em;
    border-left: 4px solid;

    .favorite {
      color: #dbdbdb;
      font-size: 25px;
    }

    .info {
      flex: 0 0 19%;
      font-weight: 500;

      .top {
        margin: 8px 0;
        font-size: 16px;
      }

      .bottom {
        font-size: 12px;
        white-space: nowrap;
      }
    }

    .step {
      width: 350px;
    }

    .desc {
      flex: 0 0 19%;
      color: #666;
      font-size: 14px;
    }

    .average {
      width: 80px;
    }

    .success-rate {
      width: 60px;
    }

    .operate {
      width: 180px;

      /deep/.el-button {
        margin-right: 10px;
        padding: 8px 12px 8px 10px;
        font-weight: 300;
        font-size: 16px;
      }

      .icon {
        margin-right: 15px;
        color: #000;
        font-size: 23px;
        cursor: pointer;

        &.disabled {
          color: #888;
          cursor: not-allowed;
        }
      }
    }

    .font {
      color: #888;
      font-weight: bold;
      font-size: 13px;
    }
  }
}

.success-color {
  color: #67c23a;
}

.fail-color {
  color: #f56c6c;
}
</style>
