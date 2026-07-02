<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
    :class="scrolled ? 'bg-cream/80 backdrop-blur-xl border-b border-sand/60' : 'bg-transparent'"
  >
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- 品牌 -->
        <RouterLink to="/" class="flex items-center gap-2.5 no-underline shrink-0">
          <span
            class="w-9 h-9 rounded-full bg-rust flex items-center justify-center text-white font-serif text-base"
          >
            拾
          </span>
          <span class="font-serif font-bold text-lg text-ink">作品拾光</span>
        </RouterLink>

        <!-- 桌面导航 -->
        <nav class="hidden md:flex items-center gap-8" aria-label="主导航">
          <template v-for="item in navItems" :key="item.label">
            <RouterLink
              v-if="item.type === 'route'"
              :to="item.to"
              class="text-sm text-stone hover:text-rust transition-colors no-underline"
            >
              {{ item.label }}
            </RouterLink>
            <RouterLink
              v-else-if="item.type === 'anchor'"
              :to="{ path: '/', hash: item.hash }"
              class="text-sm text-stone hover:text-rust transition-colors no-underline"
            >
              {{ item.label }}
            </RouterLink>
          </template>
        </nav>

        <!-- 右侧徽标 + 移动端菜单按钮 -->
        <div class="flex items-center gap-3">
          <span
            class="hidden md:flex w-10 h-10 rounded-full bg-ink items-center justify-center text-cream font-serif text-sm shrink-0"
            aria-hidden="true"
          >
            拾
          </span>
          <button
            class="md:hidden p-2 rounded-lg text-stone hover:bg-sand/50 transition-colors"
            aria-label="菜单"
            @click="menuOpen = !menuOpen"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                v-if="!menuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 移动端导航 -->
    <nav
      v-if="menuOpen"
      class="md:hidden border-t border-sand/60 bg-cream px-6 py-4 flex flex-col gap-1"
      aria-label="移动端导航"
    >
      <template v-for="item in navItems" :key="item.label">
        <RouterLink
          v-if="item.type === 'route'"
          :to="item.to"
          class="px-4 py-2.5 rounded-lg text-sm text-stone hover:text-rust hover:bg-sand/40 transition-colors no-underline"
          @click="menuOpen = false"
        >
          {{ item.label }}
        </RouterLink>
        <RouterLink
          v-else-if="item.type === 'anchor'"
          :to="{ path: '/', hash: item.hash }"
          class="px-4 py-2.5 rounded-lg text-sm text-stone hover:text-rust hover:bg-sand/40 transition-colors no-underline"
          @click="menuOpen = false"
        >
          {{ item.label }}
        </RouterLink>
      </template>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, inject, watch } from 'vue'
import type { Ref } from 'vue'

const menuOpen = ref(false)
const scrolled = ref(false)

// 从 App.vue 注入的滚动位置，用于切换头部背景
const scrollY = inject<Ref<number>>('scrollY')
if (scrollY) {
  watch(scrollY, (val) => {
    scrolled.value = val > 20
  })
}

// 导航项：锚点定位首页区块（anchor），或跳转独立页（route）
// 锚点项统一跳转到首页并携带 hash，由路由 scrollBehavior 滚动到区块
// 判别联合类型：route 必有 to，anchor 必有 hash，编译期收窄无需非空断言
interface AnchorItem {
  label: string
  type: 'anchor'
  hash: string
}
interface RouteItem {
  label: string
  type: 'route'
  to: string
}
type NavItem = AnchorItem | RouteItem

const navItems: NavItem[] = [
  { label: '作品集', type: 'anchor', hash: '#works' },
  { label: '能力', type: 'anchor', hash: '#capability' },
  { label: '历程', type: 'route', to: '/timeline' },
  { label: '思考', type: 'anchor', hash: '#thoughts' },
  { label: '联系', type: 'route', to: '/about' },
]
</script>
