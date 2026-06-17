<template>
  <div class="page-container">
    <div class="page-header">
      <h2>档案分类管理</h2>
      <el-button type="primary" @click="showAddModal = true">新增分类</el-button>
    </div>
    
    <el-tree
      :data="categoryTree"
      node-key="id"
      :props="{ label: 'name', children: 'children' }"
      :expand-on-click-node="false"
      default-expand-all
    >
      <template #default="scope">
        <span class="tree-node">
          <span class="category-name">{{ scope.data.name }}</span>
          <span class="tree-actions">
            <el-button size="mini" @click="addChild(scope.data)">新增子分类</el-button>
            <el-button size="mini" @click="editCategory(scope.data)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteCategory(scope.data.id)">删除</el-button>
          </span>
        </span>
      </template>
    </el-tree>
    
    <el-dialog title="新增分类" v-model="showAddModal" width="400px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="分类名称">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="上级分类">
          <el-select v-model="form.parent_id" placeholder="请选择上级分类">
            <el-option label="顶级分类" :value="0" />
            <el-option
              v-for="cat in categoryOptions"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input type="number" v-model="form.sort" placeholder="排序数字" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="form.description" placeholder="请输入分类描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddModal = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const categoryTree = ref([])
const showAddModal = ref(false)
const form = ref({
  name: '',
  parent_id: 0,
  sort: 0,
  description: ''
})

const categoryOptions = computed(() => {
  const options = []
  const flatten = (categories) => {
    categories.forEach(cat => {
      options.push({ id: cat.id, name: cat.name })
      if (cat.children) {
        flatten(cat.children)
      }
    })
  }
  flatten(categoryTree.value)
  return options
})

const loadCategories = async () => {
  try {
    console.log('开始加载分类数据...')
    const res = await request.get('/archive/category/tree')
    console.log('分类API返回:', res)
    if (res.code === 200) {
      categoryTree.value = Array.isArray(res.data) ? res.data : []
      console.log('分类树数据:', categoryTree.value)
    } else {
      ElMessage.error(res.msg || '加载分类失败')
    }
  } catch (err) {
    console.error('加载分类失败', err)
    ElMessage.error('加载分类失败，请检查后端接口')
  }
}

const addChild = (node) => {
  form.value = {
    name: '',
    parent_id: node.id,
    sort: 0,
    description: ''
  }
  showAddModal.value = true
}

const editCategory = (node) => {
  form.value = {
    id: node.id,
    name: node.name,
    parent_id: node.parent_id,
    sort: node.sort || 0,
    description: node.description || ''
  }
  showAddModal.value = true
}

const saveCategory = async () => {
  if (!form.value.name) {
    return ElMessage.error('请输入分类名称')
  }
  
  try {
    let res
    if (form.value.id) {
      res = await request.post('/archive/category/update', form.value)
    } else {
      res = await request.post('/archive/category/create', form.value)
    }
    
    if (res.code === 200) {
      ElMessage.success(res.msg)
      showAddModal.value = false
      form.value = { name: '', parent_id: 0, sort: 0, description: '' }
      loadCategories()
    } else {
      ElMessage.error(res.msg)
    }
  } catch (err) {
    ElMessage.error('操作失败')
  }
}

const deleteCategory = async (id) => {
  ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await request.delete(`/archive/category/${id}`)
      if (res.code === 200) {
        ElMessage.success(res.msg)
        loadCategories()
      } else {
        ElMessage.error(res.msg)
      }
    } catch (err) {
      ElMessage.error('删除失败')
    }
  })
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

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  color: #303133 !important;
  font-size: 14px;
}

.tree-node .category-name {
  color: #303133 !important;
  font-size: 14px;
  font-weight: 500;
}

.tree-actions {
  display: flex;
  gap: 5px;
}

:deep(.el-tree) {
  color: #303133 !important;
}

:deep(.el-tree-node__content) {
  height: auto !important;
  padding: 8px 0 !important;
}

:deep(.el-tree-node__label) {
  color: #303133 !important;
}

:deep(.el-tree-node__children) {
  color: #303133 !important;
}
</style>
