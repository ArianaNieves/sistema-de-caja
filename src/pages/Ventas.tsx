import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, ShoppingCart } from 'lucide-react'
import { api } from '@/api/client'
import type { Venta } from '@/types'
import Spinner from '@/components/Spinner'
import Drawer from '@/components/Drawer'
import EmptyState from '@/components/EmptyState'
import NuevaVenta from '@/forms/NuevaVenta'

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })

const tipoBadge: Record<string, string> = {
  contado:          'bg-green-100 text-green-700',
  cuota:            'bg-yellow-100 text-yellow-700',
  senia:            'bg-blue-100 text-blue-700',
  cuenta_corriente: 'bg-purple-100 text-purple-700',
}

export default function Ventas() {
  const [search, setSearch]   = useState('')
  const [drawer, setDrawer]   = useState(false)

  const { data: ventas = [], isLoading } = useQuery<Venta[]>({
    queryKey: ['ventas'],
    queryFn: () => api.get<Venta[]>('getVentas'),
  })

  const filtradas = ventas.filter(v =>
    v.cliente.toLowerCase().includes(search.toLowerCase()) ||
    v.id.includes(search)
  )

  return (
    <>
      <div className="px-4 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Ventas</h1>
          <button className="btn-primary" onClick={() => setDrawer(true)}>
            <Plus size={16} /> Nueva
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por cliente o N° venta"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <Spinner className="h-40" />
        ) : filtradas.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title={search ? 'Sin resultados' : 'Sin ventas aún'}
            description={search ? 'Probá con otro término' : 'Registrá tu primera venta con el botón Nueva'}
            action={!search ? { label: 'Nueva venta', onClick: () => setDrawer(true) } : undefined}
          />
        ) : (
          <div className="space-y-2">
            {filtradas.map(venta => (
              <div key={venta.id} className="card flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">#{venta.id}</span>
                    <span className="text-xs text-gray-400">{fmtFecha(venta.fecha)}</span>
                  </div>
                  <p className="text-sm font-medium truncate">{venta.cliente || 'Consumidor final'}</p>
                  <p className="text-xs text-gray-400">{venta.medioPago} · {venta.canalVenta}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-gray-900">{fmt(venta.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${tipoBadge[venta.tipoPago] ?? 'bg-gray-100 text-gray-600'}`}>
                    {venta.tipoPago.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Nueva venta">
        <NuevaVenta onClose={() => setDrawer(false)} />
      </Drawer>
    </>
  )
}
