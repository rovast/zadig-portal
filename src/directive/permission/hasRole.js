import utils from '@utils/utilities'
import store from '@/store'

export default {
  inserted (el, binding) {
    const { projectName, role } = binding.value
    const templates = store.state.project_templates.templates
    let hasPermissions = false

    if (!projectName) {
      if (role === 'superAdmin') {
        hasPermissions = !!utils.roleCheck().superAdmin
      } else {
        hasPermissions = true
      }
    } else {
      if (templates.length === 0) {
        hasPermissions = true
      } else {
        const projectTemplate = templates.find((item) => item.product_name === projectName) // 使用唯一字段product_name，project_name是alias，不唯一
        if (projectTemplate) {
          if (projectTemplate.role === 'admin') {
            hasPermissions = true
          } else if (role) {
            hasPermissions = projectTemplate.role === role
          }
        }
      }
    }

    if (!hasPermissions) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}
