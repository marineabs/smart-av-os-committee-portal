import { createPrismaClient } from '../server/prismaClient.mjs'
import bcrypt from 'bcryptjs'

const prisma = createPrismaClient()

const json = (value) => JSON.stringify(value)

function resolvePermissions(roleCode) {
  if (roleCode === 'platform_admin' || roleCode === 'secretariat_admin') {
    return ['admin:center:view', 'workgroups:manage', 'admin:data:write', 'admin:settings:write']
  }

  if (roleCode === 'committee_admin') {
    return ['admin:center:view', 'workgroups:manage', 'admin:data:write']
  }

  if (roleCode === 'workgroup_secretary' || roleCode === 'workgroup_leader') {
    return ['workgroup:content:manage', 'files:upload', 'members:view']
  }

  return []
}

const roles = [
  { code: 'platform_admin', name: '平台管理员', description: '拥有平台全局配置、用户权限和审计管理权限' },
  { code: 'secretariat_admin', name: '秘书处管理员', description: '负责工作组、成员单位、内容发布和资料归档管理' },
  { code: 'committee_admin', name: '委员会管理员', description: '负责所属委员会范围内的工作组协同管理' },
  { code: 'workgroup_leader', name: '工作组组长', description: '负责本组内容维护、资料上传和组内协作管理' },
  { code: 'workgroup_secretary', name: '工作组秘书', description: '负责工作组日常协作、会议和资料维护' },
  { code: 'member', name: '普通用户', description: '浏览授权内容、下载资料并参与留言反馈' },
]

const workgroups = [
  {
    key: 'wg-1',
    name: '技术需求与接口规范组',
    committee: '技术与项目管理委员会',
    leader: '华域视联',
    leaderUnit: '华域视联',
    deputy: '星河视研院 / 智芯微电子',
    deputyUnits: json(['星河视研院', '智芯微电子']),
    members: 6,
    memberUnits: json(['华域视联', '星河视研院', '智芯微电子', '云帆终端', '中视实验室', '未来视界']),
    status: '运行中',
    sort: 1,
    homepage: '已展示',
    updatedAtText: '2026-06-24 17:10',
    secretary: '孙昊',
    focus: '牵头推进接口规范草案、能力开放目录和跨单位需求收敛。',
    meetingStatus: '本月 2 场会议，1 份纪要待补签字版',
    taskStatus: '6 项任务进行中，其中 1 项本周需回填进展',
    archiveStatus: '标准草案和评审意见已纳入本月重点归档清单',
  },
  {
    key: 'wg-2',
    name: '测试认证组',
    committee: '标准与认证委员会',
    leader: '信通检测院',
    leaderUnit: '信通检测院',
    deputy: '云帆终端 / 中视实验室',
    deputyUnits: json(['云帆终端', '中视实验室']),
    members: 5,
    memberUnits: json(['信通检测院', '云帆终端', '中视实验室', '华域视联', '星河视研院']),
    status: '重点推进',
    sort: 2,
    homepage: '已展示',
    updatedAtText: '2026-06-24 11:22',
    secretary: '赵晨',
    focus: '聚焦终端兼容性测试、认证流程模板和联调结果复核。',
    meetingStatus: '联调例会已完成，待上传一份会议纪要',
    taskStatus: '测试任务节奏平稳，暂无逾期事项',
    archiveStatus: '已归档 1 份测试报告，2 份附件待补全',
  },
  {
    key: 'wg-3',
    name: '产业推广组',
    committee: '产业发展委员会',
    leader: '未来视界',
    leaderUnit: '未来视界',
    deputy: '智媒联合体 / 鸿翼生态',
    deputyUnits: json(['智媒联合体', '鸿翼生态']),
    members: 4,
    memberUnits: json(['未来视界', '智媒联合体', '鸿翼生态', '华域视联']),
    status: '筹备中',
    sort: 3,
    homepage: '待展示',
    updatedAtText: '2026-06-23 18:20',
    secretary: '许倩',
    focus: '推进产业推广方案、案例沉淀与外部协同展示材料准备。',
    meetingStatus: '暂无待归档会议，下一场月度例会待排期',
    taskStatus: '2 项推广任务逾期，需协调责任单位补录计划',
    archiveStatus: '会议纪要已建档，成果附件仍需补充',
  },
]

