<template>
  <div>
    <slot></slot>
    <el-tooltip :content="build.source==='gerrit'?`暂不支持在该类型上查看 Release`:`在 ${build.source} 上查看 Release`"
                placement="top"
                effect="dark">
      <span v-if="build.tag"
            class="link">
        <a v-if="build.source==='github'||build.source==='gitlab'"
           :href="`${build.address}/${build.repo_owner}/${build.repo_name}/tags/${build.tag}`"
           target="_blank">{{"Tag-"+build.tag}}
        </a>
        <span v-if="build.source==='gerrit'">{{"Tag-"+build.tag}}</span>
      </span>
    </el-tooltip>
    <el-tooltip :content="build.source==='gerrit'||build.source==='codehub'?`暂不支持在该类型上查看 Branch`:`在 ${build.source} 上查看 Branch`"
                placement="top"
                effect="dark">
      <span v-if="build.branch && !build.tag"
            class="link">
        <a v-if="build.source==='github'||build.source==='gitlab'"
           :href="`${build.address}/${build.repo_owner}/${build.repo_name}/tree/${build.branch}`"
           target="_blank">{{"Branch-"+build.branch}}
        </a>
        <span v-if="build.source==='gerrit'">{{"Branch-"+build.branch}}
        </span>
        <a v-if="!build.source"
           :href="`${build.address}/${build.repo_owner}/${build.repo_name}/tree/${build.branch}`"
           target="_blank">{{"Branch-"+build.branch}}
        </a>
        <!-- <a v-else-if="build.source ==='codehub'"
                               :href="`${build.address}/codehub/project${build.project_uuid}/codehub/${build.repo_id}/home?ref=${build.branch}`"
                               target="_blank">{{"Branch-"+build.branch}}
                  </a> -->
        <span v-else-if="build.source ==='codehub'">{{"Branch-"+build.branch}}</span>
      </span>
    </el-tooltip>
    <el-tooltip :content="`在 ${build.source} 上查看 PR`"
                placement="top"
                effect="dark">
      <span v-if="build.pr && build.pr>0"
            class="link">
        <a v-if="build.source==='github'"
           :href="`${build.address}/${build.repo_owner}/${build.repo_name}/pull/${build.pr}`"
           target="_blank">{{"PR-"+build.pr}}
        </a>
        <a v-if="build.source==='gitlab'"
           :href="`${build.address}/${build.repo_owner}/${build.repo_name}/merge_requests/${build.pr}`"
           target="_blank">{{"PR-"+build.pr}}
        </a>
        <a v-if="!build.source"
           :href="`${build.address}/${build.repo_owner}/${build.repo_name}/pull/${build.pr}`"
           target="_blank">{{"PR-"+build.pr}}
        </a>
      </span>
    </el-tooltip>
    <el-tooltip :content="(build.source==='gerrit'&& (!build.pr || build.pr===0))||build.source==='codehub'?`暂不支持在该类型上查看 Commit`:`在 ${build.source} 上查看 Commit`"
                placement="top"
                effect="dark">
      <span v-if="build.commit_id"
            class="link">
        <a v-if="build.source==='github'||build.source==='gitlab'"
           :href="`${build.address}/${build.repo_owner}/${build.repo_name}/commit/${build.commit_id}`"
           target="_blank">{{showCommit ? "Commit-" : ''}}{{build.commit_id.substring(0, 10)}}
        </a>
        <span
              v-else-if="build.source==='gerrit'&& (!build.pr || build.pr===0)">{{'Commit-'+build.commit_id.substring(0, 8)}}</span>
        <span v-else-if="build.source==='gerrit'&& build.pr && build.pr!==0"
              class="link">
          <a :href="`${build.address}/c/${build.repo_name}/+/${build.pr}`"
             target="_blank">{{`Change-${build.pr}`}}
          </a>
          {{build.commit_id.substring(0, 8)}}
        </span>
        <!-- <a v-else-if="build.source==='codehub'"
                               :href="`${build.address}/codehub/project/${build.project_uuid}/codehub/${build.repo_id}/${build.commit_id}/commitdetail`"
                               target="_blank">{{build.commit_id.substring(0, 8)}}
                  </a> -->
        <span v-else-if="build.source==='codehub'">{{build.commit_id.substring(0, 8)}}</span>
      </span>
    </el-tooltip>
  </div>
</template>

<script>
export default {
  props: {
    showCommit: {
      type: Boolean,
      default: true
    },
    build: Object
  }
}
</script>
