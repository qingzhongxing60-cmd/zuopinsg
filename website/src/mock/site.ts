/**
 * 展示站点 Mock 数据源
 * 提供首页所需的全部展示数据（标语、统计、精选作品、能力图谱、最新思考、关于我、成长历程）
 * 字段与 admin 各管理模块对齐；精选作品执行草稿隔离（仅返回已发布作品）
 */

/** 作品发布状态：0 草稿 / 1 已发布 */
type PublishStatus = 0 | 1

/** 作品精简数据（展示站点只读所需字段） */
interface SiteWork {
  id: number
  title: string
  slug: string
  category: string
  intro: string | null
  cover: string | null
  date: string
  status: PublishStatus
}

/** 首页聚合数据返回结构 */
export interface HomeData {
  hero: {
    eyebrow: string
    titleLines: { text: string; accent?: string }[]
    subtitle: string | null
    stats: { value: string; label: string }[]
    ctaText: string
    highlight: { tag: string; title: string; desc: string }
    /** 右侧·项目总数卡片 */
    projectCard: { badge: string; count: string; label: string }
    /** 右侧·强调块（逐行文案，accent=true 的行以强调色渲染） */
    accentBlock: { lines: { text: string; accent?: boolean }[] }
    /** 右侧·增长趋势卡片（bars 为各柱高度百分比，最后一根高亮） */
    growthCard: { badge: string; bars: number[] }
  }
  featured: {
    id: number
    title: string
    slug: string
    category: string
    intro: string | null
    cover: string | null
    date: string
  }[]
  capabilities: { name: string; score: number; title: string; desc: string }[]
  thoughts: { id: number; title: string; desc: string; date: string }[]
  about: {
    name: string
    role: string
    avatar: string | null
    intro: string
  }
  timeline: { period: string; title: string; desc: string }[]
}

// 作品数据源（与 admin 作品管理保持一致的精简镜像）
const works: SiteWork[] = [
  {
    id: 1,
    title: '智能外呼随访系统',
    slug: 'ai-voice-call',
    category: '智能外呼',
    intro: 'AI 驱动的智能外呼平台，提升随访效率与思考体验。',
    cover: null,
    date: '2024.03',
    status: 1,
  },
  {
    id: 2,
    title: 'AI 健康咨询平台',
    slug: 'ai-health',
    category: 'RAG 应用',
    intro: '基于 RAG 知识库的智能问答系统，为用户提供专业健康咨询。',
    cover: null,
    date: '2024.01',
    status: 1,
  },
  {
    id: 3,
    title: '客户关系管理系统',
    slug: 'crm',
    category: 'CRM 系统',
    intro: '企业级 CRM 系统设计，优化销售流程与客户管理。',
    cover: null,
    date: '2023.11',
    status: 1,
  },
  {
    id: 4,
    title: '呼叫中心工作台',
    slug: 'call-center',
    category: '呼叫中心',
    intro: '呼叫中心坐席工作台设计，提升坐席工作效率与体验。',
    cover: null,
    date: '2023.08',
    status: 1,
  },
]

// 首页配置（标语、副标题、精选作品 id、右侧卡片可配置内容）
const homeConfig = {
  eyebrow: 'AI PRODUCT MANAGER',
  subtitle: 'Crafting intelligent products where human insight meets machine capability.',
  featuredWorkIds: [1, 2, 3, 4],
  // 右侧·项目总数卡片
  projectCard: { badge: 'PROJECTS', count: '12', label: 'AI 产品项目总数' },
  // 右侧·强调块（逐行文案，accent 行以强调色渲染）
  accentBlock: {
    lines: [{ text: '智能' }, { text: '对话', accent: true }, { text: '助手' }],
  },
  // 右侧·增长趋势柱状图（各柱高度百分比，最后一根高亮）
  growthCard: { badge: 'GROWTH', bars: [35, 45, 42, 58, 70, 85, 100] },
}

