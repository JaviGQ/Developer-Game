import type { PlanImport } from './types'

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
    // Response wasn't JSON; fall through to the generic message
  }
  return [`Request failed (${res.status})`]
}

export async function previewPlan(text: string): Promise<PlanImport> {
  const res = await fetch('/api/projects/import/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) {
    throw new ApiError(await readErrors(res))
  }
  return res.json()
}