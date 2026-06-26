import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Cuota } from '@/types'
import Spinner from '@/components/Spinner'
import Drawer from '@/components/Drawer'
import EmptyState from '@/components/EmptyState'
import PagarCuota from '@/forms/PagarCuota'
import { clsx } from 'clsx'
import { CreditCard } from 'lucide-react'

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })

const estadoStyle: Record<Cuota['estado'], string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  pagada:    'bg-green-100 text-green-700',
  vencida:   'bg-red-100 text-red-600',
  parcial:   'bg-blue-100 text-blue-700',
}

export default function Cuotas() {
  const [filtro, setFiltro] = useState<Cuota['estado'] | 'todas'>('todas')
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState<Cuota | null>(null)

  const { data: cuotas = [], isLoading } = useQuery<Cuota[]>({
    queryKey: ['cuotas'],
    queryFn: () => api.get<Cuota[]>('getCuotas'),
  })

  const totalPendiente = cuotas
    .filter(c => c.estado !== 'pagada')
    .reduce((acc, c) => acc + c.saldoPendiente, 0)

  const filtradas = cuotas.filter(c => filtro === 'todas' || c.estado === filtro)

  const estados = ['todas', 'vencida', 'pendiente', 'parcial', 'pagada'] as const

  return (
    <>
      <div className="px-4 pt-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Cuotas</h1>

        <div className="card bg-yellow-50 border-yellow-200">
          <p className="text-xs text-yellow-700">Total pendiente de cobro</p>
          <p className="text-2xl font-bold text-yellow-800 mt-0.5">{fmt(totalPendiente)}</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {estados.map(e => (
            <button
              key={e}
              onClick={() => setFiltro(e)}
              className={clsx(
                'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                filtro === e ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 border border-gray-200'
              )}
            >
              {e.charAt(0).toUpperCase() + e.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <Spinner className="h-40" />
        ) : filtradas.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title={filtro === 'todas' ? 'Sin cuotas' : `Sin cuotas ${filtro}s`}
            description="Las cuotas aparecen acá cuando registrás una venta en cuotas"
          />
        ) : (
          <div className="space-y-2">
            {filtradas.map(cuota => (
              <div key={cuota.id} className="card space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{cuota.cliente}</p>
                    <p className="text-xs text-gray-400">
                      Cuota {cuota.numeroCuota}/{cuota.totalCuotas} · Vence {fmtFecha(cuota.fechaVencimiento)}
                    </p>
                  </div>
                  <span className={clsx('text-xs px-2 py-1 rounded-full font-medium', estadoStyle[cuota.estado])}>
                    {cuota.estado}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Monto cuota</span>
                  <span className="font-medium">{fmt(cuota.montoCuota)}</span>
                </div>
                {cuota.saldoPendiente > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Pendiente</span>
                    <span className="font-bold text-red-500">{fmt(cuota.saldoPendiente)}</span>
                  </div>
                )}
                {cuota.estado !== 'pagada' && (
                  <button
                    className="btn-primary w-full mt-1"
                    onClick={() => setCuotaSeleccionada(cuota)}
                  >
                    Registrar pago
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Drawer
        open={cuotaSeleccionada !== null}
        onClose={() => setCuotaSeleccionada(null)}
        title="Registrar pago de cuota"
      >
        {cuotaSeleccionada && (
          <PagarCuota
            cuota={cuotaSeleccionada}
            onClose={() => setCuotaSeleccionada(null)}
          />
        )}
      </Drawer>
    </>
  )
}
