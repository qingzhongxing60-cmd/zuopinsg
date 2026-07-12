<template>
  <ElCard shadow="never" class="profile-card">
    <template #header>
      <span class="card-title">个人介绍</span>
    </template>

    <ElForm ref="formRef" :model="form" :rules="formRules" label-width="80px" v-loading="loading">
      <ElFormItem label="简介" prop="intro">
        <ElInput
          v-model="form.intro"
          type="textarea"
          :rows="3"
          placeholder="对个人身份与定位的简短描述"
          maxlength="200"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="头像">
        <ElUpload
          class="avatar-uploader"
          :show-file-list="false"
          :auto-upload="false"
          accept="image/*"
          :on-change="handleAvatarChange"
          v-loading="avatarUploading"
        >
          <img v-if="form.avatar" :src="form.avatar" class="avatar-preview" alt="头像" />
          <ElIcon v-else class="avatar-uploader-icon"><Plus /></ElIcon>
        </ElUpload>
        <span class="upload-tip">支持常见图片格式，单张不超过 5MB</span>
      </ElFormItem>

      <ElFormItem label="简历">
        <div class="editor-wrapper">
          <Toolbar :editor="editorRef" :default-config="toolbarConfig" mode="default" />
          <Editor
            v-model="form.resume"
            :default-config="editorConfig"
            mode="default"
            class="editor-content"
            @on-created="handleEditorCreated"
          />
        </div>
      </ElFormItem>

      <ElFormItem>
        <ElButton type="primary" :loading="submitLoading" @click="handleSave">保存</ElButton>
      </ElFormItem>
    </ElForm>
  </ElCard>
</template>

<script setup lang="ts">
  // 个人介绍编辑：简介（必填）+ 头像上传 + 简历富文本
  import { ref, reactive, shallowRef, onMounted, onBeforeUnmount } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules, UploadFile } from 'element-plus'
  import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
  import '@wangeditor/editor/dist/css/style.css'
  import type { IDomEditor, IEditorConfig } from '@wangeditor/editor'
  import { getAboutProfile, updateAboutProfile } from '@/api/about'
  import { uploadImage } from '@/api/upload'

  defineOptions({ name: 'ProfileForm' })

  // 头像大小上限 5MB
  const MAX_AVATAR_SIZE = 5 * 1024 * 1024
  // 简历编辑器内图片大小上限 5MB
  const MAX_EDITOR_IMAGE_SIZE = 5 * 1024 * 1024

  const loading = ref(false)
  const submitLoading = ref(false)
  const avatarUploading = ref(false)
  const formRef = ref<FormInstance>()
  const form = reactive({
    intro: '',
    avatar: '',
    resume: ''
  })

  const formRules: FormRules = {
    intro: [{ required: true, message: '个人简介不能为空', trigger: 'blur' }]
  }

  // 富文本编辑器实例（用 shallowRef，避免深层响应式包裹）
  const editorRef = shallowRef<IDomEditor>()
  // 保留图片能力，仅排除视频相关菜单
  const toolbarConfig = {
    excludeKeys: ['uploadVideo', 'insertVideo', 'group-video']
  }
  // 图片上传：复用统一上传接口，落盘后回填服务器 URL
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: '请输入简历内容（选填）',
    MENU_CONF: {
      uploadImage: {
        // 单张图片上限 5MB
        maxFileSize: MAX_EDITOR_IMAGE_SIZE,
        // 仅允许图片类型
        allowedFileTypes: ['image/*'],
        /**
         * 自定义上传：上传成功后调用 insertFn 插入图片
         * @param file 待上传的图片文件
         * @param insertFn wangeditor 提供的插入函数
         */
        async customUpload(file: File, insertFn: (url: string, alt: string, href: string) => void) {
          try {
            const url = await uploadImage(file, MAX_EDITOR_IMAGE_SIZE)
            insertFn(url, file.name, url)
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : '图片上传失败'
            ElMessage.error(message)
          }
        }
      }
    }
  }

  function handleEditorCreated(editor: IDomEditor) {
    editorRef.value = editor
  }

  /** 头像选择：上传到服务器获取URL */
  async function handleAvatarChange(file: UploadFile) {
    const raw = file.raw
    if (!raw) return

    try {
      avatarUploading.value = true
      const url = await uploadImage(raw, MAX_AVATAR_SIZE)
      form.avatar = url
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '上传失败'
      ElMessage.error(message)
    } finally {
      avatarUploading.value = false
    }
  }

  /** 加载个人介绍数据 */
  async function loadProfile() {
    loading.value = true
    try {
      const { data } = await getAboutProfile()
      form.intro = data?.intro || ''
      form.avatar = data?.avatar || ''
      form.resume = data?.resume || ''
    } catch {
      ElMessage.error('加载个人介绍失败')
    } finally {
      loading.value = false
    }
  }

  /** 保存个人介绍（覆盖写入） */
  async function handleSave() {
    try {
      await formRef.value?.validate()
      submitLoading.value = true
      await updateAboutProfile({
        intro: form.intro,
        avatar: form.avatar || null,
        resume: form.resume || null
      })
      ElMessage.success('保存成功')
    } catch (error: unknown) {
      if (error !== false && error instanceof Error) {
        ElMessage.error(error.message || '保存失败')
      }
    } finally {
      submitLoading.value = false
    }
  }

  onMounted(() => loadProfile())

  // 组件销毁前销毁编辑器实例，避免内存泄漏
  onBeforeUnmount(() => {
    editorRef.value?.destroy()
  })
</script>

<style lang="scss" scoped>
  .profile-card {
    flex-shrink: 0;
    border: none !important;
    box-shadow: none !important;
    border-radius: 12px;

    .card-title {
      font-weight: 600;
    }

    .avatar-uploader {
      .avatar-preview {
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 8px;
        display: block;
      }

      :deep(.el-upload) {
        width: 100px;
        height: 100px;
        border: 1px dashed var(--el-border-color);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: border-color 0.2s;

        &:hover {
          border-color: var(--el-color-primary);
        }
      }

      .avatar-uploader-icon {
        font-size: 28px;
        color: var(--el-text-color-placeholder);
      }
    }

    .upload-tip {
      margin-left: 12px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
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
        height: 280px;
        overflow-y: auto;
      }
    }
  }
</style>
