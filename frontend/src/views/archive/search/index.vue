<template>
  <div class="page-container">
    <div class="page-header">
      <h2>档案检索</h2>
      <el-button type="primary" @click="exportExcel">导出Excel</el-button>
    </div>
    
    <div class="search-form">
      <el-form :model="searchForm" inline>
        <el-form-item label="档案编号">
          <el-input v-model="searchForm.archive_no" placeholder="请输入档案编号" />
        </el-form-item>
        <el-form-item label="档案标题">
          <el-input v-model="searchForm.title" placeholder="请输入档案标题" />
        </el-form-item>
        <el-form-item label="所属分类">
          <el-select v-model="searchForm.category_id" placeholder="请选择分类">
            <el-option label="全部" value="" />
            <el-option v-for="cat in categoryOptions" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="searchForm.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="借阅状态">
          <el-select v-model="searchForm.borrowed" placeholder="请选择状态">
            <el-option label="全部" :value="-1" />
            <el-option label="在库" :value="0" />
            <el-option label="已借阅" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadRecords">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table :data="recordList" border>
      <el-table-column prop="archive_no" label="档案编号" />
      <el-table-column prop="title" label="档案标题" />
      <el-table-column prop="Category.name" label="分类" />
      <el-table-column prop="author" label="作者" />
      <el-table-column prop="organization" label="机构" />
      <el-table-column prop="publish_date" label="发布日期" />
      <el-table-column prop="page_count" label="页数" />
      <el-table-column prop="borrowed" label="借阅状态">
        <template #default="scope">
          <el-tag :type="scope.row.borrowed === 1 ? 'warning' : 'success'">
            {{ scope.row.borrowed === 1 ? '已借阅' : '在库' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="storage_location" label="存放位置" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="previewRecord(scope.row)">预览</el-button>
          <el-button size="small" @click="downloadRecord(scope.row)">下载</el-button>
          <el-button size="small" @click="editRecord(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteRecord(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-pagination
      :current-page="pagination.page"
      :page-size="pagination.size"
      :total="pagination.total"
      @current-change="handlePageChange"
    />
    
    <el-dialog title="档案预览" v-model="showPreviewModal" width="800px" append-to-body>
      <div v-if="previewUrl" class="preview-container">
        <iframe :src="previewUrl" class="preview-iframe"></iframe>
      </div>
      <div v-else class="no-file">该档案暂无附件</div>
    </el-dialog>
    
    <el-dialog title="编辑档案" v-model="showEditModal" width="600px">
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="档案编号">
          <el-input v-model="editForm.archive_no" />
        </el-form-item>
        <el-form-item label="档案标题">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="所属分类">
          <el-select v-model="editForm.category_id">
            <el-option v-for="cat in categoryOptions" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="editForm.author" />
        </el-form-item>
        <el-form-item label="机构">
          <el-input v-model="editForm.organization" />
        </el-form-item>
        <el-form-item label="发布日期">
          <el-date-picker v-model="editForm.publish_date" type="date" />
        </el-form-item>
        <el-form-item label="页数">
          <el-input type="number" v-model="editForm.page_count" />
        </el-form-item>
        <el-form-item label="存放位置">
          <el-input v-model="editForm.storage_location" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="editForm.keywords" />
        </el-form-item>
        <el-form-item label="摘要">
          <el-input type="textarea" v-model="editForm.summary" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditModal = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const recordList = ref([])
const categoryTree = ref([])
const searchForm = ref({
  archive_no: '',
  title: '',
  category_id: '',
  author: '',
  borrowed: -1
})
const pagination = ref({ page: 1, size: 10, total: 0 })
const showPreviewModal = ref(false)
const showEditModal = ref(false)
const previewUrl = ref('')
const editForm = ref({})

const categoryOptions = computed(() => {
  const options = []
  const flatten = (categories, prefix = '') => {
    categories.forEach(cat => {
      options.push({ id: cat.id, name: prefix + cat.name })
      if (cat.children) flatten(cat.children, prefix + '├── ')
    })
  }
  flatten(categoryTree.value)
  return options
})

const loadRecords = async () => {
  try {
    const params = { page: pagination.value.page, size: pagination.value.size, ...searchForm.value }
    if (!params.category_id) delete params.category_id
    if (params.borrowed === -1) delete params.borrowed
    
    const res = await request.get('/archive/record/list', { params })
    if (res.code === 200) {
      recordList.value = res.data.list
      pagination.value.total = res.data.total
    }
  } catch (err) {
    console.error('加载档案列表失败')
  }
}

const loadCategories = async () => {
  try {
    const res = await request.get('/archive/category/tree')
    if (res.code === 200) categoryTree.value = res.data
  } catch (err) {
    console.error('加载分类失败')
  }
}

const previewRecord = (row) => {
  previewUrl.value = row.file_path ? `http://localhost:3000/api/file/preview/${row.file_path.split('/').pop()}` : ''
  showPreviewModal.value = true
}

const downloadRecord = async (row) => {
  if (!row.file_path) return ElMessage.error('该档案暂无附件')
  window.open(`http://localhost:3000/api/file/download/${row.file_path.split('/').pop()}`, '_blank')
}

const editRecord = (row) => {
  editForm.value = {
    id: row.id,
    archive_no: row.archive_no,
    title: row.title,
    category_id: row.category_id,
    author: row.author,
    organization: row.organization,
    publish_date: row.publish_date?.split('T')[0],
    page_count: row.page_count,
    storage_location: row.storage_location,
    keywords: row.keywords,
    summary: row.summary
  }
  showEditModal.value = true
}

const saveEdit = async () => {
  if (!editForm.value.archive_no || !editForm.value.title || !editForm.value.category_id) {
    return ElMessage.error('请填写必填项')
  }
  
  try {
    const res = await request.post('/archive/record/update', editForm.value)
    if (res.code === 200) {
      ElMessage.success(res.msg)
      showEditModal.value = false
      loadRecords()
    } else {
      ElMessage.error(res.msg)
    }
  } catch (err) {
    ElMessage.error('保存失败')
  }
}

const deleteRecord = async (id) => {
  ElMessageBox.confirm('确定要删除该档案吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await request.delete(`/archive/record/${id}`)
      if (res.code === 200) {
        ElMessage.success(res.msg)
        loadRecords()
      } else {
        ElMessage.error(res.msg)
      }
    } catch (err) {
      ElMessage.error('删除失败')
    }
  })
}

const exportExcel = () => {
  const params = new URLSearchParams(searchForm.value)
  window.open(`http://localhost:3000/archive/record/export?${params.toString()}`, '_blank')
}

const resetSearch = () => {
  searchForm.value = { archive_no: '', title: '', category_id: '', author: '', borrowed: -1 }
  pagination.value.page = 1
  loadRecords()
}

const handlePageChange = (page) => {
  pagination.value.page = page
  loadRecords()
}

onMounted(() => {
  loadRecords()
  loadCategories()
})
</script>

<style scoped>
.page-container { background: #fff; padding: 20px; border-radius: 12px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { margin: 0; }
.search-form { margin-bottom: 20px; }
.preview-container { height: 500px; }
.preview-iframe { width: 100%; height: 100%; border: none; }
.no-file { text-align: center; padding: 100px 0; color: #999; }
</style>
