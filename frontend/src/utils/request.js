import axios from 'axios'

// 获取当前环境的API基础URL
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return '/api'
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  return ''
}

// 创建axios实例
const service = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const rawToken = localStorage.getItem('token')
    if (rawToken) {
      config.headers.Authorization = rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器，直接剥离外层data
service.interceptors.response.use(
  res => res.data,
  err => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default service
