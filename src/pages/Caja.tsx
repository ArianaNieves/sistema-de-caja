import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { api } from '@/api/client'
import type { MovimientoCaja } from '@/types'
import Spinner from '@/components/Spinner'
import Drawer from '@/components/Drawer'
import EmptyState from '@/components/EmptyState'
import NuevoMovCaja from '@/forms/NuevoMovCaja'

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })

export default function Caja() {
  const [tipo, setTipo] = useState<'todos' | 'ingreso' | 'egreso'>('todos')
  const [drawer, setDrawer] = useState(false)

  const { data: movimientos = [], isLoading } = useQuery<MovimientoCaja[]>({
    queryKey: ['caja'],
    queryFn: () => api.get<MovimientoCaja[]>('getCaja'),
  })

  const saldo = movimientos.length > 0 ? movimientos[movimientos.length - 1].saldoAcumulado : 0
  const filtrados = movimientos.filter(m => tipo === 'todos' || m.tipo === tipo).reverse()

  return (
    <>
      <div className="px-4 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Caja</h1>
          <button className="btn-primary" onClick={() => setDrawer(true)}>
            <Plus size={16} /> Movimiento
          </button>
        </div>

        <div className="card bg-primary-600 text-white border-0">
          <p className="text-sm opacity-80">Saldo actual</p>
          <p className="text-3xl font-bold mt-1">{fmt(saldo)}</p>
        </div>

        <div className="flex gap-2">
          {(['todos', 'ingreso', 'egreso'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTipo(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                tipo === t
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <Spinner className="h-40" />
        ) : filtrados.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Sin movimientos"
            description="Registrá un ingreso o egreso de caja"
            action={{ label: 'Nuevo movimiento', onClick: () => setDrawer(true) }}
          />
        ) : (
          <div className="space-y-2">
            {filtrados.map(m => (
              <div key={m.id} className="card flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${m.tipo === 'ingreso' ? 'bg-green-50' : 'bg-red-50'}`}>
                  {m.tipo === 'ingreso'
                    ? <TrendingUp size={18} className="text-green-600" />
                    : <TrendingDown size={18} className="text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.concepto}</p>
                  <p className="text-xs text-gray-400">{fmtFecha(m.fecha)} · {m.categoria}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${m.tipo === 'ingreso' ? 'text-green-600' : 'text-red-500'}`}>
                    {m.tipo === 'ingreso' ? '+' : '-'}{fmt(m.monto)}
                  </p>
                  <p className="text-xs text-gray-400">{fmt(m.saldoAcumulado)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Nuevo movimiento de caja">
        <NuevoMovCaja onClose={() => setDrawer(false)} />
      </Drawer>
    </>
  )
}
