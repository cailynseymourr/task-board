import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { COLUMNS } from '../constants'
import { getDueStatus } from '../dateUtils'

function formatTimestamp(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export default function TaskDetail({ task, onClose }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)

  const statusTitle = COLUMNS.find(c => c.id === task.status)?.title
  const due = getDueStatus(task)

  async function loadComments(isCancelled = () => false) {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('task_id', task.id)
      .order('created_at', { ascending: true })
    if (isCancelled()) return
    if (error) setError('Could not load comments.')
    else setComments(data)
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    setComments([])
    loadComments(() => cancelled)
    return () => { cancelled = true }
  }, [task.id])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function postComment(e) {
    e.preventDefault()
    const body = text.trim()
    if (!body) return
    setPosting(true)
    setError(null)
    const { data, error } = await supabase
      .from('comments')
      .insert({ task_id: task.id, body })
      .select()
      .single()
    setPosting(false)
    if (error) {
      setError('Could not post your comment. Please try again.')
      return
    }
    setComments(cs => [...cs, data])
    setText('')
  }

  return (
    <div className="panel-backdrop" onClick={onClose}>
      <aside
        className="panel"
        role="dialog"
        aria-label="Task details"
        onClick={e => e.stopPropagation()}
      >
        <header className="panel-header">
          <span className="panel-status">{statusTitle}</span>
          <button className="panel-close" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <h2 className="panel-title">{task.title}</h2>
        <div className="card-meta">
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          {due && <span className={`due due-${due.type}`}>{due.label}</span>}
        </div>
        {task.description && <p className="panel-desc">{task.description}</p>}

        <h3 className="panel-section">Comments ({comments.length})</h3>

        {error && <div className="error-banner"><span>{error}</span></div>}

        <div className="comment-list">
          {loading && <p className="panel-muted">Loading comments…</p>}
          {!loading && comments.length === 0 && (
            <p className="panel-muted">No comments yet. Start the conversation below.</p>
          )}
          {comments.map(c => (
            <div key={c.id} className="comment">
              <div className="comment-time">{formatTimestamp(c.created_at)}</div>
              <div className="comment-body">{c.body}</div>
            </div>
          ))}
        </div>

        <form className="comment-form" onSubmit={postComment}>
          <textarea
            placeholder="Write a comment…"
            value={text}
            maxLength={1000}
            onChange={e => setText(e.target.value)}
          />
          <button type="submit" disabled={posting || !text.trim()}>
            {posting ? 'Posting…' : 'Post comment'}
          </button>
        </form>
      </aside>
    </div>
  )
}