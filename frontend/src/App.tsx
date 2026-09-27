import { useEffect, useState } from 'react'

type Health = { status: string; database: string }

function App() {
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: Health) => setHealth(data))
      .catch(() => setError('Could not reach the API'))
  }, [])

  if (error) return <p>{error}</p>
  if (!health) return <p>Checking API…</p>

  return (
    <main>
      <h1>DeveloperGame</h1>
      <p>API: {health.status}</p>
      <p>Database: {health.database}</p>
    </main>
  )
}

export default App