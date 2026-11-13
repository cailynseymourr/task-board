import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export function useGuestSession() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const { data: { session: existing } } = await supabase.auth.getSession()
        if (existing) {
          if (!cancelled) setSession(existing)
          return
        }
        const { data, error } = await supabase.auth.signInAnonymously()
        if (error) throw error
        if (!cancelled) setSession(data.session)
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [])

  return { session, loading, error }
}