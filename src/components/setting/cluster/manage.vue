<template>
  <div
    v-loading="loading"
    element-loading-text="加载中..."
    element-loading-spinner="iconfont iconfont-loading iconjiqun"
    class="setting-cluster-container"
  >
    <!--Cluster-access-dialog-->
    <el-dialog
      :title="`接入集群 ${accessCluster.name}`"
      :visible.sync="dialogClusterAccessVisible"
      custom-class="dialog-style"
      :close-on-click-modal="false"
      width="75%"
    >
      <p>运行下面的 kubectl 命令，将其导入到 Zadig 系统中</p>
      <div class="highlighter-rouge">
        <div class="highlight">
          <span class="code-line">
            {{`$ kubectl apply -f "${$utils.getOrigin()}/api/aslan/cluster/agent/${accessCluster.id}/agent.yaml${deployType==='Deployment'?'?type=deploy':''}"`}}
            <span
              v-clipboard:copy="getYamlUrl()"
              v-clipboard:success="copyCommandSuccess"
              v-clipboard:error="copyCommandError"
              class="el-icon-document-copy copy"
            ></span>
          </span>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button :plain="true" size="small" type="primary" @click="dialogClusterAccessVisible=false">确定</el-button>
      </div>
    </el-dialog>
    <!--Cluster-access-dialog-->

    <!--Cluster-dialog-->
    <el-dialog
      :title="isEdit ? '修改集群': '添加集群'"
      :visible.sync="dialogClusterFormVisible"
      custom-class="dialog-style"
      :close-on-click-modal="false"
      width="45%"
    >
      <el-alert title="注意:" type="warning" style="margin-bottom: 15px;" :closable="false">
        <slot>
          <span class="tip-item">- 如果指定生产集群为“否”，有集成环境创建权限的用户，可以指定使用哪个集群资源。</span>
          <span class="tip-item">
            -
            如果指定生产集群为“是”，超级管理员可以通过权限控制集群资源的使用，以实现业务与资源的严格隔离和安全生产管控。
          </span>
          <span class="tip-item">
            - 接入新的集群后，如需该集群支持泛域名访问，需安装 Ingress Controller，请参阅
            <el-link
              style="font-size: 14px; vertical-align: baseline;"
              type="primary"
              :href="`https://docs.koderover.com/zadig/pages/cluster_manage/`"
              :underline="false"
              target="_blank"
            >帮助</el-link>查看 Agent 部署样例
          </span>
          <span class="tip-item">
            - 如需配置工作流任务的“调度策略”和“缓存资源配置”，请在集群正常接入后进行配置，请参阅
            <el-link
              style="font-size: 14px; vertical-align: baseline;"
              type="primary"
              :href="`https://docs.koderover.com/zadig/pages/cluster_manage/`"
              :underline="false"
              target="_blank"
            >帮助</el-link>
            查看具体的配置。
          </span>
        </slot>
      </el-alert>
      <el-form ref="cluster" :rules="rules" label-width="140px" label-position="left" :model="cluster">
        <el-form-item label="名称" prop="name">
          <el-input size="small" v-model="cluster.name" placeholder="请输入集群名称"></el-input>
        </el-form-item>
        <el-form-item label="集群提供商" prop="provider">
          <el-select v-model="cluster.provider" style="width: 100%;" size="small" placeholder="请选择集群提供商">
            <el-option :value="1" label="阿里云 ACK">
              <i class="iconfont iconaliyun"></i>
              <span>阿里云 ACK</span>
            </el-option>

            <el-option :value="2" label="腾讯云 TKE">
              <i class="iconfont icontengxunyun"></i>
              <span>腾讯云 TKE</span>
            </el-option>
            <el-option :value="3" label="华为云 CCE">
              <i class="iconfont iconhuawei"></i>
              <span>华为云 CCE</span>
            </el-option>
            <el-option :value="0" label="其他">
              <i class="iconfont iconqita"></i>
              <span>其他</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input size="small" v-model="cluster.description" placeholder="请输入描述"></el-input>
        </el-form-item>
        <el-form-item label="生产集群" prop="production">
          <el-radio-group v-model="cluster.production">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-button type="text" @click="expandAdvanced = !expandAdvanced">
          高级配置
          <i :class="{'el-icon-arrow-right': !expandAdvanced,'el-icon-arrow-down': expandAdvanced}"></i>
        </el-button>
        <template v-if="expandAdvanced">
          <section>
            <h4>指定项目范围</h4>
            <el-form-item label="选择项目" prop="advanced_config.project_names" class="project-scoped">
              <el-select
                v-model="cluster.advanced_config.project_names"
                placeholder="请选择项目"
                size="small"
                style="width: 100%;"
                filterable
                multiple
                clearable
                collapse-tags
              >
                <el-option v-for="name in projectNames" :key="name" :label="name" :value="name"></el-option>
              </el-select>
              <el-button size="mini" plain @click="cluster.advanced_config.project_names = []">清空所有</el-button>
            </el-form-item>
          </section>
          <section v-show="isEdit">
            <h4>
              调度策略
              <el-tooltip effect="dark" placement="top">
                <div slot="content" style="line-height: 1.5;">
                  <div>随机调度：工作流任务被随机调度到集群的可用节点上</div>
                  <div>强制调度：工作流任务被强制调度到对应节点上，如果节点有问题，任务可能调度不成功</div>
                  <div>优先调度：工作流任务被优先调度到对应节点上，如果节点有问题，会调度到其他可用节点上</div>
                </div>
                <i class="el-icon-question"></i>
              </el-tooltip>
              <span v-if="!isConfigurable" style="color: #e6a23c; font-weight: 400; font-size: 12px;">集群正常接入后才可选择调度策略</span>
            </h4>
            <el-form-item prop="advanced_config.strategy" >
              <span slot="label">选择策略</span>
              <el-select
                v-model="cluster.advanced_config.strategy"
                placeholder="请选择策略"
                style="width: 100%;"
                size="small"
                required
                :disabled="!isConfigurable"
              >
                <el-option label="随机调度" value="normal"></el-option>
                <el-option label="强制调度" value="required"></el-option>
                <el-option label="优先调度" value="preferred"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="cluster.advanced_config.strategy && cluster.advanced_config.strategy !== 'normal'" prop="advanced_config.node_labels" label="选择标签">
              <el-select v-model="cluster.advanced_config.node_labels" placeholder="请选择" multiple style="width: 100%;" size="small">
                <el-option v-for="node in clusterNodes.labels" :key="node" :label="node" :value="node"></el-option>
              </el-select>
              <span style="color: #e6a23c; font-size: 12px;" v-if="clusterNodes.labels.length == 0">请先在对应节点上打上标签</span>
              <div class="list-host">
                <div v-for="host in  matchedHost" :key="host.ip">
                  {{host.ip}} &nbsp;&nbsp;-&nbsp;&nbsp;
                  <span
                    :style="{color: host.ready ? '#67c23a' : '#f56c6c'}"
                  >{{host.ready ? 'Ready' : 'Not Ready'}}</span>
                </div>
              </div>
            </el-form-item>
          </section>
          <section v-show="isEdit">
            <h4>
              缓存资源配置
              <el-tooltip effect="dark" placement="top">
                <div slot="content" style="line-height: 1.5;">调度到当前集群的工作流任务将会使用指定存储介质进行缓存</div>
                <i class="el-icon-question"></i>
              </el-tooltip>
              <el-link
                style="font-size: 14px; vertical-align: baseline;"
                type="primary"
                :href="`https://docs.koderover.com/zadig/pages/cluster_manage/`"
                :underline="false"
                target="_blank"
              >帮助</el-link>
            </h4>
            <el-form-item prop="cache.medium_type">
              <span slot="label">选择存储介质</span>
              <el-radio-group v-model="cluster.cache.medium_type" @change="changeMediumType" class="storage-medium">
                <el-radio label="object">对象存储</el-radio>
                <el-radio :disabled="!isConfigurable" label="nfs">
                  集群存储
                  <span v-if="!isConfigurable" style="color: #e6a23c; font-weight: 400; font-size: 12px;">集群正常接入后才可使用集群资源</span>
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="cluster.cache.medium_type === 'object'" prop="cache.object_properties.id">
              <span slot="label">选择对象存储</span>
              <el-select v-model="cluster.cache.object_properties.id" placeholder="请选择对象存储" style="width: 100%;" size="small">
                <template v-if="allStorage.length > 0">
                  <el-option v-for="(item,index) in (cluster.local ? allStorage : externalStorage)" :key="index" :label="`${item.endpoint}/${item.bucket}`" :value="item.id"></el-option>
                </template>
                <el-option v-if="(cluster.local ? allStorage : externalStorage).length === 0" value="NEWCUSTOM">
                  <router-link to="/v1/system/storage" style="color: #606266;">集成对象存储</router-link>
                </el-option>
              </el-select>
            </el-form-item>
            <template v-else-if="cluster.cache.medium_type === 'nfs'">
              <el-form-item prop="cache.nfs_properties.provision_type">
                <span slot="label">选择存储资源</span>
                <el-radio-group v-model="cluster.cache.nfs_properties.provision_type">
                  <el-radio label="dynamic">动态生成资源</el-radio>
                  <el-radio label="static">使用现有存储资源</el-radio>
                </el-radio-group>
              </el-form-item>
              <template v-if="cluster.cache.nfs_properties.provision_type === 'dynamic'">
                <el-form-item prop="cache.nfs_properties.storage_class">
                  <span slot="label">选择 Storage Class</span>
                  <el-select v-model="cluster.cache.nfs_properties.storage_class" placeholder="请选择" style="width: 100%;" size="small">
                    <el-option v-for="(item,index) in allStorageClass" :key="index" :label="item" :value="item"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item prop="cache.nfs_properties.storage_size_in_gib">
                  <span slot="label">存储空间大小</span>
                  <el-input
                    v-model.number="cluster.cache.nfs_properties.storage_size_in_gib"
                    style="width: 100%; vertical-align: baseline;"
                    size="small"
                    placeholder="请输入存储空间大小"
                  >
                    <template slot="append">GiB</template>
                  </el-input>
                </el-form-item>
              </template>
              <template v-else-if="cluster.cache.nfs_properties.provision_type === 'static'">
                <el-form-item prop="cache.nfs_properties.pvc">
                  <span slot="label">
                    指定 PVC
                    <el-link
                      style="font-size: 14px; vertical-align: baseline;"
                      type="primary"
                      :href="`https://docs.koderover.com/zadig/pages/cluster_manage/`"
                      :underline="false"
                      target="_blank"
                    >帮助</el-link>
                  </span>
                  <el-select v-model="cluster.cache.nfs_properties.pvc" placeholder="请选择" style="width: 100%;" size="small">
                    <el-option
                      v-for="(item,index) in allPvc"
                      :key="index"
                      :label="`${item.name} ${$utils.formatBytes(item.storage_size_in_bytes)}`"
                      :value="item.name"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </template>
            </template>
          </section>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogClusterFormVisible = false">取 消</el-button>
        <el-button :plain="true" size="small" type="success" @click="clusterOperation(isEdit ? 'update' : 'add')">保存</el-button>
      </div>
    </el-dialog>
    <!--Cluster-dialog-->

    <div class="section">
      <el-alert type="info" :closable="false">
        <template>
          支持阿里云 ACK、腾讯云 TKE、华为云 CCE 等 K8s 集群的接入和使用，详情可参考
          <el-link
            style="font-size: 14px; vertical-align: baseline;"
            type="primary"
            :href="`https://docs.koderover.com/zadig/pages/cluster_manage/`"
            :underline="false"
            target="_blank"
          >帮助文档</el-link>
        </template>
      </el-alert>
      <div class="sync-container">
        <el-button size="small" :plain="true" @click="clusterOperation('init')" type="success">新建</el-button>
      </div>
      <div class="cluster-list">
        <template>
          <el-table :data="allCluster" style="width: 100%;" :row-class-name="tableRowClassName">
            <el-table-column label="名称">
              <template slot-scope="scope">
                <i v-if="scope.row.local" class="iconfont iconvery-k8s"></i>
                <i v-else :class="getProviderMap(scope.row.provider,'icon')"></i>
                <span v-if="scope.row.local">本地集群（local）</span>
                <span v-else>{{scope.row.name}}</span>
              </template>
            </el-table-column>
            <el-table-column width="120" label="状态">
              <template slot-scope="scope">
                <el-tag size="small" effect="dark" :type="statusIndicator[scope.row.status]">{{myTranslate(scope.row.status)}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="生产集群">
              <template slot-scope="scope">
                <span>{{scope.row.production?'是':'否'}}</span>
              </template>
            </el-table-column>
            <el-table-column label="描述">
              <template slot-scope="scope">
                <span>{{scope.row.description}}</span>
              </template>
            </el-table-column>
            <el-table-column label="创建时间">
              <template slot-scope="scope">
                <span>{{$utils.convertTimestamp(scope.row.createdAt)}}</span>
              </template>
            </el-table-column>
            <el-table-column label="创建人">
              <template slot-scope="scope">
                <span>{{scope.row.createdBy}}</span>
              </template>
            </el-table-column>

            <el-table-column width="240" label="操作">
              <template slot-scope="scope">
                <span v-show="!scope.row.local">
                  <el-button
                    v-if="scope.row.status==='pending'||scope.row.status==='abnormal'"
                    @click="clusterOperation('access',scope.row)"
                    size="mini"
                  >接入</el-button>
                  <el-button v-if="scope.row.status==='normal'" @click="clusterOperation('disconnect',scope.row)" size="mini">断开</el-button>
                  <el-button v-if="scope.row.status==='disconnected'" @click="clusterOperation('recover',scope.row)" size="mini">恢复</el-button>
                </span>
                <el-button @click="clusterOperation('edit',scope.row)" size="mini">编辑</el-button>
                <el-button v-show="!scope.row.local" @click="clusterOperation('delete',scope.row)" size="mini" type="danger">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getClusterListAPI,
  createClusterAPI,
  updateClusterAPI,
  deleteClusterAPI,
  recoverClusterAPI,
  disconnectClusterAPI,
  getClusterNodeInfo,
  getClusterStorageClassAPI,
  getClusterPvcAPI,
  getStorageListAPI
} from '@api'
import { wordTranslate } from '@utils/wordTranslate'
import bus from '@utils/eventBus'
import { cloneDeep, omit } from 'lodash'
const validateClusterName = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入集群名称'))
  } else {
    if (!/^[a-z0-9-]+$/.test(value)) {
      callback(new Error('名称只支持小写字母和数字，特殊字符只支持中划线'))
    } else {
      callback()
    }
  }
}