/** 展示端作品项（对外只读字段，不含草稿状态） */
export interface PublicWork {
  id: number
  title: string
  slug: string
  category: string
  intro: string | null
  cover: string | null
  date: string
}

/**
 * 获取全部已发布作品（展示端用）
 * 执行草稿隔离（仅 status=1），按日期倒序排列，剔除 status 字段
 */
export function getAllPublishedWorks(): PublicWork[] {
  return works
    .filter((w) => w.status === 1)
    // 日期格式形如 2024.03，字符串倒序即时间倒序（最新在前）
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(({ id, title, slug, category, intro, cover, date }) => ({
      id,
      title,
      slug,
      category,
      intro,
      cover,
      date,
    }))
}

/** 分类项（展示端用） */
interface CategoryItem {
  id: number
  name: string
  slug: string
  sort: number
}

/**
 * 获取全部分类列表（展示端用）
 * 从作品数据中聚合并去重，模拟后端分类接口返回格式
 */
export function getAllCategories(): CategoryItem[] {
  const categoryMap = new Map<string, { name: string; id: number; slug: string }>()
  let id = 1
  for (const w of works) {
    if (w.status === 1 && !categoryMap.has(w.category)) {
      categoryMap.set(w.category, {
        name: w.category,
        id: id++,
        slug: w.category.toLowerCase().replace(/\s+/g, '-'),
      })
    }
  }
  return Array.from(categoryMap.values()).map((c) => ({ ...c, sort: 0 }))
}

/** 作品正文分节 */
interface WorkSection {
  heading: string
  paragraphs: string[]
}

/** 作品详情扩展字段（按 slug 映射，挂接到精简 works 数据源之上） */
interface WorkDetailExtra {
  role: string | null
  duration: string | null
  tags: string[]
  overview: string | null
  sections: WorkSection[]
}

