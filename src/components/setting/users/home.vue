<template>
  <div class="user-home">
    <div class="tab-container">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane name="user" label="用户">
          <keep-alive>
            <User v-if="activeTab === 'user'" />
          </keep-alive>
        </el-tab-pane>
        <el-tab-pane name="role" label="系统角色">
          <keep-alive>
            <Role v-if="activeTab === 'role'" />
          </keep-alive>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
import User from './manage.vue'
import Role from './role.vue'
import bus from '@utils/eventBus'

export default {
  name: 'config',
  components: {
    User,
    Role
  },
  data () {
    return {
      activeTab: 'user'
    }
  },
  mounted () {
    bus.$emit('set-topbar-title', { title: '用户配置', breadcrumb: [] })
  }
}
</script>

<style lang="less" >
.user-home {
  position: relative;
  flex: 1;
  padding: 15px 30px;
  overflow: auto;
}
</style>
