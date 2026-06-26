import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { api } from '@/api/client'
import { useToast } from '@/components/Toast'
import FormField from '@/components/FormField'

interface Props {
  onClose: () => void
  tipoInicial?: 'ingreso' | 'egreso'
}

const CATEGORIAS_EGRESO = [
  { value: 'compras',      label: 'Compras / Stock' },
  { value: 'servicios',    label: 'Servicios (luz, agua, etc.)' },
  { value: 'alquiler',     label: 'Alquiler' },
  { value: 'sueldos',      label: 'Sueldos' },
  { value: 'marketing',    label: 'Marketing / Publicidad' },
  { value: 'impuestos',    label: 'Impuestos / Monotributo' },
  { value: 'fletes',       label: 'Fletes / Envíos' },
  { value: 'otro',         label: 'Otro gasto' },
]

const CATEGORIAS_INGRESO = [
  { value: 'ventas',       label: 'Ventas' },
  { value: 'cobro_cc',     label: 'Cobro cuenta corriente' },
  { value: 'prestamo',     label: 'Préstamo recibido' },
  { value: 'otro',         label: 'Otro ingreso' },
]

const MEDIOS_PAGO = [
  { value: 'efectivo',      label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'debito',        label: 'Débito' },
  { value: 'mercadoPago',   label: 'Mercado Pago' },
]

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

export default function NuevoMovCaja({ onClose, tipoInicial = 'egreso' }: Props) {
  const toast = useToast()
  const queryClient = useQueryClient()

  const [tipo, setTipo] = useState<'ingreso' | 'egreso'>(tipoInicial)
  const [form, setForm] = useState({
    concepto: '',
    categoria: '',
    monto: '',
    medioPago: 'efectivo',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const categorias = tipo === 'egreso' ? CATEGORIAS_EGRESO : CATEGORIAS_INGRESO

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post('addMovCaja', {
      fecha: new Date().toISOString(),
      tipo,
      concepto: form.concepto,
      categoria: form.categoria,
      monto: Number(form.monto),
      medioPago: form.medioPago,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caja'] })
      queryClient.invalidateQueries({ queryKey: ['kpis'] })
      toast.success(`${tipo === 'ingreso' ? 'Ingreso' : 'Egreso'} registrado`)
      onClose()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const valid = form.concepto.trim() && Number(form.monto) > 0

  return (
    <div className="space-y-4">
      {/* Selector ingreso/egreso */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setTipo('ingreso')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${
            tipo === 'ingreso' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <TrendingUp size={16} /> Ingreso
        </button>
        <button
          onClick={() => setTipo('egreso')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${
            tipo === 'egreso' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <TrendingDown size={16} /> Egreso
        </button>
      </div>

      <FormField required label="Concepto" value={form.concepto} onChange={set('concepto')} placeholder="Ej: Compra de mercadería" />

      <FormField
        as="select"
        label="Categoría"
        value={form.categoria}
        onChange={set('categoria')}
        options={[{ value: '', label: 'Sin categoría' }, ...categorias]}
      />

      <FormField
        required
        label="Monto"
        type="number"
        min="0"
        value={form.monto}
        onChange={set('monto')}
        placeholder="0"
      />

      <FormField
        as="select"
        label="Medio de pago"
        value={form.medioPago}
        onChange={set('medioPago')}
        options={MEDIOS_PAGO}
      />

      {form.monto && Number(form.monto) > 0 && (
        <div className={`card text-center ${tipo === 'ingreso' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="text-xs text-gray-500">{tipo === 'ingreso' ? 'Entrada de' : 'Salida de'}</p>
          <p className={`text-2xl font-bold mt-0.5 ${tipo === 'ingreso' ? 'text-green-700' : 'text-red-600'}`}>
            {fmt(Number(form.monto))}
          </p>
        </div>
      )}

      <button
        className="btn-primary w-full"
        disabled={!valid || isPending}
        onClick={() => mutate()}
      >
        {isPending ? 'Guardando...' : `Registrar ${tipo}`}
      </button>
    </div>
  )
}
