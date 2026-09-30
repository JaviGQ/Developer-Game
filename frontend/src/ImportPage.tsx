import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { ApiError, previewPlan } from './api'
import type { PlanImport } from './types'

function ImportPage() {
  const [text, setText] = useState('')
  const [plan, setPlan] = useState<PlanImport | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  function updateText(value: string) {
    setText(value)
    setPlan(null)
    setErrors([])
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    updateText(await file.text())
  }

  async function handlePreview() {
    setLoading(true)
    setErrors([])
    setPlan(null)
    try {
      setPlan(await previewPlan(text))
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['Could not reach the server'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <h1>Import a plan</h1>
      <p>Paste the plan your AI generated, or load it from a file.</p>

      <input type="file" accept=".json,.txt,.md" onChange={handleFile} />

      <textarea
        value={text}
        onChange={(e) => updateText(e.target.value)}
        rows={16}
        cols={80}
        placeholder="Paste your plan here"
      />

      <button type="button" onClick={handlePreview} disabled={!text.trim() || loading}>
        {loading ? 'Checking…' : 'Preview'}
      </button>

      {errors.length > 0 && (
        <ul role="alert">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      {plan && (
        <p>
          Valid plan: {plan.title} ({plan.milestones.length} milestones)
        </p>
      )}
    </main>
  )
}

export default ImportPage