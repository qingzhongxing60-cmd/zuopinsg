import { AppRouteRecord } from '@/types/router'

/**
 * 首页配置路由（一级菜单，无子路由）
 * 维护展示站点首页展示文案与精选作品
 */
export const homeConfigRoutes: AppRouteRecord = {
  path: '/home-config',
  name: 'HomeConfig',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.homeConfig.title',
    icon: 'HomeFilled',
    isFirstLevel: true
  },
  children: [
    {
      path: '',
      name: 'HomeConfigIndex',
      component: () => import('@/views/home-config/index.vue'),
      meta: {
        title: 'menus.homeConfig.title',
        keepAlive: true,
        isHide: true
      }
    }
  ]
}
