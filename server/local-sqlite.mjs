import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import bcrypt from 'bcryptjs'
import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'
import { loadEnvFile } from './prismaClient.mjs'

loadEnvFile()

const runtimeDir = path.join(process.cwd(), '.local')
fs.mkdirSync(runtimeDir, { recursive: true })

const db = new DatabaseSync(path.join(runtimeDir, 'admin-dev.sqlite'))
const app = express()
const port = Number(process.env.SERVER_PORT ?? 4174)
const jwtSecret = process.env.JWT_SECRET ?? 'local-dev-smart-av-secret'

app.use(cors())
app.use(express.json({ limit: '25mb' }))

const editableSections = new Set(['workgroups', 'organizations', 'users', 'content', 'archive'])
const collaborationSections = new Map([
  ['knowledge-files', '文件资料'],
  ['meetings', '会议'],
  ['members', '成员单位'],
])

const initialSettings = {
  platformName: '智慧视听操作系统专委会协同工作平台',
  supportEmail: 'support@abs.cn',
  supportPhone: '010-8888 8888',
  supportTeam: '专委会平台运维组',
  demoTag: '生产预览',
  modules: {
    portal: true,
    workgroups: true,
    files: true,
    members: true,
    meetings: true,
    dynamics: true,
  },
}

const seedRecords = {
  workgroups: [
    {
      key: 'wg-1',
      name: '技术需求与接口规范组',
      committee: '技术与项目管理委员会',
      leader: '华域视联',
      leaderUnit: '华域视联',
      deputy: '星河视研院 / 智芯微电子',
      deputyUnits: ['星河视研院', '智芯微电子'],
      members: 6,
      memberUnits: ['华域视联', '星河视研院', '智芯微电子', '云帆终端', '中视实验室', '未来视界'],
      status: '运行中',
      sort: 1,
      homepage: '已展示',
      updatedAt: '2026-06-24 17:10',
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
      deputyUnits: ['云帆终端', '中视实验室'],
      members: 5,
      memberUnits: ['信通检测院', '云帆终端', '中视实验室', '华域视联', '星河视研院'],
      status: '重点推进',
      sort: 2,
      homepage: '已展示',
      updatedAt: '2026-06-24 11:22',
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
      deputyUnits: ['智媒联合体', '鸿翼生态'],
      members: 4,
      memberUnits: ['未来视界', '智媒联合体', '鸿翼生态', '华域视联'],
      status: '筹备中',
      sort: 3,
      homepage: '待展示',
      updatedAt: '2026-06-23 18:20',
      secretary: '许倩',
      focus: '推进产业推广方案、案例沉淀与外部协同展示材料准备。',
      meetingStatus: '暂无待归档会议，下一场月度例会待排期',
      taskStatus: '2 项推广任务逾期，需协调责任单位补录计划',
      archiveStatus: '会议纪要已建档，成果附件仍需补充',
    },
  ],
  organizations: [
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
  ],
  users: [
    {
      key: 'user-1',
      account: 'zhangwei',
      name: '张伟',
      role: '秘书处管理员',
      scope: '全平台',
      unit: '专委会秘书处',
      status: '启用',
      group: '秘书处',
      lastLogin: '2026-06-25 09:12',
    },
    {
      key: 'user-2',
      account: 'liuting',
      name: '刘婷',
      role: '委员会管理员',
      scope: '技术与项目管理委员会',
      unit: '华域视联',
      status: '启用',
      group: '技术需求与接口规范组',
      lastLogin: '2026-06-24 18:26',
    },
    {
      key: 'user-3',
      account: 'sunhao',
      name: '孙昊',
      role: '工作组秘书',
      scope: '技术需求与接口规范组',
      unit: '星河视研院',
      status: '受限',
      group: '技术需求与接口规范组',
      lastLogin: '2026-06-24 14:08',
    },
  ],
  content: [
    {
      key: 'content-1',
      column: '首页通知',
      title: '关于 6 月工作组协同安排的通知',
      owner: '秘书处',
      updatedAt: '2026-06-24 16:30',
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
      updatedAt: '2026-06-24 10:10',
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
      updatedAt: '2026-06-23 18:40',
      status: '草稿',
      audience: '全体成员',
      priority: '中',
      summary: '说明演示环境维护窗口、影响范围和恢复时间。',
    },
  ],
  archive: [
    {
      key: 'archive-1',
      category: '标准草案',
      item: '《接口能力开放规范（草案）》',
      group: '技术需求与接口规范组',
      retention: '长期',
      status: '待归档',
      owner: '孙昊',
      updatedAt: '2026-06-24',
      notes: '待补秘书处审核意见与签字版附件。',
    },
    {
      key: 'archive-2',
      category: '测试报告',
      item: '终端适配兼容性测试报告',
      group: '测试认证组',
      retention: '长期',
      status: '已归档',
      owner: '赵晨',
      updatedAt: '2026-06-22',
      notes: '归档材料完整，已完成目录登记。',
    },
    {
      key: 'archive-3',
      category: '会议材料',
      item: '产业发展委员会月度会议纪要',
      group: '产业推广组',
      retention: '五年',
      status: '待补附件',
      owner: '许倩',
      updatedAt: '2026-06-21',
      notes: '缺少签到表扫描件和议程附件。',
    },
  ],
  supervision: [
    {
      key: 'supervision-1',
      group: '技术需求与接口规范组',
      committee: '技术与项目管理委员会',
      meetings: '2 场待归档',
      tasks: '1 项逾期',
      result: '2 份待提交',
      risk: '中',
      owner: '孙昊',
    },
    {
      key: 'supervision-2',
      group: '测试认证组',
      committee: '标准与认证委员会',
      meetings: '1 场待上传纪要',
      tasks: '0 项逾期',
      result: '1 份待审核',
      risk: '低',
      owner: '赵晨',
    },
    {
      key: 'supervision-3',
      group: '产业推广组',
      committee: '产业发展委员会',
      meetings: '0',
      tasks: '2 项逾期',
      result: '1 份待立项',
      risk: '高',
      owner: '许倩',
    },
  ],
  logs: [
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
  ],
}

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      account TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      profile TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS records (
      section TEXT NOT NULL,
      record_key TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (section, record_key)
    );
  `)

  const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count
  if (userCount === 0) {
    const passwordHash = bcrypt.hashSync('demo-portal-2026', 10)
    const insertUser = db.prepare('INSERT INTO users (account, password_hash, profile) VALUES (?, ?, ?)')
    const demoUsers = [
      {
        account: 'zhangwei',
        name: '张伟',
        role: '秘书处管理员',
        avatarText: '张',
        roleKey: 'secretariat_admin',
        permissions: ['admin:center:view', 'workgroups:manage', 'admin:data:write', 'admin:settings:write'],
        organizationName: '专委会秘书处',
        currentWorkgroup: '秘书处',
        managementScope: '全平台',
        tags: ['后台认证', '秘书处管理员'],
      },
      {
        account: 'sunhao',
        name: '孙昊',
        role: '技术标准组组长',
        avatarText: '孙',
        roleKey: 'workgroup_leader',
        permissions: ['workgroup:content:manage', 'files:upload', 'members:view'],
        organizationName: '星河视研院',
        currentWorkgroup: '技术标准组',
        managementScope: '本组内容 / 本组资料 / 本组成员',
        tags: ['后台认证', '组长'],
      },
      {
        account: 'wangmin',
        name: '王敏',
        role: '普通用户',
        avatarText: '王',
        roleKey: 'member',
        permissions: [],
        organizationName: '华域视联',
        currentWorkgroup: '技术标准组',
        managementScope: '公开资料 / 授权资料 / 留言反馈',
        tags: ['后台认证', '普通用户'],
      },
    ]

    for (const user of demoUsers) {
      const { account, ...profile } = user
      insertUser.run(account, passwordHash, JSON.stringify(profile))
    }
  }

  const settingCount = db.prepare('SELECT COUNT(*) AS count FROM settings').get().count
  if (settingCount === 0) {
    db.prepare('INSERT INTO settings (id, payload) VALUES (?, ?)').run('default', JSON.stringify(initialSettings))
  }

  const recordCount = db.prepare('SELECT COUNT(*) AS count FROM records').get().count
  if (recordCount === 0) {
    seedAllRecords()
  }
}

function seedAllRecords() {
  const insertRecord = db.prepare('INSERT OR REPLACE INTO records (section, record_key, payload) VALUES (?, ?, ?)')
  for (const [section, records] of Object.entries(seedRecords)) {
    for (const record of records) {
      insertRecord.run(section, record.key, JSON.stringify(record))
    }
  }
}

function getRows(section) {
  return db
    .prepare('SELECT payload FROM records WHERE section = ? ORDER BY created_at ASC')
    .all(section)
    .map((row) => JSON.parse(row.payload))
}

function getRecord(section, key) {
  const row = db.prepare('SELECT payload FROM records WHERE section = ? AND record_key = ?').get(section, key)
  return row ? JSON.parse(row.payload) : null
}

function saveRecord(section, record) {
  db.prepare(
    `INSERT OR REPLACE INTO records (section, record_key, payload, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
  ).run(section, record.key, JSON.stringify(record))
  return record
}

