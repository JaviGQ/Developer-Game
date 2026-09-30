import { useEffect, useState } from 'react'
import { useOutletContext, useParams } from 'react-router'
import { ApiError, getProject, renameProject } from './api'
import EditableTitle from './EditableTitle'
import type { LayoutContext } from './Layout'
import type { ProjectDetail } from './types'

type LoadResult = {
  id: number
  project: ProjectDetail | null
  errors: string[]
}

function ProjectPage() {
  const { projectId } = useParams()
  const id = Number(projectId)
  const validId = Number.isInteger(id) && id > 0
  const { refreshProjects } = useOutletContext<LayoutContext>()
  const [result, setResult] = useState<LoadResult | null>(null)

  async function handleRename(title: string) {
    const updated = await renameProject(id, title)
    setResult((prev) =>
      prev?.project ? { ...prev, project: { ...prev.project, title: updated.title } } : prev,
    )
    refreshProjects()
  }

  useEffect(() => {
    if (!validId) return
    let ignore = false

    getProject(id)
      .then((project) => {
        if (!ignore) setResult({ id, project, errors: [] })
      })
      .catch((err) => {
        if (!ignore) {
          setResult({
            id,
            project: null,
            errors: err instanceof ApiError ? err.messages : ['Could not reach the server'],
          })
        }
      })

    return () => {
      ignore = true
    }
  }, [id, validId])

  if (!validId) return <p role="alert">Project not found</p>
  if (!result || result.id !== id) return <p>Loading…</p>
  if (!result.project) {
    return (
      <ul role="alert">
        {result.errors.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    )
  }

  const project = result.project
  const done = project.milestones.filter((m) => m.completed_at).length
  const total = project.milestones.length
  const context = project.context

  return (
    <article>
        <EditableTitle title={project.title} onSave={handleRename} />
      <p>
        {done} of {total} milestones complete
      </p>
      {project.summary && <p>{project.summary}</p>}

      {context && (
        <section>
          <h2>Context</h2>
          {context.current_status && (
            <p>
              <strong>Status:</strong> {context.current_status}
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
            <strong>{m.title}</strong>
            <p>{m.description}</p>
          </li>
        ))}
      </ol>
    </article>
  )
}

export default ProjectPage