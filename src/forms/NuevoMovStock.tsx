import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { BarChart3 } from 'lucide-react'
import { api } from '@/api/client'
import type { Producto } from '@/types'
import { useToast } from '@/components/Toast'
import FormField from '@/components/FormField'

interface Props {
  onClose: () => void
  skuInicial?: string
}

const MOTIVOS = [
  { value: 'compra',       label: 'Compra a proveedor' },
  { value: 'devolucion',   label: 'Devolución de cliente' },
  { value: 'ajuste',       label: 'Ajuste de inventario' },
  { value: 'rotura',       label: 'Rotura / Merma' },
  { value: 'transferencia',label: 'Transferencia entre depósitos' },
  { value: 'otro',         label: 'Otro' },
]

export default function NuevoMovStock({ onClose, skuInicial }: Props) {
  const toast = useToast()
  const queryClient = useQueryClient()

  const { data: productos = [] } = useQuery<Producto[]>({
    queryKey: ['productos'],
    queryFn: () => api.get<Producto[]>('getProductos'),
  })

  const [sku, setSku] = useState(skuInicial ?? '')
  const [tipo, setTipo] = useState<'entrada' | 'salida' | 'ajuste'>('entrada')
  const [cantidad, setCantidad] = useState('')
  const [motivo, setMotivo] = useState('')

  const prod = productos.find(p => p.sku === sku)

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post('addMovStock', {
      fecha: new Date().toISOString(),
      tipo,
      sku,
      nombreProducto: prod?.nombre ?? '',
      cantidad: Number(cantidad),
      motivo,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario'] })
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      queryClient.invalidateQueries({ queryKey: ['kpis'] })
      toast.success('Movimiento de stock registrado')
      onClose()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const valid = sku && Number(cantidad) > 0 && motivo

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Producto</label>
        <select
          className="input"
          value={sku}
          onChange={e => setSku(e.target.value)}
        >
          <option value="">Seleccionar producto...</option>
          {productos.map(p => (
            <option key={p.sku} value={p.sku}>
              {p.nombre} ({p.sku}) — Stock: {p.stock}
            </option>
          ))}
        </select>
        {prod && (
          <p className="text-xs text-gray-400 mt-1">Stock actual: <strong>{prod.stock}</strong></p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(['entrada', 'salida', 'ajuste'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTipo(t)}
            className={`py-2.5 rounded-xl text-xs font-medium transition-colors ${
              tipo === t
                ? t === 'entrada' ? 'bg-green-600 text-white'
                  : t === 'salida'  ? 'bg-red-500 text-white'
                  : 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <FormField
        required
        label="Cantidad"
        type="number"
        min="1"
        value={cantidad}
        onChange={e => setCantidad(e.target.value)}
        placeholder="0"
      />

      <FormField
        as="select"
        label="Motivo"
        value={motivo}
        onChange={e => setMotivo(e.target.value)}
        options={[{ value: '', label: 'Seleccionar motivo...' }, ...MOTIVOS]}
        required
      />

      {prod && cantidad && (
        <div className="card bg-gray-50 text-center">
          <p className="text-xs text-gray-500">Stock resultante</p>
          <p className="text-2xl font-bold mt-0.5">
            {tipo === 'entrada'
              ? prod.stock + Number(cantidad)
              : tipo === 'salida'
              ? Math.max(0, prod.stock - Number(cantidad))
              : Number(cantidad)}
          </p>
        </div>
      )}

      <button
        className="btn-primary w-full"
        disabled={!valid || isPending}
        onClick={() => mutate()}
      >
        <BarChart3 size={16} />
        {isPending ? 'Guardando...' : 'Registrar movimiento'}
      </button>
    </div>
  )
}
