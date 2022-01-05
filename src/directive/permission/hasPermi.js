import store from '@/store'
import { permissionCheckingLogic } from '@utils/checkPermission'
export default {
  async inserted (el, binding) {
    const { projectName, action, logic, isPublic } = binding.value
    let hasPermission
    if (isPublic) {
      hasPermission = true
    } else {
      hasPermission = await permissionCheckingLogic({
        permissions: store.state.projectPermission,
        projectName,
        isPublic,
        action,
        logic
      })
    }
    if (!hasPermission) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}
