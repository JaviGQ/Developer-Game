import { Route, Routes } from 'react-router'
import ImportPage from './ImportPage'
import Layout from './Layout'
import ProjectPage from './ProjectPage'
import MilestonePage from './MilestonePage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ImportPage />} />
        <Route path="projects/:projectId" element={<ProjectPage />} />
        <Route path="projects/:projectId/milestones/:position" element={<MilestonePage />} />        
      </Route>
    </Routes>
  )
}

export default App