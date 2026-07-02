import { AppRouteRecord } from '@/types/router'

/**
 * 时间轴管理路由（一级菜单，无子路由）
 * 维护成长轨迹年份节点，对外展示职业发展路径
 */
export const timelineRoutes: AppRouteRecord = {
  path: '/timeline',
  name: 'Timeline',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.timeline.title',
    icon: 'Calendar',
    isFirstLevel: true
  },
  children: [
    {
      path: '',
      name: 'TimelineIndex',
      component: () => import('@/views/timeline/index.vue'),
      meta: {
        title: 'menus.timeline.title',
        keepAlive: true,
        isHide: true
      }
    }
  ]
}
