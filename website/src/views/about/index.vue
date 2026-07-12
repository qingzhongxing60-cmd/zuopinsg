<template>
  <div class="bg-cream min-h-screen">
    <div class="max-w-3xl mx-auto px-6 lg:px-8 pt-28 pb-24 lg:pt-32">
      <!-- 加载骨架 -->
      <div v-if="loading" class="animate-pulse">
        <div class="flex gap-5 mb-10">
          <div class="w-20 h-20 rounded-full bg-sand/40 shrink-0"></div>
          <div class="flex-1 space-y-3 pt-2">
            <div class="h-6 w-32 rounded bg-sand/40"></div>
            <div class="h-4 w-48 rounded bg-sand/40"></div>
            <div class="h-3 w-full rounded bg-sand/40"></div>
          </div>
        </div>
        <div class="h-4 w-full rounded bg-sand/40 mb-2"></div>
        <div class="h-4 w-2/3 rounded bg-sand/40"></div>
      </div>

      <!-- 加载失败态 -->
      <div v-else-if="!data" class="py-16 text-center">
        <p class="font-serif text-2xl font-bold text-ink mb-3">内容加载失败</p>
        <p class="text-sm text-stone mb-8">请稍后重试。</p>
        <button
          type="button"
          class="px-5 py-2 rounded-md bg-rust text-white text-sm font-medium hover:bg-rust/90 transition-colors"
          @click="loadAbout"
        >
          重新加载
        </button>
      </div>

      <!-- 关于我内容 -->
      <div v-else>
        <!-- Hero 个人名片 -->
        <header class="mb-12">
          <p class="flex items-center gap-3 text-rust text-xs font-medium tracking-[0.2em] mb-6">
            <span class="w-8 h-px bg-rust"></span>
            ABOUT · 关于我
          </p>
          <div class="flex flex-col sm:flex-row sm:items-center gap-6">
            <!-- 头像：无头像用姓名首字占位 -->
            <div class="w-20 h-20 rounded-full overflow-hidden bg-sand/60 shrink-0 flex items-center justify-center">
              <img
                v-if="data.avatar"
                :src="data.avatar"
                :alt="data.name"
                width="80"
                height="80"
                class="w-full h-full object-cover"
              />
              <span v-else class="font-serif text-2xl text-rust">{{ data.name.charAt(0) }}</span>
            </div>
            <div class="min-w-0">
              <h1 class="font-serif text-3xl font-bold text-ink">{{ data.name }}</h1>
              <p class="text-sm text-rust mt-1.5">{{ data.role }}</p>
              <p class="text-sm text-stone leading-relaxed mt-3">{{ data.intro }}</p>
            </div>
          </div>

          <!-- 关键数据 -->
          <dl v-if="data.stats.length" class="flex flex-wrap gap-10 mt-8">
            <div v-for="stat in data.stats" :key="stat.label">
              <dt class="font-serif text-3xl font-bold text-ink">{{ stat.value }}</dt>
              <dd class="text-xs text-mute mt-1">{{ stat.label }}</dd>
            </div>
          </dl>
        </header>

        <!-- 自我介绍：优先渲染净化后的简历富文本（含图片/格式），否则回退纯文本段落 -->
        <section v-if="data.resumeHtml || data.paragraphs.length" class="mb-12">
          <div class="flex items-center gap-3 mb-4">
            <h2 class="font-serif text-xl font-bold text-ink">自我介绍</h2>
            <span class="w-8 h-px bg-rust"></span>
          </div>
          <!-- resumeHtml 由后端 sanitize-html 白名单净化，可安全 v-html 渲染 -->
          <div v-if="data.resumeHtml" class="resume-prose" v-html="data.resumeHtml"></div>
          <template v-else>
            <p
              v-for="(para, i) in data.paragraphs"
              :key="i"
              class="text-sm text-stone leading-relaxed mb-3 last:mb-0"
            >
              {{ para }}
            </p>
          </template>
        </section>

        <!-- 专长领域 -->
        <section v-if="data.expertise.length" class="mb-12">
          <div class="flex items-center gap-3 mb-5">
            <h2 class="font-serif text-xl font-bold text-ink">专长领域</h2>
            <span class="w-8 h-px bg-rust"></span>
          </div>
          <ul class="divide-y divide-sand/60">
            <li v-for="item in data.expertise" :key="item.name" class="py-3 first:pt-0 last:pb-0">
              <p class="text-sm font-semibold text-ink">{{ item.name }}</p>
              <p class="text-xs text-stone leading-relaxed mt-1">{{ item.desc }}</p>
            </li>
          </ul>
        </section>

        <!-- 联系方式 -->
        <section v-if="data.contacts.length">
          <div class="flex items-center gap-3 mb-5">
            <h2 class="font-serif text-xl font-bold text-ink">联系方式</h2>
            <span class="w-8 h-px bg-rust"></span>
          </div>
          <ul class="flex flex-wrap gap-3">
            <li v-for="contact in data.contacts" :key="contact.label">
              <a
                :href="contactHref(contact)"
                :target="contact.type === 'link' ? '_blank' : undefined"
                :rel="contact.type === 'link' ? 'noopener noreferrer' : undefined"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-paper border border-sand text-sm text-stone hover:border-rust/40 hover:text-rust transition-colors"
              >
                <span class="text-mute">{{ contact.label }}</span>
                <span>{{ contact.display || contact.value }}</span>
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 关于我页
 * 展示个人名片、关键数据、自我介绍、专长领域与联系方式
 */
