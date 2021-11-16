<template>
  <div class="basic-dialog">
    <el-dialog :visible.sync="dialogVisible" width="600px">
      <div slot="title">{{title}}</div>

      <section v-if="value">
        <el-form ref="form" v-if="value.type === 'enum'" :model="formData" label-width="90px">
          <el-form-item label="变量名称">
            <el-input v-model="value.key" disabled size="small"></el-input>
          </el-form-item>
          <el-form-item label="可选值">
            <el-input type="textarea" v-model="formData.enumData" placeholder="可选值之间用英文 “,” 隔开" size="small" rows="4"></el-input>
          </el-form-item>
        </el-form>

        <el-form ref="form" v-else-if="value.type === 'async'" :model="formData" label-width="90px">
          <el-form-item label="API 地址">
            <el-row :gutter="10">
              <el-col :span="10">
                <el-select v-model="formData.external" placeholder="请选择外部系统" size="small">
                  <el-option label="item1" value="item1"></el-option>
                  <el-option label="item2" value="item2"></el-option>
                </el-select>
              </el-col>
              <el-col :span="10">
                <el-input v-model="value.path" size="small" placeholder="输入访问路径"></el-input>
              </el-col>
            </el-row>
            <div>
              <el-radio-group v-model="check" size="mini">
                <el-radio-button label="header">Headers</el-radio-button>
                <el-radio-button label="body">Body</el-radio-button>
              </el-radio-group>
            </div>
            <el-table :data="formData[check]" style="width: 100%;">
              <el-table-column label="Header Name">
                <template slot-scope="{row}">
                  <el-input v-model="row.name" placeholder="Header Name" size="small"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="Header Value">
                <template slot-scope="{row}">
                  <el-input v-model="row.value" placeholder="Header Value" size="small"></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="value" label="操作">
                <template slot-scope="{}">
                  <el-button type="text" icon="el-icon-remove-outline"></el-button>
                  <el-button type="text" icon="el-icon-circle-plus-outline"></el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
          <el-form-item label="变量名称">
            <el-row :gutter="10" v-for="vars in formData.vars" :key="vars.name">
              <el-col :span="8">
                  <el-input v-model="vars.name" placeholder="变量名" size="small"></el-input>
              </el-col>
              <el-col :span="2">
                  <span> -&gt; </span>
              </el-col>
              <el-col :span="8">
                  <el-input v-model="vars.returnName" placeholder="接口返回字段" size="small"></el-input>
              </el-col>
              <el-col :span="5">
                  <el-button type="text" icon="el-icon-remove-outline"></el-button>
                  <el-button type="text" icon="el-icon-circle-plus-outline"></el-button>
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
      </section>

      <div slot="footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="summit" size="small">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    value: Object
  },
  data () {
    return {
      formData: {
        enumData: '',
        external: '',
        path: '',
        header: [
          {
            name: '',
            value: ''
          }
        ],
        body: [
          {
            name: '',
            value: ''
          }
        ],
        vars: [
          {
            name: '',
            returnName: ''
          }
        ]
      },
      check: 'header' // body
    }
  },
  computed: {
    title () {
      if (this.value) {
        if (this.value.type === 'enum') {
          return '枚举'
        } else if (this.value.type === 'async') {
          return '动态变量'
        }
      }
      return ''
    },
    dialogVisible: {
      get () {
        return !!this.value
      },
      set (val) {
        this.$emit('update:value', null)
      }
    }
  },
  methods: {
    summit () {
      console.log('确定')
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.basic-dialog {
  /deep/.el-input {
    width: 100%;
  }
}
</style>
