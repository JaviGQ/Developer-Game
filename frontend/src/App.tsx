import { Route, Routes } from 'react-router'
import ImportPage from './ImportPage'
import Layout from './Layout'
import ProjectPage from './ProjectPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ImportPage />} />
        <Route path="projects/:projectId" element={<ProjectPage />} />
      </Route>
    </Routes>
  )
}

export default App