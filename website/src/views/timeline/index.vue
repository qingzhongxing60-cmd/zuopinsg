<template>
  <div class="bg-cream min-h-screen">
    <!-- ============ Hero 标题区 ============ -->
    <section class="pt-28 pb-10 lg:pt-32 lg:pb-12">
      <div class="max-w-3xl mx-auto px-6 lg:px-8">
        <p class="flex items-center gap-3 text-rust text-xs font-medium tracking-[0.2em] mb-6">
          <span class="w-8 h-px bg-rust"></span>
          TIMELINE · 成长历程
        </p>
        <h1 class="font-serif text-4xl lg:text-5xl font-bold text-ink leading-[1.15] mb-5">
          一路<em class="not-italic text-rust">成长</em>
        </h1>
        <p class="text-sm text-stone max-w-xl leading-relaxed">
          记录每一步成长，见证从初心到专业的蜕变。
        </p>
        <p v-if="!loading && nodes.length" class="text-xs text-mute mt-5">
          共 {{ nodes.length }} 段历程
        </p>
      </div>
    </section>

    <!-- ============ 时间轴 ============ -->
    <section class="pb-24">
      <div class="max-w-3xl mx-auto px-6 lg:px-8">
        <!-- 加载骨架 -->
        <ol v-if="loading" class="relative border-l border-sand pl-6 space-y-8 animate-pulse">
          <li v-for="n in 4" :key="n" class="relative">
            <span class="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-sand ring-4 ring-cream"></span>
            <div class="h-3 w-24 rounded bg-sand/40 mb-3"></div>
            <div class="h-5 w-1/2 rounded bg-sand/40 mb-3"></div>
            <div class="h-3 w-full rounded bg-sand/40 mb-2"></div>
            <div class="h-3 w-2/3 rounded bg-sand/40"></div>
          </li>
        </ol>

        <!-- 时间轴节点 -->
        <ol v-else-if="nodes.length" class="relative border-l border-sand pl-6 space-y-10">
          <li v-for="(node, i) in nodes" :key="`${node.period}-${i}`" class="relative">
            <span class="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-rust ring-4 ring-cream"></span>
            <p class="text-xs text-rust font-medium tracking-wide mb-1.5">{{ node.period }}</p>
            <h2 class="font-serif text-lg font-bold text-ink mb-2">{{ node.title }}</h2>
            <p class="text-sm text-stone leading-relaxed">{{ node.desc }}</p>
            <!-- 节点标签（可选） -->
            <ul v-if="node.tags && node.tags.length" class="flex flex-wrap gap-2 mt-3">
              <li
                v-for="tag in node.tags"
                :key="tag"
                class="px-2.5 py-1 rounded-full bg-paper border border-sand text-xs text-stone"
              >
                {{ tag }}
              </li>
            </ul>
          </li>
        </ol>

        <!-- 空态 / 加载失败态 -->
        <div v-else class="py-16 text-center">
          <p class="text-mute text-sm">
            {{ loadFailed ? '内容加载失败，请稍后重试' : '暂无历程' }}
          </p>
          <button
            v-if="loadFailed"
            type="button"
            class="inline-block text-sm text-rust hover:text-rust/80 transition-colors mt-3"
            @click="loadTimeline"
          >
            重新加载
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 成长历程时间轴页
 * 竖向展示成长历程节点（时期/标题/描述/可选标签），按时期倒序
 */
import { ref, onMounted } from 'vue'
import { getTimeline } from '@/api/site'
import type { TimelineItem } from '@/api/site'

const loading = ref(true)
const loadFailed = ref(false)
const nodes = ref<TimelineItem[]>([])

// 加载成长历程节点
async function loadTimeline() {
  loading.value = true
  loadFailed.value = false
  try {
    nodes.value = await getTimeline()
  } catch {
    // 失败时置空并标记，由模板展示失败提示，不阻断
    nodes.value = []
    loadFailed.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadTimeline)
</script>

