import store from '../store'
import { isEmpty } from 'lodash'
export async function checkPermission (opts) {
  const { projectName, action, logic, isPublic } = opts
  return permissionCheckingLogic({
    isPublic,
    projectName,
    action,
    logic
  })
}

export function checkPermissionSync (opts) {
  const { projectName, action, logic, isPublic } = opts
  return permissionCheckingLogic({
    isPublic,
    projectName,
    action,
    logic
  })
}

export async function permissionCheckingLogic (opts) {
  const { permissions, projectName, action, logic, isPublic } = opts
  if (isPublic) {
    return true
  }
  const currentProjectPermissions = permissions[projectName] ? permissions[projectName] : {}
  if (!isEmpty(currentProjectPermissions)) {
    let permissionActions = []
    for (const resource in currentProjectPermissions) {
      if (Object.hasOwnProperty.call(currentProjectPermissions, resource)) {
        permissionActions = permissionActions.concat(currentProjectPermissions[resource])
      }
    }
    // * means all actions
    if (permissionActions.includes('*')) {
      return true
    }
    if (action) {
      return permissionActions.includes(action)
    }
    if (logic) {
      const { actions, operator } = logic
      if (operator === 'and') {
        for (const action of actions) {
          if (!permissionActions.includes(action)) {
            return false
          }
        }
      }
      if (operator === 'or') {
        for (const action of actions) {
          if (permissionActions.includes(action)) {
            return true
          }
        }
      }
    }
  } else if (isEmpty(currentProjectPermissions)) {
    await store.dispatch('checkingPermission', projectName)
  } else {
    return false
  }
}

export function projectRoleCheckingLogic (opts) {
  const { projectName, role } = opts

  const templates = store.state.project_templates.templates

  if (templates.length === 0) {
    return true
  }

  const projectTemplate = templates.find(item => item.product_name === projectName) // 使用唯一字段product_name，project_name是alias，不唯一

  if (projectTemplate) {
    if (projectTemplate.role === 'admin') {
      return true
    }

    if (role) {
      return projectTemplate.role === role
    }
  }

  return false
}
