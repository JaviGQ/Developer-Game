import { useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import { listProjects } from './api'
import Sidebar from './Sidebar'
import type { ProjectSummary } from './types'

export type LayoutContext = {
  refreshProjects: () => Promise<void>
}

function Layout() {
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null)
  const [error, setError] = useState(false)

  const refreshProjects = useCallback(async () => {
    try {
      setProjects(await listProjects())
      setError(false)
    } catch {
      setError(true)
    }
  }, [])

    useEffect(() => {
    let ignore = false
    listProjects()
      .then((data) => {
        if (!ignore) {
          setProjects(data)
          setError(false)
        }
      })
      .catch(() => {
        if (!ignore) setError(true)
      })
    return () => {
      ignore = true
    }
  }, [])

  const context: LayoutContext = { refreshProjects }

  return (
    <div className="layout">
      <Sidebar projects={projects} error={error} />
      <div className="content">
        <Outlet context={context} />
      </div>
    </div>
  )
}

export default Layout