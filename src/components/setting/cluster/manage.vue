<template>
    <div v-loading="loading"
         element-loading-text="加载中..."
         element-loading-spinner="iconfont iconfont-loading iconjiqun"
         class="setting-cluster-container">
      <!--Cluster-access-dialog-->
      <el-dialog :title='`接入集群 ${accessCluster.name}`'
                 :visible.sync="dialogClusterAccessVisible"
                 custom-class="dialog-style"
                 :close-on-click-modal="false"
                 width="75%">
        <p>运行下面的 kubectl 命令，将其导入到 Zadig 系统中</p>
        <div class="highlighter-rouge">
          <div class="highlight">
            <span class="code-line">
              {{`$ kubectl apply -f "${$utils.getOrigin()}/api/aslan/cluster/agent/${accessCluster.id}/agent.yaml${deployType==='Deployment'?'?type=deploy':''}"`}}
              <span v-clipboard:copy="getYamlUrl()"
                    v-clipboard:success="copyCommandSuccess"
                    v-clipboard:error="copyCommandError"
                    class="el-icon-document-copy copy"></span>
            </span>
          </div>
        </div>
        <div slot="footer"
             class="dialog-footer">
          <el-button :plain="true"
                     size="small"
                     type="primary"
                     @click="dialogClusterAccessVisible=false">确定</el-button>
        </div>
      </el-dialog>
      <!--Cluster-access-dialog-->

      <!--Cluster-dialog-->
      <el-dialog :title="isEdit ? '修改集群': '添加集群'"
                 :visible.sync="dialogClusterFormVisible"
                 custom-class="dialog-style"
                 :close-on-click-modal="false"
                 width="45%">
        <el-alert title="注意:"
                  type="warning"
                  style="margin-bottom: 15px;"
                  :closable="false">
          <slot>
            <span class="tip-item">- 如果指定生产集群为“否”，有集成环境创建权限的用户，可以指定使用哪个集群资源。</span>
            <span class="tip-item">-
              如果指定生产集群为“是”，超级管理员可以通过权限控制集群资源的使用，以实现业务与资源的严格隔离和安全生产管控。</span>
            <span class="tip-item">- 接入新的集群后，如需该集群支持泛域名访问，需安装 Ingress Controller，请参阅
              <el-link style="font-size: 13px;"
                       type="primary"
                       :href="`https://docs.koderover.com/zadig/pages/cluster_manage/`"
                       :underline="false"
                       target="_blank">帮助</el-link> 查看 Agent 部署样例
            </span>
          </slot>
        </el-alert>
        <el-form ref="cluster"
                 :rules="rules"
                 label-width="120px"
                 label-position="left"
                 :model="cluster">
          <el-form-item label="名称"
                        prop="name">
            <el-input size="small"
                      v-model="cluster.name"
                      placeholder="请输入集群名称"></el-input>
          </el-form-item>
          <el-form-item label="集群提供商"
                        prop="provider">
            <el-select v-model="cluster.provider"
                       style="width: 100%;"
                       size="small"
                       placeholder="请选择集群提供商">
              <el-option :value="1"
                         label="阿里云 ACK">
                <i class="iconfont iconaliyun"></i> <span>阿里云 ACK</span>
              </el-option>

              <el-option :value="2"
                         label="腾讯云 TKE">
                <i class="iconfont icontengxunyun"></i> <span>腾讯云 TKE</span>
              </el-option>
              <el-option :value="3"
                         label="华为云 CCE">
                <i class="iconfont iconhuawei"></i> <span>华为云 CCE</span>
              </el-option>
              <el-option :value="0"
                         label="其它">
                <i class="iconfont iconqita"></i> <span>其它</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="描述"
                        prop="description">
            <el-input size="small"
                      v-model="cluster.description"
                      placeholder="请输入描述"></el-input>
          </el-form-item>
          <el-form-item label="生产集群"
                        prop="production">
            <el-radio-group v-model="cluster.production">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <div v-if="isEdit">
            <el-button type="text" @click="advancedConfig">高级配置<i :class="{'el-icon-arrow-right': !cluster.config.strategy,'el-icon-arrow-down': cluster.config.strategy}"></i></el-button>
            <div v-if="cluster.config.strategy">
              <h4>调度策略</h4>
              <el-form-item label="选择策略" prop="config.strategy" required>
                <el-select v-model="cluster.config.strategy" placeholder="请选择策略" size="small" required>
                  <el-option label="随机调度" value="normal"></el-option>
                  <el-option label="强制调度" value="required"></el-option>
                  <el-option label="优先调度" value="preferred"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item v-if="cluster.config.strategy !== 'normal'"  prop="config.node_labels" label="选择标签">
                <el-select v-model="cluster.config.node_labels" placeholder="请选择" multiple size="small">
                  <el-option v-for="node in clusterNodes.labels" :key="node" :label="node" :value="node"></el-option>
                </el-select>
                <span style="color: #e6a23c; font-size: 12px;" v-if="clusterNodes.labels.length == 0">请先在对应节点上打上标签</span>
                <div class="list-host">
                  <div v-for="host in  matchedHost" :key="host.node_ip">
                    {{host.node_ip}} &nbsp;&nbsp;-&nbsp;&nbsp; {{host.node_status}}
                  </div>
                </div>
              </el-form-item>
            </div>
          </div>

        </el-form>
        <div slot="footer"
             class="dialog-footer">
          <el-button size="small"
                     @click="dialogClusterFormVisible = false">取 消</el-button>
          <el-button :plain="true"
                     size="small"
                     type="success"
                     @click="clusterOperation(isEdit ? 'update' : 'add')">保存</el-button>
        </div>
      </el-dialog>
      <!--Cluster-dialog-->

      <div class="section">
        <el-alert type="info"
                  :closable="false">
          <template>
            基于本地集群安装，同时支持外部多个 K8s 集群资源的接入和使用<br />
            详细配置可参考
            <el-link style="font-size: 14px; vertical-align: baseline;"
                     type="primary"
                     :href="`https://docs.koderover.com/zadig/pages/cluster_manage/`"
                     :underline="false"
                     target="_blank">帮助文档</el-link>
          </template>
        </el-alert>
        <div class="sync-container">
          <el-button size="small"
                     :plain="true"
                     @click="dialogClusterFormVisible=true"
                     type="success">新建</el-button>
        </div>
        <div class="cluster-list">
          <template>
            <el-table :data="allCluster"
                      style="width: 100%;"
                      :row-class-name="tableRowClassName">
              <el-table-column label="名称">
                <template slot-scope="scope">
                  <i v-if="scope.row.local" class="iconfont iconk8s"></i>
                  <i v-else :class="getProviderMap(scope.row.provider,'icon')"></i>
                  <span v-if="scope.row.local">本地集群（local）</span>
                  <span v-else>{{scope.row.name}}</span>
                </template>
              </el-table-column>
              <el-table-column width="120"
                               label="状态">
                <template slot-scope="scope">
                  <el-tag size="small"
                          effect="dark"
                          :type="statusIndicator[scope.row.status]">
                    {{myTranslate(scope.row.status)}}</el-tag>
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

              <el-table-column width="240"
                               label="操作">
                <template slot-scope="scope">
                  <span v-show="!scope.row.local">
                    <el-button v-if="scope.row.status==='pending'||scope.row.status==='abnormal'"
                              @click="clusterOperation('access',scope.row)"
                              size="mini">接入</el-button>
                    <el-button v-if="scope.row.status==='normal'"
                              @click="clusterOperation('disconnect',scope.row)"
                              size="mini">断开</el-button>
                    <el-button v-if="scope.row.status==='disconnected'"
                              @click="clusterOperation('recover',scope.row)"
                              size="mini">恢复</el-button>
                  </span>
                  <el-button @click="clusterOperation('edit',scope.row)"
                             size="mini">编辑</el-button>
                  <el-button v-show="!scope.row.local"
                             @click="clusterOperation('delete',scope.row)"
                             size="mini"
                             type="danger">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </div>
      </div>
    </div>