import { ref, onMounted } from 'vue'
import { getAbout } from '@/api/site'
import type { AboutData, AboutContact } from '@/api/site'

const loading = ref(true)
const data = ref<AboutData | null>(null)

/**
 * 计算联系方式的 href
 * email → mailto；link → 仅放行 http(s) 外链，其余协议返回 # 以防注入
 */
function contactHref(contact: AboutContact): string {
  if (contact.type === 'email') {
    return `mailto:${contact.value}`
  }
  return /^https?:\/\//i.test(contact.value) ? contact.value : '#'
}

// 加载关于我数据
async function loadAbout() {
  loading.value = true
  try {
    data.value = await getAbout()
  } catch {
    // 失败时置空，由模板展示失败态与重试入口，不阻断
    data.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadAbout)
</script>

<style scoped>
/* 简历富文本排版：v-html 内容不受 scoped 约束，用 :deep 穿透 */
.resume-prose {
  font-size: 0.875rem;
  line-height: 1.75;
  color: var(--color-stone, #57534e);
}

.resume-prose :deep(p) {
  margin-bottom: 0.75rem;
}

.resume-prose :deep(p:last-child) {
  margin-bottom: 0;
}

/* 图片自适应容器，避免溢出 */
.resume-prose :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 0.75rem 0;
}

.resume-prose :deep(h1),
.resume-prose :deep(h2),
.resume-prose :deep(h3),
.resume-prose :deep(h4) {
  font-weight: 700;
  color: var(--color-ink, #1c1917);
  margin: 1.25rem 0 0.5rem;
  line-height: 1.4;
}

.resume-prose :deep(ul),
.resume-prose :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}

.resume-prose :deep(ul) {
  list-style: disc;
}

.resume-prose :deep(ol) {
  list-style: decimal;
}

.resume-prose :deep(li) {
  margin-bottom: 0.25rem;
}

.resume-prose :deep(a) {
  color: var(--color-rust, #b45309);
  text-decoration: underline;
}

.resume-prose :deep(blockquote) {
  border-left: 3px solid var(--color-sand, #d6d3d1);
  padding-left: 1rem;
  color: var(--color-mute, #78716c);
  margin: 0.75rem 0;
}

.resume-prose :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.75rem 0;
}

.resume-prose :deep(th),
.resume-prose :deep(td) {
  border: 1px solid var(--color-sand, #d6d3d1);
  padding: 0.5rem 0.75rem;
  text-align: left;
}
</style>

