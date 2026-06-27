import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import bcrypt from 'bcryptjs'
import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'
import { buildAnalyticsSummary } from './analyticsSummary.mjs'
import { createPrismaClient, loadEnvFile } from './prismaClient.mjs'

const execFileAsync = promisify(execFile)

loadEnvFile()

const prisma = createPrismaClient()
const app = express()
const port = Number(process.env.SERVER_PORT ?? 4174)
const jwtSecret = process.env.JWT_SECRET ?? 'local-dev-smart-av-secret'

app.use(cors())
app.use(express.json({ limit: '25mb' }))

function parseJsonList(value) {
  try {
    const parsed = JSON.parse(value || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function toUserProfile(user) {
  return {
    name: user.name,
    role: user.roleName,
    avatarText: user.name.slice(0, 1),
    roleKey: user.roleKey,
    permissions: parseJsonList(user.permissions),
    organizationName: user.unit,
    currentWorkgroup: user.groupName,
    managementScope: user.scope,
    tags: [user.roleName, user.status, '后台认证'],
  }
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) {
    res.status(401).json({ error: 'missing auth token' })
    return
  }

  try {
    const payload = jwt.verify(token, jwtSecret)
    const user = await prisma.adminUser.findUnique({ where: { key: payload.sub } })
    if (!user || user.status !== '启用') {
      res.status(401).json({ error: 'invalid user session' })
      return
    }

    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'invalid auth token' })
  }
}

function requirePermission(permission) {
  return (req, res, next) => {
    const permissions = parseJsonList(req.user?.permissions)
    if (!permissions.includes(permission)) {
      res.status(403).json({ error: 'permission denied' })
      return
    }

    next()
  }
}