// 作品详情扩展数据（仅在详情页使用，与 works 通过 slug 关联）
const workDetailExtras: Record<string, WorkDetailExtra> = {
  'ai-voice-call': {
    role: 'AI 产品经理',
    duration: '2023.09 - 2024.03',
    tags: ['语音识别', '大模型', '外呼策略', '随访管理'],
    overview:
      '面向医疗随访场景的智能外呼平台，用 AI 替代人工完成大规模电话随访，在保证沟通质量的前提下大幅提升随访覆盖率与回收效率。',
    sections: [
      {
        heading: '项目背景',
        paragraphs: [
          '医院随访长期依赖人工电话，坐席数量有限，随访覆盖率不足三成，且记录质量参差不齐。',
          '随着慢病管理需求增长，机械重复的随访沟通亟需用智能外呼承接，把人力释放到真正需要人工介入的复杂沟通上。',
        ],
      },
      {
        heading: '目标与挑战',
        paragraphs: [
          '核心目标是让 AI 外呼听起来自然、答得准确，并能在患者表达异常时及时转接人工。',
          '挑战集中在多轮对话的上下文保持、方言与口语识别，以及随访话术的合规与温度。',
        ],
      },
      {
        heading: '解决方案',
        paragraphs: [
          '设计了可视化外呼策略编排，运营无需编码即可配置随访话术、分支与重拨规则。',
          '结合语音识别与大模型意图理解，机器人能根据患者回答动态选择话术，并在识别到情绪波动时自动转人工。',
        ],
      },
      {
        heading: '成果',
        paragraphs: [
          '上线后随访覆盖率从 30% 提升至 85%，单日外呼量提升数倍。',
          '随访记录结构化沉淀，为后续慢病管理提供了可分析的数据基础。',
        ],
      },
    ],
  },
  'ai-health': {
    role: 'AI 产品经理',
    duration: '2023.06 - 2024.01',
    tags: ['RAG', '知识库', '智能问答', '医疗健康'],
    overview:
      '基于 RAG 知识库的健康咨询问答平台，让用户获得有据可查的专业健康解答，回答均可追溯到权威来源。',
    sections: [
      {
        heading: '项目背景',
        paragraphs: [
          '通用大模型在健康问答上容易出现幻觉，直接面向用户存在专业性与安全性风险。',
          '需要一套以权威知识库为依据、回答可溯源的问答系统，平衡专业性与易用性。',
        ],
      },
      {
        heading: '解决方案',
        paragraphs: [
          '构建医疗知识库并完成分块与向量化，问答时先检索再生成，确保回答有据可依。',
          '每条回答附带引用来源，用户可展开查看依据，提升信任度与可核查性。',
        ],
      },
      {
        heading: '成果',
        paragraphs: [
          '问答准确率显著提升，用户对回答的信任与满意度明显提高。',
          '知识库更新后自动重新训练，内容维护成本大幅下降。',
        ],
      },
    ],
  },
  'crm': {
    role: '产品负责人',
    duration: '2023.05 - 2023.11',
    tags: ['CRM', '销售流程', '客户管理', '数据看板'],
    overview:
      '企业级 CRM 系统，围绕销售全流程梳理客户、商机与跟进动作，用数据看板驱动销售决策与团队协作。',
    sections: [
      {
        heading: '项目背景',
        paragraphs: [
          '销售团队客户信息分散在表格与个人手中，跟进缺乏统一视图，管理者难以掌握真实进展。',
          '需要把客户、商机、跟进记录沉淀到统一系统，让流程可见、可管理。',
        ],
      },
      {
        heading: '解决方案',
        paragraphs: [
          '以客户为中心重构数据模型，串联线索、商机、合同与回款的完整链路。',
          '提供销售漏斗与业绩看板，让团队进展与瓶颈一目了然。',
        ],
      },
      {
        heading: '成果',
        paragraphs: [
          '客户信息集中沉淀，跟进流程标准化，销售管理效率明显提升。',
        ],
      },
    ],
  },
  'call-center': {
    role: '产品设计负责人',
    duration: '2023.02 - 2023.08',
    tags: ['呼叫中心', '坐席工作台', '工单', '体验设计'],
    overview:
      '呼叫中心坐席工作台，把通话、客户信息、工单与知识库整合到统一界面，减少坐席操作切换，提升服务效率。',
    sections: [
      {
        heading: '项目背景',
        paragraphs: [
          '坐席在多个系统间频繁切换，通话中查信息、记工单效率低，影响服务体验。',
          '需要一个一体化工作台，让坐席在一个界面内完成核心服务动作。',
        ],
      },
      {
        heading: '解决方案',
        paragraphs: [
          '以通话为主线整合客户档案、历史记录与工单创建，关键信息随来电自动呈现。',
          '内嵌知识库检索，坐席可在通话中快速调取标准话术与解决方案。',
        ],
      },
      {
        heading: '成果',
        paragraphs: [
          '坐席平均通话处理时长缩短，操作切换大幅减少，服务体验稳步提升。',
        ],
      },
    ],
  },
}

/** 上一篇/下一篇导航项 */
interface PublicWorkNav {
  title: string
  slug: string
}

/** 展示端作品详情（合并精简字段与扩展字段，含上下篇导航） */
export interface PublicWorkDetail extends PublicWork {
  role: string | null
  duration: string | null
  tags: string[]
  overview: string | null
  sections: WorkSection[]
  prev: PublicWorkNav | null
  next: PublicWorkNav | null
}

/**
 * 按 slug 获取作品详情（展示端用）
 * 执行草稿隔离：仅已发布作品可返回；slug 不存在或指向草稿时返回 null
 * 上下篇基于已发布作品的日期倒序序列计算
 */
