import { Navigate, Route, Routes } from 'react-router-dom'
import { placeholderPages } from '../mock/portal'
import HomePortalPage from '../pages/HomePortalPage'
import KnowledgeCenterPage from '../pages/KnowledgeCenterPage'
import PlaceholderPage from '../pages/PlaceholderPage'
import WorkgroupDetailPage from '../pages/WorkgroupDetailPage'
import WorkgroupSpacePage from '../pages/WorkgroupSpacePage'

const handledPaths = new Set(['/knowledge-center', '/workgroups'])

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePortalPage />} />
      <Route path="/knowledge-center" element={<KnowledgeCenterPage />} />
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
  )
}
