<template>
  <div class="category-manage">
    <!-- 筛选卡片 -->
    <ElCard shadow="never" class="filter-card">
      <ElForm :model="filterForm" :inline="true" class="filter-form">
        <ElFormItem label="分类名称">
          <ElInput
            v-model="filterForm.name"
            placeholder="输入分类名称"
            clearable
            class="filter-input"
            @keyup.enter="handleSearch"
          />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" :icon="Search" @click="handleSearch">搜索</ElButton>
          <ElButton @click="handleReset">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 表格卡片 -->
    <ElCard shadow="never" class="table-card">
      <div class="table-header">
        <ElButton type="primary" :icon="Plus" @click="handleAdd">新增</ElButton>
      </div>

      <div class="table-container">
        <ElTable
          v-loading="loading"
          :data="tableData"
          height="100%"
          style="width: 100%"
          empty-text="暂无分类数据"
        >
          <ElTableColumn prop="name" label="分类名" min-width="180" show-overflow-tooltip />
          <ElTableColumn prop="slug" label="唯一标识" min-width="180" show-overflow-tooltip />
          <ElTableColumn label="排序值" width="120" align="center">
            <template #default="{ row }">{{ row.sort ?? '-' }}</template>
          </ElTableColumn>
          <ElTableColumn prop="workCount" label="关联作品数" width="120" align="center" />
          <ElTableColumn label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <ElButton link type="primary" @click="handleEdit(row as Category)">编辑</ElButton>
              <ElButton link type="danger" @click="handleDelete(row as Category)">删除</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </ElCard>
    <!-- 新增/编辑弹窗 -->
    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="500px" @closed="resetForm">
      <ElForm ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <ElFormItem label="分类名" prop="name">
          <ElInput v-model="form.name" placeholder="请输入分类名称" maxlength="50" show-word-limit />
        </ElFormItem>
        <ElFormItem label="唯一标识" prop="slug">
          <ElInput
            v-model="form.slug"
            placeholder="仅允许英文字母、数字、连字符，如 ai-product"
            maxlength="100"
            show-word-limit
          />
        </ElFormItem>
        <ElFormItem label="排序值" prop="sort">
          <ElInputNumber v-model="form.sort" :min="0" :max="9999" :precision="0" style="width: 100%" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  // 分类管理页面：名称筛选 + 列表展示 + 新增/编辑/删除
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Plus } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import {
    getCategoryList,
    addCategory,
    updateCategory,
    deleteCategory,
    type Category
  } from '@/api/category'

  defineOptions({ name: 'Category' })

  // 筛选表单
  const filterForm = reactive({ name: '' })

  // 列表状态
  const loading = ref(false)
  const tableData = ref<Category[]>([])

  // 弹窗与表单状态
  const dialogVisible = ref(false)
  const submitLoading = ref(false)
  const formRef = ref<FormInstance>()
  const form = reactive({
    id: undefined as number | undefined,
    name: '',
    slug: '',
    sort: 0
  })
  const dialogTitle = computed(() => (form.id ? '编辑分类' : '新增分类'))

  // slug 校验：仅允许英文字母、数字、连字符
  const validateSlug = (_rule: unknown, value: string, callback: (err?: Error) => void) => {
    if (value && !/^[a-zA-Z0-9-]+$/.test(value)) {
      callback(new Error('唯一标识仅允许英文字母、数字和连字符'))
    } else {
      callback()
    }
  }

  const formRules: FormRules = {
    name: [
      { required: true, message: '该字段不能为空', trigger: 'blur' },
      { min: 1, max: 50, message: '分类名长度需为 1-50 字', trigger: 'blur' }
    ],
    slug: [
      { required: true, message: '该字段不能为空', trigger: 'blur' },
      { min: 1, max: 100, message: '唯一标识长度需为 1-100 字符', trigger: 'blur' },
      { validator: validateSlug, trigger: 'blur' }
    ],
    sort: [{ required: true, message: '该字段不能为空', trigger: 'change' }]
  }

  /** 加载分类列表 */
  async function loadList() {
    loading.value = true
    try {
      const { data } = await getCategoryList({ name: filterForm.name || undefined })
      tableData.value = data || []
    } catch {
      ElMessage.error('加载分类列表失败')
    } finally {
      loading.value = false
    }
  }

  function handleSearch() {
    loadList()
  }

  function handleReset() {
    filterForm.name = ''
    loadList()
  }

  function handleAdd() {
    dialogVisible.value = true
  }

  function handleEdit(row: Category) {
    Object.assign(form, { id: row.id, name: row.name, slug: row.slug, sort: row.sort })
    dialogVisible.value = true
  }

  /** 删除分类（含关联作品保护，错误信息由接口返回） */
  async function handleDelete(row: Category) {
    try {
      await ElMessageBox.confirm('确认删除该分类？此操作不可恢复。', '提示', { type: 'warning' })
      await deleteCategory(row.id)
      ElMessage.success('删除成功')
      await loadList()
    } catch (error: unknown) {
      if (error !== 'cancel') {
        ElMessage.error(error instanceof Error ? error.message : '删除失败')
      }
    }
  }

  /** 提交新增或编辑 */
  async function handleSubmit() {
    try {
      await formRef.value?.validate()
      submitLoading.value = true
      if (form.id) {
        await updateCategory({ id: form.id, name: form.name, slug: form.slug, sort: form.sort })
      } else {
        await addCategory({ name: form.name, slug: form.slug, sort: form.sort })
      }
      ElMessage.success('保存成功')
      dialogVisible.value = false
      await loadList()
    } catch (error: unknown) {
      // 表单校验失败返回 false，不弹错；接口失败保留弹窗内容并提示原因
      if (error !== false && error instanceof Error) {
        ElMessage.error(error.message || '保存失败')
      }
    } finally {
      submitLoading.value = false
    }
  }

  /** 重置表单（弹窗关闭后触发） */
  function resetForm() {
    formRef.value?.resetFields()
    Object.assign(form, { id: undefined, name: '', slug: '', sort: 0 })
  }

  onMounted(() => loadList())
</script>

<style lang="scss" scoped>
  .category-manage {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .filter-card {
      flex-shrink: 0;
      border: none !important;
      box-shadow: none !important;
      border-radius: 12px;

      :deep(.el-card__body) {
        padding: 12px 20px;
      }

      .filter-form {
        @include responsiveFilterForm();
      }
    }

    .table-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: none !important;
      box-shadow: none !important;
      border-radius: 12px;

      :deep(.el-card__body) {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding: 16px;
      }

      .table-header {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
      }

      .table-container {
        flex: 1;
        overflow: hidden;
      }
    }
  }
</style>
