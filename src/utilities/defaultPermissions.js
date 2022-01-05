export const permissions = {
  Workflow: [
    'get_workflow',
    'edit_workflow',
    'create_workflow',
    'delete_workflow',
    'run_workflow'
  ],
  Environment: [
    'get_environment',
    'create_environment',
    'config_environment',
    'manage_environment',
    'delete_environment'
  ],
  Service: [
    'get_service',
    'edit_service',
    'create_service',
    'delete_service',
    'get_build',
    'create_build',
    'edit_build',
    'delete_build'
  ],
  Test: [
    'get_test',
    'edit_test',
    'delete_test',
    'create_test',
    'run_test'
  ],
  Delivery: [
    'get_delivery',
    'delete_delivery',
    'create_delivery'
  ],
  ProductionEnvironment: [
    'get_environment',
    'create_environment',
    'config_environment',
    'manage_environment',
    'delete_environment'
  ]
}
