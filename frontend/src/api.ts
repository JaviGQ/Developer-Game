import type { ImportResponse, PlanImport, ProjectSummary, ProjectDetail } from './types'

export class ApiError extends Error {
  messages: string[]

  constructor(messages: string[]) {
    super(messages.join('\n'))
    this.messages = messages
  }
}

async function readErrors(res: Response): Promise<string[]> {
  try {
    const body = await res.json()
    if (Array.isArray(body.detail) && body.detail.every((d: unknown) => typeof d === 'string')) {
      return body.detail
    }
  } catch {
    // Response was not JSON
  }
  return [`Request failed (${res.status})`]
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    throw new ApiError(await readErrors(res))
  }
  return res.json()
}

function postJson<T>(url: string, payload: unknown): Promise<T> {
  return request<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function renameProject(id: number, title: string): Promise<ProjectSummary> {
  return request<ProjectSummary>(`/api/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
}

export function getProject(id: number): Promise<ProjectDetail> {
  return request<ProjectDetail>(`/api/projects/${id}`)
}

export function listProjects(): Promise<ProjectSummary[]> {
  return request<ProjectSummary[]>('/api/projects')
}

export function previewPlan(text: string): Promise<PlanImport> {
  return postJson<PlanImport>('/api/projects/import/preview', { text })
}

export function importPlan(text: string): Promise<ImportResponse> {
  return postJson<ImportResponse>('/api/projects/import', { text })
}

