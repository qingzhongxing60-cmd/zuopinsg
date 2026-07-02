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

        <!-- 自我介绍 -->
        <section v-if="data.paragraphs.length" class="mb-12">
          <div class="flex items-center gap-3 mb-4">
            <h2 class="font-serif text-xl font-bold text-ink">自我介绍</h2>
            <span class="w-8 h-px bg-rust"></span>
          </div>
          <p
            v-for="(para, i) in data.paragraphs"
            :key="i"
            class="text-sm text-stone leading-relaxed mb-3 last:mb-0"
          >
            {{ para }}
          </p>
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


