import { AppRouteRecord } from '@/types/router'

/**
 * 数据统计路由（一级菜单，无子路由）
 * 作品访问量排行，只读展示
 */
export const statisticsRoutes: AppRouteRecord = {
  path: '/statistics',
  name: 'Statistics',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.statistics.title',
    icon: 'TrendCharts',
    isFirstLevel: true
  },
  children: [
    {
      path: '',
      name: 'StatisticsIndex',
      component: () => import('@/views/statistics/index.vue'),
      meta: {
        title: 'menus.statistics.title',
        keepAlive: true,
        isHide: true
      }
    }
  ]
}
