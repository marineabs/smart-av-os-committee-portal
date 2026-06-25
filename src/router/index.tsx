import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { placeholderPages } from '../mock/portal'
import PlaceholderPage from '../pages/PlaceholderPage'

const AdminCenterPage = lazy(() => import('../pages/AdminCenterPage'))
const AnalyticsCenterPage = lazy(() => import('../pages/AnalyticsCenterPage'))
const HomePortalPage = lazy(() => import('../pages/HomePortalPage'))
const KnowledgeCenterPage = lazy(() => import('../pages/KnowledgeCenterPage'))
const LoginDemoPage = lazy(() => import('../pages/LoginDemoPage'))
const MeetingsPage = lazy(() => import('../pages/MeetingsPage'))
const MemberCenterPage = lazy(() => import('../pages/MemberCenterPage'))
const SearchCenterPage = lazy(() => import('../pages/SearchCenterPage'))
const TasksPage = lazy(() => import('../pages/TasksPage'))
const WorkgroupDetailPage = lazy(() => import('../pages/WorkgroupDetailPage'))
const WorkgroupSpacePage = lazy(() => import('../pages/WorkgroupSpacePage'))

const handledPaths = new Set([
  '/portal',
  '/files',
  '/knowledge-center',
  '/documents',
  '/members',
  '/meetings',
  '/system',
  '/tasks',
  '/search-center',
  '/analytics',
  '/workgroups',
  '/admin',
  '/admin/workgroups',
  '/admin/organizations',
  '/admin/users',
  '/admin/content',
  '/admin/archive',
  '/admin/supervision',
  '/admin/settings',
  '/admin/logs',
])

export function AppRouter() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Navigate to="/portal" replace />} />
        <Route path="/portal" element={<HomePortalPage />} />
        <Route path="/files" element={<KnowledgeCenterPage />} />
        <Route path="/knowledge-center" element={<Navigate to="/files" replace />} />
        <Route path="/documents" element={<Navigate to="/files" replace />} />
        <Route path="/login" element={<LoginDemoPage />} />
        <Route path="/meetings" element={<MeetingsPage />} />
        <Route path="/members" element={<MemberCenterPage />} />
        <Route path="/search-center" element={<SearchCenterPage />} />
        <Route path="/analytics" element={<AnalyticsCenterPage />} />
        <Route path="/admin" element={<AdminCenterPage sectionKey="overview" />} />
        <Route path="/admin/workgroups" element={<AdminCenterPage sectionKey="workgroups" />} />
        <Route path="/admin/organizations" element={<AdminCenterPage sectionKey="organizations" />} />
        <Route path="/admin/users" element={<AdminCenterPage sectionKey="users" />} />
        <Route path="/admin/content" element={<AdminCenterPage sectionKey="content" />} />
        <Route path="/admin/archive" element={<AdminCenterPage sectionKey="archive" />} />
        <Route path="/admin/supervision" element={<AdminCenterPage sectionKey="supervision" />} />
        <Route path="/admin/settings" element={<AdminCenterPage sectionKey="settings" />} />
        <Route path="/admin/logs" element={<AdminCenterPage sectionKey="logs" />} />
        <Route path="/system" element={<Navigate to="/admin/settings" replace />} />
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
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Routes>
    </Suspense>
  )
}
