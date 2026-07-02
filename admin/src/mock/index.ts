/**
 * Mock 路由统一注册
 * VITE_USE_MOCK=true 时由 main.ts 动态导入
 */

import { mockRoute, extractId } from '@/utils/http/mockRegistry'

// ==================== 认证 ====================
import {
  mockLogin,
  mockGetUserMenuTree,
  mockLogout,
  mockGetPerms,
  mockRefreshToken,
  mockVerifyCaptcha,
  MOCK_USERS
} from './auth'

mockRoute('POST', '/admin/open/login', ({ data }) => mockLogin(data?.username, data?.password))
mockRoute('GET', '/admin/open/person', () => MOCK_USERS[0].userInfo)
mockRoute('GET', '/admin/open/permmenu', () => mockGetUserMenuTree())
mockRoute('POST', '/admin/open/logout', () => mockLogout())
mockRoute('GET', '/admin/open/perms', () => mockGetPerms())
mockRoute('POST', '/admin/open/refreshToken', ({ data }) => mockRefreshToken(data?.refreshToken))
// 注：图形验证码（/api/captcha/image）在 api/captcha.ts 内部直接走 mock，不经此注册表
mockRoute('GET', '/api/captcha/verify', () => mockVerifyCaptcha())

// ==================== 组织管理：部门 / 用户 / 岗位 ====================
import {
  getDepartmentTreeMock,
  getDepartmentListMock,
  addDepartmentMock,
  updateDepartmentMock,
  updateDepartmentStatusMock,
  deleteDepartmentMock,
  getUserListMock,
  getUserDetailMock,
  addUserMock,
  updateUserMock,
  deleteUserMock,
  batchDeleteUsersMock,
  updateUserStatusMock,
  moveUserMock
} from './organization'

import {
  getPositionListMock,
  addPositionMock,
  updatePositionMock,
  deletePositionMock
} from './position'

// 部门
mockRoute('GET', '/admin/sys/department/tree', ({ params }) => getDepartmentTreeMock(params))
mockRoute('GET', '/admin/sys/department/list', ({ params }) => getDepartmentListMock(params))
mockRoute('POST', '/admin/sys/department/add', ({ data }) => addDepartmentMock(data))
mockRoute('PUT', '/admin/sys/department/update', ({ data }) => updateDepartmentMock(data.id, data))
mockRoute('PUT', '/admin/sys/department/update-status', ({ data }) => updateDepartmentStatusMock(data.id, data.status))
mockRoute('DELETE', '/admin/sys/department/delete/:id', ({ url }) => {
  deleteDepartmentMock(extractId(url))
  return {}
})

// 用户
mockRoute('GET', '/admin/sys/user/list', ({ params }) => getUserListMock(params))
mockRoute('GET', '/admin/sys/user/detail/:id', ({ url }) => getUserDetailMock(extractId(url)))
mockRoute('POST', '/admin/sys/user/add', ({ data }) => addUserMock(data))
mockRoute('PUT', '/admin/sys/user/update', ({ data }) => updateUserMock(data.id, data))
mockRoute('PUT', '/admin/sys/user/update-status', ({ data }) => updateUserStatusMock(data.id, data.status))
mockRoute('POST', '/admin/sys/user/batch-delete', ({ data }) => batchDeleteUsersMock(data?.ids))
mockRoute('POST', '/admin/sys/user/move', ({ data }) => moveUserMock(data.userId, data.departmentId))
mockRoute('DELETE', '/admin/sys/user/delete/:id', ({ url }) => {
  deleteUserMock(extractId(url))
  return {}
})

// 岗位
mockRoute('GET', '/admin/sys/position/list', ({ params }) => getPositionListMock(params))
mockRoute('POST', '/admin/sys/position/add', ({ data }) => addPositionMock(data))
mockRoute('PUT', '/admin/sys/position/update', ({ data }) => updatePositionMock(data.id, data))
mockRoute('DELETE', '/admin/sys/position/delete/:id', ({ url }) => {
  deletePositionMock(extractId(url))
  return {}
})