const sectionMap = {
  workgroups: {
    model: prisma.workgroup,
    createAction: '工作组新增',
    editAction: '工作组信息编辑',
    deleteAction: '工作组删除',
    label: '工作组',
    toRecord: (row) => ({
      key: row.key,
      name: row.name,
      committee: row.committee,
      leader: row.leader,
      leaderUnit: row.leaderUnit,
      deputy: row.deputy,
      deputyUnits: parseList(row.deputyUnits),
      members: row.members,
      memberUnits: parseList(row.memberUnits),
      status: row.status,
      sort: row.sort,
      homepage: row.homepage,
      updatedAt: row.updatedAtText,
      secretary: row.secretary,
      focus: row.focus,
      meetingStatus: row.meetingStatus,
      taskStatus: row.taskStatus,
      archiveStatus: row.archiveStatus,
    }),
    toData: (record) => {
      const deputyUnits = getList(record.deputyUnits ?? record.deputyUnitsText ?? record.deputy)
      const memberUnits = getList(record.memberUnits ?? record.memberUnitsText)
      return {
        name: String(record.name ?? ''),
        committee: String(record.committee ?? ''),
        leader: String(record.leaderUnit ?? record.leader ?? ''),
        leaderUnit: String(record.leaderUnit ?? record.leader ?? ''),
        deputy: deputyUnits.join(' / '),
        deputyUnits: JSON.stringify(deputyUnits),
        members: Number(record.members ?? memberUnits.length),
        memberUnits: JSON.stringify(memberUnits),
        status: String(record.status ?? '筹备中'),
        sort: Number(record.sort ?? 0),
        homepage: String(record.homepage ?? '待展示'),
        updatedAtText: String(record.updatedAt ?? nowText()),
        secretary: String(record.secretary ?? ''),
        focus: String(record.focus ?? ''),
        meetingStatus: String(record.meetingStatus ?? ''),
        taskStatus: String(record.taskStatus ?? ''),
        archiveStatus: String(record.archiveStatus ?? ''),
      }
    },
  },
  organizations: {
    model: prisma.organization,
    createAction: '成员单位新增',
    editAction: '成员单位信息编辑',
    deleteAction: '成员单位删除',
    label: '成员单位',
    toRecord: (row) => ({
      key: row.key,
      name: row.name,
      type: row.type,
      liaison: row.liaison,
      phone: row.phone,
      groups: row.groups,
      status: row.status,
      participation: row.participation,
      joinedAt: row.joinedAt,
    }),
    toData: (record) => ({
      name: String(record.name ?? ''),
      type: String(record.type ?? ''),
      liaison: String(record.liaison ?? ''),
      phone: String(record.phone ?? ''),
      groups: Number(record.groups ?? countParts(record.participation)),
      status: String(record.status ?? '已加入'),
      participation: String(record.participation ?? ''),
      joinedAt: String(record.joinedAt ?? ''),
    }),
  },
  users: {
    model: prisma.adminUser,
    createAction: '用户账号新增',
    editAction: '用户权限编辑',
    deleteAction: '用户账号删除',
    label: '用户账号',
    toRecord: (row) => ({
      key: row.key,
      account: row.account,
      name: row.name,
      role: row.roleName,
      scope: row.scope,
      unit: row.unit,
      status: row.status,
      group: row.groupName,
      lastLogin: row.lastLogin,
    }),
    toData: (record) => ({
      account: String(record.account ?? ''),
      name: String(record.name ?? ''),
      roleName: String(record.role ?? record.roleName ?? ''),
      scope: String(record.scope ?? ''),
      unit: String(record.unit ?? ''),
      status: String(record.status ?? '启用'),
      groupName: String(record.group ?? record.groupName ?? ''),
      lastLogin: String(record.lastLogin ?? ''),
    }),
  },
  content: {
    model: prisma.contentItem,
    createAction: '内容发布新增',
    editAction: '内容发布编辑',
    deleteAction: '内容发布删除',
    label: '发布内容',
    toRecord: (row) => ({
      key: row.key,
      column: row.column,
      title: row.title,
      owner: row.owner,
      updatedAt: row.updatedAtText,
      status: row.status,
      audience: row.audience,
      priority: row.priority,
      summary: row.summary,
    }),
    toData: (record) => ({
      column: String(record.column ?? ''),
      title: String(record.title ?? ''),
      owner: String(record.owner ?? ''),
      updatedAtText: String(record.updatedAt ?? nowText()),
      status: String(record.status ?? '草稿'),
      audience: String(record.audience ?? ''),
      priority: String(record.priority ?? '中'),
      summary: String(record.summary ?? ''),
    }),
  },
  archive: {
    model: prisma.archiveItem,
    createAction: '归档任务新增',
    editAction: '归档资料编辑',
    deleteAction: '归档资料删除',
    label: '归档资料',
    toRecord: (row) => ({
      key: row.key,
      category: row.category,
      item: row.item,
      group: row.groupName,
      retention: row.retention,
      status: row.status,
      owner: row.owner,
      updatedAt: row.updatedAtText,
      notes: row.notes,
    }),
    toData: (record) => ({
      category: String(record.category ?? ''),
      item: String(record.item ?? ''),
      groupName: String(record.group ?? record.groupName ?? ''),
      retention: String(record.retention ?? ''),
      status: String(record.status ?? '待归档'),
      owner: String(record.owner ?? ''),
      updatedAtText: String(record.updatedAt ?? todayText()),
      notes: String(record.notes ?? ''),
    }),
  },
  supervision: {
    model: prisma.supervisionItem,
    label: '监管事项',
    toRecord: (row) => ({
      key: row.key,
      group: row.groupName,
      committee: row.committee,
      meetings: row.meetings,
      tasks: row.tasks,
      result: row.result,
      risk: row.risk,
      owner: row.owner,
    }),
    toData: (record) => ({
      groupName: String(record.group ?? record.groupName ?? ''),
      committee: String(record.committee ?? ''),
      meetings: String(record.meetings ?? ''),
      tasks: String(record.tasks ?? ''),
      result: String(record.result ?? ''),
      risk: String(record.risk ?? '低'),
      owner: String(record.owner ?? ''),
    }),
  },
  logs: {
    model: prisma.operationLog,
    label: '操作日志',
    toRecord: (row) => ({
      key: row.key,
      action: row.action,
      operator: row.operator,
      target: row.target,
      time: row.time,
      result: row.result,
      detail: row.detail,
    }),
    toData: (record) => ({
      action: String(record.action ?? ''),
      operator: String(record.operator ?? ''),
      target: String(record.target ?? ''),
      time: String(record.time ?? nowText()),
      result: String(record.result ?? '成功'),
      detail: String(record.detail ?? ''),
    }),
  },
}

const collaborationSections = new Map([
  ['knowledge-files', '文件资料'],
  ['meetings', '会议'],
  ['members', '成员单位'],
])

const searchScopeToSection = new Map([
  ['工作组', 'workgroups'],
  ['文件', 'knowledge-files'],
  ['会议', 'meetings'],
  ['成员', 'members'],
])

