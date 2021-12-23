<template>
  <el-dialog title="策略详情" :visible.sync="policyDialog" width="50%">
    <section class="policy-content">
      <div>
        <span class="info-title">策略名称</span>
        <span>{{}}</span>
      </div>
      <div>
        <span class="info-title">描述信息</span>
        <span>{{}}</span>
      </div>
      <el-table :data="policyInfo">
        <el-table-column prop="prop" label="模块名称"></el-table-column>
        <el-table-column prop="prop" label="权限项"></el-table-column>
        <el-table-column prop="prop" label="过滤规则"></el-table-column>
        <el-table-column prop="prop" label="关联资源"></el-table-column>
      </el-table>
    </section>
    <div slot="footer">
      <el-button type="primary" @click="policyDialog = false" size="small">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    dialogFlag: Boolean,
    policyInfo: Object
  },
  data () {
    return {}
  },
  computed: {
    policyDialog: {
      get () {
        return this.dialogFlag
      },
      set (val) {
        this.$emit('update:policyDialog', val)
      }
    }
  }
}
</script>

<style lang="less" scoped>
/deep/.el-dialog__body {
  padding-top: 10px;

  .policy-content {
    color: #777;

    .info-title {
      display: inline-block;
      margin-right: 10px;
      font-weight: 500;
      line-height: 2;
    }
  }
}
</style>
