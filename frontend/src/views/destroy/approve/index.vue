<template>
  <div class="page-container">
    <div class="page-header">
      <h2>销毁审批</h2>
    </div>
    
    <el-table :data="pendingList" border>
      <el-table-column prop="archive_no" label="档案编号" />
      <el-table-column prop="archive_title" label="档案标题" />
      <el-table-column prop="User.real_name" label="申请人" />
      <el-table-column prop="reason" label="销毁原因" />
      <el-table-column prop="created_at" label="申请时间" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" type="danger" @click="openApproveModal(scope.row, 1)">确认销毁</el-button>
          <el-button size="small" type="warning" @click="openApproveModal(scope.row, 2)">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog title="销毁审批" v-model="showApproveModal" width="400px">
      <el-form :model="approveForm" label-width="100px">
        <el-form-item label="档案编号">
          <span>{{ currentRecord.archive_no }}</span>
        </el-form-item>
        <el-form-item label="档案标题">
          <span>{{ currentRecord.archive_title }}</span>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input type="textarea" v-model="approveForm.comment" placeholder="请输入审批意见" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showApproveModal = false">取消</el-button>
        <el-button
          :type="approveForm.status === 1 ? 'danger' : 'warning'"
          @click="confirmApprove"
        >
          {{ approveForm.status === 1 ? '确认销毁' : '驳回申请' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const pendingList = ref([])
const showApproveModal = ref(false)
const approveForm = ref({
  destroyId: 0,
  status: 1,
  comment: ''
})
const currentRecord = ref({})

const loadPendingList = async () => {
  try {
    const res = await request.get('/destroy/list', { params: { status: 0 } })
    if (res.code === 200) {
      pendingList.value = res.data.list
    }
  } catch (err) {
    console.error('加载待审批列表失败')
  }
}

const openApproveModal = (row, status) => {
  currentRecord.value = row
  approveForm.value = {
    destroyId: row.id,
    status,
    comment: ''
  }
  showApproveModal.value = true
}

const confirmApprove = async () => {
  const message = approveForm.value.status === 1 ? '确认销毁该档案吗？此操作不可撤销！' : '确定要驳回该销毁申请吗？'
  
  ElMessageBox.confirm(message, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: approveForm.value.status === 1 ? 'error' : 'warning'
  }).then(async () => {
    try {
      const res = await request.post('/destroy/approve', {
        id: approveForm.value.destroyId,
        status: approveForm.value.status,
        comment: approveForm.value.comment
      })
      if (res.code === 200) {
        ElMessage.success(res.msg)
        showApproveModal.value = false
        loadPendingList()
      } else {
        ElMessage.error(res.msg)
      }
    } catch (err) {
      ElMessage.error('操作失败')
    }
  })
}

onMounted(() => {
  loadPendingList()
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
</style>
