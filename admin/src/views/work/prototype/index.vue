<template>
  <div class="work-prototype">
    <!-- 作品选择 -->
    <ElCard shadow="never" class="selector-card">
      <div class="selector-row">
        <span class="selector-label">选择作品：</span>
        <ElSelect
          v-model="currentWorkId"
          placeholder="请选择作品"
          filterable
          class="work-select"
          @change="handleWorkChange"
        >
          <ElOption v-for="w in workOptions" :key="w.id" :label="w.title" :value="w.id" />
        </ElSelect>
      </div>
    </ElCard>

    <div v-if="currentWorkId" class="prototype-body">
      <!-- 版本列表 -->
      <ElCard shadow="never" class="version-card">
        <div class="card-header">
          <span class="card-title">原型版本</span>
          <ElButton type="primary" :icon="Plus" size="small" @click="handleAddVersion">新增版本</ElButton>
        </div>
        <ElTable
          v-loading="versionLoading"
          :data="versionList"
          height="100%"
          highlight-current-row
          empty-text="暂无原型版本"
          @current-change="handleVersionSelect"
        >
          <ElTableColumn prop="name" label="版本名" width="100" />
          <ElTableColumn prop="title" label="标题" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">{{ row.title || '-' }}</template>
          </ElTableColumn>
          <ElTableColumn label="排序值" width="80" align="center">
            <template #default="{ row }">{{ row.sort ?? '-' }}</template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="130" align="center">
            <template #default="{ row }">
              <ElButton link type="primary" @click.stop="handleEditVersion(row as PrototypeVersion)">编辑</ElButton>
              <ElButton link type="danger" @click.stop="handleDeleteVersion(row as PrototypeVersion)">删除</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </ElCard>

      <!-- 图片列表 -->
      <ElCard shadow="never" class="image-card">
        <div class="card-header">
          <span class="card-title">
            原型图片<template v-if="currentVersionName"> · {{ currentVersionName }}</template>
          </span>
          <ElUpload
            v-if="currentVersionId"
            :show-file-list="false"
            :auto-upload="false"
            accept="image/*"
            multiple
            :on-change="handleImageUpload"
          >
            <ElButton type="primary" :icon="Plus" size="small">上传图片</ElButton>
          </ElUpload>
        </div>
        <div v-if="!currentVersionId" class="hint-text">请先选择左侧版本</div>
        <ElTable
          v-else
          v-loading="imageLoading"
          :data="imageList"
          height="100%"
          empty-text="暂无图片"
        >
          <ElTableColumn label="图片" width="100">
            <template #default="{ row }">
              <ElImage
                :src="row.url"
                fit="cover"
                class="image-thumb"
                :preview-src-list="[row.url]"
                preview-teleported
              />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="caption" label="说明" min-width="160" show-overflow-tooltip>
            <template #default="{ row }">{{ row.caption || '-' }}</template>
          </ElTableColumn>
          <ElTableColumn label="排序值" width="80" align="center">
            <template #default="{ row }">{{ row.sort ?? '-' }}</template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="130" align="center">
            <template #default="{ row }">
              <ElButton link type="primary" @click="handleEditImage(row as PrototypeImage)">编辑</ElButton>
              <ElButton link type="danger" @click="handleDeleteImage(row as PrototypeImage)">删除</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </ElCard>
    </div>
    <ElEmpty v-else description="请先选择一个作品" />

    <!-- 版本新增/编辑弹窗 -->
    <ElDialog v-model="versionDialogVisible" :title="versionForm.id ? '编辑版本' : '新增版本'" width="460px" @closed="resetVersionForm">
      <ElForm ref="versionFormRef" :model="versionForm" :rules="versionRules" label-width="80px">
        <ElFormItem label="版本名" prop="name">
          <ElInput v-model="versionForm.name" placeholder="如 V1、V2" maxlength="20" show-word-limit />
        </ElFormItem>
        <ElFormItem label="标题" prop="title">
          <ElInput v-model="versionForm.title" placeholder="版本简短说明（选填）" maxlength="100" />
        </ElFormItem>
        <ElFormItem label="排序值" prop="sort">
          <ElInputNumber v-model="versionForm.sort" :min="0" :max="9999" :precision="0" placeholder="越小越靠前" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="versionDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="versionSubmitLoading" @click="submitVersion">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 图片编辑弹窗 -->
    <ElDialog v-model="imageDialogVisible" title="编辑图片" width="460px" @closed="resetImageForm">
      <ElForm ref="imageFormRef" :model="imageForm" label-width="80px">
        <ElFormItem label="说明">
          <ElInput v-model="imageForm.caption" type="textarea" :rows="2" placeholder="图片说明（选填）" maxlength="200" show-word-limit />
        </ElFormItem>
        <ElFormItem label="排序值">
          <ElInputNumber v-model="imageForm.sort" :min="0" :max="9999" :precision="0" placeholder="越小越靠前" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="imageDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="imageSubmitLoading" @click="submitImage">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  // 原型版本管理：作品选择 + 版本 CRUD + 图片管理
  import { ref, reactive, computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules, UploadFile } from 'element-plus'
  import {
    getWorkList,
    getVersionList,
    addVersion,
    updateVersion,
    deleteVersion,
    getImageList,
    addImages,
    updateImage,
    deleteImage,
    type Work,
    type PrototypeVersion,
    type PrototypeImage
  } from '@/api/work'
  import { uploadImage } from '@/api/upload'

  defineOptions({ name: 'WorkPrototype' })

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024
  const route = useRoute()

  // 作品选择
  const workOptions = ref<{ id: number; title: string }[]>([])
  const currentWorkId = ref<number>()

  // 版本
  const versionLoading = ref(false)
  const versionList = ref<PrototypeVersion[]>([])
  const currentVersionId = ref<number>()
  const currentVersionName = computed(
    () => versionList.value.find((v) => v.id === currentVersionId.value)?.name || ''
  )

  // 图片
  const imageLoading = ref(false)
  const imageList = ref<PrototypeImage[]>([])

  /** 加载作品下拉 */
  async function loadWorks() {
    try {
      const { data } = await getWorkList()
      workOptions.value = (data || []).map((w) => ({ id: w.id, title: w.title }))
    } catch {
      ElMessage.error('加载作品列表失败')
    }
  }

  /** 加载版本列表（刷新后尽量保留当前选中版本） */
  async function loadVersions() {
    if (!currentWorkId.value) return
    versionLoading.value = true
    try {
      const { data } = await getVersionList(currentWorkId.value)
      versionList.value = data || []
      // 若当前选中版本在新列表中仍存在则保留并刷新图片，否则清空选中
      if (currentVersionId.value && versionList.value.some((v) => v.id === currentVersionId.value)) {
        await loadImages()
      } else {
        currentVersionId.value = undefined
        imageList.value = []
      }
    } catch {
      ElMessage.error('加载版本列表失败')
    } finally {
      versionLoading.value = false
    }
  }

  /** 加载图片列表 */
  async function loadImages() {
    if (!currentVersionId.value) return
    imageLoading.value = true
    try {
      const { data } = await getImageList(currentVersionId.value)
      imageList.value = data || []
    } catch {
      ElMessage.error('加载图片列表失败')
    } finally {
      imageLoading.value = false
    }
  }

  function handleWorkChange() {
    loadVersions()
  }

  function handleVersionSelect(row: PrototypeVersion | null) {
    if (!row) return
    currentVersionId.value = row.id
    loadImages()
  }

  // ===== 版本表单 =====
  const versionDialogVisible = ref(false)
  const versionSubmitLoading = ref(false)
  const versionFormRef = ref<FormInstance>()
  const versionForm = reactive({
    id: undefined as number | undefined,
    name: '',
    title: '',
    sort: undefined as number | undefined
  })
  const versionRules: FormRules = {
    name: [{ required: true, message: '请输入版本名', trigger: 'blur' }]
  }

  function handleAddVersion() {
    versionDialogVisible.value = true
  }

  function handleEditVersion(row: PrototypeVersion) {
    Object.assign(versionForm, {
      id: row.id,
      name: row.name,
      title: row.title || '',
      sort: row.sort ?? undefined
    })
    versionDialogVisible.value = true
  }

  async function submitVersion() {
    try {
      await versionFormRef.value?.validate()
      versionSubmitLoading.value = true
      if (versionForm.id) {
        await updateVersion({
          id: versionForm.id,
          name: versionForm.name,
          title: versionForm.title,
          sort: versionForm.sort
        })
      } else {
        await addVersion({
          workId: currentWorkId.value as number,
          name: versionForm.name,
          title: versionForm.title,
          sort: versionForm.sort
        })
      }
      ElMessage.success('保存成功')
      versionDialogVisible.value = false
      await loadVersions()
    } catch (error: unknown) {
      if (error !== false && error instanceof Error) ElMessage.error(error.message || '保存失败')
    } finally {
      versionSubmitLoading.value = false
    }
  }

  function resetVersionForm() {
    versionFormRef.value?.resetFields()
    Object.assign(versionForm, { id: undefined, name: '', title: '', sort: undefined })
  }

  /** 删除版本（级联删除图片） */
  async function handleDeleteVersion(row: PrototypeVersion) {
    try {
      await ElMessageBox.confirm('删除版本将同时删除该版本下所有图片，确认删除？', '提示', { type: 'warning' })
      await deleteVersion(row.id)
      ElMessage.success('删除成功')
      if (currentVersionId.value === row.id) {
        currentVersionId.value = undefined
        imageList.value = []
      }
      await loadVersions()
    } catch (error: unknown) {
      if (typeof error !== 'string') ElMessage.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  // ===== 图片 =====
  /** 上传图片（上传到服务器获取 URL，再保存记录） */
  async function handleImageUpload(file: UploadFile) {
    const raw = file.raw
    if (!raw || !currentVersionId.value) return
    try {
      const url = await uploadImage(raw, MAX_IMAGE_SIZE)
      await addImages({
        versionId: currentVersionId.value as number,
        images: [{ url }]
      })
      ElMessage.success('上传成功')
      await loadImages()
    } catch (error: unknown) {
      ElMessage.error(error instanceof Error ? error.message : '上传失败')
    }
  }

  const imageDialogVisible = ref(false)
  const imageSubmitLoading = ref(false)
  const imageFormRef = ref<FormInstance>()
  const imageForm = reactive({
    id: undefined as number | undefined,
    caption: '',
    sort: undefined as number | undefined
  })

  function handleEditImage(row: PrototypeImage) {
    Object.assign(imageForm, { id: row.id, caption: row.caption || '', sort: row.sort ?? undefined })
    imageDialogVisible.value = true
  }

  async function submitImage() {
    if (!imageForm.id) return
    imageSubmitLoading.value = true
    try {
      await updateImage({ id: imageForm.id, caption: imageForm.caption, sort: imageForm.sort })
      ElMessage.success('保存成功')
      imageDialogVisible.value = false
      await loadImages()
    } catch (error: unknown) {
      ElMessage.error(error instanceof Error ? error.message : '保存失败')
    } finally {
      imageSubmitLoading.value = false
    }
  }

  function resetImageForm() {
    Object.assign(imageForm, { id: undefined, caption: '', sort: undefined })
  }

  async function handleDeleteImage(row: PrototypeImage) {
    try {
      await ElMessageBox.confirm('确认删除该图片？', '提示', { type: 'warning' })
      await deleteImage(row.id)
      ElMessage.success('删除成功')
      await loadImages()
    } catch (error: unknown) {
      if (typeof error !== 'string') ElMessage.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  onMounted(async () => {
    await loadWorks()
    // 支持从作品列表带 workId 直达
    const qid = Number(route.query.workId)
    if (qid && workOptions.value.some((w) => w.id === qid)) {
      currentWorkId.value = qid
      await loadVersions()
    }
  })
</script>

<style lang="scss" scoped>
  .work-prototype {
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

    .prototype-body {
      flex: 1;
      display: flex;
      gap: 16px;
      overflow: hidden;

      .version-card {
        width: 440px;
        flex-shrink: 0;
      }

      .image-card {
        flex: 1;
      }

      .version-card,
      .image-card {
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
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;

        .card-title {
          font-weight: 600;
        }
      }

      .hint-text {
        color: var(--el-text-color-placeholder);
        font-size: 14px;
        padding: 24px 0;
        text-align: center;
      }

      .image-thumb {
        width: 64px;
        height: 44px;
        border-radius: 4px;
      }
    }
  }
</style>
