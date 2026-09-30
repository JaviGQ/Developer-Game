import { useState } from 'react'
import { ApiError } from './api'

type Props = {
  title: string
  onSave: (title: string) => Promise<void>
}

function EditableTitle({ title, onSave }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(title)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startEditing() {
    setDraft(title)
    setError(null)
    setEditing(true)
  }

  async function save() {
    const trimmed = draft.trim()
    if (!trimmed || saving) return
    if (trimmed === title) {
      setEditing(false)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(trimmed)
      setEditing(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.messages.join(' ') : 'Could not reach the server')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div>
        <h1>{title}</h1>
        <button type="button" onClick={startEditing}>
          Rename
        </button>
      </div>
    )
  }

  return (
    <div>
      <input
        aria-label="Project title"
        value={draft}
        maxLength={200}
        autoFocus
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save()
          if (e.key === 'Escape') setEditing(false)
        }}
      />
      <button type="button" onClick={save} disabled={saving || !draft.trim()}>
        {saving ? 'Saving…' : 'Save'}
      </button>
      <button type="button" onClick={() => setEditing(false)} disabled={saving}>
        Cancel
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  )
}

export default EditableTitle