// ==================== 权限管理：角色 / 菜单 ====================
import {
  getRoleListMock,
  getRoleDetailMock,
  addRoleMock,
  updateRoleMock,
  deleteRoleMock,
  batchDeleteRolesMock,
  updateRoleStatusMock,
  getRoleMenusMock,
  setRoleMenusMock,
  getMenuTreeMock,
  getMenuListMock,
  addMenuMock,
  updateMenuMock,
  deleteMenuMock,
  updateMenuStatusMock
} from './permission'

// 角色
mockRoute('GET', '/admin/sys/role/list', ({ params }) => getRoleListMock(params))
mockRoute('GET', '/admin/sys/role/detail/:id', ({ url }) => getRoleDetailMock(extractId(url)))
mockRoute('POST', '/admin/sys/role/add', ({ data }) => addRoleMock(data))
mockRoute('PUT', '/admin/sys/role/update', ({ data }) => updateRoleMock(data.id, data))
mockRoute('PUT', '/admin/sys/role/update-status', ({ data }) => updateRoleStatusMock(data.id, data.status))
mockRoute('POST', '/admin/sys/role/batch-delete', ({ data }) => batchDeleteRolesMock(data?.ids))
mockRoute('GET', '/admin/sys/role/getMenus/:id', ({ url }) => getRoleMenusMock(extractId(url)))
mockRoute('POST', '/admin/sys/role/setMenus', ({ data }) => setRoleMenusMock(data.roleId, data.menuIds))
mockRoute('DELETE', '/admin/sys/role/delete/:id', ({ url }) => {
  deleteRoleMock(extractId(url))
  return {}
})

// 菜单
mockRoute('GET', '/admin/sys/menu/tree', () => getMenuTreeMock())
mockRoute('GET', '/admin/sys/menu/list', () => getMenuListMock())
mockRoute('POST', '/admin/sys/menu/add', ({ data }) => addMenuMock(data))
mockRoute('PUT', '/admin/sys/menu/update', ({ data }) => updateMenuMock(data.id, data))
mockRoute('PUT', '/admin/sys/menu/update-status', ({ data }) => updateMenuStatusMock(data.id, data.status))
mockRoute('DELETE', '/admin/sys/menu/delete/:id', ({ url }) => {
  deleteMenuMock(extractId(url))
  return {}
})

// ==================== 分类管理 ====================
import {
  getCategoryListMock,
  addCategoryMock,
  updateCategoryMock,
  deleteCategoryMock
} from './category'

mockRoute('GET', '/admin/category/list', ({ params }) => getCategoryListMock(params))
mockRoute('POST', '/admin/category/add', ({ data }) => addCategoryMock(data))
mockRoute('PUT', '/admin/category/update', ({ data }) => updateCategoryMock(data.id, data))
mockRoute('DELETE', '/admin/category/delete/:id', ({ url }) => {
  deleteCategoryMock(extractId(url))
  return {}
})

// ==================== 时间轴管理 ====================
import {
  getTimelineListMock,
  addTimelineMock,
  updateTimelineMock,
  deleteTimelineMock
} from './timeline'

mockRoute('GET', '/admin/timeline/list', () => getTimelineListMock())
mockRoute('POST', '/admin/timeline/add', ({ data }) => addTimelineMock(data))
mockRoute('PUT', '/admin/timeline/update', ({ data }) => updateTimelineMock(data.id, data))
mockRoute('DELETE', '/admin/timeline/delete/:id', ({ url }) => {
  deleteTimelineMock(extractId(url))
  return {}
})

// ==================== 关于我管理：个人介绍 / 技能 ====================
import {
  getAboutProfileMock,
  updateAboutProfileMock,
  getSkillListMock,
  addSkillMock,
  updateSkillMock,
  deleteSkillMock
} from './about'

// 个人介绍
mockRoute('GET', '/admin/about/profile', () => getAboutProfileMock())
mockRoute('PUT', '/admin/about/profile', ({ data }) => updateAboutProfileMock(data))

