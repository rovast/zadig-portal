<template>
  <el-dialog
    :title="`${clonedUserInfo.name?clonedUserInfo.name:clonedUserInfo.account} 的用户信息`"
    width="30%"
    custom-class="edit-role-dialog"
    :close-on-click-modal="false"
    :visible.sync="dialogEditRoleVisible"
  >
    <el-form :model="clonedUserInfo" @submit.native.prevent :rules="editUserRule" ref="addUserForm">
      <el-form-item label="邮箱" prop="email">
        <el-input size="small" v-model="clonedUserInfo.email"></el-input>
      </el-form-item>
      <el-form-item label="昵称" prop="name">
        <el-input size="small" v-model="clonedUserInfo.name"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="phone">
        <el-input size="small" v-model="clonedUserInfo.phone"></el-input>
      </el-form-item>
      <el-form-item label="角色" prop="isAdmin">
        <el-radio-group v-model="clonedUserInfo.role">
          <el-radio label="admin">管理员</el-radio>
          <el-radio label="">普通用户</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" native-type="submit" size="small" @click="handleUserInfoUpdate()" class="start-create">确定</el-button>
      <el-button plain native-type="submit" size="small" @click="dialogEditRoleVisible = false">取消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import {
  addSystemRoleBindingsAPI,
  deleteSystemRoleBindingsAPI,
  updateUserAPI
} from '@api'
import { cloneDeep } from 'lodash'
export default {
  name: 'editUserRole',
  props: {
    editUser: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      clonedUserInfo: {},
      dialogEditRoleVisible: false,
      editUserRule: {
        email: [
          {
            type: 'string',
            required: true,
            message: '请输入登录邮箱',
            trigger: 'blur'
          },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ],
        name: [
          {
            type: 'string',
            required: true,
            message: '请输入昵称',
            trigger: 'blur'
          }
        ],
        password: [
          {
            type: 'string',
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    async handleUserInfoUpdate () {
      const payload = cloneDeep(this.clonedUserInfo)
      const userRes = await updateUserAPI(payload.uid, payload)
      if (userRes) {
        if (this.editUser.role !== payload.role) {
          if (this.editUser.role === 'admin' && payload.role === '') {
            this.deleteBindings(payload.name)
          } else if (this.editUser.role === '' && payload.role === 'admin') {
            this.addBindings(payload.name)
          }
        }
        this.$message.success('用户信息修改成功')
        this.$emit('refreshUserList')
        this.dialogEditRoleVisible = false
      }
    },
    async deleteBindings (name) {
      const res = await deleteSystemRoleBindingsAPI(name).catch(error =>
        console.log(error)
      )
    },
    async addBindings () {
      const paload = {
        name: this.editUser.account + '-' + this.editUser.identity_type,
        role: 'admin',
        uid: this.clonedUserInfo.uid
      }
      const res = await addSystemRoleBindingsAPI(paload).catch(error =>
        console.log(error)
      )
    }
  },
  watch: {
    dialogEditRoleVisible (value) {
      if (value) {
        this.clonedUserInfo = cloneDeep(this.editUser)
      }
    }
  }
}
</script>
