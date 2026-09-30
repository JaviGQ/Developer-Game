import { useState, useRef, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { ApiError, importPlan, previewPlan } from './api'
import PlanPreview from './PlanPreview'
import type { ImportResponse, PlanImport } from './types'

function ImportPage() {
  const [text, setText] = useState('')
  const [plan, setPlan] = useState<PlanImport | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<ImportResponse | null>(null)
  const errorsRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (errors.length > 0) {
      errorsRef.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [errors])

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

    async function handleSave() {
    setSaving(true)
    setErrors([])
    try {
      setSaved(await importPlan(text))
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['Could not reach the server'])
    } finally {
      setSaving(false)
    }
  }

  function reset() {
    setSaved(null)
    updateText('')
  }

    if (saved) {
    return (
      <main>
        <h1>Plan imported</h1>
        <p>
          "{saved.title}" was created with {saved.milestone_count} milestones.
        </p>
        <button type="button" onClick={reset}>
          Import another
        </button>
      </main>
    )
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

            {plan && (
        <>
          <PlanPreview plan={plan} />
          <button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save project'}
          </button>
        </>
      )}
      
      {errors.length > 0 && (
        <ul role="alert" ref={errorsRef}>
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default ImportPage