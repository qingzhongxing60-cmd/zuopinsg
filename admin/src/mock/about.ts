/**
 * 关于我管理 Mock 数据
 * 个人介绍：全局唯一记录，覆盖写入
 * 技能列表：按排序值升序，相同时按录入时间升序
 */

interface MockProfile {
  intro: string
  avatar: string | null
  resume: string | null
}

interface MockSkill {
  id: number
  name: string
  score: number
  sort: number
  createTime: string
}

// 个人介绍（单条记录，固定初始数据）
const profile: MockProfile = {
  intro: '资深产品经理，专注 AI、医疗与企业服务方向，擅长从 0 到 1 构建产品。',
  avatar: null,
  resume:
    '<h3>工作经历</h3><p>2019 年至今深耕产品领域，主导多个 B 端与 AI 产品落地。</p><h3>核心能力</h3><p>需求分析、产品设计、项目管理、数据驱动决策。</p>'
}

// 技能列表（固定初始数据）
const skills: MockSkill[] = [
  { id: 1, name: '需求分析', score: 92, sort: 1, createTime: '2026-01-05 09:00:00' },
  { id: 2, name: '产品设计', score: 88, sort: 2, createTime: '2026-01-06 09:00:00' },
  { id: 3, name: '项目管理', score: 85, sort: 3, createTime: '2026-01-07 09:00:00' },
  { id: 4, name: '数据分析', score: 80, sort: 4, createTime: '2026-01-08 09:00:00' }
]

let nextId = 100

/** 获取个人介绍 */
export function getAboutProfileMock(): MockProfile {
  return { ...profile }
}

/** 更新个人介绍（覆盖写入） */
export function updateAboutProfileMock(data: {
  intro: string
  avatar?: string | null
  resume?: string | null
}): MockProfile {
  if (!data.intro || !data.intro.trim()) {
    throw new Error('个人简介不能为空')
  }
  profile.intro = data.intro
  profile.avatar = data.avatar ?? null
  profile.resume = data.resume ?? null
  return { ...profile }
}

/** 按排序值升序、相同时按录入时间升序排列 */
function sortSkills(list: MockSkill[]): MockSkill[] {
  return [...list].sort((a, b) => {
    if (a.sort !== b.sort) return a.sort - b.sort
    return new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
  })
}

/** 获取技能列表 */
export function getSkillListMock(): MockSkill[] {
  return sortSkills(skills)
}

/** 新增技能（校验名称非空与评分范围） */
export function addSkillMock(data: { name: string; score: number; sort: number }): MockSkill {
  if (!data.name || !data.name.trim()) {
    throw new Error('技能名称不能为空')
  }
  if (data.score < 0 || data.score > 100) {
    throw new Error('评分值须在 0 到 100 之间')
  }
  const item: MockSkill = {
    id: nextId++,
    name: data.name,
    score: data.score,
    sort: data.sort,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false })
  }
  skills.push(item)
  return item
}

/** 更新技能（校验名称非空与评分范围） */
export function updateSkillMock(
  id: number,
  data: { name?: string; score?: number; sort?: number }
): MockSkill {
  const target = skills.find((s) => s.id === id)
  if (!target) throw new Error('技能不存在')
  if (data.name !== undefined && !data.name.trim()) {
    throw new Error('技能名称不能为空')
  }
  if (data.score !== undefined && (data.score < 0 || data.score > 100)) {
    throw new Error('评分值须在 0 到 100 之间')
  }
  if (data.name !== undefined) target.name = data.name
  if (data.score !== undefined) target.score = data.score
  if (data.sort !== undefined) target.sort = data.sort
  return target
}

/** 删除技能 */
export function deleteSkillMock(id: number): boolean {
  const index = skills.findIndex((s) => s.id === id)
  if (index === -1) throw new Error('技能不存在')
  skills.splice(index, 1)
  return true
}
