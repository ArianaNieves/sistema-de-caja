import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CreditCard } from 'lucide-react'
import { api } from '@/api/client'
import type { Cuota } from '@/types'
import { useToast } from '@/components/Toast'
import FormField from '@/components/FormField'

interface Props {
  cuota: Cuota
  onClose: () => void
}

const MEDIOS_PAGO = [
  { value: 'efectivo',      label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'debito',        label: 'Débito' },
  { value: 'mercadoPago',   label: 'Mercado Pago' },
]

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

export default function PagarCuota({ cuota, onClose }: Props) {
  const toast = useToast()
  const queryClient = useQueryClient()

  const [monto, setMonto] = useState(String(cuota.saldoPendiente))
  const [medioPago, setMedioPago] = useState('efectivo')

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post('pagarCuota', {
      cuotaId: cuota.id,
      montoPago: Number(monto),
      medioPago,
      fecha: new Date().toISOString(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cuotas'] })
      queryClient.invalidateQueries({ queryKey: ['caja'] })
      queryClient.invalidateQueries({ queryKey: ['kpis'] })
      toast.success('Pago registrado correctamente')
      onClose()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="space-y-4">
      <div className="card bg-yellow-50 border-yellow-200">
        <p className="text-xs text-yellow-700">{cuota.cliente}</p>
        <p className="text-sm text-yellow-800 mt-0.5">
          Cuota {cuota.numeroCuota}/{cuota.totalCuotas}
        </p>
        <p className="text-2xl font-bold text-yellow-900 mt-1">
          Pendiente: {fmt(cuota.saldoPendiente)}
        </p>
      </div>

      <FormField
        required
        label="Monto a pagar"
        type="number"
        min="1"
        max={cuota.saldoPendiente}
        value={monto}
        onChange={e => setMonto(e.target.value)}
      />

      <FormField
        as="select"
        label="Medio de pago"
        value={medioPago}
        onChange={e => setMedioPago(e.target.value)}
        options={MEDIOS_PAGO}
      />

      {Number(monto) > 0 && (
        <p className="text-xs text-center text-gray-500">
          {Number(monto) < cuota.saldoPendiente
            ? `Quedará pendiente ${fmt(cuota.saldoPendiente - Number(monto))}`
            : 'La cuota quedará completamente pagada'}
        </p>
      )}

      <button
        className="btn-primary w-full"
        disabled={!monto || Number(monto) <= 0 || isPending}
        onClick={() => mutate()}
      >
        <CreditCard size={16} />
        {isPending ? 'Guardando...' : `Registrar pago de ${fmt(Number(monto))}`}
      </button>
    </div>
  )
}
