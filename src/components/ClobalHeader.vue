<template>
  <div id="globalHeader">
    <a-row :wrap="false">
      <!-- 图标 -->
      <a-col flex="200px">
        <RouterLink to="/">
          <div class="title-bar">
            <img class="logo" src="../assets/logo.svg  " alt="log" />
            <div class="title">图聚</div>
          </div>
        </RouterLink>
      </a-col>
      <!-- 导航 -->
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
        />
      </a-col>
      <!-- 登录 -->
      <a-col flex="120px">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            {{ loginUserStore.loginUser.userName ?? '无名' }}
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { h, ref } from 'vue'
import type { MenuProps } from 'ant-design-vue'
import { HomeOutlined, MoreOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/user'

//当前登录用户
const loginUserStore = useLoginUserStore()
loginUserStore.fetchLoginUser()

//路由
const router = useRouter()

// 当前选中菜单
const current = ref<string[]>(['/'])

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}
// 监听路由变化，更新当前选中菜单
router.afterEach((to, from, next) => {
  current.value = [to.path]
})


const items = ref<MenuProps['items']>([
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '首页',
    title: '首页',
  },
  {
    key: '/about',
    icon: () => h(MoreOutlined),
    label: '关于',
    title: '关于',
  },
  {
    key: '/other',
    label: h('a', { href: 'https://antdv.com', target: '_blank' }, '其他'),
    title: '其他',
  },
])
</script>
<style scoped>
#globalHeader .title-bar {
  display: flex;
  align-items: center;
}

.title {
  color: black;
  font-size: 18px;
  margin-left: 16px;
}

.logo {
  height: 48px;
}
</style>
