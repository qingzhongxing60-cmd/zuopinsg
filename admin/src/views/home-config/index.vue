<template>
  <div class="home-config">
    <ElCard shadow="never" class="config-card" v-loading="loading">
      <!-- 展示文案 -->
      <div class="section-title">展示文案</div>
      <ElForm ref="formRef" :model="form" :rules="formRules" label-width="90px" class="config-form">
        <ElFormItem label="展示标语" prop="slogan">
          <ElInput
            v-model="form.slogan"
            placeholder="展示端首页主标题文案"
            maxlength="50"
            show-word-limit
          />
        </ElFormItem>
        <ElFormItem label="副标题" prop="subtitle">
          <ElInput
            v-model="form.subtitle"
            placeholder="展示端首页副标题文案（选填，不填则不展示）"
            maxlength="100"
            show-word-limit
          />
        </ElFormItem>

        <!-- 标题高亮 -->
        <ElFormItem label="高亮文字" prop="highlightText">
          <div class="highlight-block">
            <ElInput
              v-model="form.highlightText"
              placeholder="填写标语中需要高亮的片段，如「成长」（选填，须为标语的一部分）"
              maxlength="50"
            />
            <div class="highlight-tip">留空则整条标语使用默认颜色，不做高亮</div>
          </div>
        </ElFormItem>
        <ElFormItem label="高亮颜色">
          <div class="color-block">
            <ElColorPicker v-model="form.highlightColor" :disabled="!form.highlightText" />
            <span class="color-tip">
              {{ form.highlightText ? '选择高亮片段的强调色' : '填写高亮文字后可设置颜色' }}
            </span>
          </div>
        </ElFormItem>

        <!-- 效果预览 -->
        <ElFormItem label="效果预览">
          <div class="preview-box">
            <span
              v-for="(seg, idx) in previewSegments"
              :key="idx"
              :style="seg.highlight ? { color: form.highlightColor || 'var(--el-color-primary)' } : {}"
              >{{ seg.text }}</span
            >
          </div>
        </ElFormItem>

        <!-- 精选作品 -->
        <div class="section-title section-title--gap">精选作品</div>
        <ElFormItem label="精选作品">
          <div class="featured-block">
            <ElSelect
              v-model="form.featuredWorkIds"
              multiple
              filterable
              placeholder="从候选作品中选取"
              style="width: 100%"
              no-data-text="暂无可选作品"
            >
              <ElOption
                v-for="opt in workOptions"
                :key="opt.id"
                :label="`${opt.title}（${opt.categoryName}）`"
                :value="opt.id"
              />
            </ElSelect>
            <div class="featured-tip">
              候选范围：作品管理中「已发布」且「精选标记为是」的作品；选取数量不限
            </div>
          </div>
        </ElFormItem>

        <ElFormItem>
          <ElButton type="primary" :loading="submitLoading" @click="handleSave">保存</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  // 首页配置：展示文案编辑 + 标题高亮 + 精选作品选取（单条固定记录，只编辑）
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import {
    getHomeConfig,
    updateHomeConfig,
    getFeaturedWorkOptions,
    type FeaturedWorkOption
  } from '@/api/home-config'

  defineOptions({ name: 'HomeConfig' })

  const loading = ref(false)
  const submitLoading = ref(false)
  const formRef = ref<FormInstance>()
  const workOptions = ref<FeaturedWorkOption[]>([])

  const form = reactive({
    slogan: '',
    subtitle: '',
    highlightText: '',
    highlightColor: '#C0451F',
    featuredWorkIds: [] as number[]
  })

  const formRules: FormRules = {
    slogan: [
      { required: true, message: '展示标语不能为空', trigger: 'blur' },
      { min: 1, max: 50, message: '展示标语长度需为 1-50 字', trigger: 'blur' }
    ],
    highlightText: [
      {
        validator: (_rule, value: string, callback) => {
          const text = (value || '').trim()
          if (text && !form.slogan.includes(text)) {
            callback(new Error('高亮文字必须是展示标语中的一段文字'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  }

  /** 预览分段：把标语按高亮片段拆分为「普通/高亮」段 */
  const previewSegments = computed<{ text: string; highlight: boolean }[]>(() => {
    const slogan = form.slogan
    const highlight = form.highlightText.trim()
    if (!slogan) return []
    if (!highlight || !slogan.includes(highlight)) {
      return [{ text: slogan, highlight: false }]
    }
    // 仅高亮首次出现的片段，保持与展示端一致的单点强调
    const start = slogan.indexOf(highlight)
    const segments: { text: string; highlight: boolean }[] = []
    if (start > 0) segments.push({ text: slogan.slice(0, start), highlight: false })
    segments.push({ text: highlight, highlight: true })
    const rest = slogan.slice(start + highlight.length)
    if (rest) segments.push({ text: rest, highlight: false })
    return segments
  })

  /** 加载精选作品候选池 */
  async function loadOptions() {
    try {
      const { data } = await getFeaturedWorkOptions()
      workOptions.value = data || []
    } catch {
      ElMessage.error('加载候选作品失败')
    }
  }

  /** 加载首页配置 */
  async function loadConfig() {
    loading.value = true
    try {
      const { data } = await getHomeConfig()
      form.slogan = data?.slogan || ''
      form.subtitle = data?.subtitle || ''
      form.highlightText = data?.highlightText || ''
      // 颜色缺省回退到默认强调色，保证颜色选择器始终有值
      form.highlightColor = data?.highlightColor || '#C0451F'
      // 仅保留仍在候选池中的已选作品（草稿隔离：已下架/取消精选的不回填）
      const validIds = new Set(workOptions.value.map((o) => o.id))
      form.featuredWorkIds = (data?.featuredWorkIds || []).filter((id) => validIds.has(id))
    } catch {
      ElMessage.error('加载首页配置失败')
    } finally {
      loading.value = false
    }
  }

  /** 保存首页配置 */
  async function handleSave() {
    // 表单校验失败时行内错误已提示，直接返回，不再弹「保存失败」
    // 注：Element Plus 校验失败 reject 的是非法字段对象而非 false，故用 catch 归一化为 false
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    submitLoading.value = true
    try {
      const highlightText = form.highlightText.trim() || null
      await updateHomeConfig({
        slogan: form.slogan,
        subtitle: form.subtitle || null,
        highlightText,
        // 无高亮文字时颜色一并置空，避免后端保留孤立颜色配置
        highlightColor: highlightText ? form.highlightColor || null : null,
        featuredWorkIds: form.featuredWorkIds
      })
      ElMessage.success('保存成功')
    } catch (error: unknown) {
      // 走到这里才是真正的保存请求异常
      ElMessage.error(error instanceof Error ? error.message : '保存失败')
    } finally {
      submitLoading.value = false
    }
  }

  onMounted(async () => {
    // 先加载候选池，再加载配置（回填时需依候选池过滤无效已选项）
    await loadOptions()
    await loadConfig()
  })
</script>

<style lang="scss" scoped>
  .home-config {
    height: 100%;
    overflow-y: auto;

    .config-card {
      border: none !important;
      box-shadow: none !important;
      border-radius: 12px;
      max-width: 720px;
    }

    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 16px;
      padding-left: 8px;
      border-left: 3px solid var(--el-color-primary);

      &--gap {
        margin-top: 8px;
      }
    }

    .featured-block {
      width: 100%;

      .featured-tip {
        margin-top: 6px;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .highlight-block {
      width: 100%;

      .highlight-tip {
        margin-top: 6px;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .color-block {
      display: flex;
      align-items: center;
      gap: 10px;

      .color-tip {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .preview-box {
      width: 100%;
      padding: 16px 20px;
      background: var(--el-fill-color-light);
      border-radius: 8px;
      font-size: 28px;
      font-weight: 700;
      line-height: 1.4;
      /* 预览标题字符较大，允许溢出换行避免撑破容器 */
      word-break: break-word;
    }
  }
</style>
