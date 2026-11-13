import { useDroppable } from '@dnd-kit/core'
import TaskCard from './TaskCard'

export default function Column({ column, tasks }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  return (
    <section className={`column ${isOver ? 'column-over' : ''}`}>
      <header className="column-header">
        <h2>{column.title}</h2>
        <span className="count">{tasks.length}</span>
      </header>
      <div ref={setNodeRef} className="column-body">
        {tasks.length === 0 && <p className="empty">No tasks here yet</p>}
        {tasks.map(t => <TaskCard key={t.id} task={t} />)}
      </div>
    </section>
  )
}