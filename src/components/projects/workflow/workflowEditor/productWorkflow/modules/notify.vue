<template>
  <el-card class="notify box-card">{{isCanAdd}}
    <div class="script dashed-container" v-if="showTitle">
      <span class="title">通知</span>
    </div>
    <el-button @click="addNotifyItem()" size="mini" icon="el-icon-plus" plain>添加配置</el-button>
    <div class="dashed-container">
      <div class="notify-container" v-for="(item,index) in notify" :key="index">
        <NotifyItem :notify="item" :validObj="validObj" ref="notifys" :curIndex="index" :fromWorkflow="fromWorkflow" @update="delNotify" />
      </div>
    </div>
  </el-card>
</template>

<script type="text/javascript">
import bus from '@utils/eventBus'
import NotifyItem from './components/notifyItem.vue'
import { cloneDeep } from 'lodash'
import mixin from '@/mixin/workflowMixin'
import ValidateSubmit from '@utils/validateAsync'

export default {
  mixins: [mixin],

  data () {
    return {
      notifys: [],
      isCanAdd: false,
      validObj: new ValidateSubmit()

    }
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
      if (this.isCanAdd) {
        this.notify.push({
          enabled: true,
          webhook_type: '',
          notify_type: []
        })
      }
      this.isCanAdd = false
    },
    delNotify (curIndex) {
      this.notify.splice(curIndex, 1)
    },
    check () {
      const valid = []
      this.$nextTick(() => {
        this.$refs.notifys.forEach(item => {
          valid.push(item.$refs.notify.validate())
        })

        return Promise.all(valid).then((res) => {
          console.log(res.indexOf(false) === -1)
          console.log(111111)
          if (res.indexOf(false) === -1) {
            this.isCanAdd = true
          } else {
            this.isCanAdd = false
          }
        })
      })
    }
  },
  mounted () {

  },

  watch: {
    isCanAdd (newVal) {
      if (newVal) {
        bus.$once('check-tab:notify', () => {
          bus.$emit('receive-tab-check:notify', newVal)
        })
      }
    },
    notify: {
      handler (val) {
        if (val) {
          this.check()
        }
      },
      deep: true,
      immediate: true
    }
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
