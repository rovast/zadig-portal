<template>
  <el-card class="notify box-card">
    <div class="script dashed-container" v-if="showTitle">
      <span class="title">通知</span>
    </div>
    <el-button @click="addNotifyItem()" size="mini" icon="el-icon-plus" plain>添加配置</el-button>
    <div class="dashed-container">
      <div class="notify-container" v-for="(item,index) in notify" :key="index">
        <NotifyItem :notify="item" :curIndex="index" :fromWorkflow="fromWorkflow" @update="delNotify" />
      </div>
    </div>
  </el-card>
</template>

<script type="text/javascript">
import bus from '@utils/eventBus'
import NotifyItem from './components/notifyItem.vue'

export default {
  data () {
    return {}
  },
  components: { NotifyItem },
  props: {
    notify: {
      required: true,
      type: Array
    },
    showTitle: {
      type: Boolean,
      default: true
    },
    fromWorkflow: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    addNotifyItem () {
      this.notify.push({
        enabled: true,
        webhook_type: '',
        notify_type: [],
        id: Math.random()
      })
    },
    delNotify (curIndex) {
      this.notify = this.notify.filter((item, index) => curIndex !== index)
    }
  },
  beforeDestroy () {
    bus.$off('check-tab:notify')
  }
}
</script>

<style lang="less" scoped>
.notify {
  .dashed-container {
    .notify-container {
      margin: 16px 0;
      border: 1px solid #ddd;
    }
  }

  .script {
    padding: 5px 0;

    .title {
      display: inline-block;
      width: 100px;
      padding-top: 6px;
      color: #606266;
      font-size: 14px;
    }

    .item-title {
      margin-left: 5px;
      color: #909399;
    }
  }
}
</style>
