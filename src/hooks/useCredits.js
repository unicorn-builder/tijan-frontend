// useCredits.js — Hook gestion crédits Tijan AI
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export function useCredits() {
  const { supabase, user } = useAuth()
  const [credits, setCredits] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchCredits()
  }, [user])

  const fetchCredits = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('credits')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!data && !error) {
      // Pas de ligne — créer avec 3 crédits gratuits (offre pionniers)
      const { data: newRow } = await supabase
        .from('credits')
        .insert({ user_id: user.id, total: 1, utilises: 0 })
        .select()
        .maybeSingle()
      setCredits(newRow)
    } else if (data) {
      setCredits(data)
    }
    setLoading(false)
  }

  const restants = credits ? credits.total - credits.utilises : 0

  const consommer = async (n = 1) => {
    if (restants < n) return false
    const { error } = await supabase
      .from('credits')
      .update({ utilises: credits.utilises + n, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
    if (!error) {
      setCredits(prev => ({ ...prev, utilises: prev.utilises + n }))
      return true
    }
    return false
  }

  const ajouter = async (nb) => {
    const { error } = await supabase
      .from('credits')
      .update({ total: credits.total + nb, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
    if (!error) {
      setCredits(prev => ({ ...prev, total: prev.total + nb }))
      return true
    }
    return false
  }

  return { credits, restants, loading, consommer, ajouter, fetchCredits }
}
