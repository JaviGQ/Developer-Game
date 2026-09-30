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

export type ImportResponse = {
  id: number
  title: string
  milestone_count: number
}

export type ProjectSummary = {
  id: number
  title: string
  status: string
  version: number
}

export type MilestoneOut = {
  id: number
  position: number
  title: string
  description: string
  acceptance_criteria: string[]
  completed_at: string | null
}

export type ProjectDetail = ProjectSummary & {
  summary: string | null
  context: PlanContext | null
  created_at: string
  completed_at: string | null
  milestones: MilestoneOut[]
}