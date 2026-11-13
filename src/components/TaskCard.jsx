import { useDraggable } from '@dnd-kit/core'

export function CardBody({ task }) {
    return (
        <>
        <div className="card-title">{task.title}</div>
        {task.description && <div className="card-desc">{task.description}</div>}
        <div className="card-meta">
            <span className={`badge badge-${task.priority}`}>{task.priority}</span>
            {task.due_date && <span className="due">Due {task.due_date}</span>}
            </div>
        </>
    )
}

export default function TaskCard({ task }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id })
  return (
    <div
      ref={setNodeRef}
      className={`card ${isDragging ? 'card-dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      <CardBody task={task} />
    </div>
  )
}