export function getWorkDetail(slug: string): PublicWorkDetail | null {
  const published = getAllPublishedWorks()
  const index = published.findIndex((w) => w.slug === slug)
  // 未找到（不存在或为草稿，草稿已在 getAllPublishedWorks 过滤）
  if (index === -1) return null

  const work = published[index]
  const extra = workDetailExtras[slug]
  const prev = index > 0 ? published[index - 1] : null
  const next = index < published.length - 1 ? published[index + 1] : null

  return {
    ...work,
    role: extra?.role ?? null,
    duration: extra?.duration ?? null,
    tags: extra?.tags ?? [],
    overview: extra?.overview ?? null,
    sections: extra?.sections ?? [],
    prev: prev ? { title: prev.title, slug: prev.slug } : null,
    next: next ? { title: next.title, slug: next.slug } : null,
  }
}

/** 成长历程节点（独立页用，含可选标签） */
export interface TimelineItemData {
  period: string
  title: string
  desc: string
  tags?: string[]
}

// 成长历程数据源（按时期倒序，最新在前）
const timelineNodes: TimelineItemData[] = [
  {
    period: '2021 - 至今',
    title: 'AI 产品经理',
    desc: '专注于 AI 产品设计与创新，主导多个 AI 产品从 0 到 1 的落地，覆盖智能外呼、RAG 应用与智能体方向。',
    tags: ['大模型', 'RAG', '智能体', '产品落地'],
  },
  {
    period: '2018 - 2021',
    title: '产品经理',
    desc: '负责多个企业级产品的设计与优化，深入业务场景打磨流程，积累从需求到交付的完整产品经验。',
    tags: ['需求分析', '流程设计', 'B 端产品'],
  },
  {
    period: '2015 - 2018',
    title: '产品设计师',
    desc: '专注于用户体验设计，参与多个产品的交互与设计项目，建立以用户为中心的设计方法。',
    tags: ['交互设计', '用户体验'],
  },
  {
    period: '2012 - 2015',
    title: 'UI 设计师',
    desc: '从视觉设计起步，打磨界面与品牌表达，培养设计思维与审美能力。',
    tags: ['视觉设计', '品牌'],
  },
]

/**
 * 获取成长历程时间轴节点（展示端用）
 * 数据已按时期倒序排列（最新在前）
 */
export function getTimeline(): TimelineItemData[] {
  return timelineNodes
}

/** 关于我 - 关键数据指标 */
interface AboutStatData {
  value: string
  label: string
}

/** 关于我 - 专长领域 */
interface AboutExpertiseData {
  name: string
  desc: string
}

/** 关于我 - 联系方式 */
interface AboutContactData {
  type: 'email' | 'link'
  label: string
  value: string
  display?: string
}

/** 关于我聚合数据结构 */
interface AboutDataShape {
  name: string
  role: string
  avatar: string | null
  intro: string
  stats: AboutStatData[]
  paragraphs: string[]
  expertise: AboutExpertiseData[]
  contacts: AboutContactData[]
}

// 「关于我」数据源（与首页 about 基础字段保持人物一致）
const aboutData: AboutDataShape = {
  name: '邢庆中',
  role: 'AI 产品经理 / 产品设计负责人',
  avatar: null,
  intro: '13 年产品设计经验，专注于 AI 产品与医疗健康领域的产品设计与创新。',
  stats: [
    { value: '13', label: '年产品经验' },
    { value: '12+', label: 'AI 项目' },
    { value: '5', label: '行业领域' },
  ],
  paragraphs: [
    '我是邢庆中，一名 AI 产品经理。从 UI 设计师起步，一路走过交互设计、产品设计与产品管理，逐步建立起以用户为中心、以数据驱动的产品方法论。',
    '近年来我专注于 AI 产品方向，主导过智能外呼、RAG 健康咨询、CRM 与呼叫中心工作台等多个项目，擅长把大模型能力转化为可落地、能交付价值的产品。',
    '我相信好的产品源于对真实问题的深入理解。比起追逐技术热点，我更在意 AI 能否切实解决用户的具体场景。',
  ],
  expertise: [
    { name: 'AI 应用产品', desc: '大模型、RAG、智能体应用的产品设计与落地' },
    { name: '产品设计', desc: '从 0 到 1 的产品规划与用户体验优化' },
    { name: '数据分析', desc: '数据驱动决策，优化产品与运营策略' },
    { name: '项目管理', desc: '敏捷开发，跨团队协作与项目落地' },
  ],
  contacts: [
    { type: 'email', label: '邮箱', value: 'hello@example.com' },
    { type: 'link', label: '博客', value: 'https://example.com', display: 'example.com' },
  ],
}

