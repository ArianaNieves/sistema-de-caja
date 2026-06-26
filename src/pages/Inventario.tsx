import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, BarChart3 } from 'lucide-react'
import { api } from '@/api/client'
import type { MovimientoInventario } from '@/types'
import Spinner from '@/components/Spinner'
import Drawer from '@/components/Drawer'
import EmptyState from '@/components/EmptyState'
import NuevoMovStock from '@/forms/NuevoMovStock'

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })

export default function Inventario() {
  const [drawer, setDrawer] = useState(false)

  const { data: movimientos = [], isLoading } = useQuery<MovimientoInventario[]>({
    queryKey: ['inventario'],
    queryFn: () => api.get<MovimientoInventario[]>('getInventario'),
  })

  return (
    <>
      <div className="px-4 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Inventario</h1>
          <button className="btn-primary" onClick={() => setDrawer(true)}>
            <Plus size={16} /> Movimiento
          </button>
        </div>

        {isLoading ? (
          <Spinner className="h-40" />
        ) : movimientos.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="Sin movimientos de stock"
            description="Los movimientos de inventario se registran automáticamente al vender"
          />
        ) : (
          <div className="space-y-2">
            {[...movimientos].reverse().map(m => (
              <div key={m.id} className="card flex items-center gap-3">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  m.tipo === 'entrada' ? 'bg-green-100 text-green-700' :
                  m.tipo === 'salida'  ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {m.tipo === 'entrada' ? '+' : m.tipo === 'salida' ? '-' : '±'}
                  {m.cantidad}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.nombreProducto}</p>
                  <p className="text-xs text-gray-400">{fmtFecha(m.fecha)} · {m.motivo}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-gray-400">{m.sku}</span>
                  <p className="text-xs text-gray-500">Stock: {m.stockResultante}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Movimiento de stock">
        <NuevoMovStock onClose={() => setDrawer(false)} />
      </Drawer>
    </>
  )
}
