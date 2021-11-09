<template>
  <div class="config-link">
    <el-alert type="info" :closable="false">
      <template>可设置外部快捷链接，方便跳转。</template>
    </el-alert>
    <div class="link-content">
      <el-table :data="links" style="width: 100%;">
        <el-table-column prop="name" label="名称">
          <template slot-scope="{row}">
            <span v-show="!row.edit">{{row.name}}</span>
            <el-input v-show="row.edit" v-model="row.name" placeholder="请输入名称" size="small"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="URL">
          <template slot-scope="{row}">
            <span v-show="!row.edit">{{row.url}}</span>
            <el-input v-show="row.edit" v-model="row.url" placeholder="请输入 URL" size="small"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100px">
          <template slot-scope="{row}">
            <span class="btn" v-show="!row.edit" @click="deleteExternalLink(row)">删除</span>
            <span class="btn" v-show="!row.edit" @click="row.edit = true">编辑</span>
            <span class="btn" v-show="row.edit" @click="updateExternalLink(row)">确认</span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 20px;">
        <el-button type="text" icon="el-icon-plus" @click="addLink">添加快捷链接</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getExternalLinksAPI,
  createExternalLinkAPI,
  updateExternalLinkAPI,
  deleteExternalLinkAPI
} from '@api'
export default {
  data () {
    return {
      links: []
    }
  },
  methods: {
    addLink () {
      this.links.push({
        id: '',
        name: '',
        url: '',
        edit: true
      })
    },
    getExternalLinks () {
      getExternalLinksAPI().then(res => {
        this.links = (res || []).map(re => {
          return {
            ...re,
            edit: false
          }
        })
      })
    },

    updateExternalLink (data) {
      if (!data.name || !data.url) {
        this.$message.info(`${data.name ? 'URL ' : '名称'}不能为空！`)
        return
      }
      const payload = {
        name: data.name,
        url: data.url
      }
      const res = data.id
        ? updateExternalLinkAPI(data.id, payload)
        : createExternalLinkAPI(payload)
      res.then(() => {
        this.$message.success(`${data.id ? '更新' : '新建'}外部链接成功！`)
        this.getExternalLinks()
      })
    },
    deleteExternalLink (data) {
      deleteExternalLinkAPI(data.id).then(() => {
        this.$message.success(`删除外部链接成功！`)
        this.getExternalLinks()
      })
    }
  },
  created () {
    this.getExternalLinks()
  }
}
</script>

<style lang="less" scoped>
.config-link {
  .link-content {
    padding-top: 15px;
    padding-bottom: 15px;
  }

  .btn {
    margin-right: 10px;
    color: #409eff;
    font-weight: 500;
    font-size: 14px;
    white-space: nowrap;
    cursor: pointer;
  }
}
</style>
