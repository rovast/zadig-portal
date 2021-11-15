<template>
  <div class="common-tab-menu">
    <div
      v-for="tab in selectedTabs"
      :key="tab.tab"
      @click="updateTab(tab, 'select')"
      class="tab-title"
      :class="{'is-current': tab.isCurrent}"
    >
      {{tab.tab}}
      <i v-if="tab.tab !== '基本信息'" class="icon el-icon-error" @click.stop="updateTab(tab, 'delete')"></i>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['selectedTabs'])
  },
  methods: {
    updateTab (list, type) {
      this.$store.commit('UPDATE_TABS', { type: type, tab: list.tab })
    }
  }
}
</script>

<style lang="less" scoped>
.common-tab-menu {
  display: flex;
  .tab-title {
    margin: 0 3px;
    width: 100px;
    text-align: center;
    line-height: 35px;
    border-top-right-radius: 6px;
    border-top-left-radius: 6px;
    background-color: #808080ba;
    cursor: pointer;
    position: relative;
    color: #fff;
    &.is-current {
      background-color: #6c6c6c;
    }
    .icon {
      position: absolute;
      right: -8px;
      top: -8px;
      border-radius: 50%;
      color: #ff5733;
    }
  }
}
</style>
