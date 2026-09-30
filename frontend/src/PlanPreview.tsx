import type { PlanImport } from './types'

type Props = {
  plan: PlanImport
}

function PlanPreview({ plan }: Props) {
  return (
    <section>
      <h2>{plan.title}</h2>
      <p>{plan.summary}</p>

      {plan.context.stack.length > 0 && (
        <p>
          <strong>Stack:</strong> {plan.context.stack.join(', ')}
        </p>
      )}

      <h3>Milestones</h3>
      <ol>
        {plan.milestones.map((m, i) => (
          <li key={i}>
            {m.completed ? '✓ ' : ''}
            <strong>{m.title}</strong>
            <p>{m.description}</p>
            <ul>
              {m.acceptance_criteria.map((c, j) => (
                <li key={j}>{c}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default PlanPreview