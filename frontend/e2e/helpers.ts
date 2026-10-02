import { expect } from '@playwright/test'
import type { APIRequestContext, Page } from '@playwright/test'

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

export async function createProject(
  request: APIRequestContext,
  title: string,
  milestoneCount = 1,
): Promise<number> {
  const res = await request.post('/api/projects/import', {
    data: { text: validPlan(title, milestoneCount) },
  })
  expect(res.ok()).toBeTruthy()
  const body = await res.json()
  return body.id
}

export function sidebarLink(page: Page, title: string) {
  return page.getByRole('navigation', { name: 'Projects' }).getByRole('link', { name: title })
}

export async function completeMilestones(
  request: APIRequestContext,
  projectId: number,
  positions?: number[],
): Promise<void> {
  const res = await request.get(`/api/projects/${projectId}`)
  const project = await res.json()
  for (const m of project.milestones) {
    if (positions && !positions.includes(m.position)) continue
    const update = await request.patch(`/api/projects/${projectId}/milestones/${m.id}`, {
      data: { completed: true },
    })
    expect(update.ok()).toBeTruthy()
  }
}