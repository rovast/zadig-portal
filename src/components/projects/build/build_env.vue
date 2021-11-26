<template>
  <div>
    <span class="item-title">构建环境</span>
    <div class="divider item"></div>
    <el-row :gutter="20">
      <el-col :span="7">
        <el-form-item label="构建系统">
          <el-select size="small" v-model="pre_build.image_id" placeholder="请选择" @change="changeImage('id', $event)">
            <el-option v-for="(sys,index) in systems" :key="index" :label="sys.label" :value="sys.id">
              <span>
                {{sys.label}}
                <el-tag v-if="sys.image_from==='custom'" type="info" size="mini" effect="light">自定义</el-tag>
              </span>
            </el-option>
            <el-option value="NEWCUSTOM">
              <router-link to="/v1/system/imgs" style="color: #606266;">新建自定义构建镜像</router-link>
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="16">
        <el-form-item label="资源规格">
          <el-select size="small" v-model="pre_build.res_req" placeholder="请选择">
            <el-option label="高 | CPU: 16 核 内存: 32 GB" value="high"></el-option>
            <el-option label="中 | CPU: 8 核 内存: 16 GB" value="medium"></el-option>
            <el-option label="低 | CPU: 4 核 内存: 8 GB" value="low"></el-option>
            <el-option label="最低 | CPU: 2 核 内存: 2 GB" value="min"></el-option>
            <el-option label="自定义" value="define"></el-option>
          </el-select>
          <span v-show="pre_build.res_req === 'define'" class="define-resource">
            CPU(m)
            <el-input v-model="pre_build.res_req_spec.cpu_limit" placeholder="自定义 CPU" size="small"></el-input>
            Memory(Mi)
            <el-input v-model="pre_build.res_req_spec.memory_limit" placeholder="自定义内存" size="small"></el-input>
          </span>
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getImgListAPI } from '@api'
export default {
  props: {
    pre_build: Object,
    isCreate: {
      default: false,
      type: Boolean
    }
  },
  data () {
    return {
      systems: []
    }
  },
  methods: {
    getImgList () {
      getImgListAPI().then(response => {
        this.systems = response
        if (this.isCreate) {
          this.changeImage('', '', 0)
        } else {
          const key = this.pre_build.image_id
            ? 'id'
            : this.pre_build.build_os
              ? 'value'
              : ''
          const value = this.pre_build.image_id || this.pre_build.build_os
          if (key) {
            this.changeImage(key, value)
          }
        }
      })
    },
    changeImage (key, value, index = -1) {
      let imageSys = null
      if (index !== -1) {
        imageSys = this.systems[index]
      } else {
        imageSys = this.systems.find(item => {
          return item[key] === value
        })
      }
      this.pre_build.image_id = imageSys.id
      this.pre_build.image_from = imageSys.image_from
      this.pre_build.build_os = imageSys.value
      console.log('data: ', this.pre_build)
    }
  },
  created () {
    this.getImgList()
  }
}
</script>

<style lang="less" scoped>
.define-resource {
  display: inline-block;
  margin-left: 10px;
  color: #606266;
  white-space: nowrap;

  /deep/.el-input {
    width: 120px;
    margin-right: 5px;
  }
}
</style>