</template>

<script>
import { getClusterListAPI, createClusterAPI, updateClusterAPI, deleteClusterAPI, recoverClusterAPI, disconnectClusterAPI, getClusterNodeInfo } from '@api'
import { wordTranslate } from '@utils/word_translate'
import bus from '@utils/event_bus'
import { cloneDeep } from 'lodash'
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
  namespace: ''
  // config: { // 编辑的时候有这个数据
  //   strategy: '',
  //   node_labels: []
  // }
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
      deployType: 'Deployment',
      cluster: cloneDeep(clusterInfo),
      providerMap: {
        0: {
          icon: 'iconfont logo iconqita',
          name: '其它'
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
        name: [{
          type: 'string',
          required: true,
          validator: validateClusterName,
          trigger: 'change'
        }],
        provider: [{ required: true, message: '请选择提供商', trigger: 'blur' }],
        production: [{
          type: 'boolean',
          required: true,
          message: '请选择是否为生产集群'
        }],
        'config.node_labels': {
          required: true,
          message: '请选择标签',
          type: 'array'
        }
      },
      clusterNodes: {
        labels: [],
        data: [] // {node_labels, node_status, node_ip}
      }

    }
  },
  computed: {
    isEdit () {
      return !!this.cluster.id
    },
    matchedHost () {
      const labels = this.cluster.config.node_labels
      return this.clusterNodes.data.filter(data => {
        return labels.filter(label => {
          return data.node_labels.includes(label)
        }).length
      })
    }
  },
  watch: {
    dialogClusterFormVisible (nVal, oldV) {
      if (!nVal) {
        this.clearValidate()
      }
    }
  },
  methods: {
    advancedConfig () {
      if (!this.cluster.config.strategy) {
        this.cluster.config.strategy = 'normal'
      } else {
        this.cluster.config = {
          strategy: '',
          node_labels: []
        }
      }
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
      return `kubectl apply -f "${this.$utils.getOrigin()}/api/aslan/cluster/agent/${this.accessCluster.id}/agent.yaml${this.deployType === 'Deployment' ? '?type=deploy' : ''}"`
    },
    clusterOperation (operate, current_cluster) {
      if (operate === 'add') {
        this.$refs.cluster.validate(valid => {
          if (valid) {
            const payload = this.cluster
            this.dialogClusterFormVisible = false
            this.addCluster(payload)
          } else {
            return false
          }
        })
      } else if (operate === 'access') {
        this.accessCluster = this.$utils.cloneObj(current_cluster)
        this.dialogClusterAccessVisible = true
      } else if (operate === 'disconnect') {
        this.$confirm(`确定要断开 ${current_cluster.name} 的连接?`, '确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(({ value }) => {
          this.disconnectCluster(current_cluster.id)
        })
      } else if (operate === 'recover') {
        this.recoverCluster(current_cluster.id)
      } else if (operate === 'edit') {
        this.getClusterNode(current_cluster.id)
        this.cluster = this.$utils.cloneObj(current_cluster)
        this.dialogClusterFormVisible = true
      } else if (operate === 'update') {
        this.$refs.cluster.validate(valid => {
          if (valid) {
            const id = this.cluster.id
            const payload = this.cluster
            this.dialogClusterFormVisible = false
            this.updateCluster(id, payload)
          } else {
            return false
          }
        })
      } else if (operate === 'delete') {
        const id = current_cluster.id
        this.$confirm(`确定要删除 ${current_cluster.name} ?`, '确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(({ value }) => {
          deleteClusterAPI(id).then((res) => {
            this.getCluster()
            this.$message({
              message: '删除集群成功',
              type: 'success'
            })
          })
        })
      }
    },
    addCluster (payload) {
      createClusterAPI(payload).then((res) => {
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
      disconnectClusterAPI(id).then((res) => {
        this.getCluster()
        this.$message({
          type: 'success',
          message: '断开集群连接成功'
        })
      })
    },
    recoverCluster (id) {
      recoverClusterAPI(id).then((res) => {
        this.getCluster()
        this.$message({
          type: 'success',
          message: '恢复集群连接成功'
        })
      })
    },
    updateCluster (id, payload) {
      updateClusterAPI(id, payload).then((res) => {
        this.getCluster()
        this.$message({
          type: 'success',
          message: '更新成功'
        })
      })
    },
    getCluster () {
      this.loading = true
      getClusterListAPI().then((res) => {
        this.loading = false
        const localId = res.findIndex(re => re.local)
        if (localId !== -1) {
          const local = res.splice(localId, 1)
          res.unshift(local[0])
        } else {
          this.$message.error(`未找到本地集群！`)
        }
        this.allCluster = res.map(re => {
          if (!re.config) {
            re.config = {
              strategy: '',
              node_labels: []
            }
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
    bus.$emit(`set-sub-sidebar-title`, {
      title: '',
      routerList: []
    })
  }
}
</script>

<style lang="less">
.setting-cluster-container {
  position: relative;
  flex: 1;
  padding: 15px 30px;
  overflow: auto;
  font-size: 13px;

  .module-title h1 {
    margin-bottom: 1.5rem;
    font-weight: 200;
    font-size: 2rem;
  }

  .section {
    margin-bottom: 56px;

    .sync-container {
      padding-top: 15px;
      padding-bottom: 15px;
      overflow: hidden;

      .el-button--success.is-plain {
        color: #13ce66;
        background: #fff;
        border-color: #13ce66;
      }

      .el-button--success.is-plain:hover {
        color: #13ce66;
        background: #fff;
        border-color: #13ce66;
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
          color: #13ce66;
        }
      }
    }

    .command {
      color: #fff;
      font-size: 13px;
      line-height: 20px;
      background: #303133;
    }
  }

  .list-host {
    max-height: 50px;
    overflow: auto;
    color: #909399;
    font-size: 12px;
  }
}
</style>
