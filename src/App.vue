<template>
  <div id="app">
    <a-config-provider :locale="zhCN">
      <BasicLayout />
    </a-config-provider>
  </div>
</template>

<script setup lang="ts">
import BasicLayout from '@/layouts/BasicLayout.vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { onMounted } from 'vue';
import { useLoginUserStore } from './stores/user';
const loginUser=useLoginUserStore()
onMounted(async()=>{
  await loginUser.fetchLoginUser()
})
</script>
<style></style>
