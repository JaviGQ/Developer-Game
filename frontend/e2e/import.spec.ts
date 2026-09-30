import { expect, test } from '@playwright/test'

function validPlan(title: string, milestoneCount = 1): string {
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

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('shows an error for text without JSON', async ({ page }) => {
  await page.getByPlaceholder('Paste your plan here').fill('hello')
  await page.getByRole('button', { name: 'Preview' }).click()
  await expect(page.getByRole('alert')).toContainText('No JSON object found')
})

test('lists each missing field', async ({ page }) => {
  await page.getByPlaceholder('Paste your plan here').fill('{"schema_version": "1"}')
  await page.getByRole('button', { name: 'Preview' }).click()
  const alert = page.getByRole('alert')
  await expect(alert).toContainText('title: Field required')
  await expect(alert).toContainText('summary: Field required')
  await expect(alert).toContainText('milestones: Field required')
})

test('loads a plan from a file', async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles({
    name: 'plan.json',
    mimeType: 'application/json',
    buffer: Buffer.from(validPlan('Loaded From File')),
  })
  await expect(page.getByPlaceholder('Paste your plan here')).toHaveValue(/Loaded From File/)
})

test('editing the text clears the preview', async ({ page }) => {
  const textarea = page.getByPlaceholder('Paste your plan here')
  await textarea.fill(validPlan('Edit Test'))
  await page.getByRole('button', { name: 'Preview' }).click()
  await expect(page.getByRole('button', { name: 'Save project' })).toBeVisible()

  await textarea.fill(validPlan('Edit Test') + '\n')
  await expect(page.getByRole('button', { name: 'Save project' })).toBeHidden()
})

test('shows save errors next to the Save button', async ({ page }) => {
  await page.route('**/api/projects/import', (route) =>
    route.fulfill({ status: 502, body: '' }),
  )
  await page.getByPlaceholder('Paste your plan here').fill(validPlan('Long Plan', 20))
  await page.getByRole('button', { name: 'Preview' }).click()
  await page.getByRole('button', { name: 'Save project' }).click()

  const alert = page.getByRole('alert')
  await expect(alert).toContainText('Request failed (502)')
  await expect(alert).toBeInViewport()
})

test('previews and saves a valid plan', async ({ page }) => {
  const title = `E2E Test Plan ${Date.now()}`
  await page.getByPlaceholder('Paste your plan here').fill(validPlan(title))
  await page.getByRole('button', { name: 'Preview' }).click()
  await expect(page.getByRole('heading', { name: title })).toBeVisible()

  await page.getByRole('button', { name: 'Save project' }).click()
  await expect(page.getByRole('heading', { name: 'Plan imported' })).toBeVisible()
  await expect(page.getByText(title)).toBeVisible()
})