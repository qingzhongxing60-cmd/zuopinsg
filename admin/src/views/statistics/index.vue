<template>
  <div class="statistics">
    <ElCard shadow="never" class="table-card">
      <div class="card-header">
        <span class="card-title">作品访问量排行</span>
        <span class="card-subtitle">仅统计已发布作品，按访问量降序</span>
      </div>

      <div class="table-container">
        <ElTable v-loading="loading" :data="tableData" height="100%" style="width: 100%" empty-text="暂无访问数据">
          <ElTableColumn label="排名" width="100" align="center">
            <template #default="{ $index }">
              <span :class="['rank-badge', rankClass($index)]">{{ rankNo($index) }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="title" label="作品标题" min-width="240" show-overflow-tooltip />
          <ElTableColumn prop="categoryName" label="所属分类" width="160">
            <template #default="{ row }">{{ row.categoryName || '-' }}</template>
          </ElTableColumn>
          <ElTableColumn prop="views" label="访问量" width="160" align="center" />
        </ElTable>
      </div>

      <div class="pagination-container">
        <ElPagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="loadRank"
        />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  // 数据统计：作品访问量排行（只读 + 分页）
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { getWorkViewRank, type WorkViewRankItem } from '@/api/statistics'

  defineOptions({ name: 'Statistics' })

  const loading = ref(false)
  const tableData = ref<WorkViewRankItem[]>([])
  const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

  /** 当前页下行序号对应的全局排名（从 1 起） */
  function rankNo(index: number): number {
    return (pagination.page - 1) * pagination.pageSize + index + 1
  }

  /** 前三名高亮样式 */
  function rankClass(index: number): string {
    const no = rankNo(index)
    if (no === 1) return 'rank-badge--first'
    if (no === 2) return 'rank-badge--second'
    if (no === 3) return 'rank-badge--third'
    return ''
  }

  /** 加载访问量排行 */
  async function loadRank() {
    loading.value = true
    try {
      const { data } = await getWorkViewRank({
        page: pagination.page,
        pageSize: pagination.pageSize
      })
      tableData.value = data?.list || []
      pagination.total = data?.pagination?.total || 0
    } catch {
      ElMessage.error('加载访问量排行失败')
    } finally {
      loading.value = false
    }
  }

  /** 每页条数变更：回到第 1 页重新加载 */
  function handleSizeChange() {
    pagination.page = 1
    loadRank()
  }

  onMounted(() => loadRank())
</script>

<style lang="scss" scoped>
  .statistics {
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

      .card-header {
        display: flex;
        align-items: baseline;
        gap: 12px;
        margin-bottom: 16px;

        .card-title {
          font-size: 15px;
          font-weight: 600;
        }

        .card-subtitle {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }

      .table-container {
        flex: 1;
        overflow: hidden;
      }

      .pagination-container {
        display: flex;
        justify-content: flex-end;
        margin-top: 16px;
      }

      // 排名徽标：前三名以颜色区分权重
      .rank-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        height: 28px;
        padding: 0 8px;
        border-radius: 14px;
        font-weight: 600;
        color: var(--el-text-color-regular);
        background: var(--el-fill-color-light);

        &--first {
          color: #fff;
          background: #f5a623;
        }

        &--second {
          color: #fff;
          background: #9aa7b5;
        }

        &--third {
          color: #fff;
          background: #cd7f32;
        }
      }
    }
  }
</style>
