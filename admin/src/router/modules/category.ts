import { AppRouteRecord } from '@/types/router'

/**
 * 分类管理路由（一级菜单，无子路由）
 * 维护作品分类，作为作品归属维度与展示端筛选项来源
 */
export const categoryRoutes: AppRouteRecord = {
  path: '/category',
  name: 'Category',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.category.title',
    icon: 'Collection',
    isFirstLevel: true
  },
  children: [
    {
      path: '',
      name: 'CategoryIndex',
      component: () => import('@/views/category/index.vue'),
      meta: {
        title: 'menus.category.title',
        keepAlive: true,
        isHide: true
      }
    }
  ]
}
