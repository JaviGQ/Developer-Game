export type PlanMilestone = {
  title: string
  description: string
  acceptance_criteria: string[]
  completed: boolean
}

export type PlanContext = {
  stack: string[]
  decisions: string[]
  current_status: string
  open_questions: string[]
}

export type PlanImport = {
  schema_version: string
  title: string
  summary: string
  context: PlanContext
  milestones: PlanMilestone[]
}