// 技能
mockRoute('GET', '/admin/about/skill/list', () => getSkillListMock())
mockRoute('POST', '/admin/about/skill/add', ({ data }) => addSkillMock(data))
mockRoute('PUT', '/admin/about/skill/update', ({ data }) => updateSkillMock(data.id, data))
mockRoute('DELETE', '/admin/about/skill/delete/:id', ({ url }) => {
  deleteSkillMock(extractId(url))
  return {}
})

// ==================== 作品管理：作品 / 原型版本 / 图片 / 拆解文章 ====================
import {
  getWorkListMock,
  addWorkMock,
  updateWorkMock,
  deleteWorkMock,
  toggleWorkStatusMock,
  toggleWorkFeaturedMock,
  getVersionListMock,
  addVersionMock,
  updateVersionMock,
  deleteVersionMock,
  getImageListMock,
  addImagesMock,
  updateImageMock,
  deleteImageMock,
  getArticleListMock,
  addArticleMock,
  updateArticleMock,
  deleteArticleMock,
  toggleArticleStatusMock
} from './work'

// 作品
mockRoute('GET', '/admin/work/list', ({ params }) => getWorkListMock(params))
mockRoute('POST', '/admin/work/add', ({ data }) => addWorkMock(data))
mockRoute('PUT', '/admin/work/update', ({ data }) => updateWorkMock(data))
mockRoute('PUT', '/admin/work/toggle-status', ({ data }) => toggleWorkStatusMock(data.id))
mockRoute('PUT', '/admin/work/toggle-featured', ({ data }) => toggleWorkFeaturedMock(data.id))
mockRoute('DELETE', '/admin/work/delete/:id', ({ url }) => {
  deleteWorkMock(extractId(url))
  return {}
})

// 原型版本
mockRoute('GET', '/admin/work/version/list', ({ params }) => getVersionListMock(params.workId))
mockRoute('POST', '/admin/work/version/add', ({ data }) => addVersionMock(data))
mockRoute('PUT', '/admin/work/version/update', ({ data }) => updateVersionMock(data.id, data))
mockRoute('DELETE', '/admin/work/version/delete/:id', ({ url }) => {
  deleteVersionMock(extractId(url))
  return {}
})

// 原型图片
mockRoute('GET', '/admin/work/image/list', ({ params }) => getImageListMock(params.versionId))
mockRoute('POST', '/admin/work/image/add', ({ data }) => addImagesMock(data))
mockRoute('PUT', '/admin/work/image/update', ({ data }) => updateImageMock(data.id, data))
mockRoute('DELETE', '/admin/work/image/delete/:id', ({ url }) => {
  deleteImageMock(extractId(url))
  return {}
})

// 拆解文章
mockRoute('GET', '/admin/work/article/list', ({ params }) => getArticleListMock(params.workId))
mockRoute('POST', '/admin/work/article/add', ({ data }) => addArticleMock(data))
mockRoute('PUT', '/admin/work/article/update', ({ data }) => updateArticleMock(data.id, data))
mockRoute('PUT', '/admin/work/article/toggle-status', ({ data }) => toggleArticleStatusMock(data.id))
mockRoute('DELETE', '/admin/work/article/delete/:id', ({ url }) => {
  deleteArticleMock(extractId(url))
  return {}
})

// ==================== 首页配置 ====================
import {
  getHomeConfigMock,
  updateHomeConfigMock,
  getFeaturedWorkOptionsMock
} from './home-config'

mockRoute('GET', '/admin/home-config', () => getHomeConfigMock())
mockRoute('PUT', '/admin/home-config', ({ data }) => updateHomeConfigMock(data))
mockRoute('GET', '/admin/home-config/featured-options', () => getFeaturedWorkOptionsMock())

// ==================== 数据统计 ====================
import { getWorkViewRankMock } from './statistics'

mockRoute('GET', '/admin/statistics/work-views', ({ params }) => getWorkViewRankMock(params))

