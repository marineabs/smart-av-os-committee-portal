import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

const rootDir = process.cwd()
const runtimeDir = path.join(rootDir, '.local')
const pidFile = path.join(runtimeDir, 'dev-server.pid')
const logFile = path.join(runtimeDir, 'dev-server.log')
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js')
const host = '0.0.0.0'
const port = '5173'
const appPath = '/smart-av-os-committee-portal/'

function ensureRuntimeDir() {
  fs.mkdirSync(runtimeDir, { recursive: true })
}

function readPid() {
  if (!fs.existsSync(pidFile)) {
    return null
  }

  const value = fs.readFileSync(pidFile, 'utf8').trim()
  if (!value) {
    return null
  }

  const pid = Number(value)
  return Number.isInteger(pid) ? pid : null
}

function isRunning(pid) {
  if (!pid) {
    return false
  }

  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

function removePidFile() {
  if (fs.existsSync(pidFile)) {
    fs.unlinkSync(pidFile)
  }
}

function printStatus(pid) {
  if (pid && isRunning(pid)) {
    console.log(`dev server is running (pid ${pid})`)
    console.log(`url: http://localhost:${port}${appPath}`)
    console.log(`log: ${logFile}`)
    return
  }

  console.log('dev server is not running')
}

function startServer() {
  ensureRuntimeDir()

  const currentPid = readPid()
  if (isRunning(currentPid)) {
    printStatus(currentPid)
    return
  }

  removePidFile()

  const logFd = fs.openSync(logFile, 'a')
  const child = spawn(process.execPath, [viteBin, '--host', host, '--port', port, '--strictPort'], {
    cwd: rootDir,
    detached: true,
    stdio: ['ignore', logFd, logFd],
    env: process.env,
  })

  child.unref()
  fs.writeFileSync(pidFile, `${child.pid}\n`)

  console.log(`started dev server (pid ${child.pid})`)
  console.log(`url: http://localhost:${port}${appPath}`)
  console.log(`log: ${logFile}`)
}

function stopServer() {
  const pid = readPid()
  if (!isRunning(pid)) {
    removePidFile()
    console.log('dev server is not running')
    return
  }

  process.kill(pid, 'SIGTERM')
  removePidFile()
  console.log(`stopped dev server (pid ${pid})`)
}

function restartServer() {
  stopServer()
  startServer()
}

const command = process.argv[2] ?? 'status'

if (command === 'start') {
  startServer()
} else if (command === 'stop') {
  stopServer()
} else if (command === 'restart') {
  restartServer()
} else if (command === 'status') {
  printStatus(readPid())
} else {
  console.error(`unknown command: ${command}`)
  process.exit(1)
}
