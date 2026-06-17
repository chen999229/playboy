<template>
  <div class="page-container">
    <div class="page-header">
      <h2>销毁申请</h2>
    </div>
    
    <el-form :model="form" label-width="120px">
      <el-form-item label="选择档案">
        <el-select v-model="form.archive_id" placeholder="请选择档案" filterable>
          <el-option
            v-for="archive in archives"
            :key="archive.id"
            :label="`${archive.archive_no} - ${archive.title}`"
            :value="archive.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="销毁原因">
        <el-input type="textarea" v-model="form.reason" placeholder="请输入销毁原因" :rows="3" />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="submitApply">提交申请</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    
    <div class="section">
      <h3>我的销毁申请记录</h3>
      <el-table :data="myApplies" border>
        <el-table-column prop="archive_no" label="档案编号" />
        <el-table-column prop="archive_title" label="档案标题" />
        <el-table-column prop="reason" label="销毁原因" />
        <el-table-column prop="created_at" label="申请时间" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approve_comment" label="审批意见" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const form = ref({
  archive_id: '',
  reason: ''
})

const archives = ref([])
const myApplies = ref([])

const getStatusType = (status) => {
  const types = ['warning', 'danger', 'info']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待审批', '已销毁', '已驳回']
  return texts[status] || '未知'
}

const loadArchives = async () => {
  try {
    const res = await request.get('/archive/record/list', { params: { status: 1 } })
    if (res.code === 200) {
      archives.value = res.data.list
    }
  } catch (err) {
    console.error('加载档案列表失败')
  }
}

const loadMyApplies = async () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const res = await request.get('/destroy/list', { params: { user_id: userInfo.id } })
    if (res.code === 200) {
      myApplies.value = res.data.list
    }
  } catch (err) {
    console.error('加载销毁申请记录失败')
  }
}

const submitApply = async () => {
  if (!form.value.archive_id || !form.value.reason) {
    return ElMessage.error('请填写必填项')
  }
  
  ElMessageBox.confirm('确定要申请销毁该档案吗？此操作不可撤销。', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await request.post('/destroy/apply', form.value)
      if (res.code === 200) {
        ElMessage.success(res.msg)
        resetForm()
        loadArchives()
        loadMyApplies()
      } else {
        ElMessage.error(res.msg)
      }
    } catch (err) {
      ElMessage.error('提交失败')
    }
  })
}

const resetForm = () => {
  form.value = {
    archive_id: '',
    reason: ''
  }
}

onMounted(() => {
  loadArchives()
  loadMyApplies()
})
</script>

<style scoped>
.page-container {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.section {
  margin-top: 40px;
}

.section h3 {
  margin: 0 0 20px;
  font-size: 16px;
}
</style>
