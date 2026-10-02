import { Link, useOutletContext, useParams } from 'react-router'
import { updateProject } from './api'
import EditableTitle from './EditableTitle'
import type { LayoutContext } from './Layout'
import { useProject } from './useProject'
import ProgressBar from './ProgressBar'
import ResumeInsert from './ResumeInsert'

function ProjectPage() {
  const { projectId } = useParams()
  const { project, errors, loading, setProject } = useProject(Number(projectId))
  const { refreshProjects } = useOutletContext<LayoutContext>()

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

    async function handleRename(title: string) {
    setProject(await updateProject(project!.id, { title }))
    refreshProjects()
  }

  const firstIncomplete = project.milestones.find((m) => !m.completed_at)  
  const done = project.milestones.filter((m) => m.completed_at).length
  const total = project.milestones.length
  const context = project.context

  return (
    <article>
        <EditableTitle title={project.title} onSave={handleRename} />
          <ProgressBar done={done} total={total} />
          {project.status === 'completed' && (
          <ResumeInsert project={project} onSaved={setProject} />          
      )}
      {project.summary && <p>{project.summary}</p>}

      {context && (
        <section>
          <h2>Context</h2>
          {context.current_status && (
            <p>
              <strong>Status:</strong> {context.current_status}
            </p>
          )}
          {firstIncomplete && (
            <p>
              <Link to={`/projects/${project.id}/milestones/${firstIncomplete.position}`}>
                Continue: {firstIncomplete.title}
              </Link>
            </p>
        )}
          {context.stack.length > 0 && (
            <p>
              <strong>Stack:</strong> {context.stack.join(', ')}
            </p>
          )}
          {context.decisions.length > 0 && (
            <>
              <h3>Decisions</h3>
              <ul>
                {context.decisions.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </>
          )}
          {context.open_questions.length > 0 && (
            <>
              <h3>Open questions</h3>
              <ul>
                {context.open_questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <h2>Milestones</h2>
      <ol>
        {project.milestones.map((m) => (
          <li key={m.id}>
            {m.completed_at ? '✓ ' : ''}
            <Link to={`/projects/${project.id}/milestones/${m.position}`}>
              <strong>{m.title}</strong>
            </Link>
            <p>{m.description}</p>
          </li>
        ))}
      </ol>
    </article>
  )
}

export default ProjectPage