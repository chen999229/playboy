import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('@/views/dashboard/index.vue') }
    ]
  },
  {
    path: '/system',
    name: 'System',
    component: () => import('@/layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'user', name: 'User', component: () => import('@/views/system/user/index.vue') },
      { path: 'role', name: 'Role', component: () => import('@/views/system/role/index.vue') },
      { path: 'menu', name: 'Menu', component: () => import('@/views/system/menu/index.vue') }
    ]
  },
  {
    path: '/archive',
    name: 'Archive',
    component: () => import('@/layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'category', name: 'Category', component: () => import('@/views/archive/category/index.vue') },
      { path: 'record', name: 'Record', component: () => import('@/views/archive/record/index.vue') },
      { path: 'search', name: 'Search', component: () => import('@/views/archive/search/index.vue') }
    ]
  },
  {
    path: '/borrow',
    name: 'Borrow',
    component: () => import('@/layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'apply', name: 'BorrowApply', component: () => import('@/views/borrow/apply/index.vue') },
      { path: 'approve', name: 'BorrowApprove', component: () => import('@/views/borrow/approve/index.vue') },
      { path: 'list', name: 'BorrowList', component: () => import('@/views/borrow/list/index.vue') }
    ]
  },
  {
    path: '/destroy',
    name: 'Destroy',
    component: () => import('@/layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'apply', name: 'DestroyApply', component: () => import('@/views/destroy/apply/index.vue') },
      { path: 'approve', name: 'DestroyApprove', component: () => import('@/views/destroy/approve/index.vue') },
      { path: 'list', name: 'DestroyList', component: () => import('@/views/destroy/list/index.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta?.requiresAuth !== false && !token) {
    next('/login')
    return
  }

  if (to.path === '/login' && token) {
    next('/dashboard')
    return
  }

  next()
})

export default router
