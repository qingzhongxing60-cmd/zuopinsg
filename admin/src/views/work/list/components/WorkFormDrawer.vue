<template>
  <ElDrawer
    v-model="visible"
    :title="isEdit ? '编辑作品' : '新增作品'"
    size="600px"
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="formRules" label-width="90px" v-loading="loading">
      <ElFormItem label="标题" prop="title">
        <ElInput v-model="form.title" placeholder="请输入作品标题" maxlength="100" show-word-limit />
      </ElFormItem>
      <ElFormItem label="唯一标识" prop="slug">
        <ElInput
          v-model="form.slug"
          placeholder="仅允许英文字母、数字、连字符"
          maxlength="100"
          show-word-limit
        />
      </ElFormItem>
      <ElFormItem label="简介" prop="intro">
        <ElInput
          v-model="form.intro"
          type="textarea"
          :rows="2"
          placeholder="作品简介（选填）"
          maxlength="500"
          show-word-limit
        />
      </ElFormItem>
      <ElFormItem label="封面图" prop="cover">
        <ElUpload
          class="cover-uploader"
          :show-file-list="false"
          :auto-upload="false"
          accept="image/*"
          :on-change="handleCoverChange"
          v-loading="coverUploading"
        >
          <img v-if="form.cover" :src="form.cover" class="cover-preview" alt="封面" />
          <ElIcon v-else class="cover-uploader-icon"><Plus /></ElIcon>
        </ElUpload>
        <span class="upload-tip">单张图片，建议不超过 5MB</span>
      </ElFormItem>
      <ElFormItem label="所属分类" prop="categoryId">
        <ElSelect v-model="form.categoryId" placeholder="请选择所属分类" style="width: 100%">
          <ElOption
            v-for="c in categoryOptions"
            :key="c.id"
            :label="c.name"
            :value="c.id"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="详情">
        <div class="editor-wrapper">
          <Toolbar :editor="editorRef" :default-config="toolbarConfig" mode="default" />
          <Editor
            v-model="form.detail"
            :default-config="editorConfig"
            mode="default"
            class="editor-content"
            @on-created="handleEditorCreated"
          />
        </div>
      </ElFormItem>
      <ElFormItem label="精选标记" prop="featured">
        <ElSwitch v-model="form.featured" />
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
      <ElFormItem v-if="isEdit" label="访问量">
        <span class="readonly-text">{{ readonlyViews }}</span>
      </ElFormItem>
      <ElFormItem v-if="isEdit" label="发布时间">
        <span class="readonly-text">{{ readonlyPublishTime || '-' }}</span>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">保存</ElButton>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  // 作品新增/编辑抽屉：封面上传 + wangeditor 富文本详情
  import { ref, reactive, computed, shallowRef, onBeforeUnmount } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules, UploadFile } from 'element-plus'
  import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
  import '@wangeditor/editor/dist/css/style.css'
  import type { IDomEditor } from '@wangeditor/editor'
  import { addWork, updateWork, type Work } from '@/api/work'
  import { getCategoryList as fetchCategories } from '@/api/category'
  import { uploadImage } from '@/api/upload'

  const MAX_COVER_SIZE = 5 * 1024 * 1024

  const emit = defineEmits<{ saved: [] }>()

  const visible = ref(false)
  const isEdit = ref(false)
  const loading = ref(false)
  const submitLoading = ref(false)
  const coverUploading = ref(false)
  const formRef = ref<FormInstance>()
  const categoryOptions = ref<{ id: number; name: string }[]>([])
  const readonlyViews = ref(0)
  const readonlyPublishTime = ref<string | null>(null)

  const form = reactive({
    id: undefined as number | undefined,
    title: '',
    slug: '',
    intro: '',
    cover: '',
    detail: '',
    categoryId: undefined as number | undefined,
    featured: false,
    status: 0 as 0 | 1,
    sort: undefined as number | undefined
  })

  const formRules: FormRules = {
    title: [{ required: true, message: '请输入作品标题', trigger: 'blur' }],
    slug: [
      { required: true, message: '请输入唯一标识', trigger: 'blur' },
      {
        validator: (_r, v: string, cb: (e?: Error) => void) => {
          if (v && !/^[a-zA-Z0-9-]+$/.test(v)) cb(new Error('唯一标识仅允许英文字母、数字和连字符'))
          else cb()
        },
        trigger: 'blur'
      }
    ],
    categoryId: [{ required: true, message: '请选择所属分类', trigger: 'change' }]
  }

  // 富文本编辑器
  const editorRef = shallowRef<IDomEditor>()
  const toolbarConfig = {
    excludeKeys: ['uploadVideo', 'insertVideo', 'group-video']
  }
  const editorConfig = { placeholder: '请输入作品详情（选填）' }

  function handleEditorCreated(editor: IDomEditor) {
    editorRef.value = editor
  }

  /** 加载分类下拉数据 */
  async function loadCategories() {
    try {
      const { data } = await fetchCategories()
      categoryOptions.value = (data || []).map((c) => ({ id: c.id, name: c.name }))
    } catch {
      ElMessage.error('加载分类列表失败')
    }
  }

  /** 封面选择：上传到服务器获取URL */
  async function handleCoverChange(file: UploadFile) {
    const raw = file.raw
    if (!raw) return

    try {
      coverUploading.value = true
      const url = await uploadImage(raw, MAX_COVER_SIZE)
      form.cover = url
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '上传失败'
      ElMessage.error(message)
    } finally {
      coverUploading.value = false
    }
  }

  /** 打开抽屉：新增或编辑 */
  function open(row?: Work) {
    loadCategories()
    if (row) {
      isEdit.value = true
      Object.assign(form, {
        id: row.id,
        title: row.title,
        slug: row.slug,
        intro: row.intro || '',
        cover: row.cover || '',
        detail: row.detail || '',
        categoryId: row.categoryId,
        featured: row.featured,
        status: row.status,
        sort: row.sort ?? undefined
      })
      readonlyViews.value = row.views
      readonlyPublishTime.value = row.publishTime
    } else {
      isEdit.value = false
      Object.assign(form, {
        id: undefined,
        title: '',
        slug: '',
        intro: '',
        cover: '',
        detail: '',
        categoryId: undefined,
        featured: false,
        status: 0,
        sort: undefined
      })
    }
    visible.value = true
  }

  /** 提交保存 */
  async function handleSubmit() {
    try {
      await formRef.value?.validate()
      submitLoading.value = true
      const payload = {
        title: form.title,
        slug: form.slug,
        intro: form.intro || null,
        cover: form.cover || null,
        detail: form.detail || null,
        categoryId: form.categoryId as number,
        featured: form.featured,
        status: form.status,
        sort: form.sort ?? null
      }
      if (isEdit.value && form.id) {
        await updateWork({ id: form.id, ...payload })
      } else {
        await addWork(payload)
      }
      ElMessage.success('保存成功')
      visible.value = false
      emit('saved')
    } catch (error: unknown) {
      if (error !== false && error instanceof Error) {
        ElMessage.error(error.message || '保存失败')
      }
    } finally {
      submitLoading.value = false
    }
  }

  /** 关闭后重置表单 */
  function handleClosed() {
    formRef.value?.resetFields()
    Object.assign(form, {
      id: undefined,
      title: '',
      slug: '',
      intro: '',
      cover: '',
      detail: '',
      categoryId: undefined,
      featured: false,
      status: 0,
      sort: undefined
    })
    isEdit.value = false
  }

  onBeforeUnmount(() => editorRef.value?.destroy())

  defineExpose({ open })
</script>

<style lang="scss" scoped>
  .cover-uploader {
    .cover-preview {
      width: 120px;
      height: 80px;
      object-fit: cover;
      border-radius: 6px;
      display: block;
    }

    :deep(.el-upload) {
      width: 120px;
      height: 80px;
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: border-color 0.2s;

      &:hover {
        border-color: var(--el-color-primary);
      }
    }

    .cover-uploader-icon {
      font-size: 24px;
      color: var(--el-text-color-placeholder);
    }
  }

  .upload-tip {
    margin-left: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .readonly-text {
    color: var(--el-text-color-regular);
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
      height: 240px;
      overflow-y: auto;
    }
  }
</style>
