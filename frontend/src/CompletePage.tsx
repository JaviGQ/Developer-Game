import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { Link, Navigate, useParams } from 'react-router'
import ProgressBar from './ProgressBar'
import { useProject } from './useProject'
import ResumeInsert from './ResumeInsert'

const DAY_MS = 24 * 60 * 60 * 1000

function CompletePage() {
  const { projectId } = useParams()
  const { project, errors, loading, setProject } = useProject(Number(projectId))
  const isComplete = project?.status === 'completed'

  useEffect(() => {
    if (!isComplete) return
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      disableForReducedMotion: true,
    })
    return () => { confetti.reset() }
  }, [isComplete])

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
  if (!isComplete) return <Navigate to={`/projects/${project.id}`} replace />

  const total = project.milestones.length
  const days = Math.max(
    1,
    Math.round((Date.parse(project.completed_at!) - Date.parse(project.created_at)) / DAY_MS),
  )

  return (
    <article>
      <h1>🎉 Project complete!</h1>
      <h2>{project.title}</h2>
      <ProgressBar done={total} total={total} />
      <p>
        You completed {total} milestones in {days} {days === 1 ? 'day' : 'days'}.
      </p>
      <ResumeInsert project={project} onSaved={setProject} />
      <p>
        <Link to={`/projects/${project.id}`}>Back to the project</Link>
      </p>
    </article>
  )
}

export default CompletePage