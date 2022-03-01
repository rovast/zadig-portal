<template>
  <div class="project-rbac-container">
    <div class="tab-container" style="width: 100%;">
      <el-tabs  v-model="activeTab" :tab-position="tabPosition" type="card" style="height: 200px;">
        <el-tab-pane name="member" label="成员管理"><Member v-if="activeTab==='member'" :projectName="projectName" /></el-tab-pane>
        <el-tab-pane name="role" label="角色管理"><Role  v-if="activeTab==='role'" :projectName="projectName"/></el-tab-pane>
        <el-tab-pane name="policy" label="策略管理">
          <Policy v-if="activeTab==='policy'" :projectName="projectName"></Policy>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
import Member from './member.vue'
import Role from './role.vue'
import Policy from './policy'

export default {
  name: 'rbac',
  components: {
    Member,
    Role,
    Policy
  },
  data () {
    return {
      activeTab: 'member',
      tabPosition: 'top'

    }
  },
  methods: {},
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  }
}
</script>

<style lang="less" scoped>
.project-rbac-container {
  padding: 25px 20px;
  font-size: 15px;
}
</style>
