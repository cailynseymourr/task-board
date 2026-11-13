// Parse 'YYYY-MM-DD' as a LOCAL date. new Date('2026-11-13') would be read
// as UTC and can show up as the previous day in US time zones.
export function parseLocalDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDate(str) {
  return parseLocalDate(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function getDueStatus(task) {
  if (!task.due_date) return null
  if (task.status === 'done') {
    return { type: 'done', label: `Due ${formatDate(task.due_date)}` }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.round((parseLocalDate(task.due_date) - today) / 86400000)

  if (days < 0) {
    return { type: 'overdue', label: days === -1 ? 'Overdue by 1 day' : `Overdue by ${-days} days` }
  }
  if (days === 0) return { type: 'soon', label: 'Due today' }
  if (days === 1) return { type: 'soon', label: 'Due tomorrow' }
  if (days === 2) return { type: 'soon', label: 'Due in 2 days' }
  return { type: 'later', label: `Due ${formatDate(task.due_date)}` }
}