<template>
  <div class="page-container">
    <div class="page-header">
      <h2>借阅审批</h2>
    </div>
    
    <el-table :data="pendingList" border>
      <el-table-column prop="ArchiveRecord.archive_no" label="档案编号" />
      <el-table-column prop="ArchiveRecord.title" label="档案标题" />
      <el-table-column prop="User.real_name" label="借阅人" />
      <el-table-column prop="borrow_date" label="借阅日期" />
      <el-table-column prop="expected_return_date" label="预计归还" />
      <el-table-column prop="reason" label="借阅原因" />
      <el-table-column prop="created_at" label="申请时间" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" type="success" @click="approve(scope.row.id, 1)">通过</el-button>
          <el-button size="small" type="danger" @click="openRejectModal(scope.row)">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog title="驳回申请" v-model="showRejectModal" width="400px">
      <el-form :model="rejectForm" label-width="100px">
        <el-form-item label="驳回原因">
          <el-input type="textarea" v-model="rejectForm.comment" placeholder="请输入驳回原因" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRejectModal = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确定驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const pendingList = ref([])
const showRejectModal = ref(false)
const rejectForm = ref({
  borrowId: 0,
  comment: ''
})

const loadPendingList = async () => {
  try {
    const res = await request.get('/borrow/list', { params: { status: 0 } })
    if (res.code === 200) {
      pendingList.value = res.data.list
    }
  } catch (err) {
    console.error('加载待审批列表失败')
  }
}

const approve = async (id, status) => {
  ElMessageBox.confirm(status === 1 ? '确定要通过该借阅申请吗？' : '确定要驳回该借阅申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: status === 1 ? 'info' : 'warning'
  }).then(async () => {
    try {
      const res = await request.post('/borrow/approve', { id, status })
      if (res.code === 200) {
        ElMessage.success(res.msg)
        loadPendingList()
      } else {
        ElMessage.error(res.msg)
      }
    } catch (err) {
      ElMessage.error('操作失败')
    }
  })
}

const openRejectModal = (row) => {
  rejectForm.value = {
    borrowId: row.id,
    comment: ''
  }
  showRejectModal.value = true
}

const confirmReject = async () => {
  if (!rejectForm.value.comment) {
    return ElMessage.error('请输入驳回原因')
  }
  
  try {
    const res = await request.post('/borrow/approve', {
      id: rejectForm.value.borrowId,
      status: 2,
      comment: rejectForm.value.comment
    })
    if (res.code === 200) {
      ElMessage.success(res.msg)
      showRejectModal.value = false
      loadPendingList()
    } else {
      ElMessage.error(res.msg)
    }
  } catch (err) {
    ElMessage.error('操作失败')
  }
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
