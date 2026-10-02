import { expect, test } from '@playwright/test'
import { completeMilestones, createProject, uniqueTitle } from './helpers.js'

test('finishing with skipped milestones returns to them instead of celebrating', async ({
  page,
  request,
}) => {
  const id = await createProject(request, uniqueTitle('Skipped'), 3)

  await page.goto(`/projects/${id}/milestones/3`)
  await page.getByRole('button', { name: 'Complete milestone' }).click()

  await expect(page).toHaveURL(new RegExp(`/projects/${id}/milestones/1$`))
  await expect(page.getByRole('heading', { name: 'Project complete!' })).toHaveCount(0)
})

test('the celebration redirects unfinished projects', async ({ page, request }) => {
  const id = await createProject(request, uniqueTitle('Redirect'), 1)

  await page.goto('/')
  await page.goto(`/projects/${id}/complete`)
  await expect(page).toHaveURL(new RegExp(`/projects/${id}$`))

  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
})

test('the celebration shows stats for a completed project', async ({ page, request }) => {
  const id = await createProject(request, uniqueTitle('Stats'), 2)
  await completeMilestones(request, id)

  await page.goto(`/projects/${id}/complete`)
  await expect(page.getByRole('heading', { name: 'Project complete!' })).toBeVisible()
  await expect(page.getByText('You completed 2 milestones')).toBeVisible()
})

test('completed projects are read-only in the UI and the API', async ({ page, request }) => {
  const id = await createProject(request, uniqueTitle('ReadOnly'), 2)
  await completeMilestones(request, id)

  await page.goto(`/projects/${id}/milestones/1`)
  await expect(page.getByText('milestones are read-only')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Mark as not done' })).toHaveCount(0)

  const project = await (await request.get(`/api/projects/${id}`)).json()
  const res = await request.patch(
    `/api/projects/${id}/milestones/${project.milestones[0].id}`,
    { data: { completed: false } },
  )
  expect(res.status()).toBe(409)
})

test('a resume insert can be saved, edited, and cleared', async ({ page, request }) => {
  const id = await createProject(request, uniqueTitle('Resume'), 1)
  await completeMilestones(request, id)

  await page.goto(`/projects/${id}/complete`)
  const section = page.getByRole('region', { name: 'Resume insert' })
  const textbox = section.getByRole('textbox', { name: 'Resume insert' })

  await textbox.fill('• Built a tested project tracker')
  await section.getByRole('button', { name: 'Save resume insert' }).click()
  await expect(section).toContainText('Built a tested project tracker')

  await page.reload()
  await expect(section).toContainText('Built a tested project tracker')

  await section.getByRole('button', { name: 'Edit' }).click()
  await textbox.fill('')
  await section.getByRole('button', { name: 'Save resume insert' }).click()
  await expect(section.getByRole('button', { name: 'Copy prompt' })).toBeVisible()
})

test.describe('clipboard', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  test('copy prompt puts the project details on the clipboard', async ({ page, request }) => {
    const title = uniqueTitle('Clipboard')
    const id = await createProject(request, title, 2)
    await completeMilestones(request, id)

    await page.goto(`/projects/${id}/complete`)
    await page.getByRole('button', { name: 'Copy prompt' }).click()
    await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible()

    const clipboard = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboard).toContain(title)
    expect(clipboard).toContain('Milestone 2')
    expect(clipboard).toContain('Do not invent metrics')
  })
})