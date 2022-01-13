import hasPermi from './permission/hasPermi'
import hasRole from './permission/hasRole'

const install = function (Vue) {
  Vue.directive('hasPermi', hasPermi)
  Vue.directive('hasRole', hasRole)
}

export default install
