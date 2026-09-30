import { expect } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

export function validPlan(title: string, milestoneCount = 1): string {
  return JSON.stringify({
    schema_version: '1',
    title,
    summary: 'Created by an end-to-end test',
    milestones: Array.from({ length: milestoneCount }, (_, i) => ({
      title: `Milestone ${i + 1}`,
      description: 'Do the thing',
      acceptance_criteria: ['It works'],
    })),
  })
}

export function uniqueTitle(label: string): string {
  return `E2E Test Plan ${label} ${Date.now()}`
}

export async function createProject(request: APIRequestContext, title: string): Promise<number> {
  const res = await request.post('/api/projects/import', { data: { text: validPlan(title) } })
  expect(res.ok()).toBeTruthy()
  const body = await res.json()
  return body.id
}