<template>
  <div class="common-basic-info">
    <el-form ref="basicForm" :model="commonInfoUse" label-width="120px" label-position="top">
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="工作流名称">
            <el-input v-model="commonInfoUse.pipelineName" placeholder="请输入工作流名称" size="small"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="选择项目">
            <el-select v-model="commonInfoUse.projectName" placeholder="请选择项目" size="small">
              <el-option label="label" value="value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="描述">
        <el-input type="textarea" v-model="commonInfoUse.desc" rows="4" size="small"></el-input>
      </el-form-item>
      <el-form-item label="变量设置">
        <el-table v-if="commonInfoUse.vars" :data="commonInfoUse.vars" style="width: 100%;">
          <el-table-column label="变量/变量组">
            <template slot-scope="{row}">
              <el-input v-model="row.key" placeholder="请输入变量" size="small"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="类型">
            <template slot-scope="{row}">
              <el-select v-model="row.type" placeholder="请选择类型" size="small" style="width: 100px; margin-right: 10px;">
                <el-option label="字符串" value="string"></el-option>
                <el-option label="枚举" value="enum"></el-option>
                <el-option label="动态" value="async"></el-option>
              </el-select>
              <i v-show="row.type !== 'string'" class="el-icon-edit" style="cursor: pointer;" @click="varData = row"></i>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="默认值">
            <template slot-scope="{row}">
              <el-input v-if="row.type==='string'" v-model="row.value" placeholder="请输入默认值" size="small"></el-input>
              <el-select v-else-if="row.type==='enum'" v-model="row.value" placeholder="请选择默认值" size="small">
                <el-option label="TEST1" value="TEST1"></el-option>
                <el-option label="TEST2" value="TEST2"></el-option>
                <el-option label="TEST3" value="TEST3"></el-option>
              </el-select>
              <span v-else>无</span>
            </template>
          </el-table-column>
          <el-table-column label="敏感信息" width="100px" align="center">
            <template slot-scope="{row}">
              <el-checkbox v-model="row.is_credential"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80px" align="center">
            <template slot-scope="{ $index }">
              <i class="el-icon-delete" style="color: red;" @click="handleVars('delete', $index)"></i>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="text" icon="el-icon-plus" @click="handleVars('add')">添加变量</el-button>
      </el-form-item>
    </el-form>
    <BasicDialog :value.sync="varData"></BasicDialog>
  </div>
</template>

<script>
import BasicDialog from './basic_dialog.vue'
import { mapState } from 'vuex'
import { cloneDeep } from 'lodash'
export default {
  data () {
    return {
      commonInfoUse: null,
      varData: null
    }
  },
  computed: {
    ...mapState({
      commonInfo: state => state.common_pipeline.commonInfo
    })
  },
  watch: {
    commonInfo: {
      handler (newV, oldV) {
        const { pipelineName, projectName, desc, vars } = cloneDeep(newV)
        this.commonInfoUse = { pipelineName, projectName, desc, vars }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleVars (type, index) {
      if (type === 'delete') {
        this.commonInfoUse.vars.splice(index, 1)
      } else if (type === 'add') {
        this.commonInfoUse.vars.push({
          key: 'key',
          type: 'string',
          value: 'value',
          is_credential: false
        })
      }
    },
    storeInfo () {
      this.$store.commit('UPDATE_COMMON_INFO', this.commonInfoUse)
    }
  },
  components: {
    BasicDialog
  },
  deactivated () {
    this.storeInfo()
    console.log('deactivated')
  }
}
</script>

<style lang="less" scoped>
.common-basic-info {
  /deep/.el-form {
    &.el-form--label-top {
      .el-form-item__label {
        padding: 0;
      }
    }

    .el-form-item {
      margin-bottom: 10px;
    }
  }

  .el-input,
  .el-select {
    width: 80%;
  }

  .el-select > .el-input {
    width: 100%;
  }
}
</style>
