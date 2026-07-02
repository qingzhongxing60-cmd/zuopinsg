import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma.service';

/**
 * 种子数据初始化服务
 *
 * 编译进 dist，生产环境无需 ts-node 即可运行。
 * 幂等：所有写入用 upsert / 存在性检查，可重复执行。
 */
@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** 执行种子数据初始化（超级管理员 + 默认角色 + 系统菜单） */
  async run(): Promise<void> {
    this.logger.log('开始初始化种子数据...');

    const password = await bcrypt.hash('123456', 12);

    const admin = await this.prisma.sysUser.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password,
        name: '超级管理员',
        nickName: 'Admin',
        status: 1,
        passwordV: 1,
      },
    });

    const adminRole = await this.prisma.sysRole.upsert({
      where: { label: 'admin' },
      update: {},
      create: {
        name: '管理员',
        label: 'admin',
        remark: '系统默认管理员角色',
        relevance: 1,
        status: 1,
      },
    });

    await this.prisma.sysUserRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
      update: {},
      create: { userId: admin.id, roleId: adminRole.id },
    });

    await this.seedMenus();
    await this.seedPositions();

    this.logger.log('种子数据初始化完成，请登录后立即修改默认管理员密码');
  }


  /** 初始化系统菜单（type: 0=目录 1=菜单 2=权限按钮）；按 router 幂等，缺失即补 */
  private async seedMenus(): Promise<void> {
    // 单管理员模式仅保留「人员管理」一级菜单用于账号管理（排在最底部，见下方）；
    // 组织管理目录、部门管理页/角色管理页/菜单管理页等多用户 RBAC 管理菜单不再生成（对应 API 仍保留，供人员管理页内部调用）。

    // 业务模块菜单（作品集系统）
    const workDir = await this.ensureMenu({ name: '作品管理', type: 0, router: '/work', icon: 'Briefcase', orderNum: 10 });
    await this.ensureMenu({ name: '作品列表', type: 1, router: '/work/list', perms: 'work:list', orderNum: 1, parentId: workDir.id });
    await this.ensureMenu({ name: '原型版本', type: 1, router: '/work/prototype', perms: 'work:version:list', orderNum: 2, parentId: workDir.id });
    await this.ensureMenu({ name: '拆解文章', type: 1, router: '/work/article', perms: 'work:article:list', orderNum: 3, parentId: workDir.id });

    await this.ensureMenu({ name: '分类管理', type: 1, router: '/category', icon: 'Collection', perms: 'category:list', orderNum: 11 });
    await this.ensureMenu({ name: '时间轴管理', type: 1, router: '/timeline', icon: 'Calendar', perms: 'timeline:list', orderNum: 12 });
    await this.ensureMenu({ name: '关于我管理', type: 1, router: '/about', icon: 'User', perms: 'about:skill-list', orderNum: 13 });
    await this.ensureMenu({ name: '首页配置', type: 1, router: '/home-config', icon: 'HomeFilled', perms: 'home-config:update', orderNum: 14 });
    await this.ensureMenu({ name: '数据统计', type: 1, router: '/statistics', icon: 'TrendCharts', perms: 'statistics:work-views', orderNum: 15 });

    // 人员管理（账号管理）排在最底部
    await this.ensureMenu({ name: '人员管理', type: 1, router: '/organization/user', icon: 'User', perms: 'sys:user:list', orderNum: 20 });

    this.logger.log('系统菜单已初始化（按钮权限由 PermsSyncService 自动登记）');
  }

  /** 按 router 幂等创建菜单：存在则返回现有记录，缺失则创建（并发冲突时回查兜底） */
  private async ensureMenu(data: {
    name: string;
    type: number;
    router: string;
    icon?: string;
    perms?: string;
    orderNum: number;
    parentId?: number;
  }) {
    const existing = await this.prisma.sysMenu.findFirst({ where: { router: data.router, type: data.type } });
    if (existing) return existing;
    try {
      return await this.prisma.sysMenu.create({ data });
    } catch {
      // 并发场景下可能已被其他进程创建，回查返回现有记录
      const created = await this.prisma.sysMenu.findFirst({ where: { router: data.router, type: data.type } });
      if (created) return created;
      throw new Error(`菜单初始化失败: ${data.router}`);
    }
  }

  /** 初始化默认岗位数据（巡检员/维修工等）；已存在则跳过 */
  private async seedPositions(): Promise<void> {
    const existing = await this.prisma.sysPosition.count();
    if (existing > 0) {
      this.logger.log('岗位已存在，跳过岗位初始化');
      return;
    }

    await this.prisma.sysPosition.createMany({
      data: [
        { name: '巡检员', description: '负责日常设备巡检工作', orderNum: 1 },
        { name: '维修工', description: '负责设备维修保养工作', orderNum: 2 },
        { name: '安全员', description: '负责安全监督检查工作', orderNum: 3 },
        { name: '班组长', description: '负责班组日常管理工作', orderNum: 4 },
        { name: '部门经理', description: '负责部门整体管理工作', orderNum: 5 },
      ],
    });

    this.logger.log('默认岗位已初始化');
  }
}
