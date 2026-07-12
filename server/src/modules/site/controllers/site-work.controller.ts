import { Controller, Get, Param, Req } from '@nestjs/common'
import type { Request } from 'express'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { Public, ApiResult, ApiArrayResult } from '@/common/decorators'
import { BaseController } from '@/common/crud'
import { SiteWorkService } from '../services/site-work.service'
import { SiteWorkItemVo, SiteWorkDetailVo } from '../vo/site-work.vo'

/**
 * 展示站点作品控制器
 * 提供公开的作品列表与详情 API 端点（无需登录鉴权），供 website 前端调用。
 * 均为已发布作品（草稿隔离）。
 */
@ApiTags('展示站点')
@Controller('site/works')
export class SiteWorkController extends BaseController {
  constructor(private readonly siteWorkService: SiteWorkService) {
    super()
  }

  /**
   * 获取全部已发布作品列表
   * 无需登录鉴权，草稿隔离，按发布日期倒序。
   */
  @Public()
  @Get()
  @ApiOperation({ summary: '展示站点作品列表（公开，无需登录）' })
  @ApiArrayResult(SiteWorkItemVo)
  async getWorks() {
    return this.ok(await this.siteWorkService.getWorks())
  }

  /**
   * 按 slug 获取作品详情
   * 无需登录鉴权；slug 不存在或指向草稿时返回 code=404（前端展示未找到态）。
   * 命中已发布作品后，以「访问来源指纹 + 自然日」去重累加访问量，累加为异步副作用，
   * 失败不影响详情正常返回。
   */
  @Public()
  @Get(':slug')
  @ApiOperation({ summary: '展示站点作品详情（公开，无需登录）' })
  @ApiParam({ name: 'slug', description: '作品唯一标识' })
  @ApiResult(SiteWorkDetailVo)
  async getWorkDetail(@Param('slug') slug: string, @Req() req: Request) {
    const detail = await this.siteWorkService.getWorkDetail(slug)
    if (!detail) {
      return this.fail('作品不存在或已下架', 404)
    }
    // 解析访客来源用于去重指纹：优先取反代透传的真实 IP，回退到直连地址
    const ip = this.resolveClientIp(req)
    const userAgent = req.headers['user-agent'] ?? ''
    // fire-and-forget：不 await，避免统计写库延迟阻塞详情响应；异常已在 service 内部兜底
    void this.siteWorkService.recordView(detail.id, ip, userAgent)
    return this.ok(detail)
  }

  /**
   * 解析客户端真实 IP
   * 经 Nginx 反代时真实 IP 在 X-Forwarded-For 首段，取不到再回退 req.ip / 直连 socket 地址。
   * @param req Express 请求对象
   * @returns 客户端 IP，全部取不到时返回空串
   */
  private resolveClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for']
    const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded
    if (raw) {
      // X-Forwarded-For 可能是「client, proxy1, proxy2」，取首段为原始客户端
      const first = raw.split(',')[0]?.trim()
      if (first) return first
    }
    return req.ip ?? req.socket?.remoteAddress ?? ''
  }
}
