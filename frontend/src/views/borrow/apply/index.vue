<template>
  <div class="page-container">
    <div class="page-header">
      <h2>借阅申请</h2>
    </div>
    
    <el-form :model="form" label-width="120px">
      <el-form-item label="选择档案">
        <el-select v-model="form.archive_id" placeholder="请选择档案" filterable>
          <el-option
            v-for="archive in availableArchives"
            :key="archive.id"
            :label="`${archive.archive_no} - ${archive.title}`"
            :value="archive.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="借阅日期">
        <el-date-picker v-model="form.borrow_date" type="date" placeholder="选择借阅日期" />
      </el-form-item>
      
      <el-form-item label="预计归还日期">
        <el-date-picker v-model="form.expected_return_date" type="date" placeholder="选择预计归还日期" />
      </el-form-item>
      
      <el-form-item label="借阅原因">
        <el-input type="textarea" v-model="form.reason" placeholder="请输入借阅原因" :rows="3" />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="submitApply">提交申请</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    
    <div class="section">
      <h3>我的借阅记录</h3>
      <el-table :data="myBorrows" border>
        <el-table-column prop="ArchiveRecord.archive_no" label="档案编号" />
        <el-table-column prop="ArchiveRecord.title" label="档案标题" />
        <el-table-column prop="borrow_date" label="借阅日期" />
        <el-table-column prop="expected_return_date" label="预计归还" />
        <el-table-column prop="actual_return_date" label="实际归还" />
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
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const form = ref({
  archive_id: '',
  borrow_date: '',
  expected_return_date: '',
  reason: ''
})

const availableArchives = ref([])
const myBorrows = ref([])

const getStatusType = (status) => {
  const types = ['warning', 'primary', 'success', 'danger']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待审批', '已借阅', '已归还', '已驳回']
  return texts[status] || '未知'
}

const loadAvailableArchives = async () => {
  try {
    const res = await request.get('/archive/record/list', { params: { borrowed: 0 } })
    if (res.code === 200) {
      availableArchives.value = res.data.list
    }
  } catch (err) {
    console.error('加载档案列表失败')
  }
}

const loadMyBorrows = async () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const res = await request.get('/borrow/list', { params: { user_id: userInfo.id } })
    if (res.code === 200) {
      myBorrows.value = res.data.list
    }
  } catch (err) {
    console.error('加载借阅记录失败')
  }
}

const submitApply = async () => {
  if (!form.value.archive_id || !form.value.borrow_date || !form.value.expected_return_date) {
    return ElMessage.error('请填写必填项')
  }
  
  if (new Date(form.value.borrow_date) > new Date(form.value.expected_return_date)) {
    return ElMessage.error('借阅日期不能晚于预计归还日期')
  }
  
  try {
    const res = await request.post('/borrow/apply', form.value)
    if (res.code === 200) {
      ElMessage.success(res.msg)
      resetForm()
      loadAvailableArchives()
      loadMyBorrows()
    } else {
      ElMessage.error(res.msg)
    }
  } catch (err) {
    ElMessage.error('提交失败')
  }
}

const resetForm = () => {
  form.value = {
    archive_id: '',
    borrow_date: '',
    expected_return_date: '',
    reason: ''
  }
}

onMounted(() => {
  loadAvailableArchives()
  loadMyBorrows()
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
