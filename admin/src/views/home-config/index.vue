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
  // 首页配置：展示文案编辑 + 精选作品选取（单条固定记录，只编辑）
  import { ref, reactive, onMounted } from 'vue'
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
    featuredWorkIds: [] as number[]
  })

  const formRules: FormRules = {
    slogan: [
      { required: true, message: '展示标语不能为空', trigger: 'blur' },
      { min: 1, max: 50, message: '展示标语长度需为 1-50 字', trigger: 'blur' }
    ]
  }

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
    try {
      await formRef.value?.validate()
      submitLoading.value = true
      await updateHomeConfig({
        slogan: form.slogan,
        subtitle: form.subtitle || null,
        featuredWorkIds: form.featuredWorkIds
      })
      ElMessage.success('保存成功')
    } catch (error: unknown) {
      // 表单校验失败 reject false，跳过不弹错；其余异常均提示
      if (error !== false) {
        ElMessage.error(error instanceof Error ? error.message : '保存失败')
      }
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
  }
</style>
