<template>
  <el-dialog class="form" title="添加成员" width="550px" :visible.sync="addUserFormVisible">
    <el-form :model="form" ref="form" :rules="formRules" label-width="100px">
      <el-form-item label="用户名称" prop="uids">
        <el-select class="select" v-model="form.uids" filterable multiple size="small" placeholder="请输入用户名称进行搜索">
          <el-option label="所有用户" value="*">
            <span>所有用户</span>
          </el-option>
          <el-option
            v-for="user in users"
            :key="user.uid"
            :label="user.name ? `${user.name}(${user.account})` : user.account"
            :value="user.uid"
          >
            <span v-if="user.identity_type">
              <i class="iconfont" :class="'icon'+user.identity_type"></i>
              <span>{{user.name ? `${user.name}(${user.account})` : user.account}}</span>
            </span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="角色名称" prop="name">
        <el-select class="select" v-model="form.name" filterable size="small" placeholder="请输入角色名称进行搜索">
          <el-option
            v-for="item in rolesFiltered"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          >{{item.name}} {{item.isPublic ? '(公共角色)': ''}}</el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="addUserFormVisible = false">取 消</el-button>
      <el-button size="small" @click="submit()" type="primary">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { usersAPI, addRoleBindingsAPI } from '@/api'

export default {
  name: 'addRoleBind',
  props: {
    projectName: String,
    rolesFiltered: Array,
    getMembers: Function
  },
  data () {
    return {
      addUserFormVisible: false,
      users: [],
      form: {
        uids: '',
        name: ''
      },
      formRules: {
        uids: [
          {
            type: 'array',
            required: true,
            message: '请选择用户',
            trigger: 'change'
          }
        ],
        name: [
          {
            type: 'string',
            required: true,
            message: '请选择角色',
            trigger: 'change'
          }
        ]
      }
    }
  },
  methods: {
    submit () {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.addMember()
        }
      })
    },
    getUsers () {
      const projectName = this.projectName
      const payload = {
        name: '',
        page: 1,
        per_page: 1000000
      }
      usersAPI(payload, projectName).then(res => {
        this.users = _.uniqBy(res.users, 'uid')
      })
    },
    async addMember () {
      const { uids, name } = this.form
      const role = this.rolesFiltered.find(item => item.name === name)
      const payload = []
      uids.forEach(uid => {
        payload.push({
          uid: uid,
          role: name,
          public: role.isPublic ? role.isPublic : false
        })
      })
      const res = await addRoleBindingsAPI(
        payload,
        this.projectName
      ).catch(error => cosnole.log(error))
      if (res) {
        this.$message({
          message: '添加成员成功',
          type: 'success'
        })

        await this.getMembers()
        this.addUserFormVisible = false
      }
    }
  },
  created () {
    this.getUsers()
  }
}
</script>
<style lang="less" scoped>
.form {
  .el-form-item {
    &:last-child {
      margin-bottom: 0;
    }

    .select {
      width: 100%;
    }
  }
}
</style>
