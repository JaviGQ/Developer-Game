import { useEffect, useState } from 'react'
import { NavLink } from 'react-router'
import { listProjects } from './api'
import type { ProjectSummary } from './types'

function Sidebar() {
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .catch(() => setError(true))
  }, [])

  return (
    <nav className="sidebar" aria-label="Projects">
      <NavLink to="/" end>
        + New project
      </NavLink>

      <h2>Projects</h2>
      {error && <p>Couldn't load projects</p>}
      {!error && projects === null && <p>Loading…</p>}
      {projects?.length === 0 && <p>No projects yet</p>}

      <ul>
        {projects?.map((p) => (
          <li key={p.id}>
            <NavLink to={`/projects/${p.id}`}>
              {p.status === 'completed' ? '✓ ' : ''}
              {p.title}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Sidebar