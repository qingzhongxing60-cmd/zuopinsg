<template>
  <div class="timeline-manage">
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
          empty-text="暂无时间轴数据"
        >
          <ElTableColumn prop="year" label="年份" width="100" align="center" />
          <ElTableColumn prop="title" label="标题" min-width="180" show-overflow-tooltip />
          <ElTableColumn label="描述" min-width="240" show-overflow-tooltip>
            <template #default="{ row }">{{ row.description || '-' }}</template>
          </ElTableColumn>
          <ElTableColumn prop="sort" label="排序值" width="100" align="center" />
          <ElTableColumn label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <ElButton link type="primary" @click="handleEdit(row as TimelineNode)">编辑</ElButton>
              <ElButton link type="danger" @click="handleDelete(row as TimelineNode)">删除</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </ElCard>

    <!-- 新增/编辑弹窗 -->
    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="500px" @closed="resetForm">
      <ElForm ref="formRef" :model="form" :rules="formRules" label-width="80px">
        <ElFormItem label="年份" prop="yearStr">
          <ElInput
            v-model="form.yearStr"
            placeholder="请输入年份，如 2024"
            maxlength="4"
          />
        </ElFormItem>
        <ElFormItem label="标题" prop="title">
          <ElInput
            v-model="form.title"
            placeholder="请输入标题"
            maxlength="100"
            show-word-limit
          />
        </ElFormItem>
        <ElFormItem label="描述" prop="description">
          <ElInput
            v-model="form.description"
            type="textarea"
            placeholder="请输入描述（选填）"
            :rows="3"
            maxlength="500"
            show-word-limit
          />
        </ElFormItem>
        <ElFormItem label="排序值" prop="sort">
          <ElInputNumber
            v-model="form.sort"
            :min="1"
            :precision="0"
            style="width: 100%"
          />
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
  // 时间轴管理页面：列表展示 + 新增/编辑/删除
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import {
    getTimelineList,
    addTimeline,
    updateTimeline,
    deleteTimeline,
    type TimelineNode
  } from '@/api/timeline'

  defineOptions({ name: 'Timeline' })

  // 列表状态
  const loading = ref(false)
  const tableData = ref<TimelineNode[]>([])
  const deleting = ref(false)

  // 弹窗与表单状态
  const dialogVisible = ref(false)
  const submitLoading = ref(false)
  const formRef = ref<FormInstance>()

  // 年份用字符串存储以便校验，提交时转换为数字
  const form = reactive({
    id: undefined as number | undefined,
    yearStr: '',
    title: '',
    description: '',
    sort: 1
  })

  const dialogTitle = computed(() => (form.id ? '编辑时间轴节点' : '新增时间轴节点'))

  // 年份校验：必填，且必须是 4 位整数
  const validateYear = (_rule: unknown, value: string, callback: (err?: Error) => void) => {
    if (!value || !value.trim()) {
      callback(new Error('请输入有效的年份（如 2024）'))
    } else if (!/^\d{4}$/.test(value.trim())) {
      callback(new Error('请输入有效的年份（如 2024）'))
    } else {
      callback()
    }
  }

  const formRules: FormRules = {
    yearStr: [{ validator: validateYear, trigger: 'blur' }],
    title: [
      { required: true, message: '标题不能为空', trigger: 'blur' },
      { min: 1, max: 100, message: '标题长度需为 1-100 字', trigger: 'blur' }
    ],
    description: [{ max: 500, message: '描述不能超过 500 字', trigger: 'blur' }],
    sort: [{ required: true, message: '排序值不能为空', trigger: 'change' }]
  }

  /** 加载时间轴列表 */
  async function loadList() {
    loading.value = true
    try {
      const { data } = await getTimelineList()
      tableData.value = data || []
    } catch {
      ElMessage.error('加载时间轴列表失败')
    } finally {
      loading.value = false
    }
  }

  function handleAdd() {
    dialogVisible.value = true
  }

  function handleEdit(row: TimelineNode) {
    Object.assign(form, {
      id: row.id,
      yearStr: String(row.year),
      title: row.title,
      description: row.description || '',
      sort: row.sort
    })
    dialogVisible.value = true
  }

  /** 删除时间轴节点（防重复触发） */
  async function handleDelete(row: TimelineNode) {
    if (deleting.value) return
    try {
      await ElMessageBox.confirm('确认删除该时间轴节点？删除后不可恢复', '提示', { type: 'warning' })
      deleting.value = true
      await deleteTimeline(row.id)
      ElMessage.success('删除成功')
      await loadList()
    } catch (error: unknown) {
      // ElMessageBox 取消时 reject 字符串（'cancel'/'close'），过滤掉不弹错
      if (typeof error !== 'string') {
        ElMessage.error(error instanceof Error ? error.message : '删除失败')
      }
    } finally {
      deleting.value = false
    }
  }

  /** 提交新增或编辑 */
  async function handleSubmit() {
    try {
      await formRef.value?.validate()
      submitLoading.value = true
      const year = parseInt(form.yearStr.trim(), 10)
      if (form.id) {
        await updateTimeline({
          id: form.id,
          year,
          title: form.title,
          description: form.description || undefined,
          sort: form.sort
        })
      } else {
        await addTimeline({
          year,
          title: form.title,
          description: form.description || undefined,
          sort: form.sort
        })
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
    Object.assign(form, { id: undefined, yearStr: '', title: '', description: '', sort: 1 })
  }

  onMounted(() => loadList())
</script>

<style lang="scss" scoped>
  .timeline-manage {
    height: 100%;
    display: flex;
    flex-direction: column;

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