const clusterInfo = {
  name: '',
  provider: null,
  production: false,
  description: '',
  namespace: '',
  cache: {
    medium_type: 'object',
    object_properties: {
      id: ''
    },
    nfs_properties: {
      provision_type: 'dynamic',
      storage_class: '',
      storage_size_in_gib: 0,
      pvc: ''
    }
  },
  advanced_config: {
    project_names: [],
    strategy: 'normal',
    node_labels: []
  }
}
export default {
  data () {
    return {
      statusIndicator: {
        normal: 'success',
        abnormal: 'danger',
        pending: 'info',
        disconnected: 'warning'
      },
      allCluster: [],
      allStorage: [],
      externalStorage: [],
      allStorageClass: [],
      allPvc: [],
      deployType: 'Deployment',
      cluster: cloneDeep(clusterInfo),
      providerMap: {
        0: {
          icon: 'iconfont logo iconqita',
          name: '其他'
        },

        1: {
          icon: 'iconfont logo iconaliyun ',
          name: '阿里云'
        },
        2: {
          icon: 'iconfont logo icontengxunyun',
          name: '腾讯云'
        },
        3: {
          icon: 'iconfont logo iconhuawei',
          name: '华为云'
        }
      },
      accessCluster: {
        yaml: 'init',
        name: 'test'
      },
      dialogClusterFormVisible: false,
      dialogClusterAccessVisible: false,
      loading: false,
      rules: {
        name: [
          {
            type: 'string',
            required: true,
            validator: validateClusterName,
            trigger: 'change'
          }
        ],
        provider: [
          { required: true, message: '请选择提供商', trigger: 'blur' }
        ],
        production: [
          {
            type: 'boolean',
            required: true,
            message: '请选择是否为生产集群'
          }
        ],
        'advanced_config.node_labels': {
          required: false,
          message: '请选择标签',
          type: 'array'
        },
        'advanced_config.project_names': {
          required: false,
          message: '请选择项目',
          type: 'array'
        },
        'cache.object_properties.id': {
          required: true,
          message: '请选择对象存储',
          type: 'string'
        },
        'cache.nfs_properties.provision_type': {
          required: true,
          message: '请选择存储资源',
          type: 'string'
        },
        'cache.nfs_properties.storage_class': {
          required: true,
          message: '请选择 Storage Class',
          type: 'string'
        },
        'cache.nfs_properties.storage_size_in_gib': {
          required: true,
          message: '请输入存储空间大小',
          type: 'number'
        },
        'cache.nfs_properties.pvc': {
          required: true,
          message: '请选择 PVC',
          type: 'string'
        }
      },
      clusterNodes: {
        labels: [],
        data: [] // {labels, ready, ip}
      },
      expandAdvanced: false,
      hasNotified: false
    }
  },
  computed: {
    isEdit () {
      return !!this.cluster.id
    },
    isConfigurable () {
      return this.cluster.id && this.cluster.status === 'normal'
    },
    matchedHost () {
      const labels = this.cluster.advanced_config.node_labels
      return this.clusterNodes.data.filter(data => {
        return labels.filter(label => {
          return data.labels.includes(label)
        }).length
      })
    },
    projectNames () {
      return this.$store.getters.projectList.map(project => project.name)
    }
  },
  watch: {
    dialogClusterFormVisible (nVal, oldV) {
      if (!nVal) {
        this.expandAdvanced = false
        this.clearValidate()
        this.clusterNodes = {
          labels: [],
          data: []
        }
      } else if (!this.isEdit) {
        this.cluster.advanced_config.project_names = cloneDeep(
          this.projectNames
        )
      }
    }
  },
  methods: {
    async getStorage () {
      await getStorageListAPI().then(res => {
        this.allStorage = res
        this.externalStorage = res.filter(storage => !storage.endpoint.startsWith('zadig-minio.'))
      })
    },
    getClusterNode (clusterId) {
      getClusterNodeInfo(clusterId).then(res => {
        this.clusterNodes = res
      })
    },
    tableRowClassName ({ row, rowIndex }) {
      if (row.local) {
        return 'local-row'
      }
      return ''
    },
    getProviderMap (name, type) {
      if (name && type) {
        return this.providerMap[name][type]
      } else {
        return this.providerMap[0].icon
      }
    },
    getYamlUrl () {
      return `kubectl apply -f "${this.$utils.getOrigin()}/api/aslan/cluster/agent/${
        this.accessCluster.id
      }/agent.yaml${this.deployType === 'Deployment' ? '?type=deploy' : ''}"`
    },
    async clusterOperation (operate, currentCluster) {
      if (operate === 'init') {
        await this.getStorage()
        if (this.allStorage.length > 0) {
          const defaultStorage = this.allStorage.find(
            storage => storage.is_default
          )
          this.cluster.cache.object_properties.id = defaultStorage.id
        }
        this.dialogClusterFormVisible = true
      } else if (operate === 'add') {
        this.$refs.cluster.validate(valid => {
          if (valid) {
            const payload = cloneDeep(omit(this.cluster, 'cache'))
            this.dialogClusterFormVisible = false
            this.addCluster(payload)
          } else {
            return false
          }
        })
      } else if (operate === 'access') {
        this.accessCluster = cloneDeep(currentCluster)
        this.dialogClusterAccessVisible = true
      } else if (operate === 'disconnect') {
        this.$confirm(`确定要断开 ${currentCluster.name} 的连接?`, '确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(({ value }) => {
          this.disconnectCluster(currentCluster.id)
        })
      } else if (operate === 'recover') {
        this.recoverCluster(currentCluster.id)
      } else if (operate === 'edit') {
        const namesapce = currentCluster.local ? 'unknown' : 'koderover-agent'
        this.cluster = cloneDeep(currentCluster)
        if (this.isConfigurable) {
          this.getClusterNode(currentCluster.id)
        }
        if (this.cluster.cache.medium_type === 'object') {
          await this.getStorage()
        } else if (this.cluster.cache.medium_type === 'nfs') {
          this.allStorageClass = await getClusterStorageClassAPI(currentCluster.id)
          this.allPvc = await getClusterPvcAPI(currentCluster.id, namesapce)
        }
        this.dialogClusterFormVisible = true
        this.hasNotified = false
      } else if (operate === 'update') {
        this.$refs.cluster.validate(valid => {
          if (valid) {
            const id = this.cluster.id
            const payload = cloneDeep(this.cluster)
            this.dialogClusterFormVisible = false
            this.updateCluster(id, payload)
          } else {
            return false
          }
        })
      } else if (operate === 'delete') {
        const id = currentCluster.id
        this.$confirm(`确定要删除 ${currentCluster.name} ?`, '确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(({ value }) => {
          deleteClusterAPI(id).then(res => {
            this.getCluster()
            this.$message({
              message: '删除集群成功',
              type: 'success'
            })
          })
        })
      }
    },
    async changeMediumType (type) {
      if (!this.hasNotified) {
        this.$message({
          message: '修改后，之前的缓存将不再生效',
          type: 'info'
        })
      }
      this.hasNotified = true
      const namesapce = this.cluster.local ? 'unknown' : 'koderover-agent'
      const id = this.cluster.id
      if (type === 'object') {
        await this.getStorage()
      } else if (type === 'nfs') {
        this.allPvc = await getClusterPvcAPI(id, namesapce)
        this.allStorageClass = await getClusterStorageClassAPI(id)
      }
    },
    addCluster (payload) {
      createClusterAPI(payload).then(res => {
        this.getCluster()
        this.accessCluster = res
        this.dialogClusterAccessVisible = true
        this.$message({
          type: 'success',
          message: '新增成功'
        })
      })
    },
    disconnectCluster (id) {
      disconnectClusterAPI(id).then(res => {
        this.getCluster()
        this.$message({
          type: 'success',
          message: '断开集群连接成功'
        })
      })
    },
    recoverCluster (id) {
      recoverClusterAPI(id).then(res => {
        this.getCluster()
        this.$message({
          type: 'success',
          message: '恢复集群连接成功'
        })
      })
    },
    updateCluster (id, payload) {
      updateClusterAPI(id, payload).then(res => {
        this.getCluster()
        this.$message({
          type: 'success',
          message: '更新成功'
        })
      })
    },
    getCluster () {
      this.loading = true
      getClusterListAPI().then(res => {
        this.loading = false
        const localId = res.findIndex(re => re.local)
        if (localId !== -1) {
          const local = res.splice(localId, 1)
          res.unshift(local[0])
        } else {
          this.$message.error(`未找到本地集群！`)
        }
        this.allCluster = res.map(re => {
          if (!re.advanced_config.node_labels) {
            re.advanced_config.node_labels = []
          }
          return re
        })
      })
    },
    copyCommandSuccess (event) {
      this.$message({
        message: '命令已成功复制到剪贴板',
        type: 'success'
      })
    },
    copyCommandError (event) {
      this.$message({
        message: '命令复制失败',
        type: 'error'
      })
    },
    myTranslate (word) {
      return wordTranslate(word, 'setting', 'cluster')
    },
    clearValidate () {
      this.cluster = cloneDeep(clusterInfo)
      this.$nextTick(() => {
        this.$refs.cluster.clearValidate()
      })
    }
  },
  created () {
    this.getCluster()
    bus.$emit(`set-topbar-title`, { title: '集群管理', breadcrumb: [] })
  }
}
</script>

