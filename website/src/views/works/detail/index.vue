<template>
  <div class="bg-cream min-h-screen">
    <div class="max-w-3xl mx-auto px-6 lg:px-8 pt-28 pb-24 lg:pt-32">
      <!-- 返回作品列表 -->
      <RouterLink
        to="/works"
        class="inline-flex items-center gap-2 text-sm text-stone hover:text-rust transition-colors mb-10"
      >
        <span aria-hidden="true">←</span> 返回作品列表
      </RouterLink>

      <!-- 加载骨架 -->
      <div v-if="loading" class="animate-pulse">
        <div class="h-4 w-20 rounded bg-sand/40 mb-5"></div>
        <div class="h-9 w-3/4 rounded bg-sand/40 mb-4"></div>
        <div class="h-4 w-full rounded bg-sand/40 mb-2"></div>
        <div class="h-4 w-2/3 rounded bg-sand/40 mb-8"></div>
        <div class="aspect-[16/9] rounded-lg bg-sand/40"></div>
      </div>

      <!-- 未找到态 / 加载失败态 -->
      <div v-else-if="!detail" class="py-16 text-center">
        <p class="font-serif text-2xl font-bold text-ink mb-3">
          {{ loadFailed ? '内容加载失败' : '作品不存在或已下架' }}
        </p>
        <p class="text-sm text-stone mb-8">
          {{ loadFailed ? '请稍后重试，或返回作品列表。' : '该作品可能已被移除，去看看其他作品吧。' }}
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
            to="/works"
            class="px-5 py-2 rounded-md border border-sand text-stone text-sm font-medium hover:border-rust/40 hover:text-rust transition-colors"
          >
            返回作品列表
          </RouterLink>
        </div>
      </div>

      <!-- 详情内容 -->
      <article v-else>
        <!-- 头部：分类 + 标题 + 简介 + 元信息 -->
        <header class="mb-8">
          <span class="inline-block px-2.5 py-1 rounded bg-rust-tint text-rust text-xs font-medium mb-4">
            {{ detail.category }}
          </span>
          <h1 class="font-serif text-3xl lg:text-4xl font-bold text-ink leading-[1.2] mb-4">
            {{ detail.title }}
          </h1>
          <p v-if="detail.intro" class="text-base text-stone leading-relaxed mb-6">
            {{ detail.intro }}
          </p>
          <!-- 元信息：日期 / 角色 / 周期 -->
          <dl class="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
            <div class="flex items-center gap-2">
              <dt class="text-mute">日期</dt>
              <dd class="text-ink">{{ detail.date }}</dd>
            </div>
            <div v-if="detail.role" class="flex items-center gap-2">
              <dt class="text-mute">担任角色</dt>
              <dd class="text-ink">{{ detail.role }}</dd>
            </div>
            <div v-if="detail.duration" class="flex items-center gap-2">
              <dt class="text-mute">项目周期</dt>
              <dd class="text-ink">{{ detail.duration }}</dd>
            </div>
          </dl>
          <!-- 技术/能力标签 -->
          <ul v-if="detail.tags.length" class="flex flex-wrap gap-2 mt-5">
            <li
              v-for="tag in detail.tags"
              :key="tag"
              class="px-2.5 py-1 rounded-full bg-paper border border-sand text-xs text-stone"
            >
              {{ tag }}
            </li>
          </ul>
        </header>

        <!-- 封面：有则图片，无则渐变占位 -->
        <div class="aspect-[16/9] rounded-lg overflow-hidden bg-sand/40 mb-10">
          <img
            v-if="detail.cover"
            :src="detail.cover"
            :alt="detail.title"
            width="1280"
            height="720"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center bg-gradient-to-br from-sand/60 to-rust-tint"
          >
            <span class="font-serif text-rust-soft text-base tracking-widest">作品拾光</span>
          </div>
        </div>

        <!-- 项目概述 -->
        <p v-if="detail.overview" class="font-serif text-lg text-ink leading-relaxed mb-10">
          {{ detail.overview }}
        </p>

        <!-- 正文分节 -->
        <section v-for="section in detail.sections" :key="section.heading" class="mb-9">
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

        <!-- 上一篇 / 下一篇导航 -->
        <nav
          v-if="detail.prev || detail.next"
          class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-14 pt-8 border-t border-sand/60"
          aria-label="作品翻页"
        >
          <RouterLink
            v-if="detail.prev"
            :to="`/works/${detail.prev.slug}`"
            class="group rounded-lg bg-paper border border-sand/50 p-5 hover:border-rust/30 transition-colors"
          >
            <p class="text-xs text-mute mb-2">← 上一篇</p>
            <p class="font-serif text-sm font-bold text-ink group-hover:text-rust transition-colors">
              {{ detail.prev.title }}
            </p>
          </RouterLink>
          <RouterLink
            v-if="detail.next"
            :to="`/works/${detail.next.slug}`"
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
 * 作品详情页
 * 按路由参数 slug 加载单作品详情，展示头部/正文/上下篇导航
 * 草稿或不存在的 slug 显示未找到态，接口异常显示加载失败态
 */
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getWorkDetail } from '@/api/site'
import type { WorkDetail } from '@/api/site'

const route = useRoute()

const loading = ref(true)
const loadFailed = ref(false)
const detail = ref<WorkDetail | null>(null)

// 加载当前 slug 对应的作品详情
async function loadDetail() {
  const slug = String(route.params.slug || '')
  loading.value = true
  loadFailed.value = false
  detail.value = null
  // slug 为空：直接展示未找到态，不发起无意义请求
  if (!slug) {
    loading.value = false
    return
  }
  try {
    detail.value = await getWorkDetail(slug)
  } catch {
    // 接口异常：标记失败，由模板展示加载失败态
    loadFailed.value = true
    detail.value = null
  } finally {
    loading.value = false
  }
}

// slug 变化（点击上下篇切换同一路由）时重新加载，并立即触发首次加载
watch(() => route.params.slug, loadDetail, { immediate: true })
</script>