const organizations = [
  {
    key: 'org-1',
    name: '华域视联',
    type: '副理事长单位',
    liaison: '李工',
    phone: '13800001234',
    groups: 3,
    status: '已加入',
    participation: '技术需求与接口规范组 / 测试认证组 / AI 智能体组',
    joinedAt: '2025-12-18',
  },
  {
    key: 'org-2',
    name: '星河视研院',
    type: '成员单位',
    liaison: '周老师',
    phone: '13900004567',
    groups: 2,
    status: '已加入',
    participation: '技术需求与接口规范组 / 产业推广组',
    joinedAt: '2026-01-08',
  },
  {
    key: 'org-3',
    name: '智芯微电子',
    type: '成员单位',
    liaison: '王经理',
    phone: '13600007890',
    groups: 1,
    status: '待扩权',
    participation: '技术需求与接口规范组',
    joinedAt: '2026-03-16',
  },
]

const users = [
  {
    key: 'user-1',
    account: 'zhangwei',
    name: '张伟',
    roleName: '秘书处管理员',
    scope: '全平台',
    unit: '专委会秘书处',
    status: '启用',
    groupName: '秘书处',
    lastLogin: '2026-06-25 09:12',
    roleCode: 'secretariat_admin',
  },
  {
    key: 'user-2',
    account: 'liuting',
    name: '刘婷',
    roleName: '委员会管理员',
    scope: '技术与项目管理委员会',
    unit: '华域视联',
    status: '启用',
    groupName: '技术需求与接口规范组',
    lastLogin: '2026-06-24 18:26',
    roleCode: 'committee_admin',
  },
  {
    key: 'user-3',
    account: 'sunhao',
    name: '孙昊',
    roleName: '技术标准组组长',
    scope: '技术标准组',
    unit: '星河视研院',
    status: '启用',
    groupName: '技术标准组',
    lastLogin: '2026-06-24 14:08',
    roleCode: 'workgroup_leader',
  },
  {
    key: 'user-4',
    account: 'wangmin',
    name: '王敏',
    roleName: '普通用户',
    scope: '公开资料 / 授权资料 / 留言反馈',
    unit: '华域视联',
    status: '启用',
    groupName: '技术标准组',
    lastLogin: '2026-06-23 16:42',
    roleCode: 'member',
  },
]

const contentItems = [
  {
    key: 'content-1',
    column: '首页通知',
    title: '关于 6 月工作组协同安排的通知',
    owner: '秘书处',
    updatedAtText: '2026-06-24 16:30',
    status: '已发布',
    audience: '全体成员',
    priority: '高',
    summary: '明确 6 月各工作组协同节奏、会议窗口和材料回填要求。',
  },
  {
    key: 'content-2',
    column: '工作组动态',
    title: '接口规范组发布草案 V0.9',
    owner: '委员会管理员',
    updatedAtText: '2026-06-24 10:10',
    status: '待复核',
    audience: '相关工作组',
    priority: '中',
    summary: '同步接口规范组草案版本更新，等待委员会管理员复核后发布。',
  },
  {
    key: 'content-3',
    column: '平台公告',
    title: '演示环境维护窗口说明',
    owner: '平台管理员',
    updatedAtText: '2026-06-23 18:40',
    status: '草稿',
    audience: '全体成员',
    priority: '中',
    summary: '说明演示环境维护窗口、影响范围和恢复时间。',
  },
]

const archives = [
  {
    key: 'archive-1',
    category: '标准草案',
    item: '《接口能力开放规范（草案）》',
    groupName: '技术需求与接口规范组',
    retention: '长期',
    status: '待归档',
    owner: '孙昊',
    updatedAtText: '2026-06-24',
    notes: '待补秘书处审核意见与签字版附件。',
  },
  {
    key: 'archive-2',
    category: '测试报告',
    item: '终端适配兼容性测试报告',
    groupName: '测试认证组',
    retention: '长期',
    status: '已归档',
    owner: '赵晨',
    updatedAtText: '2026-06-22',
    notes: '归档材料完整，已完成目录登记。',
  },
  {
    key: 'archive-3',
    category: '会议材料',
    item: '产业发展委员会月度会议纪要',
    groupName: '产业推广组',
    retention: '五年',
    status: '待补附件',
    owner: '许倩',
    updatedAtText: '2026-06-21',
    notes: '缺少签到表扫描件和议程附件。',
  },
]

