<template>
  <div class="work-article">
    <!-- 作品选择 -->
    <ElCard shadow="never" class="selector-card">
      <div class="selector-row">
        <span class="selector-label">选择作品：</span>
        <ElSelect
          v-model="currentWorkId"
          placeholder="请选择作品"
          filterable
          class="work-select"
          @change="loadArticles"
        >
          <ElOption v-for="w in workOptions" :key="w.id" :label="w.title" :value="w.id" />
        </ElSelect>
      </div>
    </ElCard>

    <!-- 文章列表 -->
    <ElCard v-if="currentWorkId" shadow="never" class="table-card">
      <div class="table-header">
        <ElButton type="primary" :icon="Plus" @click="handleAdd">新增</ElButton>
      </div>
      <div class="table-container">
        <ElTable v-loading="loading" :data="articleList" height="100%" empty-text="暂无拆解文章">
          <ElTableColumn prop="title" label="标题" min-width="220" show-overflow-tooltip />
          <ElTableColumn label="发布状态" width="110" align="center">
            <template #default="{ row }">
              <ElTag :type="row.status === 1 ? 'success' : 'info'">
                {{ row.status === 1 ? '已发布' : '草稿' }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="排序值" width="90" align="center">
            <template #default="{ row }">{{ row.sort ?? '-' }}</template>
          </ElTableColumn>
          <ElTableColumn prop="createTime" label="新增时间" width="170" />
          <ElTableColumn label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <ElButton link type="primary" @click="handleEdit(row as BreakdownArticle)">编辑</ElButton>
              <ElButton link type="success" @click="handleToggleStatus(row as BreakdownArticle)">
                {{ row.status === 1 ? '下架' : '发布' }}
              </ElButton>
              <ElButton link type="danger" @click="handleDelete(row as BreakdownArticle)">删除</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </ElCard>
    <ElEmpty v-else description="请先选择一个作品" />

    <!-- 新增/编辑抽屉 -->
    <ElDrawer v-model="drawerVisible" :title="form.id ? '编辑拆解文章' : '新增拆解文章'" size="600px" @closed="resetForm">
      <ElForm ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <ElFormItem label="标题" prop="title">
          <ElInput v-model="form.title" placeholder="请输入文章标题" maxlength="100" show-word-limit />
        </ElFormItem>
        <ElFormItem label="正文">
          <div class="editor-wrapper">
            <Toolbar :editor="editorRef" :default-config="toolbarConfig" mode="default" />
            <Editor
              v-model="form.content"
              :default-config="editorConfig"
              mode="default"
              class="editor-content"
              @on-created="handleEditorCreated"
            />
          </div>
        </ElFormItem>
        <ElFormItem label="发布状态" prop="status">
          <ElRadioGroup v-model="form.status">
            <ElRadio :value="0">草稿</ElRadio>
            <ElRadio :value="1">已发布</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="排序值" prop="sort">
          <ElInputNumber v-model="form.sort" :min="0" :max="9999" :precision="0" placeholder="越小越靠前" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="drawerVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">保存</ElButton>
      </template>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  // 拆解文章管理：作品选择 + 文章 CRUD + 发布/下架
  import { ref, reactive, shallowRef, onMounted, onBeforeUnmount } from 'vue'
  import { useRoute } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
  import '@wangeditor/editor/dist/css/style.css'
  import type { IDomEditor } from '@wangeditor/editor'
  import {
    getWorkList,
    getArticleList,
    addArticle,
    updateArticle,
    deleteArticle,
    toggleArticleStatus,
    type BreakdownArticle,
    type PublishStatus
  } from '@/api/work'

  defineOptions({ name: 'WorkArticle' })

  const route = useRoute()

  // 作品选择
  const workOptions = ref<{ id: number; title: string }[]>([])
  const currentWorkId = ref<number>()

  // 列表
  const loading = ref(false)
  const articleList = ref<BreakdownArticle[]>([])
  const toggling = ref(false)

  /** 加载作品下拉 */
  async function loadWorks() {
    try {
      const { data } = await getWorkList()
      workOptions.value = (data || []).map((w) => ({ id: w.id, title: w.title }))
    } catch {
      ElMessage.error('加载作品列表失败')
    }
  }

  /** 加载文章列表 */
  async function loadArticles() {
    if (!currentWorkId.value) return
    loading.value = true
    try {
      const { data } = await getArticleList(currentWorkId.value)
      articleList.value = data || []
    } catch {
      ElMessage.error('加载拆解文章失败')
    } finally {
      loading.value = false
    }
  }

  // ===== 表单 =====
  const drawerVisible = ref(false)
  const submitLoading = ref(false)
  const formRef = ref<FormInstance>()
  const form = reactive({
    id: undefined as number | undefined,
    title: '',
    content: '',
    status: 0 as PublishStatus,
    sort: undefined as number | undefined
  })
  const formRules: FormRules = {
    title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }]
  }

  // 富文本编辑器
  const editorRef = shallowRef<IDomEditor>()
  const toolbarConfig = { excludeKeys: ['uploadVideo', 'insertVideo', 'group-video'] }
  const editorConfig = { placeholder: '请输入拆解正文（选填）' }

  function handleEditorCreated(editor: IDomEditor) {
    editorRef.value = editor
  }

  function handleAdd() {
    drawerVisible.value = true
  }

  function handleEdit(row: BreakdownArticle) {
    Object.assign(form, {
      id: row.id,
      title: row.title,
      content: row.content || '',
      status: row.status,
      sort: row.sort ?? undefined
    })
    drawerVisible.value = true
  }

  async function handleSubmit() {
    try {
      await formRef.value?.validate()
      submitLoading.value = true
      if (form.id) {
        await updateArticle({ id: form.id, title: form.title, content: form.content, status: form.status, sort: form.sort })
      } else {
        await addArticle({
          workId: currentWorkId.value as number,
          title: form.title,
          content: form.content,
          status: form.status,
          sort: form.sort
        })
      }
      ElMessage.success('保存成功')
      drawerVisible.value = false
      await loadArticles()
    } catch (error: unknown) {
      if (error !== false && error instanceof Error) ElMessage.error(error.message || '保存失败')
    } finally {
      submitLoading.value = false
    }
  }

  function resetForm() {
    formRef.value?.resetFields()
    Object.assign(form, { id: undefined, title: '', content: '', status: 0, sort: undefined })
  }

  /** 删除文章 */
  async function handleDelete(row: BreakdownArticle) {
    try {
      await ElMessageBox.confirm('确认删除该拆解文章？', '提示', { type: 'warning' })
      await deleteArticle(row.id)
      ElMessage.success('删除成功')
      await loadArticles()
    } catch (error: unknown) {
      if (typeof error !== 'string') ElMessage.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  /** 切换发布状态 */
  async function handleToggleStatus(row: BreakdownArticle) {
    if (toggling.value) return
    toggling.value = true
    try {
      await toggleArticleStatus(row.id)
      ElMessage.success(row.status === 1 ? '已下架' : '已发布')
      await loadArticles()
    } catch (error: unknown) {
      ElMessage.error(error instanceof Error ? error.message : '操作失败')
    } finally {
      toggling.value = false
    }
  }

  onBeforeUnmount(() => editorRef.value?.destroy())

  onMounted(async () => {
    await loadWorks()
    const qid = Number(route.query.workId)
    if (qid && workOptions.value.some((w) => w.id === qid)) {
      currentWorkId.value = qid
      await loadArticles()
    }
  })
</script>

<style lang="scss" scoped>
  .work-article {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .selector-card {
      flex-shrink: 0;
      border: none !important;
      box-shadow: none !important;
      border-radius: 12px;

      :deep(.el-card__body) {
        padding: 12px 20px;
      }

      .selector-row {
        display: flex;
        align-items: center;

        .selector-label {
          flex-shrink: 0;
          font-size: 14px;
          color: var(--el-text-color-regular);
        }

        .work-select {
          width: 320px;
        }
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

    .editor-wrapper {
      width: 100%;
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      overflow: hidden;

      :deep(.w-e-toolbar) {
        border-bottom: 1px solid var(--el-border-color);
      }

      .editor-content {
        height: 300px;
        overflow-y: auto;
      }
    }
  }
</style>
