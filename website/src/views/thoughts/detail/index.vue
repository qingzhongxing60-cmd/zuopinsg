<template>
  <div class="bg-cream min-h-screen">
    <div class="max-w-3xl mx-auto px-6 lg:px-8 pt-28 pb-24 lg:pt-32">
      <!-- 返回思考列表 -->
      <RouterLink
        to="/thoughts"
        class="inline-flex items-center gap-2 text-sm text-stone hover:text-rust transition-colors mb-10"
      >
        <span aria-hidden="true">←</span> 返回思考列表
      </RouterLink>

      <!-- 加载骨架 -->
      <div v-if="loading" class="animate-pulse">
        <div class="h-9 w-3/4 rounded bg-sand/40 mb-4"></div>
        <div class="h-4 w-40 rounded bg-sand/40 mb-8"></div>
        <div class="h-4 w-full rounded bg-sand/40 mb-2"></div>
        <div class="h-4 w-full rounded bg-sand/40 mb-2"></div>
        <div class="h-4 w-2/3 rounded bg-sand/40"></div>
      </div>

      <!-- 未找到态 / 加载失败态 -->
      <div v-else-if="!detail" class="py-16 text-center">
        <p class="font-serif text-2xl font-bold text-ink mb-3">
          {{ loadFailed ? '内容加载失败' : '文章不存在或已下架' }}
        </p>
        <p class="text-sm text-stone mb-8">
          {{ loadFailed ? '请稍后重试，或返回思考列表。' : '该文章可能已被移除，去看看其他思考吧。' }}
        </p>
        <div class="flex items-center justify-center gap-3">
          <button
            v-if="loadFailed"
            type="button"
            class="px-5 py-2 rounded-md bg-rust text-white text-sm font-medium hover:bg-rust/90 transition-colors"
            @click="loadDetail"
          >
            重新加载
          </button>
          <RouterLink
            to="/thoughts"
            class="px-5 py-2 rounded-md border border-sand text-stone text-sm font-medium hover:border-rust/40 hover:text-rust transition-colors"
          >
            返回思考列表
          </RouterLink>
        </div>
      </div>

      <!-- 详情内容 -->
      <article v-else>
        <!-- 头部：标题 + 元信息 -->
        <header class="mb-10">
          <h1 class="font-serif text-3xl lg:text-4xl font-bold text-ink leading-[1.2] mb-4">
            {{ detail.title }}
          </h1>
          <!-- 元信息：日期 / 所属作品（可跳转作品详情） -->
          <dl class="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
            <div class="flex items-center gap-2">
              <dt class="text-mute">日期</dt>
              <dd class="text-ink">{{ detail.date }}</dd>
            </div>
            <div v-if="detail.workTitle" class="flex items-center gap-2">
              <dt class="text-mute">所属作品</dt>
              <dd>
                <RouterLink
                  v-if="detail.workSlug"
                  :to="`/works/${detail.workSlug}`"
                  class="text-rust hover:text-rust/80 transition-colors"
                >
                  {{ detail.workTitle }}
                </RouterLink>
                <span v-else class="text-ink">{{ detail.workTitle }}</span>
              </dd>
            </div>
          </dl>
        </header>

        <!-- 正文分节：key 用索引，避免富文本出现同名标题时重复 key -->
        <section v-for="(section, si) in detail.sections" :key="si" class="mb-9">
          <div class="flex items-center gap-3 mb-4">
            <h2 class="font-serif text-xl font-bold text-ink">{{ section.heading }}</h2>
            <span class="w-8 h-px bg-rust"></span>
          </div>
          <p
            v-for="(para, i) in section.paragraphs"
            :key="i"
            class="text-sm text-stone leading-relaxed mb-3 last:mb-0"
          >
            {{ para }}
          </p>
        </section>

        <!-- 无正文兜底 -->
        <p v-if="!detail.sections.length" class="text-sm text-mute">该文章暂无正文内容。</p>

        <!-- 上一篇 / 下一篇导航 -->
        <nav
          v-if="detail.prev || detail.next"
          class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-14 pt-8 border-t border-sand/60"
          aria-label="思考翻页"
        >
          <RouterLink
            v-if="detail.prev"
            :to="`/thoughts/${detail.prev.id}`"
            class="group rounded-lg bg-paper border border-sand/50 p-5 hover:border-rust/30 transition-colors"
          >
            <p class="text-xs text-mute mb-2">← 上一篇</p>
            <p class="font-serif text-sm font-bold text-ink group-hover:text-rust transition-colors">
              {{ detail.prev.title }}
            </p>
          </RouterLink>
          <RouterLink
            v-if="detail.next"
            :to="`/thoughts/${detail.next.id}`"
            class="group rounded-lg bg-paper border border-sand/50 p-5 hover:border-rust/30 transition-colors sm:text-right sm:col-start-2"
          >
            <p class="text-xs text-mute mb-2">下一篇 →</p>
            <p class="font-serif text-sm font-bold text-ink group-hover:text-rust transition-colors">
              {{ detail.next.title }}
            </p>
          </RouterLink>
        </nav>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 思考详情页
 * 按路由参数 id 加载单篇思考详情，展示头部/正文分节/上下篇导航
 * 草稿或不存在的 id 显示未找到态，接口异常显示加载失败态
 */
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getThoughtDetail } from '@/api/site'
import type { ThoughtDetail } from '@/api/site'

const route = useRoute()

const loading = ref(true)
const loadFailed = ref(false)
const detail = ref<ThoughtDetail | null>(null)

// 加载当前 id 对应的思考详情
async function loadDetail() {
  const id = Number(route.params.id)
  loading.value = true
  loadFailed.value = false
  detail.value = null
  // id 非法（非正整数）：直接展示未找到态，不发起无意义请求
  if (!Number.isInteger(id) || id <= 0) {
    loading.value = false
    return
  }
  try {
    detail.value = await getThoughtDetail(id)
  } catch {
    // 接口异常：标记失败，由模板展示加载失败态
    loadFailed.value = true
    detail.value = null
  } finally {
    loading.value = false
  }
}

// id 变化（点击上下篇切换同一路由）时重新加载，并立即触发首次加载
watch(() => route.params.id, loadDetail, { immediate: true })
</script>
