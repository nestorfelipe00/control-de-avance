import { useEffect, useState } from 'react'
import { getAvance } from '../data/avanceRepository.js'

/**
 * Hook que carga los registros de avance desde el repositorio (mock o Supabase).
 * Devuelve { registros, cargando, error }.
 */
export function useAvanceData() {
  const [registros, setRegistros] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let vivo = true
    getAvance()
      .then((data) => {
        if (vivo) setRegistros(data)
      })
      .catch((e) => vivo && setError(e))
      .finally(() => vivo && setCargando(false))
    return () => {
      vivo = false
    }
  }, [])

  return { registros, cargando, error }
}
