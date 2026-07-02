import { AppRouteRecord } from '@/types/router'
import { categoryRoutes } from './category'
import { timelineRoutes } from './timeline'
import { workRoutes } from './work'
import { homeConfigRoutes } from './home-config'
import { statisticsRoutes } from './statistics'

export const routeModules: AppRouteRecord[] = [
  workRoutes,
  categoryRoutes,
  timelineRoutes,
  homeConfigRoutes,
  statisticsRoutes,
]
