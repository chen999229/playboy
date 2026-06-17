<template>
  <div class="page-container">
    <div class="page-header">
      <h2>销毁台账</h2>
      <el-button type="primary" @click="exportExcel">导出Excel</el-button>
    </div>
    
    <div class="search-form">
      <el-form :model="searchForm" inline>
        <el-form-item label="档案编号">
          <el-input v-model="searchForm.archive_no" placeholder="请输入档案编号" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="全部" :value="-1" />
            <el-option label="待审批" :value="0" />
            <el-option label="已销毁" :value="1" />
            <el-option label="已驳回" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadRecords">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table :data="destroyList" border>
      <el-table-column prop="archive_no" label="档案编号" />
      <el-table-column prop="archive_title" label="档案标题" />
      <el-table-column prop="User.real_name" label="申请人" />
      <el-table-column prop="reason" label="销毁原因" />
      <el-table-column prop="created_at" label="申请时间" />
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="ApproveUser.real_name" label="审批人" />
      <el-table-column prop="approve_date" label="审批日期" />
      <el-table-column prop="destroy_date" label="销毁日期" />
      <el-table-column prop="approve_comment" label="审批意见" />
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
import request from '@/utils/request'

const destroyList = ref([])
const searchForm = ref({
  archive_no: '',
  status: -1
})
const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const getStatusType = (status) => {
  const types = ['warning', 'danger', 'info']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待审批', '已销毁', '已驳回']
  return texts[status] || '未知'
}

const loadRecords = async () => {
  try {
    const params = {
      page: pagination.value.page,
      size: pagination.value.size,
      ...searchForm.value
    }
    if (!params.archive_no) delete params.archive_no
    if (params.status === -1) delete params.status
    
    const res = await request.get('/destroy/list', { params })
    if (res.code === 200) {
      destroyList.value = res.data.list
      pagination.value.total = res.data.total
    }
  } catch (err) {
    console.error('加载销毁记录失败')
  }
}

const exportExcel = () => {
  const params = new URLSearchParams(searchForm.value)
  window.open(`http://localhost:3000/api/destroy/export?${params.toString()}`, '_blank')
}

const resetSearch = () => {
  searchForm.value = { archive_no: '', status: -1 }
  pagination.value.page = 1
  loadRecords()
}

const handlePageChange = (page) => {
  pagination.value.page = page
  loadRecords()
}

onMounted(() => {
  loadRecords()
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
