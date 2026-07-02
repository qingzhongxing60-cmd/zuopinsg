import { createRouter, createWebHistory } from 'vue-router'

// hash 滚动轮询令牌：每次新的 hash 导航自增，使旧导航的轮询失效，避免滚动位置被覆盖
let scrollToken = 0

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/components/layout/DefaultLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/home/index.vue'),
        },
        {
          path: 'works',
          name: 'works',
          component: () => import('@/views/works/index.vue'),
        },
        {
          path: 'works/:slug',
          name: 'work-detail',
          component: () => import('@/views/works/detail/index.vue'),
        },
        {
          path: 'timeline',
          name: 'timeline',
          component: () => import('@/views/timeline/index.vue'),
        },
        {
          path: 'product',
          name: 'product',
          component: () => import('@/views/product/index.vue'),
        },
        {
          path: 'pricing',
          name: 'pricing',
          component: () => import('@/views/pricing/index.vue'),
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('@/views/about/index.vue'),
        },
        {
          path: 'contact',
          name: 'contact',
          component: () => import('@/views/contact/index.vue'),
        },
      ],
    },
  ],
  scrollBehavior(to, _, savedPosition) {
    if (savedPosition) return savedPosition
    // 带 hash 的导航：滚动到对应区块（顶部固定头部高 64px，需偏移）
    // 首页区块在异步数据加载后才渲染，轮询等待目标元素出现再滚动
    if (to.hash) {
      const myToken = ++scrollToken
      return new Promise((resolve) => {
        const tryScroll = (attempt: number) => {
          // 已有更新的 hash 导航发起，放弃本次轮询，不干扰新滚动
          if (myToken !== scrollToken) {
            resolve(false)
            return
          }
          let el: Element | null = null
          try {
            el = document.querySelector(to.hash)
          } catch {
            // hash 非法选择器时回退到顶部
            resolve({ top: 0 })
            return
          }
          if (el) {
            resolve({ el: to.hash, top: 64, behavior: 'smooth' })
          } else if (attempt < 30) {
            setTimeout(() => tryScroll(attempt + 1), 100)
          } else {
            resolve({ top: 0 })
          }
        }
        tryScroll(0)
      })
    }
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
