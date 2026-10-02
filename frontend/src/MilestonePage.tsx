import { useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router'
import { ApiError, setMilestoneCompleted } from './api'
import type { LayoutContext } from './Layout'
import ProgressBar from './ProgressBar'
import { useProject } from './useProject'
import type { ProjectDetail } from './types'

function MilestonePage() {
  const { projectId, position } = useParams()
  const { project, errors, loading, setProject } = useProject(Number(projectId))
  const { refreshProjects } = useOutletContext<LayoutContext>()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<{ milestoneId: number; message: string } | null>(null)

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
  const done = milestones.filter((m) => m.completed_at).length
  const readOnly = project.status === 'completed'
  
  async function updateCompleted(completed: boolean) {
    setSaving(true)
    setError(null)
    try {
        const updated = await setMilestoneCompleted(project!.id, milestone.id, completed)
        setProject(updated)
        refreshProjects()
        if (completed) navigate(nextPathAfterComplete(updated))
    } catch (err) {
        setError({
        milestoneId: milestone.id,
        message: err instanceof ApiError ? err.messages.join(' ') : 'Could not reach the server',
        })
    } finally {
        setSaving(false)
    }
  }

  function nextPathAfterComplete(updated: ProjectDetail): string {
    if (updated.status === 'completed') return `/projects/${updated.id}/complete`
    if (next) return `${base}/${next.position}`
    const unfinished = updated.milestones.find((m) => !m.completed_at)
    return unfinished ? `${base}/${unfinished.position}` : `/projects/${updated.id}`
  }

  return (
    <article>
      <p>
        <Link to={`/projects/${project.id}`}>← {project.title}</Link>
      </p>
      <p>
        Milestone {index + 1} of {milestones.length}
      </p>
      <ProgressBar done={done} total={milestones.length} />

      <h1>{milestone.title}</h1>
      {milestone.completed_at && <p>✓ Completed</p>}
      <p>{milestone.description}</p>

      <h2>Done when</h2>
      <ul>
        {milestone.acceptance_criteria.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
      
      {readOnly ? (
        <>
          <p>
            This project is complete, so its milestones are read-only.{' '}
            <Link to={`/projects/${project.id}/complete`}>View celebration</Link>
          </p>
          <nav aria-label="Milestone navigation">
            {prev && <Link to={`${base}/${prev.position}`}>← Previous</Link>}
            {next && <Link to={`${base}/${next.position}`}>Next →</Link>}
          </nav>
        </>
      ) : (
        <nav aria-label="Milestone navigation">
          {/* your existing nav contents, unchanged */}
        </nav>
      )}

      <nav aria-label="Milestone navigation">
        {prev && <Link to={`${base}/${prev.position}`}>← Previous</Link>}

        {milestone.completed_at ? (
          <>
            {next && <Link to={`${base}/${next.position}`}>Next →</Link>}
            <button type="button" onClick={() => updateCompleted(false)} disabled={saving}>
              Mark as not done
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => updateCompleted(true)} disabled={saving}>
              {saving ? 'Saving…' : next ? 'Complete and continue →' : 'Complete milestone'}
            </button>
            {next && <Link to={`${base}/${next.position}`}>Skip →</Link>}
          </>
        )}
      </nav>

      {error?.milestoneId === milestone.id && <p role="alert">{error.message}</p>}
    </article>
  )
}

export default MilestonePage