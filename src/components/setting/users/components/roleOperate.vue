<template>
  <el-dialog :title=" isEdit ? '编辑':'新增' " custom-class="create-user-dialog" :close-on-click-modal="false" :visible.sync="isShowDialogRoleVisible">
    <el-form
      :model="form"
      @submit.native.prevent
      :rules="roleRule"
      ref="roleForm"
      label-position="left"
      label-width="120px"
      class="primary-form"
    >
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="描述信息" prop="account">
        <el-input v-model="form.desc"></el-input>
      </el-form-item>
      <el-form-item label="权限列表" prop="permissions" label-width="100px">
        <div class="permissions-group" v-for="(group,group_index) in permissionGroups" :key="group_index">
          <el-checkbox
            :label="group.resource"
            :key="group.resource"
            :value="calculatePermissionGroupsCheckedState(group.rules)"
            @change="handlePermissionGroupChange(group.rules)"
            :indeterminate="isIndeterminate(group.resource,group.rules)"
          >{{group.alias}}</el-checkbox>
          <div class="sub-permissions">
            <el-checkbox-group v-model="form.permissions">
              <div>
                <el-checkbox
                  class="sub-permissions-checkbox"
                  v-for="(subPermission,sub_index) in   group.rules"
                  :key="sub_index"
                  :label="subPermission. uniqueAction"
                >{{subPermission.alias}}</el-checkbox>
              </div>
            </el-checkbox-group>
          </div>
        </div>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" size="small" @click="submit" class="start-create">确定</el-button>
      <el-button plain native-type="submit" size="small" @click="isShowDialogRoleVisible = false">取消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { getRolePolicyListAPI, addSystemRoleAPI, queryRoleDetailAPI, updateRoleAPI } from '@api'
import { cloneDeep } from 'lodash'

const resources = {}
const initFormData = {
  name: '',
  desc: '',
  permissions: []

}
export default {
  name: 'RoleOperate',
  props: {
    title: {
      type: String,
      default: ''
    },
    currentRole: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      permission: [],
      isShowDialogRoleVisible: false,
      isEdit: false,
      permissionGroups: [],
      form: {
        name: '',
        desc: '',
        permissions: [],
        isPublic: false
      },
      roleRule: {
        name: [
          {
            type: 'string',
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  mounted () {
    this.getPolicyDefinitions()
  },
  methods: {
    initNewForm () {
      this.form = cloneDeep(initFormData)
    },
    async getRoleDetail (role) {
      let res = null
      res = await queryRoleDetailAPI(role.name, '*').catch(error => console.log(error))
      res.rules.forEach(item => {
        if (item.kind === 'resource') {
          item.verbs.forEach(action => {
            this.form.permissions.push(`${item.resources[0]}/${action}`)
          })
        }
      })
    },
    handlePermissionGroupChange (rules) {
      for (let i = 0; i < rules.length; i++) {
        if (this.form.permissions.includes(rules[i].uniqueAction)) {
          const index = this.form.permissions.indexOf(rules[i].uniqueAction)
          this.form.permissions.splice(index, 1)
        } else {
          const res = rules.map(item => item.uniqueAction)
          this.form.permissions = _.uniq(this.form.permissions.concat(res))
          return
        }
      }
    },
    calculatePermissionGroupsCheckedState (rules) {
      for (const rule of rules) {
        if (!this.form.permissions.includes(rule.uniqueAction)) {
          return false
        }
      }
      return true
    },
    isIndeterminate (resource, rules) {
      for (const rule of rules) {
        if (this.form.permissions.includes(rule.uniqueAction)) {
          resources[resource] = true
          return true
        }
      }
      resources[resource] = false

      return false
    },
    async getPolicyDefinitions () {
      const projectName = this.projectName
      const res = await getRolePolicyListAPI(projectName).catch(error =>
        console.log(error)
      )
      if (res) {
        res.forEach(group => {
          group.rules.forEach(item => {
            item.uniqueAction = `${group.resource}/${item.action}`
            item.resource = group.resource
          })
        })
        this.permissionGroups = res
      }
    },
    async submit () {
      const res = await this.$refs.roleForm.validate()
      const resource = []
      const projectName = this.projectName
      Object.keys(resources).forEach(i => {
        if (resources[i]) {
          resource.push(i)
        }
      })

      const rules = []
      const permissions = this.form.permissions
      if (res) {
        const resourceMap = {}
        for (let index = 0; index < permissions.length; index++) {
          const element = permissions[index]
          const resource = element.split('/')[0]
          const action = element.split('/')[1]
          resourceMap[resource] = resourceMap[resource] || []
          resourceMap[resource].push(action)
        }
        for (const resource in resourceMap) {
          if (Object.hasOwnProperty.call(resourceMap, resource)) {
            const element = resourceMap[resource]
            rules.push({
              kind: 'resource',
              resources: [resource],
              verbs: element
            })
          }
        }
        if (this.isEdit) {
          let result = null
          result = await updateRoleAPI({ name: this.form.name, rules: rules }).catch(error => console.log(error))
          if (result) {
            this.$message.success('修改成功')
            this.isShowDialogRoleVisible = false
            this.$emit('refreshUserList')
          }
        } else {
          const { name, desc } = this.form
          const result = await addSystemRoleAPI({
            name,
            desc,
            rules: rules
          }).catch(error => console.log(error))
          if (result) {
            this.$message.success('添加成功')
            this.isShowDialogRoleVisible = false
            this.$emit('refreshUserList')
          }
        }
      }
    }
  },
  watch: {
    isShowDialogRoleVisible: {
      handler: function (newVal, oldVal) {
        console.log(this.currentRole)
        if (newVal && this.currentRole) {
          this.isEdit = true
          this.getRoleDetail(this.currentRole)
          this.form.name = this.currentRole.name
          this.form.desc = this.currentRole.desc
        } else {
          this.isEdit = false
          this.initNewForm()
        }
      },
      immediate: true
    }
  }
}
</script>
