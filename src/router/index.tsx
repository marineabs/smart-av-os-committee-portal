import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { placeholderPages } from '../mock/portal'
import PlaceholderPage from '../pages/PlaceholderPage'

const HomePortalPage = lazy(() => import('../pages/HomePortalPage'))
const KnowledgeCenterPage = lazy(() => import('../pages/KnowledgeCenterPage'))
const LoginDemoPage = lazy(() => import('../pages/LoginDemoPage'))
const MeetingsPage = lazy(() => import('../pages/MeetingsPage'))
const MemberCenterPage = lazy(() => import('../pages/MemberCenterPage'))
const SystemCenterPage = lazy(() => import('../pages/SystemCenterPage'))
const TasksPage = lazy(() => import('../pages/TasksPage'))
const WorkgroupDetailPage = lazy(() => import('../pages/WorkgroupDetailPage'))
const WorkgroupSpacePage = lazy(() => import('../pages/WorkgroupSpacePage'))

const handledPaths = new Set(['/knowledge-center', '/members', '/meetings', '/system', '/tasks', '/workgroups'])

export function AppRouter() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<HomePortalPage />} />
        <Route path="/knowledge-center" element={<KnowledgeCenterPage />} />
        <Route path="/login" element={<LoginDemoPage />} />
        <Route path="/meetings" element={<MeetingsPage />} />
        <Route path="/members" element={<MemberCenterPage />} />
        <Route path="/system" element={<SystemCenterPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/workgroups" element={<WorkgroupSpacePage />} />
        <Route path="/workgroups/:groupId" element={<WorkgroupDetailPage />} />
        {placeholderPages.filter((page) => !handledPaths.has(page.path)).map((page) => (
          <Route
            key={page.path}
            path={page.path}
            element={<PlaceholderPage title={page.title} description={page.description} />}
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
