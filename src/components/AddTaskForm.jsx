import { useState } from 'react'

export default function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('normal')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    const ok = await onAdd({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      due_date: dueDate || null,
    })
    setSaving(false)
    if (ok) {
      setTitle(''); setDescription(''); setPriority('normal'); setDueDate('')
    }
  }

  return (
    <form className="add-form" onSubmit={submit}>
      <input
        placeholder="Task title (required)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <input
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <select value={priority} onChange={e => setPriority(e.target.value)}>
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
      </select>
      <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
      <button type="submit" disabled={saving}>{saving ? 'Adding…' : 'Add task'}</button>
    </form>
  )
}