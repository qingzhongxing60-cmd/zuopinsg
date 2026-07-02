<template>
  <div class="bg-cream min-h-screen">
    <!-- ============ Hero 标题区 ============ -->
    <section class="pt-28 pb-10 lg:pt-32 lg:pb-12">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <p class="flex items-center gap-3 text-rust text-xs font-medium tracking-[0.2em] mb-6">
          <span class="w-8 h-px bg-rust"></span>
          WORKS · 作品拾光
        </p>
        <h1 class="font-serif text-4xl lg:text-5xl font-bold text-ink leading-[1.15] mb-5">
          全部<em class="not-italic text-rust">作品</em>
        </h1>
        <p class="text-sm text-stone max-w-xl leading-relaxed">
          完整收录 AI 产品设计案例，记录从 0 到 1 的思考与实践。
        </p>
      </div>
    </section>

    <!-- ============ 分类筛选 ============ -->
    <section v-if="!loading && works.length" class="pb-2">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex flex-wrap items-center gap-2.5">
          <button
            v-for="cat in categories"
            :key="cat"
            type="button"
            class="px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
            :class="
              activeCategory === cat
                ? 'bg-rust text-white'
                : 'bg-paper border border-sand text-stone hover:border-rust/40 hover:text-rust'
            "
            @click="activeCategory = cat"
          >
            {{ cat }}
          </button>
        </div>
        <!-- 数量提示 -->
        <p class="text-xs text-mute mt-5">
          共 {{ filteredWorks.length }} 件作品
        </p>
      </div>
    </section>

    <!-- ============ 作品网格 ============ -->
    <section class="pt-6 pb-24">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <!-- 加载骨架 -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="n in 6"
            :key="n"
            class="rounded-lg bg-paper border border-sand/50 overflow-hidden"
          >
            <div class="aspect-[4/3] bg-sand/40 animate-pulse"></div>
            <div class="p-5 space-y-3">
              <div class="h-4 w-16 rounded bg-sand/40 animate-pulse"></div>
              <div class="h-5 w-3/4 rounded bg-sand/40 animate-pulse"></div>
              <div class="h-3 w-full rounded bg-sand/40 animate-pulse"></div>
            </div>
          </div>
        </div>

        <!-- 作品卡片网格 -->
        <div
          v-else-if="filteredWorks.length"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <RouterLink
            v-for="work in filteredWorks"
            :key="work.id"
            :to="`/works/${work.slug}`"
            class="group rounded-lg bg-paper border border-sand/50 overflow-hidden hover:border-rust/30 transition-colors no-underline"
          >
            <!-- 封面：无封面用渐变占位 -->
            <div class="aspect-[4/3] overflow-hidden bg-sand/40">
              <img
                v-if="work.cover"
                :src="work.cover"
                :alt="work.title"
                loading="lazy"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center bg-gradient-to-br from-sand/60 to-rust-tint"
              >
                <span class="font-serif text-rust-soft text-sm tracking-widest">作品拾光</span>
              </div>
            </div>
            <div class="p-5">
              <span class="inline-block px-2.5 py-1 rounded bg-rust-tint text-rust text-xs font-medium mb-3">
                {{ work.category }}
              </span>
              <h3 class="font-serif text-base font-bold text-ink group-hover:text-rust transition-colors">
                {{ work.title }}
              </h3>
              <p v-if="work.intro" class="text-xs text-stone leading-relaxed mt-2 line-clamp-2">
                {{ work.intro }}
              </p>
              <div class="flex items-center justify-between mt-4 pt-3 border-t border-sand/50">
                <span class="text-xs text-mute">{{ work.date }}</span>
                <span class="text-rust text-sm" aria-hidden="true">→</span>
              </div>
            </div>
          </RouterLink>
        </div>

        <!-- 空状态 -->
        <div v-else class="py-16 text-center">
          <p class="text-mute text-sm">{{ emptyText }}</p>
          <button
            v-if="activeCategory !== ALL_CATEGORY && works.length"
            type="button"
            class="inline-block text-sm text-rust hover:text-rust/80 transition-colors mt-3"
            @click="activeCategory = ALL_CATEGORY"
          >
            查看全部作品 →
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 作品列表页
 * 展示全部已发布作品，支持按分类筛选，卡片跳转作品详情
 */
import { ref, computed, onMounted } from 'vue'
import { getWorks, getCategories } from '@/api/site'
import type { WorkItem } from '@/api/site'

// "全部"分类标识（非真实分类，用于重置筛选）
const ALL_CATEGORY = '全部'

const loading = ref(true)
const loadFailed = ref(false)
const works = ref<WorkItem[]>([])
const categoryNames = ref<string[]>([])
const activeCategory = ref<string>(ALL_CATEGORY)

// 分类选项：从接口获取所有分类，前置"全部"
const categories = computed<string[]>(() => {
  return [ALL_CATEGORY, ...categoryNames.value]
})

// 当前分类下的作品
const filteredWorks = computed<WorkItem[]>(() => {
  if (activeCategory.value === ALL_CATEGORY) return works.value
  return works.value.filter((w) => w.category === activeCategory.value)
})

// 空状态文案：区分加载失败 / 分类无结果 / 全部无作品
const emptyText = computed(() => {
  if (loadFailed.value) return '内容加载失败，请稍后重试'
  if (!works.value.length) return '暂无作品'
  return '该分类暂无作品'
})

// 加载全部已发布作品
async function loadWorks() {
  loading.value = true
  loadFailed.value = false
  try {
    const [worksData, categoriesData] = await Promise.all([getWorks(), getCategories()])
    works.value = worksData
    categoryNames.value = categoriesData.map((c) => c.name)
  } catch {
    // 失败时置空并标记，由模板展示独立的失败提示，不阻断
    works.value = []
    categoryNames.value = []
    loadFailed.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadWorks)
</script>