const supervisionItems = [
  {
    key: 'supervision-1',
    groupName: '技术需求与接口规范组',
    committee: '技术与项目管理委员会',
    meetings: '2 场待归档',
    tasks: '1 项逾期',
    result: '2 份待提交',
    risk: '中',
    owner: '孙昊',
  },
  {
    key: 'supervision-2',
    groupName: '测试认证组',
    committee: '标准与认证委员会',
    meetings: '1 场待上传纪要',
    tasks: '0 项逾期',
    result: '1 份待审核',
    risk: '低',
    owner: '赵晨',
  },
  {
    key: 'supervision-3',
    groupName: '产业推广组',
    committee: '产业发展委员会',
    meetings: '0',
    tasks: '2 项逾期',
    result: '1 份待立项',
    risk: '高',
    owner: '许倩',
  },
]

const logs = [
  {
    key: 'log-1',
    action: '工作组信息更新',
    operator: '张伟',
    target: '技术需求与接口规范组',
    time: '2026-06-24 17:10',
    result: '成功',
    detail: '调整首页展示顺序、更新组长单位信息',
  },
  {
    key: 'log-2',
    action: '权限角色调整',
    operator: '平台管理员',
    target: 'liuting / 委员会管理员',
    time: '2026-06-24 15:42',
    result: '成功',
    detail: '新增内容发布复核权限',
  },
  {
    key: 'log-3',
    action: '内容发布撤回',
    operator: '刘婷',
    target: '首页通知 / 协同安排',
    time: '2026-06-24 11:03',
    result: '已撤回',
    detail: '因发布时间需要调整而撤回',
  },
]

async function main() {
  const defaultPasswordHash = await bcrypt.hash('demo-portal-2026', 10)

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: role,
      create: role,
    })
  }

  const roleMap = new Map((await prisma.role.findMany()).map((role) => [role.code, role.id]))

  for (const user of users) {
    const { roleCode, ...data } = user
    await prisma.adminUser.upsert({
      where: { key: user.key },
      update: {
        ...data,
        passwordHash: defaultPasswordHash,
        permissions: json(resolvePermissions(roleCode)),
        roleId: roleMap.get(roleCode),
        roleKey: roleCode,
      },
      create: {
        ...data,
        passwordHash: defaultPasswordHash,
        permissions: json(resolvePermissions(roleCode)),
        roleId: roleMap.get(roleCode),
        roleKey: roleCode,
      },
    })
  }

  for (const data of workgroups) {
    await prisma.workgroup.upsert({ where: { key: data.key }, update: data, create: data })
  }

  for (const data of organizations) {
    await prisma.organization.upsert({ where: { key: data.key }, update: data, create: data })
  }

  for (const data of contentItems) {
    await prisma.contentItem.upsert({ where: { key: data.key }, update: data, create: data })
  }

  for (const data of archives) {
    await prisma.archiveItem.upsert({ where: { key: data.key }, update: data, create: data })
  }

  for (const data of supervisionItems) {
    await prisma.supervisionItem.upsert({ where: { key: data.key }, update: data, create: data })
  }

  for (const data of logs) {
    await prisma.operationLog.upsert({ where: { key: data.key }, update: data, create: data })
  }

  await prisma.systemSetting.upsert({
    where: { singletonKey: 'default' },
    update: {},
    create: {
      singletonKey: 'default',
      platformName: '智慧视听操作系统专委会协同工作平台',
      supportEmail: 'support@abs.cn',
      supportPhone: '010-8888 8888',
      supportTeam: '专委会平台运维组',
      demoTag: '生产预览',
      modules: json({
        portal: true,
        workgroups: true,
        files: true,
        members: true,
        meetings: true,
        dynamics: true,
      }),
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
