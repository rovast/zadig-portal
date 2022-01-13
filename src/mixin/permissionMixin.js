import { permissionCheckingLogic } from '@utils/checkPermission'
export default {
  methods: {
    async checkingPermissionMixin (payload) {
      const hasPermission = await permissionCheckingLogic(payload)
      return hasPermission
    }
  }
}
