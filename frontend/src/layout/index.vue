<template>
  <div class="layout-container">
    <aside class="sidebar">
      <div class="logo">
        <h2>档案管理系统</h2>
      </div>
      <el-menu :default-active="activeMenu" class="sidebar-menu" mode="vertical">
        <template v-for="menu in menus" :key="menu.id">
          <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="String(menu.id)">
            <template #title>
              <i :class="menu.icon"></i>
              <span>{{ menu.name }}</span>
            </template>
            <el-menu-item
              v-for="child in menu.children"
              :key="child.id"
              :index="child.path"
              @click="handleMenuClick(child.path)"
            >
              {{ child.name }}
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="menu.path" @click="handleMenuClick(menu.path)">
            <i :class="menu.icon"></i>
            <span>{{ menu.name }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </aside>
    <main class="main-content">
      <header class="top-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
              <span v-if="index === breadcrumbs.length - 1">{{ item.name }}</span>
              <a v-else @click="goToPath(item.path)">{{ item.name }}</a>
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <i class="el-icon-user"></i>
              {{ userInfo.real_name }}
              <i class="el-icon-arrow-down"></i>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="showChangePassword = true">修改密码</el-dropdown-item>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      <div class="content-body">
        <router-view />
      </div>
    </main>
    
    <el-dialog title="修改密码" v-model="showChangePassword" width="400px">
      <el-form :model="passwordForm" label-width="100px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input type="password" v-model="passwordForm.oldPassword" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input type="password" v-model="passwordForm.newPassword" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input type="password" v-model="passwordForm.confirmPassword" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showChangePassword = false">取消</el-button>
        <el-button type="primary" @click="changePassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()

const menus = ref([])
const userInfo = ref({ real_name: '' })
const showChangePassword = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const activeMenu = computed(() => {
  return route.path
})

const breadcrumbs = computed(() => {
  const path = route.path
  const items = []
  let currentPath = ''
  
  const menuMap = {}
  const flatMenus = (menuList) => {
    menuList.forEach(menu => {
      menuMap[menu.path] = menu
      if (menu.children) {
        flatMenus(menu.children)
      }
    })
  }
  flatMenus(menus.value)
  
  path.split('/').filter(p => p).forEach(p => {
    currentPath += '/' + p
    const menu = menuMap[currentPath]
    if (menu) {
      items.push({ name: menu.name, path: currentPath })
    }
  })
  
  return items
})

const handleMenuClick = (path) => {
  router.push(path)
}

const goToPath = (path) => {
  router.push(path)
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  router.push('/login')
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    return ElMessage.error('两次输入的密码不一致')
  }
  
  try {
    const res = await request.post('/user/change-password', {
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })
    if (res.code === 200) {
      ElMessage.success(res.msg)
      showChangePassword.value = false
      passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
    } else {
      ElMessage.error(res.msg)
    }
  } catch (err) {
    ElMessage.error('修改失败')
  }
}

const loadMenus = async () => {
  try {
    const res = await request.get('/menu/tree')
    
    if (res.code === 200) {
      menus.value = res.data
    } else {
      ElMessage.error(res.msg || '加载菜单失败')
    }
  } catch (err) {
    console.error('加载菜单失败:', err)
    ElMessage.error('加载菜单失败')
  }
}

const loadUserInfo = async () => {
  try {
    const res = await request.get('/user/info')
    if (res.code === 200) {
      userInfo.value = res.data
      localStorage.setItem('userInfo', JSON.stringify(res.data))
    }
  } catch (err) {
    console.error('加载用户信息失败:', err)
  }
}

onMounted(() => {
  loadMenus()
  loadUserInfo()
})
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background: #2b3a4a;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #3d4f60;
}

.logo h2 {
  margin: 0;
  font-size: 16px;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  color: #b8c7ce;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background: #1f2d3d;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: #1f2d3d;
  color: #409eff;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.header-left {
  flex: 1;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.content-body {
  flex: 1;
  padding: 20px;
  overflow: auto;
}
</style>
