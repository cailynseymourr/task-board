import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { useGuestSession } from './useGuestSession'

export default function App() {
  const { session, loading, error } = useGuestSession()
  const [tasks, setTasks] = useState([])

  async function load() {
    const { data, error } = await supabase.from('tasks').select('*')
    if (error) console.error(error)
    else setTasks(data)
  }

  async function add() {
    const { error } = await supabase
      .from('tasks')
      .insert({ title: 'Test task ' + new Date().toLocaleTimeString() })
    if (error) console.error(error)
    load()
  }

  useEffect(() => {
    if (session) load()
  }, [session])

  if (loading) return <p>Starting guest session…</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div style={{ padding: 24 }}>
      <p>Guest user id: {session.user.id}</p>
      <button onClick={add}>Add test task</button>
      <ul>
        {tasks.map(t => <li key={t.id}>{t.title}</li>)}
      </ul>
    </div>
  )
}
