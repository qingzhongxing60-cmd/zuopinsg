import { getHomeData, getAllPublishedWorks, getWorkDetail, getAbout, getAllCategories } from './site'

// 全局 mock 开关 — 控制是否启用 mock 数据
// 当前为 false：所有接口均走 vite 代理请求真实后端；改为 true 可重新启用 mock 拦截
export const MOCK_ENABLED = false

if (MOCK_ENABLED) {
  const mockRoutes: Record<string, Record<string, (body?: unknown) => unknown>> = {
    POST: {
      '/api/auth/login': (body: unknown) => {
        const { username, password } = body as { username: string; password: string }
        if (username === 'admin' && password === '123456') {
          return {
            code: 0,
            data: {
              token: 'mock-token-axuremart-2026',
              user: { id: 1, name: '张明', email: 'admin@axuremart.ai', avatar: '', role: 'admin' },
            },
            message: '登录成功',
          }
        }
        return { code: 401, data: null, message: '用户名或密码错误' }
      },
      '/api/auth/logout': () => ({ code: 0, message: '已退出登录' }),
    },
    GET: {
      '/api/auth/me': () => ({
        code: 0,
        data: { id: 1, name: '张明', email: 'admin@axuremart.ai', avatar: '', role: 'admin' },
      }),
      // 展示站点首页聚合数据：标语、统计、精选作品、能力图谱、思考、关于我、成长历程
      '/api/site/home': () => ({
        code: 0,
        data: getHomeData(),
        message: 'ok',
      }),
      // 展示站点全部已发布作品列表（草稿隔离，日期倒序）
      '/api/site/works': () => ({
        code: 0,
        data: getAllPublishedWorks(),
        message: 'ok',
      }),
      // 展示站点全部分类列表（按排序值升序）
      '/api/site/categories': () => ({
        code: 0,
        data: getAllCategories(),
        message: 'ok',
      }),
      // 注意：/api/site/timeline 不在此处，直接调用后端真实 API
      // 展示站点「关于我」聚合数据
      '/api/site/about': () => ({
        code: 0,
        data: getAbout(),
        message: 'ok',
      }),
    },
  }

  const originalFetch = window.fetch.bind(window)

  // 动态路由匹配（带路径参数，精确匹配未命中时尝试）
  // 返回 mock 响应体；不匹配返回 null 交还原生 fetch
  function matchDynamicRoute(method: string, pathname: string): unknown | null {
    // GET /api/site/works/:slug —— 作品详情
    const detailPrefix = '/api/site/works/'
    if (method === 'GET' && pathname.startsWith(detailPrefix)) {
      const slug = decodeURIComponent(pathname.slice(detailPrefix.length))
      // 排除空 slug 与多级路径
      if (slug && !slug.includes('/')) {
        const detail = getWorkDetail(slug)
        return detail
          ? { code: 0, data: detail, message: 'ok' }
          : { code: 404, data: null, message: '作品不存在或已下架' }
      }
    }
    return null
  }

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.pathname : (input as Request).url
    // 去掉查询串，仅保留 path 用于匹配
    const pathname = rawUrl.split('?')[0]
    const method = (init?.method || 'GET').toUpperCase()
    const handler = mockRoutes[method]?.[pathname] as ((body?: unknown) => unknown) | undefined

    // 精确匹配优先，未命中再尝试动态路由
    const dynamicData = handler ? null : matchDynamicRoute(method, pathname)

    if (handler || dynamicData !== null) {
      await new Promise((r) => setTimeout(r, 200 + Math.random() * 200))
      let body: unknown
      if (init?.body) {
        try { body = JSON.parse(init.body as string) } catch { body = init.body }
      }
      const data = handler ? handler(body) : dynamicData
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return originalFetch(input, init)
  }
}
