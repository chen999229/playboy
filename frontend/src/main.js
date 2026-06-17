import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import router from "./router/index.js"
import { createPinia } from 'pinia'
import './style.css'
import { ElMessage } from 'element-plus'

const app = createApp(App)
const pinia = createPinia()

app.use(ElementPlus)
app.use(pinia)
app.config.globalProperties.$message = ElMessage
app.use(router)
app.mount('#app')
