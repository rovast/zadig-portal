<template>
  <div class="rbac-policy">
    <el-alert type="info" :closable="false" description="用户与策略关联后，即可获得策略描述的权限"></el-alert>

    <el-table :data="policies" style="width: 100%;">
      <el-table-column prop="prop" label="策略名称"></el-table-column>
      <el-table-column prop="prop" label="描述信息"></el-table-column>
      <el-table-column prop="prop" label="修改时间">
          <template slot-scope="{ row }">
              <span>{{ $utils.convertTimestamp(row.time) }}</span>
          </template>
      </el-table-column>
      <el-table-column label="操作">
          <template slot-scope="{ $index }">
              <el-button type="primary" size="small" plain @click="lookOverPolicy($index)">查看</el-button>
          </template>
      </el-table-column>
    </el-table>

    <LookOverPolicy :dialogFlag.sync="dialogFlag" :policyInfo="policyInfo"></LookOverPolicy>
  </div>
</template>

<script>
import LookOverPolicy from './components/look-over-policy.vue'
export default {
  data () {
    return {
      policies: [],
      dialogFlag: false,
      policyInfo: {}
    }
  },
  methods: {
    lookOverPolicy (index) {
      this.dialogFlag = true
      console.log('look ', index)
    }
  },
  components: {
    LookOverPolicy
  }
}
</script>

<style lang="less" scoped>
.rbac-policy {
  background-color: inherit;
}
</style>
