<template>
  <div class="work-list">
    <!-- 筛选卡片 -->
    <ElCard shadow="never" class="filter-card">
      <ElForm :model="filterForm" :inline="true" class="filter-form">
        <ElFormItem label="标题">
          <ElInput
            v-model="filterForm.title"
            placeholder="输入作品标题"
            clearable
            class="filter-input"
            @keyup.enter="handleSearch"
          />
        </ElFormItem>
        <ElFormItem label="所属分类">
          <ElSelect v-model="filterForm.categoryId" placeholder="全部分类" clearable class="filter-select">
            <ElOption v-for="c in categoryOptions" :key="c.id" :label="c.name" :value="c.id" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="发布状态">
          <ElSelect v-model="filterForm.status" placeholder="全部状态" clearable class="filter-select">
            <ElOption label="草稿" :value="0" />
            <ElOption label="已发布" :value="1" />
          </ElSelect>
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
        <ElTable v-loading="loading" :data="tableData" height="100%" style="width: 100%" empty-text="暂无作品数据">
          <ElTableColumn label="封面图" width="100">
            <template #default="{ row }">
              <ElImage
                v-if="row.cover && !failedCovers.has(row.id)"
                :src="row.cover"
                fit="cover"
                class="cover-thumb"
                :preview-src-list="[row.cover]"
                preview-teleported
                @error="() => failedCovers.add(row.id)"
              />
              <div v-else class="cover-placeholder">无封面</div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="title" label="标题" min-width="160" show-overflow-tooltip />
          <ElTableColumn prop="slug" label="唯一标识" min-width="140" show-overflow-tooltip />
          <ElTableColumn prop="categoryName" label="所属分类" width="120" />
          <ElTableColumn label="发布状态" width="100" align="center">
            <template #default="{ row }">
              <ElTag :type="row.status === 1 ? 'success' : 'info'">
                {{ row.status === 1 ? '已发布' : '草稿' }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="精选" width="80" align="center">
            <template #default="{ row }">
              <ElTag v-if="row.featured" type="warning">是</ElTag>
              <span v-else>否</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="views" label="访问量" width="90" align="center" />
          <ElTableColumn label="排序值" width="80" align="center">
            <template #default="{ row }">{{ row.sort ?? '-' }}</template>
          </ElTableColumn>
          <ElTableColumn label="发布时间" width="160">
            <template #default="{ row }">{{ row.publishTime || '-' }}</template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="280" fixed="right">
            <template #default="{ row }">
              <ElButton link type="primary" @click="handleEdit(row as Work)">编辑</ElButton>
              <ElButton link type="primary" @click="goPrototype(row as Work)">原型版本</ElButton>
              <ElButton link type="primary" @click="goArticle(row as Work)">拆解文章</ElButton>
              <ElButton link type="success" @click="handleToggleStatus(row as Work)">
                {{ row.status === 1 ? '下架' : '发布' }}
              </ElButton>
              <ElButton link type="warning" @click="handleToggleFeatured(row as Work)">
                {{ row.featured ? '取消精选' : '设为精选' }}
              </ElButton>
              <ElButton link type="danger" @click="handleDelete(row as Work)">删除</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </ElCard>

    <WorkFormDrawer ref="drawerRef" @saved="loadList" />
  </div>
</template>

<script setup lang="ts">
  // 作品列表：筛选 + 表格 + 新增/编辑/删除/发布/精选
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Plus } from '@element-plus/icons-vue'
  import {
    getWorkList,
    deleteWork,
    toggleWorkStatus,
    toggleWorkFeatured,
    type Work,
    type PublishStatus
  } from '@/api/work'
  import { getCategoryList } from '@/api/category'
  import WorkFormDrawer from './components/WorkFormDrawer.vue'

  defineOptions({ name: 'WorkList' })

  const router = useRouter()

  const filterForm = reactive({
    title: '',
    categoryId: undefined as number | undefined,
    status: undefined as PublishStatus | undefined
  })

  const loading = ref(false)
  const tableData = ref<(Work & { categoryName: string })[]>([])
  const categoryOptions = ref<{ id: number; name: string }[]>([])
  const drawerRef = ref<InstanceType<typeof WorkFormDrawer>>()
  const statusToggling = ref(false)
  const featuredToggling = ref(false)
  /** 加载失败的封面 ID 集合，避免反复触发 error 事件 */
  const failedCovers = reactive(new Set<number>())

  /** 加载分类下拉 */
  async function loadCategories() {
    try {
      const { data } = await getCategoryList()
      categoryOptions.value = (data || []).map((c) => ({ id: c.id, name: c.name }))
    } catch {
      ElMessage.error('加载分类列表失败')
    }
  }

  /** 加载作品列表 */
  async function loadList() {
    loading.value = true
    failedCovers.clear()
    try {
      const { data } = await getWorkList({
        title: filterForm.title || undefined,
        categoryId: filterForm.categoryId,
        status: filterForm.status
      })
      tableData.value = (data as (Work & { categoryName: string })[]) || []
    } catch {
      ElMessage.error('加载作品列表失败')
    } finally {
      loading.value = false
    }
  }

  function handleSearch() {
    loadList()
  }

  function handleReset() {
    filterForm.title = ''
    filterForm.categoryId = undefined
    filterForm.status = undefined
    loadList()
  }

  function handleAdd() {
    drawerRef.value?.open()
  }

  function handleEdit(row: Work) {
    drawerRef.value?.open(row)
  }

  function goPrototype(row: Work) {
    router.push({ path: '/work/prototype', query: { workId: row.id } })
  }

  function goArticle(row: Work) {
    router.push({ path: '/work/article', query: { workId: row.id } })
  }

  /** 删除作品（级联删除版本与文章） */
  async function handleDelete(row: Work) {
    try {
      await ElMessageBox.confirm(
        '删除作品将同时删除其原型版本与拆解文章，确认删除？',
        '提示',
        { type: 'warning' }
      )
      await deleteWork(row.id)
      ElMessage.success('删除成功')
      await loadList()
    } catch (error: unknown) {
      if (typeof error !== 'string') {
        ElMessage.error(error instanceof Error ? error.message : '删除失败')
      }
    }
  }

  /** 切换发布状态 */
  async function handleToggleStatus(row: Work) {
    if (statusToggling.value) return
    statusToggling.value = true
    try {
      await toggleWorkStatus(row.id)
      ElMessage.success(row.status === 1 ? '已下架' : '已发布')
      await loadList()
    } catch (error: unknown) {
      ElMessage.error(error instanceof Error ? error.message : '操作失败')
    } finally {
      statusToggling.value = false
    }
  }

  /** 切换精选标记 */
  async function handleToggleFeatured(row: Work) {
    if (featuredToggling.value) return
    featuredToggling.value = true
    try {
      await toggleWorkFeatured(row.id)
      ElMessage.success(row.featured ? '已取消精选' : '已设为精选')
      await loadList()
    } catch (error: unknown) {
      ElMessage.error(error instanceof Error ? error.message : '操作失败')
    } finally {
      featuredToggling.value = false
    }
  }

  onMounted(() => {
    loadCategories()
    loadList()
  })
</script>

<style lang="scss" scoped>
  .work-list {
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

      .cover-thumb {
        width: 60px;
        height: 40px;
        border-radius: 4px;
      }

      .cover-placeholder {
        width: 60px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: var(--el-text-color-placeholder);
        background: var(--el-fill-color-light);
        border-radius: 4px;
      }
    }
  }
</style>
