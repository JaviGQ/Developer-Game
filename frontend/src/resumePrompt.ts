import type { ProjectDetail } from './types'

export function buildResumePrompt(project: ProjectDetail): string {
  const lines = [
    'Write resume bullet points for a software project I completed.',
    '',
    'Rules:',
    '- Write 2 to 4 bullets, each one line, starting with a strong past-tense action verb.',
    '- Be specific about the technologies used and what was built.',
    '- Do not invent metrics, numbers, or results that are not stated below.',
    '- Output only the bullets as plain text, one per line, each starting with "• ".',
    '',
    `Project: ${project.title}`,
  ]

  if (project.summary) lines.push(`Summary: ${project.summary}`)

  const context = project.context
  if (context?.stack.length) lines.push(`Stack: ${context.stack.join(', ')}`)
  if (context?.decisions.length) {
    lines.push('Key decisions:', ...context.decisions.map((d) => `- ${d}`))
  }

  lines.push(
    'Completed milestones:',
    ...project.milestones.map((m) => `- ${m.title}: ${m.acceptance_criteria.join('; ')}`),
  )

  return lines.join('\n')
}