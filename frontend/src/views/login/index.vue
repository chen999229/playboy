<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>档案数字化管理系统</h1>
        <p>请登录您的账号</p>
      </div>
      <el-form :model="loginForm" ref="loginFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="loginForm.password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" @click="login">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'

const router = useRouter()
const loginForm = ref({
  username: '',
  password: '',
  remember: false
})

const loginFormRef = ref(null)

const login = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    return ElMessage.error('请输入用户名和密码')
  }

  try {
    const res = await request.post('/user/login', {
      username: loginForm.value.username,
      password: loginForm.value.password
    })

    if (res.code === 200) {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userInfo', JSON.stringify(res.data.user))

      if (loginForm.value.remember) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('savedUsername', loginForm.value.username)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('savedUsername')
      }

      ElMessage.success(res.msg)
      router.push('/dashboard')
    } else {
      ElMessage.error(res.msg)
    }
  } catch (err) {
    ElMessage.error('登录失败，请检查网络连接')
  }
}

onMounted(() => {
  const rememberMe = localStorage.getItem('rememberMe')
  if (rememberMe === 'true') {
    loginForm.value.username = localStorage.getItem('savedUsername') || ''
    loginForm.value.remember = true
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  margin: 0 0 10px;
  font-size: 24px;
  color: #333;
}

.login-header p {
  margin: 0;
  color: #999;
}

.login-btn {
  width: 100%;
}
</style>
