import { expect, test } from '@playwright/test'
import { createProject, sidebarLink, uniqueTitle } from './helpers.js'

function progress(page: import('@playwright/test').Page) {
  return page.getByRole('progressbar', { name: 'Project progress' })
}

function milestoneHeading(page: import('@playwright/test').Page, n: number) {
  return page.getByRole('heading', { level: 1, name: `Milestone ${n}`, exact: true })
}

test('continue opens the first unfinished milestone', async ({ page, request }) => {
  const id = await createProject(request, uniqueTitle('Continue'), 3)

  await page.goto(`/projects/${id}`)
  await page.getByRole('link', { name: 'Continue: Milestone 1' }).click()
  await expect(milestoneHeading(page, 1)).toBeVisible()

  await page.getByRole('button', { name: 'Complete and continue' }).click()
  await page.goto(`/projects/${id}`)
  await expect(page.getByRole('link', { name: 'Continue: Milestone 2' })).toBeVisible()
})

test('completing advances and fills the progress bar', async ({ page, request }) => {
  const id = await createProject(request, uniqueTitle('Advance'), 3)

  await page.goto(`/projects/${id}/milestones/1`)
  await expect(progress(page)).toHaveAttribute('aria-valuenow', '0')

  await page.getByRole('button', { name: 'Complete and continue' }).click()

  await expect(page).toHaveURL(new RegExp(`/projects/${id}/milestones/2$`))
  await expect(milestoneHeading(page, 2)).toBeVisible()
  await expect(progress(page)).toHaveAttribute('aria-valuenow', '1')

  await page.reload()
  await expect(progress(page)).toHaveAttribute('aria-valuenow', '1')
})

test('skip moves ahead without completing', async ({ page, request }) => {
  const id = await createProject(request, uniqueTitle('Skip'), 3)

  await page.goto(`/projects/${id}/milestones/1`)
  await page
    .getByRole('navigation', { name: 'Milestone navigation' })
    .getByRole('link', { name: 'Skip' })
    .click()

  await expect(milestoneHeading(page, 2)).toBeVisible()
  await expect(progress(page)).toHaveAttribute('aria-valuenow', '0')
})

test('mark as not done reopens a milestone', async ({ page, request }) => {
  const id = await createProject(request, uniqueTitle('Reopen'), 3)

  await page.goto(`/projects/${id}/milestones/1`)
  await page.getByRole('button', { name: 'Complete and continue' }).click()
  await expect(milestoneHeading(page, 2)).toBeVisible()

  await page.getByRole('link', { name: 'Previous' }).click()
  await expect(page.getByText('✓ Completed')).toBeVisible()

  await page.getByRole('button', { name: 'Mark as not done' }).click()
  await expect(progress(page)).toHaveAttribute('aria-valuenow', '0')
  await expect(page.getByRole('button', { name: 'Complete and continue' })).toBeVisible()
})

test('completing the last milestone completes the project', async ({ page, request }) => {
  const title = uniqueTitle('Finish')
  const id = await createProject(request, title, 2)

  await page.goto(`/projects/${id}/milestones/1`)
  await page.getByRole('button', { name: 'Complete and continue' }).click()
  await page.getByRole('button', { name: 'Complete final milestone' }).click()

  await expect(page).toHaveURL(new RegExp(`/projects/${id}$`))
  await expect(progress(page)).toHaveAttribute('aria-valuenow', '2')
  await expect(sidebarLink(page, title)).toContainText('✓')
})

test('unknown milestones show not found', async ({ page, request }) => {
  const id = await createProject(request, uniqueTitle('Missing'), 1)

  await page.goto(`/projects/${id}/milestones/999`)
  await expect(page.getByRole('alert')).toContainText('Milestone not found')
})