/**
 * 获取「关于我」聚合数据（展示端用）
 */
export function getAbout(): AboutDataShape {
  return aboutData
}

/** 获取首页聚合数据 */
export function getHomeData(): HomeData {
  // 精选作品：草稿隔离，仅返回已发布且被选中的作品
  const featured = homeConfig.featuredWorkIds
    .map((id) => works.find((w) => w.id === id))
    .filter((w): w is SiteWork => !!w && w.status === 1)
    .map((w) => ({
      id: w.id,
      title: w.title,
      slug: w.slug,
      category: w.category,
      intro: w.intro,
      cover: w.cover,
      date: w.date,
    }))

  return {
    hero: {
      eyebrow: homeConfig.eyebrow,
      titleLines: [
        { text: '用 ', accent: 'AI' },
        { text: '产品的', accent: '每一刻' },
      ],
      subtitle: homeConfig.subtitle,
      stats: [
        { value: '12+', label: 'AI 项目' },
        { value: '5', label: '行业领域' },
        { value: '200W+', label: '服务用户' },
      ],
      ctaText: '探索作品',
      highlight: {
        tag: 'LATEST WORK · 2025',
        title: '基于 RAG 的大模型产品',
        desc: '解决率提升 34%，用户突破 50 万',
      },
      projectCard: homeConfig.projectCard,
      accentBlock: homeConfig.accentBlock,
      growthCard: homeConfig.growthCard,
    },
    featured,
    capabilities: [
      { name: '产品设计', score: 92, title: 'AI 应用', desc: '大模型、RAG、智能体应用与产品落地' },
      { name: 'AI 应用', score: 88, title: '产品设计', desc: '从 0 到 1 的产品设计与用户体验优化' },
      { name: '数据分析', score: 80, title: '数据分析', desc: '数据驱动决策，优化产品与运营策略' },
      { name: '项目管理', score: 85, title: '项目管理', desc: '敏捷开发，跨团队协作与项目落地' },
      { name: '用户研究', score: 78, title: '用户研究', desc: '深入洞察用户需求，驱动产品迭代' },
    ],
    thoughts: [
      { id: 1, title: '如何设计一个高转化的 AI 咨询系统', desc: '从用户需求到产品落地的完整思考过程', date: '2025.05.20' },
      { id: 2, title: 'RAG 在医疗场景的应用与优化', desc: '解决方案、效果评估与未来展望', date: '2025.04.15' },
      { id: 3, title: 'AI 外呼系统的指标体系设计', desc: '从通道率到转化率的全链路指标拆解', date: '2025.03.10' },
      { id: 4, title: '产品经理如何拥抱 AI 时代', desc: 'AI 工具与产品能力的融合思考', date: '2025.02.28' },
    ],
    about: {
      name: '邢庆中',
      role: 'AI 产品经理 / 产品设计负责人',
      avatar: null,
      intro: '13 年产品设计经验，专注于 AI 产品与医疗健康领域的产品设计与创新。',
    },
    timeline: [
      { period: '2021 - 至今', title: 'AI 产品经理', desc: '专注于 AI 产品设计与创新，主导多个 AI 产品的落地' },
      { period: '2018 - 2021', title: '产品经理', desc: '负责多个产品的设计与优化，积累丰富的产品经验' },
      { period: '2015 - 2018', title: '产品设计师', desc: '专注于用户体验设计，参与多个产品设计项目' },
      { period: '2012 - 2015', title: 'UI 设计师', desc: '从视觉设计开始，培养设计思维与审美能力' },
    ],
  }
}
