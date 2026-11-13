import { useDroppable } from '@dnd-kit/core'
import TaskCard from './TaskCard'

const EMPTY_TEXT = {
  todo: 'Nothing planned. Add a task above.',
  in_progress: 'Drag a task here when you start it.',
  in_review: 'Tasks waiting for review land here.',
  done: 'Finished tasks will show up here.',
}

export default function Column({ column, tasks, onOpen }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  return (
    <section className={`column ${isOver ? 'column-over' : ''}`}>
      <header className="column-header">
        <h2><span className={`dot dot-${column.id}`} />{column.title}</h2>
        <span className="count">{tasks.length}</span>
      </header>
      <div ref={setNodeRef} className="column-body">
        {tasks.length === 0 && <p className="empty">{EMPTY_TEXT[column.id]}</p>}
        {tasks.map(t => <TaskCard key={t.id} task={t} onOpen={onOpen} />)}
      </div>
    </section>
  )
}