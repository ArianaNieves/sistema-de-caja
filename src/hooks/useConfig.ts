import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Config } from '@/types'

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `${r} ${g} ${b}`
}

function shadeHex(hex: string, amount: number): string {
  const clean = hex.replace('#', '')
  const num = parseInt(clean, 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount))
  return `${r} ${g} ${b}`
}

export function useConfig() {
  const { data: config } = useQuery<Config>({
    queryKey: ['config'],
    queryFn: () => api.get<Config>('getConfig'),
    staleTime: 1000 * 60 * 10,
    enabled: !!import.meta.env.VITE_API_URL,
  })

  useEffect(() => {
    if (!config) return
    const root = document.documentElement
    const p = config.colorPrimario || '#6366f1'
    const a = config.colorSecundario || '#f59e0b'
    root.style.setProperty('--color-primary-50',  shadeHex(p,  160))
    root.style.setProperty('--color-primary-100', shadeHex(p,  120))
    root.style.setProperty('--color-primary-500', hexToRgb(p))
    root.style.setProperty('--color-primary-600', shadeHex(p,  -20))
    root.style.setProperty('--color-primary-700', shadeHex(p,  -40))
    root.style.setProperty('--color-accent-500',  hexToRgb(a))
    root.style.setProperty('--color-accent-600',  shadeHex(a, -20))

    if (config.nombreNegocio) {
      document.title = config.nombreNegocio
    }
  }, [config])

  return config
}
