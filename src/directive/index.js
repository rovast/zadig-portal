import hasPermi from './perimission/hasPermi'
import hasRole from './perimission/hasRole'

const install = function (Vue) {
  Vue.directive('hasPermi', hasPermi)
  Vue.directive('hasRole', hasRole)
}

export default install
