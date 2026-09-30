import { expect, test } from '@playwright/test'
import { createProject, uniqueTitle } from './helpers.js'

function sidebarLink(page: import('@playwright/test').Page, title: string) {
  return page.getByRole('navigation', { name: 'Projects' }).getByRole('link', { name: title })
}

test('sidebar lists a project and opens it', async ({ page, request }) => {
  const title = uniqueTitle('Open')
  const id = await createProject(request, title)

  await page.goto('/')
  await sidebarLink(page, title).click()

  await expect(page).toHaveURL(new RegExp(`/projects/${id}$`))
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
  await expect(sidebarLink(page, title)).toHaveClass(/active/)

  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
})

test('renaming updates the heading and the sidebar', async ({ page, request }) => {
  const id = await createProject(request, uniqueTitle('Rename'))
  const newTitle = uniqueTitle('Renamed')

  await page.goto(`/projects/${id}`)
  await page.getByRole('button', { name: 'Rename' }).click()
  await page.getByLabel('Project title').fill(newTitle)
  await page.getByLabel('Project title').press('Enter')

  await expect(page.getByRole('heading', { level: 1, name: newTitle })).toBeVisible()
  await expect(sidebarLink(page, newTitle)).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: newTitle })).toBeVisible()
})

test('cancelling a rename keeps the original title', async ({ page, request }) => {
  const title = uniqueTitle('Cancel')
  const id = await createProject(request, title)

  await page.goto(`/projects/${id}`)
  await page.getByRole('button', { name: 'Rename' }).click()
  await page.getByLabel('Project title').fill('Something else')
  await page.getByLabel('Project title').press('Escape')

  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
  await expect(page.getByLabel('Project title')).toBeHidden()
})

test('blank titles cannot be saved', async ({ page, request }) => {
  const id = await createProject(request, uniqueTitle('Blank'))

  await page.goto(`/projects/${id}`)
  await page.getByRole('button', { name: 'Rename' }).click()
  await page.getByLabel('Project title').fill('   ')

  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled()
})

test('unknown projects show not found', async ({ page }) => {
  await page.goto('/projects/99999999')
  await expect(page.getByRole('alert')).toContainText('Project not found')

  await page.goto('/projects/abc')
  await expect(page.getByRole('alert')).toContainText('Project not found')
})