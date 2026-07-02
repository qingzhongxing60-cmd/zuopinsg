/**
 * 首页配置 Mock 数据
 * 单条固定记录，只编辑不增删
 * 精选作品候选池来源于作品管理中"已发布且精选标记为是"的作品
 */

import { works, getCategoryName } from './work-data'

interface MockHomeConfig {
  slogan: string
  subtitle: string | null
  featuredWorkIds: number[]
}

// 首页配置单条记录（固定初始数据）
const homeConfig: MockHomeConfig = {
  slogan: '用作品记录每一次产品思考',
  subtitle: '产品经理 · AI / 医疗 / 企业服务',
  featuredWorkIds: [1]
}

/** 获取首页配置 */
export function getHomeConfigMock(): MockHomeConfig {
  return {
    slogan: homeConfig.slogan,
    subtitle: homeConfig.subtitle,
    featuredWorkIds: [...homeConfig.featuredWorkIds]
  }
}

/** 更新首页配置（覆盖写入，展示标语必填） */
export function updateHomeConfigMock(data: {
  slogan: string
  subtitle?: string | null
  featuredWorkIds: number[]
}): MockHomeConfig {
  if (!data.slogan || !data.slogan.trim()) {
    throw new Error('展示标语不能为空')
  }
  homeConfig.slogan = data.slogan
  homeConfig.subtitle = data.subtitle ?? null
  homeConfig.featuredWorkIds = Array.isArray(data.featuredWorkIds) ? [...data.featuredWorkIds] : []
  return getHomeConfigMock()
}

/** 获取精选作品候选池（已发布 status=1 且精选 featured=true） */
export function getFeaturedWorkOptionsMock(): {
  id: number
  title: string
  categoryName: string
}[] {
  return works
    .filter((w) => w.status === 1 && w.featured)
    .map((w) => ({
      id: w.id,
      title: w.title,
      categoryName: getCategoryName(w.categoryId)
    }))
}
