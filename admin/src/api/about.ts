import request from '@/utils/http'

/** 个人介绍数据类型 */
export interface AboutProfile {
  /** 简介（必填） */
  intro: string
  /** 头像地址（选填） */
  avatar: string | null
  /** 简历富文本 HTML（选填） */
  resume: string | null
}

/** 技能数据类型 */
export interface Skill {
  /** 技能 ID */
  id: number
  /** 技能名称 */
  name: string
  /** 评分值（0-100） */
  score: number
  /** 排序值，数值越小越靠前 */
  sort: number
  /** 录入时间 */
  createTime: string
}

/**
 * 获取个人介绍（全局唯一记录）
 */
export function getAboutProfile() {
  return request.get<AboutProfile>({
    url: '/admin/about/profile'
  })
}

/**
 * 更新个人介绍（覆盖写入）
 * @param data 简介、头像、简历
 */
export function updateAboutProfile(data: {
  intro: string
  avatar?: string | null
  resume?: string | null
}) {
  return request.put({
    url: '/admin/about/profile',
    data
  })
}

/**
 * 获取技能列表（按排序值升序，相同时按录入时间升序）
 */
export function getSkillList() {
  return request.get<Skill[]>({
    url: '/admin/about/skill/list'
  })
}

/**
 * 新增技能
 * @param data 技能名称、评分值、排序值
 */
export function addSkill(data: { name: string; score: number; sort: number }) {
  return request.post({
    url: '/admin/about/skill/add',
    data
  })
}

/**
 * 更新技能
 * @param data 技能 ID 及待更新字段
 */
export function updateSkill(data: { id: number; name?: string; score?: number; sort?: number }) {
  return request.put({
    url: '/admin/about/skill/update',
    data
  })
}

/**
 * 删除技能
 * @param id 技能 ID
 */
export function deleteSkill(id: number) {
  return request.del({
    url: `/admin/about/skill/delete/${id}`
  })
}
