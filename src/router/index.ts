import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import UserLogin from '@/pages/user/UserLogin.vue'
import UserManage from '@/pages/admin/UserManage.vue'
import UserRegister from '@/pages/user/UserRegister.vue'
import ACCESS_ENUM from '@/access/accessEnum'
import AboutView from '@/views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '主页',
      component: HomePage,
      meta: {
        access: ACCESS_ENUM.NOT_LOGIN,
      },
    },
    {
      path: '/user/login',
      name: '用户登录',
      component: UserLogin,
      meta: {
        access: ACCESS_ENUM.NOT_LOGIN,
        hideInMenu: true,
      },
    },
    {
      path: '/user/register',
      name: '用户注册',
      component: UserRegister,
      meta: {
        access: ACCESS_ENUM.NOT_LOGIN,
        hideInMenu: true,
      },
    },
    {
      path: '/admin/userManage',
      name: '用户管理',
      component: UserManage,
      meta: {
        access: ACCESS_ENUM.ADMIN,
      },
    },
    {
      path: '/test',
      name: '组件测试',
      component: AboutView,
      meta: {
        access: ACCESS_ENUM.NOT_LOGIN,
      },
    },
  ],
})

export default router
