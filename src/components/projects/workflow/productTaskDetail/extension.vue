<template>
  <div class="extension-container">
    <div class="primary-title not-first-child">扩展</div>
    <el-alert
      v-if="extensionStage.error"
      title="错误信息"
      :description="extensionStage.error"
      type="error"
      close-text="知道了"
      style="margin: 8px 0;"
    ></el-alert>
    <el-row :gutter="0" class="extension-content">
      <el-col :span="6">
        <i class="iconfont iconzhuangtai"></i> 状态
      </el-col>
      <el-col
        :span="6"
        :class="colorTranslation(extensionStage.status, 'pipeline', 'task')"
      >{{ extensionStage.status ? myTranslate(extensionStage.status) : "未运行" }}</el-col>
      <el-col v-if="extensionStage.status!=='running'" :span="6">
        <i class="iconfont iconshijian"></i> 持续时间
      </el-col>
      <el-col v-if="extensionStage.status!=='running'" :span="6">{{ extensionStage.duration }}</el-col>
    </el-row>
    <el-row :gutter="0" class="extension-content" v-if="extensionStage.payload">
      <el-col :span="6">
        <i class="iconfont iconBoardList"></i> Payload
      </el-col>
      <el-col :span="6">
        <el-popover placement="top" width="400" trigger="click">
          <VueJsonPretty :data="JSON.parse(extensionStage.payload)"/>
          <span slot="reference" class="btn">查看</span>
        </el-popover>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { wordTranslate, colorTranslate } from '@utils/wordTranslate.js'
import VueJsonPretty from 'vue-json-pretty'
export default {
  props: {
    extensionStage: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    colorTranslation (word, category, subitem) {
      return colorTranslate(word, category, subitem)
    },
    myTranslate (word) {
      return wordTranslate(word, 'pipeline', 'task')
    }
  },
  components: {
    VueJsonPretty
  }
}
</script>
<style lang="less" scoped>
.extension-container {
  .extension-content {
    margin-top: 12px;
    color: #8d9199;
    font-size: 14px;
    line-height: 22px;

    .btn {
      color: @themeColor;
      cursor: pointer;

      &:hover {
        color: #66b1ff;
      }
    }
  }
}
</style>
