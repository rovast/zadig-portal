<template>
  <div class="profile-home"></div>
</template>
<script>
export default {
  mounted () {
    this.$router.replace('/v1/profile/info')
  }
}
</script>
