<template>
  <div class="common-pipeline">
    <SideMenu class="side"></SideMenu>
    <div class="middle">
      <TabMenu class="top"></TabMenu>
      <el-card class="content">
        <keep-alive>
          <component :is="isComp"></component>
        </keep-alive>
      </el-card>
    </div>
    <footer class="footer">
      <el-tag>填写相关信息，然后点击保存</el-tag>
      <el-button type="primary" plain>取消</el-button>
      <el-button type="primary" plain>保存</el-button>
    </footer>
  </div>
</template>

<script>
import SideMenu from './side_menu.vue'
import TabMenu from './tab_menu.vue'
import BasicInfo from './switch_tab/basic_info.vue'
import Build from './switch_tab/build.vue'
import External from './switch_tab/external.vue'
import Trigger from './switch_tab/trigger.vue'

import { mapGetters } from 'vuex'

export default {
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['currentTab']),
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
        case '触发器':
          res = Trigger
          break
      }
      return res
    }
  },
  components: {
    SideMenu,
    TabMenu
  }
}
</script>

<style lang="less" scoped>
.common-pipeline {
  flex: 1 1 auto;
  display: flex;
  background-color: #f0f2f5;
  position: relative;
  font-size: 14px;

  .side {
    align-self: center;
    background-color: #fff;
    width: 90px;
    padding: 15px;
    flex: 0 0 auto;

    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.117647),
      0 1px 4px rgba(0, 0, 0, 0.117647);
  }

  .middle {
    margin: 5%;
    margin-left: 30px;
    flex: 1 1 auto;
    width: 70%;

    .top {
    }

    .content {
      background-color: #fff;
      max-height: 90%;
      overflow: auto;
      border-radius: 6px;
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.117647),
        0 1px 4px rgba(0, 0, 0, 0.117647);
    }
  }

  .footer {
    position: absolute;
    bottom: 20px;
    right: 10%;

    /deep/.el-tag {
      margin-right: 20px;
    }
  }
}
</style>