<style lang="less">
@import url('~@assets/css/common/scroll-bar.less');

.setting-cluster-container {
  position: relative;
  flex: 1;
  height: 100%;
  padding: 15px 30px;
  overflow: auto;
  font-size: 13px;

  .section {
    margin-bottom: 56px;

    .sync-container {
      padding-top: 15px;
      padding-bottom: 15px;
      overflow: hidden;

      .el-button--success.is-plain {
        color: @themeColor;
        background: #fff;
        border-color: @themeColor;
      }

      .el-button--success.is-plain:hover {
        color: @themeColor;
        background: #fff;
        border-color: @themeColor;
      }
    }

    .cluster-list {
      padding-bottom: 30px;

      .logo {
        font-size: 20px;
      }

      .local-row {
        background: #fafafa;
      }
    }
  }

  .dialog-style {
    .el-dialog__body {
      padding: 0 20px;
    }

    .el-form-item {
      margin-bottom: 10px;
    }

    .tip-item {
      display: block;
      font-size: 14px;
      line-height: 17px;

      &.code {
        display: block;
        margin: 2px 0;
        padding: 0 2px;
        color: #ecf0f1;
        font-size: 13px;
        font-family: monospace;
        word-wrap: break-word;
        word-break: break-all;
        background-color: #3d3d3d;
        background-color: #334851;
        border: 1px solid #0a141a;
        border-radius: 4px;
      }
    }

    .highlighter-rouge {
      .code-line {
        display: block;
        margin: 0;
        padding: 8px 0;
        color: #ecf0f1;
        font-size: 14px;
        font-family: monospace;
        word-wrap: break-word;
        word-break: break-all;
        background-color: #3d3d3d;
        background-color: #334851;
        border: 1px solid #0a141a;
        border-radius: 4px;
      }

      .copy {
        font-size: 16px;
        cursor: pointer;

        &:hover {
          color: @themeColor;
        }
      }
    }

    .command {
      color: #fff;
      font-size: 13px;
      line-height: 20px;
      background: #303133;
    }

    .project-scoped {
      position: relative;

      .el-button {
        position: absolute;
        right: 1px;
        bottom: 6px;
        z-index: 1;
      }
    }

    .storage-medium {
      .el-radio {
        padding: 5px 0;
      }
    }
  }

  .list-host {
    max-height: 50px;
    padding: 5px;
    overflow: auto;
    color: #909399;
    font-size: 12px;

    .blockScrollBar();

    div {
      line-height: 1.2;
    }
  }
}
</style>
