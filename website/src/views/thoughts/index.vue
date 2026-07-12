<template>
  <div class="bg-cream min-h-screen">
    <!-- ============ Hero 标题区 ============ -->
    <section class="pt-28 pb-10 lg:pt-32 lg:pb-12">
      <div class="max-w-3xl mx-auto px-6 lg:px-8">
        <p class="flex items-center gap-3 text-rust text-xs font-medium tracking-[0.2em] mb-6">
          <span class="w-8 h-px bg-rust"></span>
          THOUGHTS · 最新思考
        </p>
        <h1 class="font-serif text-4xl lg:text-5xl font-bold text-ink leading-[1.15] mb-5">
          最新<em class="not-italic text-rust">思考</em>
        </h1>
        <p class="text-sm text-stone max-w-xl leading-relaxed">
          分享产品思考与行业洞察，记录成长与感悟。
        </p>
      </div>
    </section>

    <!-- ============ 思考文章列表 ============ -->
    <section class="pb-24">
      <div class="max-w-3xl mx-auto px-6 lg:px-8">
        <!-- 加载骨架 -->
        <ul v-if="loading" class="animate-pulse">
          <li v-for="n in 4" :key="n" class="py-6 border-b border-sand/50">
            <div class="h-5 w-2/3 rounded bg-sand/40 mb-3"></div>
            <div class="h-3 w-full rounded bg-sand/40 mb-2"></div>
            <div class="h-3 w-1/3 rounded bg-sand/40"></div>
          </li>
        </ul>

        <!-- 文章列表 -->
        <ul v-else-if="thoughts.length">
          <li v-for="item in thoughts" :key="item.id">
            <RouterLink
              :to="`/thoughts/${item.id}`"
              class="group block py-6 border-b border-sand/50 no-underline"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <h2 class="font-serif text-lg font-bold text-ink group-hover:text-rust transition-colors">
                    {{ item.title }}
                  </h2>
                  <p v-if="item.desc" class="text-sm text-stone leading-relaxed mt-2 line-clamp-2">
                    {{ item.desc }}
                  </p>
                  <!-- 所属作品来源 -->
                  <p v-if="item.workTitle" class="text-xs text-mute mt-3">
                    来自作品 · {{ item.workTitle }}
                  </p>
                </div>
                <span class="text-xs text-mute shrink-0 whitespace-nowrap mt-1">{{ item.date }}</span>
              </div>
            </RouterLink>
          </li>
        </ul>

        <!-- 空状态 / 加载失败态 -->
        <div v-else class="py-16 text-center">
          <p class="text-mute text-sm">{{ emptyText }}</p>
          <button
            v-if="loadFailed"
            type="button"
            class="inline-block text-sm text-rust hover:text-rust/80 transition-colors mt-3"
            @click="loadThoughts"
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
 * 思考列表页
 * 展示全部已发布思考文章，按时间倒序，列表项跳转思考详情
 */
import { ref, computed, onMounted } from 'vue'
import { getThoughts } from '@/api/site'
import type { ThoughtItem } from '@/api/site'

const loading = ref(true)
const loadFailed = ref(false)
const thoughts = ref<ThoughtItem[]>([])

// 空状态文案：区分加载失败与暂无内容
const emptyText = computed(() => {
  if (loadFailed.value) return '内容加载失败，请稍后重试'
  return '暂无思考文章'
})

// 加载全部已发布思考文章
async function loadThoughts() {
  loading.value = true
  loadFailed.value = false
  try {
    thoughts.value = await getThoughts()
  } catch {
    // 失败时置空并标记，由模板展示失败提示，不阻断
    thoughts.value = []
    loadFailed.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadThoughts)
</script>
