import { useCallback, useEffect, useState } from 'react'
import { ApiError, getProject } from './api'
import type { ProjectDetail } from './types'

type LoadResult = {
  id: number
  project: ProjectDetail | null
  errors: string[]
}

export function useProject(id: number) {
  const validId = Number.isInteger(id) && id > 0
  const [result, setResult] = useState<LoadResult | null>(null)

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

  const setProject = useCallback((project: ProjectDetail) => {
    setResult({ id: project.id, project, errors: [] })
  }, [])

  const current = result?.id === id ? result : null

  return {
    project: current?.project ?? null,
    errors: validId ? (current?.errors ?? []) : ['Project not found'],
    loading: validId && current === null,
    setProject,
  }
}