import request from '@/utils/http'

/** 首页配置数据类型 */
export interface HomeConfig {
  /** 展示标语（必填，1-50字） */
  slogan: string
  /** 副标题（选填，0-100字） */
  subtitle: string | null
  /** 标语中需要高亮显示的文字片段（选填，须为展示标语的子串，为空则不高亮） */
  highlightText: string | null
  /** 高亮文字颜色（选填，十六进制色值，为空时展示端使用默认强调色） */
  highlightColor: string | null
  /** 已选精选作品 ID 列表 */
  featuredWorkIds: number[]
}

/** 精选作品候选项类型 */
export interface FeaturedWorkOption {
  id: number
  title: string
  categoryName: string
}

/**
 * 获取首页配置（单条固定记录）
 */
export function getHomeConfig() {
  return request.get<HomeConfig>({
    url: '/admin/home-config'
  })
}

/**
 * 更新首页配置（覆盖写入）
 * @param data 展示标语、副标题、高亮文字片段、高亮颜色、精选作品 ID 列表
 */
export function updateHomeConfig(data: {
  slogan: string
  subtitle?: string | null
  highlightText?: string | null
  highlightColor?: string | null
  featuredWorkIds: number[]
}) {
  return request.put({
    url: '/admin/home-config',
    data
  })
}

/**
 * 获取精选作品候选池（已发布且精选标记为是的作品）
 */
export function getFeaturedWorkOptions() {
  return request.get<FeaturedWorkOption[]>({
    url: '/admin/home-config/featured-options'
  })
}
