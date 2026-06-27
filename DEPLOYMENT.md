# 智慧视听操作系统专委会协同平台部署说明

## 当前部署形态

当前项目已经包含两部分：

- 前端：Vite + React 单页应用。
- 本地开发后台：Express + Node SQLite，零依赖即可跑通登录和管理中心 CRUD。
- 生产后台：Express + Prisma 7 + MySQL。

平台管理中心已经从浏览器本地持久化升级为优先调用后台 API。后台未连接时，前端会自动降级到浏览器本地缓存，方便开发和演示不被阻塞。

## 本地启动

1. 安装依赖：

```bash
npm install
```

2. 准备环境变量：

```bash
cp .env.example .env
```

3. 一条命令启动前端和本地 SQLite 后台：

```bash
npm run dev:full
```

前端默认地址：

```text
http://localhost:5173/smart-av-os-committee-portal/
```

后台健康检查：

```text
http://localhost:4174/api/health
```

默认种子账号：

```text
账号：zhangwei
密码：demo-portal-2026
```

本地 SQLite 数据文件位于：

```text
.local/admin-dev.sqlite
```

## 本地 MySQL 联调

如果需要在本机直接验证 MySQL 后台，再执行下面步骤。

1. 启动 MySQL。

当前这台 Mac 已经安装 MySQL 到 `/usr/local/mysql`，并使用项目内数据目录 `.local/mysql-data`，监听端口 `3307`。重启电脑后可用下面命令启动：

```bash
npm run mysql:local:start
```

如果需要进入 MySQL 命令行：

```bash
npm run mysql:local:client
```

如果需要停止项目内 MySQL：

```bash
npm run mysql:local:stop
```

如果本机有 Docker：

```bash
npm run db:up
```

如果使用已有 MySQL，请把 `.env` 中的 `DATABASE_URL` 改成你的连接串：

```bash
DATABASE_URL="mysql://user:password@host:3306/database"
```

当前项目内 MySQL 的连接串为：

```bash
DATABASE_URL="mysql://smart_av_user:smart_av_password@127.0.0.1:3307/smart_av_os"
```

2. 初始化数据库表和种子数据：

```bash
npm run server:setup
```

3. 单独启动 MySQL 后台：

```bash
npm run dev:api:mysql
```

如果要同时启动前端和 MySQL 后台：

```bash
npm run dev:full:mysql
```

## 主要后台接口

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/admin/bootstrap`
- `GET /api/admin/:section`
- `POST /api/admin/:section`
- `PUT /api/admin/:section/:key`
- `PATCH /api/admin/:section/:key`
- `DELETE /api/admin/:section/:key`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`
- `POST /api/admin/reset`
- `GET /api/admin/backup`
- `POST /api/admin/restore`
- `GET /api/collab/:section`
- `POST /api/collab/:section/bootstrap`
- `POST /api/collab/:section`
- `POST /api/collab/:section/:key/audit`
- `PUT /api/collab/:section/:key`
- `DELETE /api/collab/:section/:key`

其中 `section` 包括：

- `workgroups`
- `organizations`
- `users`
- `content`
- `archive`
- `supervision`
- `logs`

协同业务记录的 `section` 包括：

- `knowledge-files`
- `meetings`
- `members`

## 生产部署需要拷贝哪些文件

如果是在服务器上构建前端、运行 Node 后台，建议拷贝整个项目源码，但排除本地生成物和敏感文件：

需要拷贝：

- `package.json`
- `package-lock.json`
- `index.html`
- `favicon.svg`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `prisma.config.ts`
- `prisma/schema.prisma`
- `prisma/seed.mjs`
- `server/`
- `src/`
- `scripts/`
- `docker-compose.yml`，仅当服务器也用 Docker 启 MySQL 时需要。
- `vercel.json`，仅当前端部署到 Vercel 时需要。
- `.github/workflows/deploy.yml`，仅当继续使用 GitHub Pages 自动部署前端时需要。