function parseList(value) {
  try {
    const parsed = JSON.parse(value || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function getList(value) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean)
  }

  return String(value ?? '')
    .split(/\n|\/|、|,|，/g)
    .map((item) => item.trim())
    .filter(Boolean)
}

function countParts(value) {
  return getList(value).length
}

function todayText() {
  return new Date().toISOString().slice(0, 10)
}

function nowText() {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function buildKey(section) {
  return `${section}-${Date.now()}`
}

function getRecordDisplayName(record) {
  return String(record.name ?? record.title ?? record.item ?? record.account ?? record.key)
}

function parsePayloadRecord(row) {
  try {
    return JSON.parse(row.payload)
  } catch {
    return { id: row.key }
  }
}

function normalizeSearchText(value) {
  return String(value ?? '').trim().toLowerCase()
}

function tokenizeKeyword(keyword) {
  const normalized = normalizeSearchText(keyword)
  return normalized ? normalized.split(/\s+/).filter(Boolean) : []
}

function toSearchMetaList(values) {
  return values.flatMap((value) => {
    if (Array.isArray(value)) {
      return value.map(String).map((item) => item.trim()).filter(Boolean)
    }

    const text = String(value ?? '').trim()
    return text ? [text] : []
  })
}

function buildSearchDataset({ workgroups = [], files = [], meetings = [], members = [] }) {
  const workgroupResults = workgroups.map((record) => ({
    id: `workgroup-${record.key ?? record.id}`,
    scope: '工作组',
    title: String(record.name ?? ''),
    summary: String(record.focus ?? record.positioning ?? record.latestUpdate ?? record.status ?? ''),
    meta: toSearchMetaList([
      record.committee,
      record.leaderUnit ?? record.leader,
      record.deputyUnits ?? record.deputy,
      record.status,
      record.updatedAt ?? record.latestUpdate,
      record.secretary,
      record.meetingStatus,
      record.taskStatus,
      record.archiveStatus,
    ]),
    sortText: String(record.updatedAt ?? record.latestUpdate ?? ''),
  }))

  const fileResults = files.map((record) => ({
    id: `file-${record.id ?? record.key}`,
    scope: '文件',
    title: String(record.title ?? ''),
    summary: [record.categoryLabel, record.status, record.permission].filter(Boolean).join(' / '),
    meta: toSearchMetaList([record.workgroup, record.uploader, record.version, record.updatedAt, record.description]),
    sortText: String(record.updatedAt ?? ''),
  }))

  const meetingResults = meetings.map((record) => ({
    id: `meeting-${record.id ?? record.key}`,
    scope: '会议',
    title: String(record.title ?? ''),
    summary: String(record.summary ?? ''),
    meta: toSearchMetaList([record.workgroup, record.ownerUnit, record.time, record.minutesStatus]),
    sortText: String(record.time ?? ''),
  }))

  const memberResults = members.map((record) => ({
    id: `member-${record.id ?? record.key}`,
    scope: '成员',
    title: String(record.name ?? ''),
    summary: String(record.description ?? ''),
    meta: toSearchMetaList([record.committee, record.workgroups, record.primaryContact, record.status]),
    sortText: String(record.updatedAt ?? record.joinedAt ?? ''),
  }))

  return {
    results: [...workgroupResults, ...fileResults, ...meetingResults, ...memberResults],
    totals: {
      all: workgroupResults.length + fileResults.length + meetingResults.length + memberResults.length,
      workgroups: workgroupResults.length,
      files: fileResults.length,
      meetings: meetingResults.length,
      members: memberResults.length,
    },
  }
}

function buildSearchResponse(dataset, keyword, scope, limit = 120) {
  const normalizedKeyword = normalizeSearchText(keyword)
  const keywordTerms = tokenizeKeyword(keyword)
  const sectionFilter = searchScopeToSection.get(String(scope ?? '').trim())

  const rankedResults = dataset.results
    .filter((item) => {
      if (sectionFilter && item.scope !== scope) {
        return false
      }

      if (!keywordTerms.length) {
        return true
      }

      const haystack = [item.title, item.summary, item.meta.join(' ')].join(' ').toLowerCase()
      return keywordTerms.every((term) => haystack.includes(term))
    })
    .map((item) => {
      const titleText = normalizeSearchText(item.title)
      const summaryText = normalizeSearchText(item.summary)
      const metaText = normalizeSearchText(item.meta.join(' '))

      let score = 0
      if (normalizedKeyword) {
        if (titleText === normalizedKeyword) {
          score += 120
        }
        if (titleText.includes(normalizedKeyword)) {
          score += 72
        }
        if (summaryText.includes(normalizedKeyword)) {
          score += 30
        }
        if (metaText.includes(normalizedKeyword)) {
          score += 12
        }
      }

      for (const term of keywordTerms) {
        if (titleText.includes(term)) {
          score += 10
        }
        if (summaryText.includes(term)) {
          score += 5
        }
        if (metaText.includes(term)) {
          score += 2
        }
      }

      return { ...item, score }
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      return String(right.sortText).localeCompare(String(left.sortText), 'zh-CN')
    })
    .slice(0, Math.max(1, Number(limit) || 120))
    .map(({ sortText, score, ...item }) => item)

  return {
    results: rankedResults,
    totals: dataset.totals,
  }
}

async function appendLog(action, target, detail, operator = '张伟') {
  await prisma.operationLog.create({
    data: {
      key: `log-${Date.now()}-${Math.round(Math.random() * 10000)}`,
      action,
      operator,
      target,
      time: nowText(),
      result: '成功',
      detail,
    },
  })
}

async function findRows(section) {
  const config = sectionMap[section]
  if (!config) {
    return null
  }

  const rows = await config.model.findMany({ orderBy: { id: 'asc' } })
  return rows.map(config.toRecord)
}

async function getSettings() {
  const setting = await prisma.systemSetting.findUnique({ where: { singletonKey: 'default' } })
  if (!setting) {
    return null
  }

  return {
    platformName: setting.platformName,
    supportEmail: setting.supportEmail,
    supportPhone: setting.supportPhone,
    supportTeam: setting.supportTeam,
    demoTag: setting.demoTag,
    modules: JSON.parse(setting.modules || '{}'),
  }
}

async function buildBootstrapPayload() {
  const tableRows = {}
  for (const section of Object.keys(sectionMap)) {
    tableRows[section] = await findRows(section)
  }

  return {
    settings: await getSettings(),
    tableRows,
  }
}

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      database: 'ok',
      ok: true,
      service: 'smart-av-os-admin-api',
      time: new Date().toISOString(),
    })
  } catch (error) {
    res.status(503).json({
      database: 'unavailable',
      error: error instanceof Error ? error.message : 'database unavailable',
      ok: false,
      service: 'smart-av-os-admin-api',
      time: new Date().toISOString(),
    })
  }
})

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const account = String(req.body.account ?? '').trim()
    const password = String(req.body.password ?? '')
    const user = await prisma.adminUser.findUnique({ where: { account } })

    if (!user || user.status !== '启用') {
      res.status(401).json({ error: '账号或密码不正确' })
      return
    }

    const passwordMatched = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatched) {
      res.status(401).json({ error: '账号或密码不正确' })
      return
    }

    const token = jwt.sign(
      {
        roleKey: user.roleKey,
        permissions: parseJsonList(user.permissions),
      },
      jwtSecret,
      {
        expiresIn: '8h',
        subject: user.key,
      },
    )

    await appendLog('用户登录', user.name, `账号 ${user.account} 登录平台`, user.name)
    res.json({
      token,
      user: toUserProfile(user),
    })
  } catch (error) {
    next(error)
  }
})

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: toUserProfile(req.user) })
})

