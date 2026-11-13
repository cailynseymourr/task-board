import { useDraggable } from '@dnd-kit/core'
import { getDueStatus } from '../dateUtils'

export function CardBody({ task }) {
  const due = getDueStatus(task)
  return (
    <>
      <div className="card-title">{task.title}</div>
      {task.description && <div className="card-desc">{task.description}</div>}
      <div className="card-meta">
        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
        {due && <span className={`due due-${due.type}`}>{due.label}</span>}
      </div>
    </>
  )
}

export default function TaskCard({ task, onOpen }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id })
  return (
    <div
      ref={setNodeRef}
      className={`card ${isDragging ? 'card-dragging' : ''}`}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(task.id)}
    >
      <CardBody task={task} />
    </div>
  )
}