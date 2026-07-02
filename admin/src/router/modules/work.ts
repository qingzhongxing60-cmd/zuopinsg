import { AppRouteRecord } from '@/types/router'

/**
 * 作品管理路由（一级菜单）
 * 包含：作品列表、原型版本、拆解文章
 */
export const workRoutes: AppRouteRecord = {
  path: '/work',
  name: 'Work',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.work.title',
    icon: 'Briefcase',
    isFirstLevel: true
  },
  children: [
    {
      path: 'list',
      name: 'WorkList',
      component: () => import('@/views/work/list/index.vue'),
      meta: {
        title: 'menus.work.list',
        keepAlive: true
      }
    },
    {
      path: 'prototype',
      name: 'WorkPrototype',
      component: () => import('@/views/work/prototype/index.vue'),
      meta: {
        title: 'menus.work.prototype',
        keepAlive: true
      }
    },
    {
      path: 'article',
      name: 'WorkArticle',
      component: () => import('@/views/work/article/index.vue'),
      meta: {
        title: 'menus.work.article',
        keepAlive: true
      }
    }
  ]
}
