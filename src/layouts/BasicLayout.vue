<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header  class="header">
        <ClobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>

      <a-layout-footer class="footer">
        <a href="https://www.codefather.cn" target="_blank"> 图聚 by 止水 </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import ClobalHeader from '@/components/ClobalHeader.vue';
</script>
<style scoped>
#basicLayout {
  background-color: #efefef;
}
#basicLayout .header {
  padding-inline: 20px;
  margin-bottom: 16px;
  color: unset;
  background: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}
#basicLayout .content {
  margin-top: 80px;
  background: linear-gradient(to right, #fefefe, #fff);
  margin-bottom: 28px;
  padding: 20px;
}
#basicLayout .footer {
  background: #efefef;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}
</style>