app.use('/api/search', requireAuth)

app.post('/api/search', async (req, res, next) => {
  try {
    const [workgroups, collabRows] = await Promise.all([
      findRows('workgroups'),
      prisma.collaborationRecord.findMany({
        where: { section: { in: ['knowledge-files', 'meetings', 'members'] } },
        orderBy: { updatedAt: 'desc' },
      }),
    ])

    const collabRecords = collabRows.reduce((bucket, row) => {
      if (!bucket[row.section]) {
        bucket[row.section] = []
      }
      bucket[row.section].push(parsePayloadRecord(row))
      return bucket
    }, {})

    const dataset = buildSearchDataset({
      workgroups: workgroups ?? [],
      files: collabRecords['knowledge-files'] ?? [],
      meetings: collabRecords.meetings ?? [],
      members: collabRecords.members ?? [],
    })

    res.json(buildSearchResponse(dataset, req.body?.keyword, req.body?.scope, req.body?.limit))
  } catch (error) {
    next(error)
  }
})

app.use('/api/analytics', requireAuth)

app.post('/api/analytics/summary', async (req, res, next) => {
  try {
    const [workgroups, organizations, supervision, archive, collabRows] = await Promise.all([
      findRows('workgroups'),
      findRows('organizations'),
      findRows('supervision'),
      findRows('archive'),
      prisma.collaborationRecord.findMany({
        where: { section: { in: ['knowledge-files', 'meetings', 'members'] } },
        orderBy: { updatedAt: 'desc' },
      }),
    ])
    const collabRecords = collabRows.reduce((bucket, row) => {
      if (!bucket[row.section]) {
        bucket[row.section] = []
      }
      bucket[row.section].push(parsePayloadRecord(row))
      return bucket
    }, {})

    res.json(buildAnalyticsSummary({
      filters: req.body?.filters ?? {},
      workgroups: workgroups ?? [],
      organizations: organizations ?? [],
      supervision: supervision ?? [],
      archive: archive ?? [],
      files: collabRecords['knowledge-files'] ?? [],
      meetings: collabRecords.meetings ?? [],
      members: collabRecords.members ?? [],
    }))
  } catch (error) {
    next(error)
  }
})

