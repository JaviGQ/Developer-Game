import { useState } from 'react'
import { ApiError, updateProject } from './api'
import { buildResumePrompt } from './resumePrompt'
import type { ProjectDetail } from './types'

type Props = {
  project: ProjectDetail
  onSaved: (project: ProjectDetail) => void
}

function ResumeInsert({ project, onSaved }: Props) {
  const [editing, setEditing] = useState(!project.resume_insert)
  const [draft, setDraft] = useState(project.resume_insert ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<'prompt' | 'insert' | null>(null)

  async function copy(text: string, which: 'prompt' | 'insert') {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(which)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      setError('Copy failed. Select the text and copy it manually.')
    }
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const updated = await updateProject(project.id, { resume_insert: draft })
      onSaved(updated)
      setEditing(!updated.resume_insert)
    } catch (err) {
      setError(err instanceof ApiError ? err.messages.join(' ') : 'Could not reach the server')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section aria-labelledby="resume-heading">
      <h2 id="resume-heading">Resume insert</h2>

      {editing ? (
        <>
          <p>
            1. Copy this prompt into your AI chat.{' '}
            <button type="button" onClick={() => copy(buildResumePrompt(project), 'prompt')}>
              {copied === 'prompt' ? 'Copied!' : 'Copy prompt'}
            </button>
          </p>
          <p>2. Paste the bullets it writes here, then save.</p>
          <textarea
            aria-label="Resume insert"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
            cols={80}
            maxLength={5000}
          />
          <p>
            <button type="button" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save resume insert'}
            </button>
            {project.resume_insert && (
              <button type="button" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </button>
            )}
          </p>
        </>
      ) : (
        <>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{project.resume_insert}</pre>
          <button type="button" onClick={() => copy(project.resume_insert ?? '', 'insert')}>
            {copied === 'insert' ? 'Copied!' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(project.resume_insert ?? '')
              setEditing(true)
            }}
          >
            Edit
          </button>
        </>
      )}

      {error && <p role="alert">{error}</p>}
    </section>
  )
}

export default ResumeInsert