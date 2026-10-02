type Props = {
  done: number
  total: number
}

function ProgressBar({ done, total }: Props) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div className="progress-wrap">
      <div
        className="progress"
        role="progressbar"
        aria-label="Project progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
      >
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <span>
        {done} / {total}
      </span>
    </div>
  )
}

export default ProgressBar