app.use('/api/admin', requireAuth, requirePermission('admin:center:view'))

app.get('/api/admin/bootstrap', async (_req, res, next) => {
  try {
    res.json(await buildBootstrapPayload())
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/reset', requirePermission('admin:settings:write'), async (_req, res, next) => {
  try {
    await prisma.operationLog.deleteMany()
    await prisma.supervisionItem.deleteMany()
    await prisma.archiveItem.deleteMany()
    await prisma.contentItem.deleteMany()
    await prisma.adminUser.deleteMany()
    await prisma.organization.deleteMany()
    await prisma.workgroup.deleteMany()
    await prisma.systemSetting.deleteMany()
    await prisma.role.deleteMany()

    await execFileAsync(process.execPath, ['prisma/seed.mjs'], { cwd: process.cwd() })
    res.json(await buildBootstrapPayload())
  } catch (error) {
    next(error)
  }
})

app.get('/api/admin/backup', requirePermission('admin:settings:write'), async (_req, res, next) => {
  try {
    const collabRows = await prisma.collaborationRecord.findMany({ orderBy: { id: 'asc' } })
    const collabRecords = collabRows.reduce((bucket, row) => {
      if (!bucket[row.section]) {
        bucket[row.section] = []
      }
      bucket[row.section].push(parsePayloadRecord(row))
      return bucket
    }, {})

    res.json({
      exportedAt: new Date().toISOString(),
      settings: await getSettings(),
      tableRows: (await buildBootstrapPayload()).tableRows,
      collabRecords,
      version: 2,
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/restore', requirePermission('admin:settings:write'), async (req, res, next) => {
  try {
    const payload = req.body ?? {}
    const collabRecords = payload.collabRecords ?? {}

    await prisma.collaborationRecord.deleteMany()
    for (const [section, records] of Object.entries(collabRecords)) {
      if (!collaborationSections.has(section) || !Array.isArray(records)) {
        continue
      }

      await prisma.collaborationRecord.createMany({
        data: records.map((record) => ({
          section,
          key: String(record.id ?? record.key),
          payload: JSON.stringify(record),
        })),
        skipDuplicates: true,
      })
    }

    if (payload.settings) {
      await prisma.systemSetting.upsert({
        where: { singletonKey: 'default' },
        update: {
          platformName: String(payload.settings.platformName ?? ''),
          supportEmail: String(payload.settings.supportEmail ?? ''),
          supportPhone: String(payload.settings.supportPhone ?? ''),
          supportTeam: String(payload.settings.supportTeam ?? ''),
          demoTag: String(payload.settings.demoTag ?? ''),
          modules: JSON.stringify(payload.settings.modules ?? {}),
        },
        create: {
          singletonKey: 'default',
          platformName: String(payload.settings.platformName ?? ''),
          supportEmail: String(payload.settings.supportEmail ?? ''),
          supportPhone: String(payload.settings.supportPhone ?? ''),
          supportTeam: String(payload.settings.supportTeam ?? ''),
          demoTag: String(payload.settings.demoTag ?? ''),
          modules: JSON.stringify(payload.settings.modules ?? {}),
        },
      })
    }

    await appendLog('平台数据恢复', '备份文件', '通过管理中心恢复协同业务数据', req.user.name)
    res.json(await buildBootstrapPayload())
  } catch (error) {
    next(error)
  }
})

app.get('/api/admin/settings', async (_req, res, next) => {
  try {
    res.json(await getSettings())
  } catch (error) {
    next(error)
  }
})

app.put('/api/admin/settings', requirePermission('admin:settings:write'), async (req, res, next) => {
  try {
    const settings = req.body ?? {}
    const saved = await prisma.systemSetting.upsert({
      where: { singletonKey: 'default' },
      update: {
        platformName: String(settings.platformName ?? ''),
        supportEmail: String(settings.supportEmail ?? ''),
        supportPhone: String(settings.supportPhone ?? ''),
        supportTeam: String(settings.supportTeam ?? ''),
        demoTag: String(settings.demoTag ?? ''),
        modules: JSON.stringify(settings.modules ?? {}),
      },
      create: {
        singletonKey: 'default',
        platformName: String(settings.platformName ?? ''),
        supportEmail: String(settings.supportEmail ?? ''),
        supportPhone: String(settings.supportPhone ?? ''),
        supportTeam: String(settings.supportTeam ?? ''),
        demoTag: String(settings.demoTag ?? ''),
        modules: JSON.stringify(settings.modules ?? {}),
      },
    })
    await appendLog('系统设置保存', saved.platformName, '通过平台管理中心保存系统设置')
    res.json(await getSettings())
  } catch (error) {
    next(error)
  }
})

app.get('/api/admin/:section', async (req, res, next) => {
  try {
    const rows = await findRows(req.params.section)
    if (!rows) {
      res.status(404).json({ error: 'unknown section' })
      return
    }
    res.json(rows)
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/:section', requirePermission('admin:data:write'), async (req, res, next) => {
  try {
    const config = sectionMap[req.params.section]
    if (!config?.createAction) {
      res.status(404).json({ error: 'section is not creatable' })
      return
    }

    const key = String(req.body.key ?? buildKey(req.params.section))
    const created = await config.model.create({
      data: {
        key,
        ...config.toData({ ...req.body, key }),
      },
    })
    const record = config.toRecord(created)
    await appendLog(config.createAction, getRecordDisplayName(record), `通过平台管理中心新增${config.label}`)
    res.status(201).json(record)
  } catch (error) {
    next(error)
  }
})

app.put('/api/admin/:section/:key', requirePermission('admin:data:write'), async (req, res, next) => {
  try {
    const config = sectionMap[req.params.section]
    if (!config?.editAction) {
      res.status(404).json({ error: 'section is not editable' })
      return
    }

    const updated = await config.model.update({
      where: { key: req.params.key },
      data: config.toData({ ...req.body, key: req.params.key }),
    })
    const record = config.toRecord(updated)
    await appendLog(config.editAction, getRecordDisplayName(record), `通过平台管理中心编辑${config.label}信息`)
    res.json(record)
  } catch (error) {
    next(error)
  }
})

app.patch('/api/admin/:section/:key', requirePermission('admin:data:write'), async (req, res, next) => {
  try {
    const config = sectionMap[req.params.section]
    if (!config) {
      res.status(404).json({ error: 'unknown section' })
      return
    }

    const data = {}
    if (req.body.status !== undefined) {
      data.status = String(req.body.status)
    }
    if (req.body.risk !== undefined) {
      data.risk = String(req.body.risk)
    }
    if (req.body.result !== undefined) {
      data.result = String(req.body.result)
    }

    const updated = await config.model.update({
      where: { key: req.params.key },
      data,
    })
    res.json(config.toRecord(updated))
  } catch (error) {
    next(error)
  }
})

app.delete('/api/admin/:section/:key', requirePermission('admin:data:write'), async (req, res, next) => {
  try {
    const config = sectionMap[req.params.section]
    if (!config?.deleteAction) {
      res.status(404).json({ error: 'section is not deletable' })
      return
    }

    const deleted = await config.model.delete({ where: { key: req.params.key } })
    const record = config.toRecord(deleted)
    await appendLog(config.deleteAction, getRecordDisplayName(record), `通过平台管理中心删除${config.label}记录`)
    res.json(record)
  } catch (error) {
    next(error)
  }
})

app.use('/api/collab', requireAuth)

app.get('/api/collab/:section', async (req, res, next) => {
  try {
    if (!collaborationSections.has(req.params.section)) {
      res.status(404).json({ error: 'unknown collaboration section' })
      return
    }

    const rows = await prisma.collaborationRecord.findMany({
      where: { section: req.params.section },
      orderBy: { updatedAt: 'desc' },
    })
    res.json(rows.map(parsePayloadRecord))
  } catch (error) {
    next(error)
  }
})

app.post('/api/collab/:section/bootstrap', async (req, res, next) => {
  try {
    const sectionLabel = collaborationSections.get(req.params.section)
    if (!sectionLabel) {
      res.status(404).json({ error: 'unknown collaboration section' })
      return
    }

    const rows = Array.isArray(req.body.records) ? req.body.records : []
    const count = await prisma.collaborationRecord.count({ where: { section: req.params.section } })
    if (count === 0 && rows.length > 0) {
      await prisma.collaborationRecord.createMany({
        data: rows.map((record) => ({
          section: req.params.section,
          key: String(record.id ?? record.key),
          payload: JSON.stringify(record),
        })),
        skipDuplicates: true,
      })
      await appendLog(`${sectionLabel}初始化`, `${rows.length} 条记录`, `初始化${sectionLabel}业务数据`, req.user.name)
    }

    const savedRows = await prisma.collaborationRecord.findMany({
      where: { section: req.params.section },
      orderBy: { updatedAt: 'desc' },
    })
    res.json(savedRows.map(parsePayloadRecord))
  } catch (error) {
    next(error)
  }
})

app.post('/api/collab/:section', async (req, res, next) => {
  try {
    const sectionLabel = collaborationSections.get(req.params.section)
    if (!sectionLabel) {
      res.status(404).json({ error: 'unknown collaboration section' })
      return
    }

    const record = {
      ...req.body,
      id: String(req.body.id ?? `${req.params.section}-${Date.now()}`),
    }

    const saved = await prisma.collaborationRecord.upsert({
      where: {
        section_key: {
          section: req.params.section,
          key: record.id,
        },
      },
      update: { payload: JSON.stringify(record) },
      create: {
        section: req.params.section,
        key: record.id,
        payload: JSON.stringify(record),
      },
    })
    await appendLog(`${sectionLabel}保存`, getRecordDisplayName(record), `保存${sectionLabel}业务记录`, req.user.name)
    res.status(201).json(parsePayloadRecord(saved))
  } catch (error) {
    next(error)
  }
})

app.post('/api/collab/:section/:key/audit', async (req, res, next) => {
  try {
    const sectionLabel = collaborationSections.get(req.params.section)
    if (!sectionLabel) {
      res.status(404).json({ error: 'unknown collaboration section' })
      return
    }

    const action = String(req.body.action ?? `${sectionLabel}访问`)
    const detail = String(req.body.detail ?? `访问${sectionLabel}业务记录`)
    await appendLog(action, String(req.body.target ?? req.params.key), detail, req.user.name)
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

app.put('/api/collab/:section/:key', async (req, res, next) => {
  try {
    const sectionLabel = collaborationSections.get(req.params.section)
    if (!sectionLabel) {
      res.status(404).json({ error: 'unknown collaboration section' })
      return
    }

    const record = { ...req.body, id: req.params.key }
    const saved = await prisma.collaborationRecord.upsert({
      where: {
        section_key: {
          section: req.params.section,
          key: req.params.key,
        },
      },
      update: { payload: JSON.stringify(record) },
      create: {
        section: req.params.section,
        key: req.params.key,
        payload: JSON.stringify(record),
      },
    })
    await appendLog(`${sectionLabel}更新`, getRecordDisplayName(record), `更新${sectionLabel}业务记录`, req.user.name)
    res.json(parsePayloadRecord(saved))
  } catch (error) {
    next(error)
  }
})

app.delete('/api/collab/:section/:key', async (req, res, next) => {
  try {
    const sectionLabel = collaborationSections.get(req.params.section)
    if (!sectionLabel) {
      res.status(404).json({ error: 'unknown collaboration section' })
      return
    }

    const deleted = await prisma.collaborationRecord.delete({
      where: {
        section_key: {
          section: req.params.section,
          key: req.params.key,
        },
      },
    })
    const record = parsePayloadRecord(deleted)
    await appendLog(`${sectionLabel}删除`, getRecordDisplayName(record), `删除${sectionLabel}业务记录`, req.user.name)
    res.json(record)
  } catch (error) {
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: error.message ?? 'server error' })
})

app.listen(port, () => {
  console.log(`admin api listening on http://localhost:${port}/api`)
})
