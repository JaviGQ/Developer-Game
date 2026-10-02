import { Link, useParams } from 'react-router'
import { useProject } from './useProject'

function MilestonePage() {
  const { projectId, position } = useParams()
  const { project, errors, loading } = useProject(Number(projectId))

  if (loading) return <p>Loading…</p>
  if (!project) {
    return (
      <ul role="alert">
        {errors.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    )
  }

  const milestones = project.milestones
  const index = milestones.findIndex((m) => m.position === Number(position))

  if (index === -1) {
    return (
      <div>
        <p role="alert">Milestone not found</p>
        <Link to={`/projects/${project.id}`}>Back to {project.title}</Link>
      </div>
    )
  }

  const milestone = milestones[index]
  const prev = milestones[index - 1]
  const next = milestones[index + 1]
  const base = `/projects/${project.id}/milestones`

  return (
    <article>
      <p>
        <Link to={`/projects/${project.id}`}>← {project.title}</Link>
      </p>
      <p>
        Milestone {index + 1} of {milestones.length}
      </p>

      <h1>{milestone.title}</h1>
      {milestone.completed_at && <p>✓ Completed</p>}
      <p>{milestone.description}</p>

      <h2>Done when</h2>
      <ul>
        {milestone.acceptance_criteria.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>

      <nav aria-label="Milestone navigation">
        {prev && <Link to={`${base}/${prev.position}`}>← Previous</Link>}
        {next && <Link to={`${base}/${next.position}`}>Next →</Link>}
      </nav>
    </article>
  )
}

export default MilestonePage