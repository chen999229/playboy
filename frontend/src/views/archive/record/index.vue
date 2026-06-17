<template>
  <div class="page-container">
    <div class="page-header">
      <h2>档案著录</h2>
      <el-button type="primary" @click="showAddModal = true">新增档案</el-button>
    </div>
    
    <el-form :model="form" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="档案编号">
            <el-input v-model="form.archive_no" placeholder="请输入档案编号" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="档案标题">
            <el-input v-model="form.title" placeholder="请输入档案标题" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="所属分类">
            <el-select v-model="form.category_id" placeholder="请选择分类">
              <el-option
                v-for="cat in categoryOptions"
                :key="cat.id"
                :label="cat.name"
                :value="cat.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="作者">
            <el-input v-model="form.author" placeholder="请输入作者" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="机构">
            <el-input v-model="form.organization" placeholder="请输入机构" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="发布日期">
            <el-date-picker v-model="form.publish_date" type="date" placeholder="选择日期" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="页数">
            <el-input type="number" v-model="form.page_count" placeholder="请输入页数" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="存放位置">
            <el-input v-model="form.storage_location" placeholder="请输入存放位置" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="关键词">
        <el-input v-model="form.keywords" placeholder="请输入关键词，用逗号分隔" />
      </el-form-item>
      
      <el-form-item label="摘要">
        <el-input type="textarea" v-model="form.summary" placeholder="请输入摘要" :rows="3" />
      </el-form-item>
      
      <el-form-item label="附件">
        <el-upload
          action="/api/file/upload"
          :headers="{ Authorization: `Bearer ${token}` }"
          :multiple="true"
          :on-success="handleFileUpload"
          :on-error="handleFileError"
          :file-list="fileList"
          :before-remove="handleFileRemove"
        >
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">只能上传PDF/图片/doc/xls等文件</div>
        </el-upload>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="saveRecord">保存</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    
    <el-dialog title="新增档案" v-model="showAddModal" width="600px">
      <el-form :model="addForm" label-width="120px">
        <el-form-item label="档案编号">
          <el-input v-model="addForm.archive_no" placeholder="请输入档案编号" />
        </el-form-item>
        <el-form-item label="档案标题">
          <el-input v-model="addForm.title" placeholder="请输入档案标题" />
        </el-form-item>
        <el-form-item label="所属分类">
          <el-select v-model="addForm.category_id" placeholder="请选择分类">
            <el-option
              v-for="cat in categoryOptions"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="addForm.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="机构">
          <el-input v-model="addForm.organization" placeholder="请输入机构" />
        </el-form-item>
        <el-form-item label="发布日期">
          <el-date-picker v-model="addForm.publish_date" type="date" placeholder="选择日期" />
        </el-form-item>
        <el-form-item label="页数">
          <el-input type="number" v-model="addForm.page_count" placeholder="请输入页数" />
        </el-form-item>
        <el-form-item label="存放位置">
          <el-input v-model="addForm.storage_location" placeholder="请输入存放位置" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="addForm.keywords" placeholder="请输入关键词" />
        </el-form-item>
        <el-form-item label="摘要">
          <el-input type="textarea" v-model="addForm.summary" placeholder="请输入摘要" :rows="3" />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
            action="/api/file/upload"
            :headers="{ Authorization: `Bearer ${token}` }"
            :multiple="true"
            :on-success="handleAddFileUpload"
            :file-list="addFileList"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddModal = false">取消</el-button>
        <el-button type="primary" @click="saveNewRecord">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const token = ref(localStorage.getItem('token') || '')

const form = ref({
  archive_no: '',
  title: '',
  category_id: '',
  author: '',
  organization: '',
  publish_date: '',
  page_count: '',
  storage_location: '',
  keywords: '',
  summary: ''
})

const addForm = ref({
  archive_no: '',
  title: '',
  category_id: '',
  author: '',
  organization: '',
  publish_date: '',
  page_count: '',
  storage_location: '',
  keywords: '',
  summary: ''
})

const showAddModal = ref(false)
const fileList = ref([])
const addFileList = ref([])
const categoryTree = ref([])

const categoryOptions = computed(() => {
  const options = []
  const flatten = (categories, prefix = '') => {
    categories.forEach(cat => {
      options.push({ id: cat.id, name: prefix + cat.name })
      if (cat.children) {
        flatten(cat.children, prefix + '├── ')
      }
    })
  }
  flatten(categoryTree.value)
  return options
})

const loadCategories = async () => {
  try {
    const res = await request.get('/archive/category/tree')
    if (res.code === 200) {
      categoryTree.value = res.data
    }
  } catch (err) {
    console.error('加载分类失败')
  }
}

const handleFileUpload = (response, file) => {
  if (response.code === 200) {
    ElMessage.success('文件上传成功')
  } else {
    ElMessage.error(response.msg)
  }
}

const handleFileError = (err) => {
  ElMessage.error('文件上传失败')
}

const handleFileRemove = (file, fileList) => {
  return ElMessageBox.confirm('确定要删除该文件吗？')
}

const handleAddFileUpload = (response, file) => {
  if (response.code === 200) {
    ElMessage.success('文件上传成功')
  }
}

const saveRecord = async () => {
  if (!form.value.archive_no || !form.value.title || !form.value.category_id) {
    return ElMessage.error('请填写必填项')
  }
  
  try {
    const res = await request.post('/archive/record/update', form.value)
    if (res.code === 200) {
      ElMessage.success(res.msg)
    } else {
      ElMessage.error(res.msg)
    }
  } catch (err) {
    ElMessage.error('保存失败')
  }
}

const saveNewRecord = async () => {
  if (!addForm.value.archive_no || !addForm.value.title || !addForm.value.category_id) {
    return ElMessage.error('请填写必填项')
  }
  
  try {
    const res = await request.post('/archive/record/create', addForm.value)
    if (res.code === 200) {
      ElMessage.success(res.msg)
      showAddModal.value = false
      addForm.value = {
        archive_no: '',
        title: '',
        category_id: '',
        author: '',
        organization: '',
        publish_date: '',
        page_count: '',
        storage_location: '',
        keywords: '',
        summary: ''
      }
      addFileList.value = []
    } else {
      ElMessage.error(res.msg)
    }
  } catch (err) {
    ElMessage.error('保存失败')
  }
}

const resetForm = () => {
  form.value = {
    archive_no: '',
    title: '',
    category_id: '',
    author: '',
    organization: '',
    publish_date: '',
    page_count: '',
    storage_location: '',
    keywords: '',
    summary: ''
  }
  fileList.value = []
}

onMounted(() => {
  loadCategories()
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
</style>
