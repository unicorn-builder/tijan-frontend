// useProjects.js — Hook CRUD projets Supabase
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export function useProjects() {
  const { supabase, user } = useAuth()
  const [projets, setProjets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchProjets()
  }, [user])

  const fetchProjets = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('projets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error) setProjets(data || [])
    setLoading(false)
  }

  const sauvegarderProjet = async (params, resultats_structure, resultats_mep = null) => {
    const { data, error } = await supabase
      .from('projets')
      .insert({
        user_id: user.id,
        nom: params.nom,
        ville: params.ville,
        pays: params.pays || 'Senegal',
        nb_niveaux: params.nb_niveaux,
        surface_emprise_m2: params.surface_emprise_m2,
        portee_max_m: params.portee_max_m,
        portee_min_m: params.portee_min_m,
        nb_travees_x: params.nb_travees_x,
        nb_travees_y: params.nb_travees_y,
        usage: params.usage || 'residentiel',
        resultats_structure,
        resultats_mep,
      })
      .select()
      .single()
    if (!error) setProjets(prev => [data, ...prev])
    return { data, error }
  }

  const supprimerProjet = async (id) => {
    const { error } = await supabase.from('projets').delete().eq('id', id)
    if (!error) setProjets(prev => prev.filter(p => p.id !== id))
    return { error }
  }

  return { projets, loading, fetchProjets, sauvegarderProjet, supprimerProjet }
}
