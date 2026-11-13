import { useEffect, useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import { supabase } from './supabaseClient'
import { useGuestSession } from './useGuestSession'
import { COLUMNS } from './constants'
import Column from './components/Column'
import { CardBody } from './components/TaskCard'
import AddTaskForm from './components/AddTaskForm'
import './App.css'

export default function App() {
  const { session, loading: authLoading, error: authError } = useGuestSession()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  async function loadTasks() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError('Could not load your tasks. Please try again.')
    else setTasks(data)
    setLoading(false)
  }

  useEffect(() => {
    if (session) loadTasks()
  }, [session])

  async function addTask(fields) {
    setError(null)
    const { data, error } = await supabase
      .from('tasks')
      .insert(fields)
      .select()
      .single()
    if (error) {
      setError('Could not create the task. Please try again.')
      return false
    }
    setTasks(ts => [data, ...ts])
    return true
  }

  async function handleDragEnd({ active, over }) {
    setActiveId(null)
    if (!over) return
    const task = tasks.find(t => t.id === active.id)
    if (!task || task.status === over.id) return

    const previous = task.status
    // Optimistic update so the card doesn't snap back
    setTasks(ts => ts.map(t => (t.id === task.id ? { ...t, status: over.id } : t)))

    const { error } = await supabase
      .from('tasks')
      .update({ status: over.id })
      .eq('id', task.id)

    if (error) {
      setTasks(ts => ts.map(t => (t.id === task.id ? { ...t, status: previous } : t)))
      setError('Could not move that task, so it was put back.')
    }
  }

  if (authLoading) return <div className="page-message">Starting your guest session…</div>
  if (authError) return <div className="page-message error">Sign-in failed: {authError}</div>

  const activeTask = tasks.find(t => t.id === activeId)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Task Board</h1>
        <p className="subtitle">Drag tasks across columns to update their status.</p>
      </header>

      <AddTaskForm onAdd={addTask} />

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <span>
            <button onClick={loadTasks}>Retry</button>
            <button onClick={() => setError(null)}>Dismiss</button>
          </span>
        </div>
      )}

      {loading ? (
        <div className="board">
          {COLUMNS.map(col => (
            <section key={col.id} className="column">
              <header className="column-header"><h2>{col.title}</h2></header>
              <div className="skeleton" />
              <div className="skeleton" />
            </section>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={e => setActiveId(e.active.id)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="board">
            {COLUMNS.map(col => (
              <Column
                key={col.id}
                column={col}
                tasks={tasks.filter(t => t.status === col.id)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? <div className="card card-overlay"><CardBody task={activeTask} /></div> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}
