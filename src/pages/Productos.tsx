import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, AlertTriangle, Package } from 'lucide-react'
import { api } from '@/api/client'
import type { Producto } from '@/types'
import Spinner from '@/components/Spinner'
import Drawer from '@/components/Drawer'
import EmptyState from '@/components/EmptyState'
import NuevoProducto from '@/forms/NuevoProducto'
import NuevoMovStock from '@/forms/NuevoMovStock'

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

export default function Productos() {
  const [search, setSearch]     = useState('')
  const [drawerNew, setDrawerNew] = useState(false)
  const [drawerStock, setDrawerStock] = useState<string | null>(null)

  const { data: productos = [], isLoading } = useQuery<Producto[]>({
    queryKey: ['productos'],
    queryFn: () => api.get<Producto[]>('getProductos'),
  })

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="px-4 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Productos</h1>
          <button className="btn-primary" onClick={() => setDrawerNew(true)}>
            <Plus size={16} /> Nuevo
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por nombre o SKU"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <Spinner className="h-40" />
        ) : filtrados.length === 0 ? (
          <EmptyState
            icon={Package}
            title={search ? 'Sin resultados' : 'Sin productos aún'}
            description="Agregá tu primer producto con el botón Nuevo"
            action={!search ? { label: 'Nuevo producto', onClick: () => setDrawerNew(true) } : undefined}
          />
        ) : (
          <div className="space-y-2">
            {filtrados.map(prod => (
              <div
                key={prod.sku}
                className="card flex items-center gap-3"
                onClick={() => setDrawerStock(prod.sku)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400">{prod.sku}</span>
                    {prod.stock <= prod.stockMinimo && prod.stockMinimo > 0 && (
                      <AlertTriangle size={12} className="text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{prod.nombre}</p>
                  <p className="text-xs text-gray-400">{prod.categoria || 'Sin categoría'}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-gray-900">{fmt(prod.precioVentaConIva)}</p>
                  <p className={`text-xs ${
                    prod.stock <= prod.stockMinimo && prod.stockMinimo > 0
                      ? 'text-red-500 font-medium'
                      : 'text-gray-400'
                  }`}>
                    Stock: {prod.stock}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Drawer open={drawerNew} onClose={() => setDrawerNew(false)} title="Nuevo producto">
        <NuevoProducto onClose={() => setDrawerNew(false)} />
      </Drawer>

      <Drawer
        open={drawerStock !== null}
        onClose={() => setDrawerStock(null)}
        title="Movimiento de stock"
      >
        <NuevoMovStock
          skuInicial={drawerStock ?? undefined}
          onClose={() => setDrawerStock(null)}
        />
      </Drawer>
    </>
  )
}
