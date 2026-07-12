<template>
  <div v-if="data" class="bg-cream">
    <!-- ============ Hero 标语区 ============ -->
    <section class="pt-28 pb-16 lg:pt-32 lg:pb-20">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- 左侧：标语 + 统计 + CTA -->
          <div class="max-w-xl">
            <p class="flex items-center gap-3 text-rust text-xs font-medium tracking-[0.2em] mb-6">
              <span class="w-8 h-px bg-rust"></span>
              {{ data.hero.eyebrow }}
            </p>
            <h1 class="font-serif text-5xl lg:text-6xl font-bold text-ink leading-[1.15] mb-6">
              <template v-for="(line, i) in data.hero.titleLines" :key="i">
                {{ line.text
                }}<em
                  v-if="line.accent"
                  class="not-italic text-rust"
                  :style="line.accentColor ? { color: line.accentColor } : undefined"
                  >{{ line.accent }}</em
                >{{ line.tail }}
                <br v-if="i < data.hero.titleLines.length - 1" />
              </template>
            </h1>
            <p v-if="data.hero.subtitle" class="font-serif italic text-base text-mute leading-relaxed mb-10">
              {{ data.hero.subtitle }}
            </p>

            <!-- 统计指标 -->
            <div class="flex items-center gap-10 mb-10">
              <div v-for="stat in data.hero.stats" :key="stat.label">
                <div class="font-serif text-3xl font-bold text-ink">{{ stat.value }}</div>
                <div class="text-xs text-mute mt-1">{{ stat.label }}</div>
              </div>
            </div>

            <a
              href="#works"
              class="inline-flex items-center gap-3 px-7 py-3.5 rounded-md bg-rust text-white text-sm font-medium hover:bg-rust/90 transition-colors no-underline"
            >
              {{ data.hero.ctaText }}
              <span aria-hidden="true">→</span>
            </a>
          </div>
          <!-- 右侧：统计卡片网格 -->
          <div class="grid grid-cols-2 gap-4">
            <!-- 项目总数 -->
            <div class="rounded-lg bg-paper border border-sand/50 p-6">
              <p class="text-mute text-[11px] tracking-[0.18em] mb-4">{{ data.hero.projectCard.badge }}</p>
              <div class="font-serif text-4xl font-bold text-rust">{{ data.hero.projectCard.count }}</div>
              <p class="text-xs text-mute mt-3">{{ data.hero.projectCard.label }}</p>
            </div>

            <!-- 强调块（跨两行，逐行文案，accent 行用强调色） -->
            <div class="row-span-2 rounded-lg bg-sand/70 p-6 flex flex-col justify-between">
              <p class="font-serif text-2xl leading-relaxed text-ink">
                <template v-for="(line, i) in data.hero.accentBlock.lines" :key="i">
                  <em v-if="line.accent" class="not-italic text-rust">{{ line.text }}</em>
                  <template v-else>{{ line.text }}</template>
                  <br v-if="i < data.hero.accentBlock.lines.length - 1" />
                </template>
              </p>
              <div class="mt-6 rounded-md bg-paper/80 p-4">
                <p class="text-mute text-[10px] tracking-[0.15em] mb-2">{{ data.hero.highlight.tag }}</p>
                <p class="font-serif text-sm font-bold text-ink">{{ data.hero.highlight.title }}</p>
                <p class="text-xs text-stone mt-1.5 leading-relaxed">{{ data.hero.highlight.desc }}</p>
              </div>
            </div>

            <!-- 增长趋势：纯 CSS 柱状图 -->
            <div class="rounded-lg bg-paper border border-sand/50 p-6">
              <p class="text-mute text-[11px] tracking-[0.18em] mb-4">{{ data.hero.growthCard.badge }}</p>
              <div class="flex items-end gap-1.5 h-16">
                <span
                  v-for="(h, i) in data.hero.growthCard.bars"
                  :key="i"
                  class="flex-1 rounded-sm"
                  :class="i === data.hero.growthCard.bars.length - 1 ? 'bg-rust' : 'bg-rust-soft/50'"
                  :style="{ height: `${Math.min(100, Math.max(0, h))}%` }"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- ============ 精选项目 ============ -->
    <section id="works" class="py-16 scroll-mt-16">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex items-center gap-4 mb-3">
          <h2 class="font-serif text-2xl font-bold text-ink">精选项目</h2>
          <span class="w-10 h-px bg-rust"></span>
        </div>
        <div class="flex flex-wrap items-end justify-between gap-4 mb-10">
          <p class="text-sm text-stone max-w-xs leading-relaxed">精选 AI 产品设计案例，探索从 0 到 1 的思考与实践。</p>
          <RouterLink to="/works" class="text-sm text-rust hover:text-rust/80 transition-colors no-underline">
            查看全部作品 →
          </RouterLink>
        </div>

        <!-- 作品卡片网格 -->
        <div v-if="data.featured.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <RouterLink
            v-for="work in data.featured"
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
              <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-sand/60 to-rust-tint">
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
              <p v-if="work.intro" class="text-xs text-stone leading-relaxed mt-2 line-clamp-2">{{ work.intro }}</p>
              <div class="flex items-center justify-between mt-4 pt-3 border-t border-sand/50">
                <span class="text-xs text-mute">{{ work.date }}</span>
                <span class="text-rust text-sm" aria-hidden="true">→</span>
              </div>
            </div>
          </RouterLink>
        </div>

        <!-- 空状态 -->
        <div v-else class="py-16 text-center">
          <p class="text-mute text-sm">暂无精选作品</p>
        </div>
      </div>
    </section>
    <!-- ============ 能力图谱 + 最新思考 ============ -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 能力图谱 -->
        <div id="capability" class="rounded-xl bg-paper border border-sand/50 p-8 scroll-mt-16">
          <div class="flex items-center gap-4 mb-2">
            <h2 class="font-serif text-2xl font-bold text-ink">能力图谱</h2>
            <span class="w-10 h-px bg-rust"></span>
          </div>
          <p class="text-sm text-stone mb-6">多维能力融合，打造 AI 产品的核心竞争力。</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <RadarChart :items="data.capabilities" />
            <ul class="space-y-4">
              <li v-for="cap in data.capabilities" :key="cap.title" class="flex gap-3">
                <span class="w-7 h-7 rounded-md bg-rust-tint flex items-center justify-center shrink-0 mt-0.5">
                  <span class="w-2 h-2 rounded-full bg-rust"></span>
                </span>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-ink">{{ cap.title }}</p>
                  <p class="text-xs text-stone leading-relaxed mt-0.5">{{ cap.desc }}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- 最新思考 -->
        <div id="thoughts" class="rounded-xl bg-paper border border-sand/50 p-8 scroll-mt-16">
          <div class="flex items-center gap-4 mb-2">
            <h2 class="font-serif text-2xl font-bold text-ink">最新思考</h2>
            <span class="w-10 h-px bg-rust"></span>
          </div>
          <p class="text-sm text-stone mb-6">分享产品思考与行业洞察，记录成长与感悟。</p>
          <ul>
            <li v-for="thought in data.thoughts" :key="thought.id">
              <RouterLink :to="`/thoughts/${thought.id}`" class="group flex items-start justify-between gap-4 py-4 border-b border-sand/50 no-underline">
                <div class="min-w-0">
                  <p class="font-serif text-sm font-bold text-ink group-hover:text-rust transition-colors">
                    {{ thought.title }}
                  </p>
                  <p class="text-xs text-stone mt-1.5 leading-relaxed">{{ thought.desc }}</p>
                </div>
                <span class="text-xs text-mute shrink-0 whitespace-nowrap mt-0.5">{{ thought.date }}</span>
              </RouterLink>
            </li>
          </ul>
          <RouterLink to="/thoughts" class="inline-block text-sm text-rust hover:text-rust/80 transition-colors mt-5 no-underline">
            查看更多思考 →
          </RouterLink>
        </div>
      </div>
    </section>
    <!-- ============ 关于我 + 成长历程 ============ -->
    <section class="py-16 pb-24">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 关于我 -->
        <div id="about" class="rounded-xl bg-paper border border-sand/50 p-8 scroll-mt-16">
          <div class="flex items-center gap-4 mb-8">
            <h2 class="font-serif text-2xl font-bold text-ink">关于我</h2>
            <span class="w-10 h-px bg-rust"></span>
          </div>
          <div class="flex gap-5">
            <!-- 头像：无头像用首字占位 -->
            <div class="w-20 h-20 rounded-full overflow-hidden bg-sand/60 shrink-0 flex items-center justify-center">
              <img
                v-if="data.about.avatar"
                :src="data.about.avatar"
                :alt="data.about.name"
                loading="lazy"
                class="w-full h-full object-cover"
              />
              <span v-else class="font-serif text-2xl text-rust">{{ data.about.name.charAt(0) }}</span>
            </div>
            <div class="min-w-0">
              <h3 class="font-serif text-lg font-bold text-ink">{{ data.about.name }}</h3>
              <p class="text-sm text-rust mt-1">{{ data.about.role }}</p>
              <p class="text-sm text-stone leading-relaxed mt-3">{{ data.about.intro }}</p>
              <RouterLink to="/about" class="inline-block text-sm text-rust hover:text-rust/80 transition-colors mt-4 no-underline">
                了解更多 →
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- 成长历程 -->
        <div id="timeline" class="rounded-xl bg-paper border border-sand/50 p-8 scroll-mt-16">
          <div class="flex items-center gap-4 mb-2">
            <h2 class="font-serif text-2xl font-bold text-ink">成长历程</h2>
            <span class="w-10 h-px bg-rust"></span>
          </div>
          <p class="text-sm text-stone mb-6">记录每一步成长，见证从初心到专业的蜕变。</p>
          <ol class="relative border-l border-sand pl-6 space-y-6">
            <li v-for="node in data.timeline" :key="node.period" class="relative">
              <span class="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-rust ring-4 ring-paper"></span>
              <div class="flex flex-wrap items-baseline gap-x-3">
                <span class="text-xs text-mute">{{ node.period }}</span>
                <h3 class="font-serif text-sm font-bold text-ink">{{ node.title }}</h3>
              </div>
              <p class="text-xs text-stone leading-relaxed mt-1.5">{{ node.desc }}</p>
            </li>
          </ol>
        </div>
      </div>
    </section>
  </div>

  <!-- 加载中 / 失败友好空态 -->
  <div v-else class="min-h-screen flex items-center justify-center bg-cream">
    <p class="text-mute text-sm">{{ loading ? '加载中…' : '内容加载失败，请稍后重试' }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getHomeData } from '@/api/site'
import type { HomeData } from '@/api/site'
import RadarChart from './components/RadarChart.vue'

const loading = ref(true)
const data = ref<HomeData | null>(null)

// 加载首页聚合数据
async function loadHome() {
  loading.value = true
  try {
    data.value = await getHomeData()
  } catch {
    // 失败时保持空态，由模板展示友好提示，不阻断
    data.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadHome)
</script>
