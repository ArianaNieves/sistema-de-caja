import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Users } from 'lucide-react'
import { api } from '@/api/client'
import type { Cliente } from '@/types'
import Spinner from '@/components/Spinner'
import Drawer from '@/components/Drawer'
import EmptyState from '@/components/EmptyState'
import NuevoCliente from '@/forms/NuevoCliente'

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

export default function Clientes() {
  const [search, setSearch] = useState('')
  const [drawer, setDrawer] = useState(false)

  const { data: clientes = [], isLoading } = useQuery<Cliente[]>({
    queryKey: ['clientes'],
    queryFn: () => api.get<Cliente[]>('getClientes'),
  })

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.telefono.includes(search)
  )

  return (
    <>
      <div className="px-4 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Clientes</h1>
          <button className="btn-primary" onClick={() => setDrawer(true)}>
            <Plus size={16} /> Nuevo
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Nombre, email o teléfono"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <Spinner className="h-40" />
        ) : filtrados.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? 'Sin resultados' : 'Sin clientes aún'}
            description="Creá tu base de clientes para llevar el historial de compras"
            action={!search ? { label: 'Nuevo cliente', onClick: () => setDrawer(true) } : undefined}
          />
        ) : (
          <div className="space-y-2">
            {filtrados.map(cliente => (
              <div key={cliente.id} className="card flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {cliente.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{cliente.nombre}</p>
                  <p className="text-xs text-gray-400 truncate">{cliente.telefono || cliente.email || 'Sin contacto'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{cliente.cantidadCompras} compras</p>
                  {cliente.saldoCuentaCorriente > 0 && (
                    <p className="text-xs text-red-500 font-medium">
                      Debe {fmt(cliente.saldoCuentaCorriente)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Nuevo cliente">
        <NuevoCliente onClose={() => setDrawer(false)} />
      </Drawer>
    </>
  )
}
