<template>
  <div class="rbac-policy">
    <el-alert type="info" :closable="false" description="用户与策略关联后，即可获得策略描述的权限"></el-alert>

    <el-table :data="policies" style="width: 100%;">
      <el-table-column prop="name" label="策略名称"></el-table-column>
      <el-table-column prop="description" label="描述信息"></el-table-column>
      <el-table-column prop="prop" label="修改时间">
        <template slot-scope="{ row }">
          <span>{{ $utils.convertTimestamp(row.update_time) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{ $index }">
          <el-button type="primary" size="small" plain @click="lookOverPolicy($index)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <LookOverPolicy :dialogFlag.sync="dialogFlag" :policyInfo="policyInfo" :policyMap="policyMap"></LookOverPolicy>
  </div>
</template>

<script>
import LookOverPolicy from './lookOverPolicy.vue'
import { getAllPolicyAPI, queryPolicyDefinitionsAPI } from '@api'
export default {
  data () {
    return {
      policies: [],
      dialogFlag: false,
      policyInfo: {},
      policyMap: {}
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  methods: {
    async lookOverPolicy (index) {
      this.dialogFlag = true
      this.policyInfo = this.policies[index]
    },
    getAllPolicy () {
      getAllPolicyAPI(this.projectName).then(res => {
        this.policies = res || []
      })
    },
    async getPolicyDefinitions () {
      const res = await queryPolicyDefinitionsAPI(
        this.projectName
      ).catch(error => console.log(error))
      if (res) {
        const policyMap = {}
        res.forEach(re => {
          policyMap[re.resource] = re.alias
          re.rules.forEach(rule => {
            policyMap[rule.action] = rule.alias
          })
        })
        this.policyMap = policyMap
      }
    }
  },
  components: {
    LookOverPolicy
  },
  created () {
    this.getAllPolicy()
    this.getPolicyDefinitions()
  }
}
</script>

<style lang="less" scoped>
.rbac-policy {
  background-color: inherit;
}
</style>
