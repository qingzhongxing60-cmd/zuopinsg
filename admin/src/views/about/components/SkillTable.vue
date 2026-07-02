<template>
  <ElCard shadow="never" class="skill-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">技能管理</span>
        <ElButton type="primary" :icon="Plus" @click="handleAdd">新增</ElButton>
      </div>
    </template>

    <ElTable v-loading="loading" :data="tableData" style="width: 100%" empty-text="暂无技能数据">
      <ElTableColumn prop="name" label="技能名称" min-width="200" show-overflow-tooltip />
      <ElTableColumn prop="score" label="评分值" width="120" align="center" />
      <ElTableColumn prop="sort" label="排序值" width="120" align="center" />
      <ElTableColumn label="操作" width="150" align="center" fixed="right">
        <template #default="{ row }">
          <ElButton link type="primary" @click="handleEdit(row as Skill)">编辑</ElButton>
          <ElButton link type="danger" @click="handleDelete(row as Skill)">删除</ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <!-- 新增/编辑弹窗 -->
    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="480px" @closed="resetForm">
      <ElForm ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <ElFormItem label="技能名称" prop="name">
          <ElInput v-model="form.name" placeholder="请输入技能名称" maxlength="50" show-word-limit />
        </ElFormItem>
        <ElFormItem label="评分值" prop="score">
          <ElInputNumber v-model="form.score" :min="0" :max="100" :precision="0" style="width: 100%" />
        </ElFormItem>
        <ElFormItem label="排序值" prop="sort">
          <ElInputNumber v-model="form.sort" :min="1" :max="9999" :precision="0" style="width: 100%" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </ElCard>
</template>

<script setup lang="ts">
  // 技能管理：列表 + 新增/编辑/删除
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { getSkillList, addSkill, updateSkill, deleteSkill, type Skill } from '@/api/about'

  defineOptions({ name: 'SkillTable' })

  // 列表状态
  const loading = ref(false)
  const tableData = ref<Skill[]>([])
  const deleting = ref(false)

  // 弹窗与表单状态
  const dialogVisible = ref(false)
  const submitLoading = ref(false)
  const formRef = ref<FormInstance>()
  const form = reactive({
    id: undefined as number | undefined,
    name: '',
    score: 0,
    sort: 1
  })
  const dialogTitle = computed(() => (form.id ? '编辑技能' : '新增技能'))

  const formRules: FormRules = {
    name: [{ required: true, message: '技能名称不能为空', trigger: 'blur' }],
    score: [
      { required: true, message: '评分值不能为空', trigger: 'change' },
      { type: 'number', min: 0, max: 100, message: '评分值须在 0 到 100 之间', trigger: 'change' }
    ],
    sort: [{ required: true, message: '排序值不能为空', trigger: 'change' }]
  }

  /** 加载技能列表 */
  async function loadList() {
    loading.value = true
    try {
      const { data } = await getSkillList()
      tableData.value = data || []
    } catch {
      ElMessage.error('加载技能列表失败')
    } finally {
      loading.value = false
    }
  }

  function handleAdd() {
    dialogVisible.value = true
  }

  function handleEdit(row: Skill) {
    Object.assign(form, { id: row.id, name: row.name, score: row.score, sort: row.sort })
    dialogVisible.value = true
  }

  /** 删除技能（防重复触发） */
  async function handleDelete(row: Skill) {
    if (deleting.value) return
    try {
      await ElMessageBox.confirm('确认删除该技能？删除后不可恢复', '提示', { type: 'warning' })
      deleting.value = true
      await deleteSkill(row.id)
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
      if (form.id) {
        await updateSkill({ id: form.id, name: form.name, score: form.score, sort: form.sort })
      } else {
        await addSkill({ name: form.name, score: form.score, sort: form.sort })
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
    Object.assign(form, { id: undefined, name: '', score: 0, sort: 1 })
  }

  onMounted(() => loadList())
</script>

<style lang="scss" scoped>
  .skill-card {
    flex-shrink: 0;
    border: none !important;
    box-shadow: none !important;
    border-radius: 12px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .card-title {
      font-weight: 600;
    }
  }
</style>
