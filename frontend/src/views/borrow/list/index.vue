<template>
  <div class="page-container">
    <div class="page-header">
      <h2>借阅记录</h2>
      <el-button type="primary" @click="exportExcel">导出Excel</el-button>
    </div>
    
    <div class="search-form">
      <el-form :model="searchForm" inline>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="全部" :value="-1" />
            <el-option label="待审批" :value="0" />
            <el-option label="已借阅" :value="1" />
            <el-option label="已归还" :value="2" />
            <el-option label="已驳回" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadBorrows">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table :data="borrowList" border>
      <el-table-column prop="ArchiveRecord.archive_no" label="档案编号" />
      <el-table-column prop="ArchiveRecord.title" label="档案标题" />
      <el-table-column prop="User.real_name" label="借阅人" />
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
      <el-table-column prop="overdue" label="是否逾期">
        <template #default="scope">
          <el-tag v-if="scope.row.overdue" type="danger">是</el-tag>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column prop="ApproveUser.real_name" label="审批人" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button
            v-if="scope.row.status === 1"
            size="small"
            type="success"
            @click="returnArchive(scope.row.id)"
          >
            确认归还
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-pagination
      :current-page="pagination.page"
      :page-size="pagination.size"
      :total="pagination.total"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const borrowList = ref([])
const searchForm = ref({ status: -1 })
const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const getStatusType = (status) => {
  const types = ['warning', 'primary', 'success', 'danger']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待审批', '已借阅', '已归还', '已驳回']
  return texts[status] || '未知'
}

const loadBorrows = async () => {
  try {
    const params = {
      page: pagination.value.page,
      size: pagination.value.size
    }
    if (searchForm.value.status !== -1) {
      params.status = searchForm.value.status
    }
    
    const res = await request.get('/borrow/list', { params })
    if (res.code === 200) {
      borrowList.value = res.data.list
      pagination.value.total = res.data.total
    }
  } catch (err) {
    console.error('加载借阅记录失败')
  }
}

const returnArchive = async (id) => {
  ElMessageBox.confirm('确定要确认归还该档案吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      const res = await request.post('/borrow/return', { id })
      if (res.code === 200) {
        ElMessage.success(res.msg)
        loadBorrows()
      } else {
        ElMessage.error(res.msg)
      }
    } catch (err) {
      ElMessage.error('操作失败')
    }
  })
}

const exportExcel = () => {
  const params = new URLSearchParams(searchForm.value)
  window.open(`http://localhost:3000/borrow/export?${params.toString()}`, '_blank')
}

const resetSearch = () => {
  searchForm.value = { status: -1 }
  pagination.value.page = 1
  loadBorrows()
}

const handlePageChange = (page) => {
  pagination.value.page = page
  loadBorrows()
}

onMounted(() => {
  loadBorrows()
})
</script>

<style scoped>
.page-container {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.search-form {
  margin-bottom: 20px;
}
</style>