function deleteRecord(section, key) {
  const record = getRecord(section, key)
  if (!record) {
    return null
  }

  db.prepare('DELETE FROM records WHERE section = ? AND record_key = ?').run(section, key)
  return record
}

function getSettings() {
  const row = db.prepare('SELECT payload FROM settings WHERE id = ?').get('default')
  return row ? JSON.parse(row.payload) : initialSettings
}

function saveSettings(settings) {
  db.prepare('INSERT OR REPLACE INTO settings (id, payload) VALUES (?, ?)').run('default', JSON.stringify(settings))
  return settings
}

function nowText() {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function appendLog(action, target, detail, operator = '张伟') {
  const record = {
    key: `log-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    action,
    operator,
    target,
    time: nowText(),
    result: '成功',
    detail,
  }
  saveRecord('logs', record)
}

function buildBootstrapPayload() {
  const tableRows = {}
  for (const section of Object.keys(seedRecords)) {
    tableRows[section] = getRows(section)
  }
  return {
    settings: getSettings(),
    tableRows,
  }
}

function getRecordDisplayName(record) {
  return String(record.name ?? record.title ?? record.item ?? record.account ?? record.key)
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    res.status(401).json({ error: 'missing auth token' })
    return
  }

  try {
    const payload = jwt.verify(token, jwtSecret)
    const row = db.prepare('SELECT profile FROM users WHERE account = ?').get(payload.sub)
    if (!row) {
      res.status(401).json({ error: 'invalid user session' })
      return
    }
    req.user = JSON.parse(row.profile)
    next()
  } catch {
    res.status(401).json({ error: 'invalid auth token' })
  }
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user?.permissions?.includes(permission)) {
      res.status(403).json({ error: 'permission denied' })
      return
    }
    next()
  }
}

initializeDatabase()

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'smart-av-os-local-sqlite-api', time: new Date().toISOString() })
})

app.post('/api/auth/login', (req, res) => {
  const account = String(req.body.account ?? '').trim()
  const password = String(req.body.password ?? '')
  const row = db.prepare('SELECT password_hash, profile FROM users WHERE account = ?').get(account)
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    res.status(401).json({ error: '账号或密码不正确' })
    return
  }

  const profile = JSON.parse(row.profile)
  const token = jwt.sign(
    {
      roleKey: profile.roleKey,
      permissions: profile.permissions ?? [],
    },
    jwtSecret,
    {
      expiresIn: '8h',
      subject: account,
    },
  )

  appendLog('用户登录', profile.name, `账号 ${account} 登录平台`, profile.name)
  res.json({ token, user: profile })
})

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

app.use('/api/admin', requireAuth, requirePermission('admin:center:view'))

app.get('/api/admin/bootstrap', (_req, res) => {
  res.json(buildBootstrapPayload())
})

app.post('/api/admin/reset', requirePermission('admin:settings:write'), (_req, res) => {
  db.prepare('DELETE FROM records').run()
  db.prepare('DELETE FROM settings').run()
  saveSettings(initialSettings)
  seedAllRecords()
  res.json(buildBootstrapPayload())
})

app.get('/api/admin/backup', requirePermission('admin:settings:write'), (_req, res) => {
  const collabRecords = {}
  for (const section of collaborationSections.keys()) {
    collabRecords[section] = getRows(section)
  }

  res.json({
    exportedAt: new Date().toISOString(),
    settings: getSettings(),
    tableRows: buildBootstrapPayload().tableRows,
    collabRecords,
    version: 2,
  })
})

app.post('/api/admin/restore', requirePermission('admin:settings:write'), (req, res) => {
  const payload = req.body ?? {}
  const collabRecords = payload.collabRecords ?? {}

  for (const section of collaborationSections.keys()) {
    db.prepare('DELETE FROM records WHERE section = ?').run(section)
  }

  for (const [section, records] of Object.entries(collabRecords)) {
    if (!collaborationSections.has(section) || !Array.isArray(records)) {
      continue
    }

    for (const row of records) {
      const record = { ...row, id: String(row.id ?? row.key) }
      saveRecord(section, { ...record, key: record.id })
    }
  }

  if (payload.settings) {
    saveSettings(payload.settings)
  }

  appendLog('平台数据恢复', '备份文件', '通过管理中心恢复协同业务数据', req.user.name)
  res.json(buildBootstrapPayload())
})

app.get('/api/admin/settings', (_req, res) => {
  res.json(getSettings())
})

app.put('/api/admin/settings', requirePermission('admin:settings:write'), (req, res) => {
  const settings = saveSettings(req.body)
  appendLog('系统设置保存', settings.platformName, '通过平台管理中心保存系统设置', req.user.name)
  res.json(settings)
})

app.get('/api/admin/:section', (req, res) => {
  if (!seedRecords[req.params.section]) {
    res.status(404).json({ error: 'unknown section' })
    return
  }
  res.json(getRows(req.params.section))
})

app.post('/api/admin/:section', requirePermission('admin:data:write'), (req, res) => {
  if (!editableSections.has(req.params.section)) {
    res.status(404).json({ error: 'section is not creatable' })
    return
  }
  const record = { ...req.body, key: req.body.key ?? `${req.params.section}-${Date.now()}` }
  saveRecord(req.params.section, record)
  appendLog('新增记录', getRecordDisplayName(record), `通过平台管理中心新增${req.params.section}`, req.user.name)
  res.status(201).json(record)
})

app.put('/api/admin/:section/:key', requirePermission('admin:data:write'), (req, res) => {
  if (!editableSections.has(req.params.section)) {
    res.status(404).json({ error: 'section is not editable' })
    return
  }
  const record = { ...req.body, key: req.params.key }
  saveRecord(req.params.section, record)
  appendLog('编辑记录', getRecordDisplayName(record), `通过平台管理中心编辑${req.params.section}`, req.user.name)
  res.json(record)
})

app.patch('/api/admin/:section/:key', requirePermission('admin:data:write'), (req, res) => {
  const record = getRecord(req.params.section, req.params.key)
  if (!record) {
    res.status(404).json({ error: 'record not found' })
    return
  }
  const nextRecord = { ...record, ...req.body }
  saveRecord(req.params.section, nextRecord)
  res.json(nextRecord)
})

app.delete('/api/admin/:section/:key', requirePermission('admin:data:write'), (req, res) => {
  if (!editableSections.has(req.params.section)) {
    res.status(404).json({ error: 'section is not deletable' })
    return
  }
  const record = deleteRecord(req.params.section, req.params.key)
  if (!record) {
    res.status(404).json({ error: 'record not found' })
    return
  }
  appendLog('删除记录', getRecordDisplayName(record), `通过平台管理中心删除${req.params.section}`, req.user.name)
  res.json(record)
})

app.use('/api/collab', requireAuth)

app.get('/api/collab/:section', (req, res) => {
  if (!collaborationSections.has(req.params.section)) {
    res.status(404).json({ error: 'unknown collaboration section' })
    return
  }

  res.json(getRows(req.params.section))
})

app.post('/api/collab/:section/bootstrap', (req, res) => {
  const sectionLabel = collaborationSections.get(req.params.section)
  if (!sectionLabel) {
    res.status(404).json({ error: 'unknown collaboration section' })
    return
  }

  const rows = Array.isArray(req.body.records) ? req.body.records : []
  if (getRows(req.params.section).length === 0 && rows.length > 0) {
    for (const row of rows) {
      const record = { ...row, id: String(row.id ?? row.key) }
      saveRecord(req.params.section, { ...record, key: record.id })
    }
    appendLog(`${sectionLabel}初始化`, `${rows.length} 条记录`, `初始化${sectionLabel}业务数据`, req.user.name)
  }

  res.json(getRows(req.params.section))
})

app.post('/api/collab/:section', (req, res) => {
  const sectionLabel = collaborationSections.get(req.params.section)
  if (!sectionLabel) {
    res.status(404).json({ error: 'unknown collaboration section' })
    return
  }

  const record = {
    ...req.body,
    id: String(req.body.id ?? `${req.params.section}-${Date.now()}`),
  }
  saveRecord(req.params.section, { ...record, key: record.id })
  appendLog(`${sectionLabel}保存`, getRecordDisplayName(record), `保存${sectionLabel}业务记录`, req.user.name)
  res.status(201).json(record)
})

app.post('/api/collab/:section/:key/audit', (req, res) => {
  const sectionLabel = collaborationSections.get(req.params.section)
  if (!sectionLabel) {
    res.status(404).json({ error: 'unknown collaboration section' })
    return
  }

  const action = String(req.body.action ?? `${sectionLabel}访问`)
  const detail = String(req.body.detail ?? `访问${sectionLabel}业务记录`)
  appendLog(action, String(req.body.target ?? req.params.key), detail, req.user.name)
  res.json({ ok: true })
})

app.put('/api/collab/:section/:key', (req, res) => {
  const sectionLabel = collaborationSections.get(req.params.section)
  if (!sectionLabel) {
    res.status(404).json({ error: 'unknown collaboration section' })
    return
  }

  const record = { ...req.body, id: req.params.key, key: req.params.key }
  saveRecord(req.params.section, record)
  appendLog(`${sectionLabel}更新`, getRecordDisplayName(record), `更新${sectionLabel}业务记录`, req.user.name)
  res.json(record)
})

app.delete('/api/collab/:section/:key', (req, res) => {
  const sectionLabel = collaborationSections.get(req.params.section)
  if (!sectionLabel) {
    res.status(404).json({ error: 'unknown collaboration section' })
    return
  }

  const record = deleteRecord(req.params.section, req.params.key)
  if (!record) {
    res.status(404).json({ error: 'record not found' })
    return
  }

  appendLog(`${sectionLabel}删除`, getRecordDisplayName(record), `删除${sectionLabel}业务记录`, req.user.name)
  res.json(record)
})

app.listen(port, () => {
  console.log(`local sqlite admin api listening on http://localhost:${port}/api`)
})