不要拷贝：

- `node_modules/`
- `dist/`
- `.local/`
- `.env`
- `.DS_Store`
- `.git/`，除非服务器上用 Git 拉取代码。

服务器上单独创建生产 `.env`，不要直接复用本机 `.env`：

```bash
DATABASE_URL="mysql://smart_av_user:strong-password@mysql-host:3306/smart_av_os"
SERVER_PORT="4174"
JWT_SECRET="replace-with-a-long-random-production-secret"
VITE_API_BASE_URL="https://your-api-domain.example.com/api"
```

如果前端已经在本机或 CI 构建完成，只把静态站点放到 Nginx/静态托管平台，则前端只需要上传 `dist/` 目录；后台服务器仍需要 `package.json`、`package-lock.json`、`prisma.config.ts`、`prisma/`、`server/`，并执行依赖安装和数据库初始化。

## MySQL 生产部署顺序

1. 在生产 MySQL 中创建数据库和账号，确认 `DATABASE_URL` 能连接。

2. 安装依赖：

```bash
npm ci
```

3. 初始化表结构和种子账号：

```bash
npm run server:setup
```

4. 构建前端：

```bash
npm run build
```

5. 启动 MySQL 版后台：

```bash
npm run start:api:mysql
```

生产环境建议用 `pm2`、`systemd` 或平台自带进程管理器托管该命令，并把 `/api` 反向代理到 `SERVER_PORT`。

## Vercel + 独立后台

前端可以继续部署到 Vercel：

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

生产环境需要给前端配置：

```bash
VITE_API_BASE_URL="https://your-api-domain.example.com/api"
```

后台建议部署到支持 Node.js 长驻服务的平台，例如服务器、Docker、Railway、Render、Fly.io、阿里云 ECS、腾讯云 Lighthouse 等，并连接云 MySQL。生产环境请使用 `npm run start:api:mysql` 启动 Express + Prisma + MySQL 服务入口。

## Nginx 前端静态部署

将 `dist/` 上传到站点目录，并配置单页应用回退：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

如果前后端同域部署，可以把 `/api` 反向代理到 Express：

```nginx
location /api/ {
  proxy_pass http://127.0.0.1:4174/api/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}
```

## 上线前检查

- HTTPS：前端站点和后台 API 均必须通过 HTTPS 暴露；如果前后端分域，确认 `VITE_API_BASE_URL` 使用 `https://`。
- 存储容量：生产文件建议接入对象存储或挂载盘，并按不少于 2TB 初始容量规划；当前本地 SQLite 仅用于开发演示。
- 性能验证：上线前对首页、文件中心、搜索中心和统计中心做页面 3 秒、检索 5 秒的验收测试。
- 并发验证：用生产数据库和真实 API 环境压测不少于 50 人同时访问、300 个注册用户规模。
- 备份恢复：在管理中心导出完整备份，并在测试环境执行恢复演练，确认协同记录、会议、成员和文件元数据可恢复。

- `npm run build` 通过。
- `npx prisma validate` 通过。
- `npx prisma generate` 通过。
- MySQL 可连接，且 `npm run server:setup` 成功。
- `GET /api/health` 返回 `ok: true`。
- 登录页可使用后台账号登录。
- 进入平台管理中心后，右上角状态显示 `后台 API`。
- 新增、编辑、删除一条工作组记录后刷新页面，数据仍然保留。
- 系统设置保存后刷新页面，配置仍然保留。

## 下一阶段建议

当前后台已经能承载管理中心的真实 CRUD。继续往生产级推进时，建议补：

- 更完整的账号管理：改密、重置密码、禁用账号、登录失败锁定。
- 更细的服务端权限：按钮权限、数据范围权限、接口审计策略。
- 文件上传到对象存储。
- 审批流：内容发布审核、资料归档审核、工作组变更审批。
- 操作日志前后变更对比。
- 数据库迁移版本化和定期备份。
