import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Package } from 'lucide-react'
import { api } from '@/api/client'
import type { Config } from '@/types'
import { useToast } from '@/components/Toast'
import FormField from '@/components/FormField'

interface Props {
  onClose: () => void
}

const CATEGORIAS = [
  { value: '',          label: 'Sin categoría' },
  { value: 'ropa',      label: 'Ropa' },
  { value: 'calzado',   label: 'Calzado' },
  { value: 'accesorios',label: 'Accesorios' },
  { value: 'alimentos', label: 'Alimentos' },
  { value: 'bebidas',   label: 'Bebidas' },
  { value: 'tecnologia',label: 'Tecnología' },
  { value: 'hogar',     label: 'Hogar' },
  { value: 'otro',      label: 'Otro' },
]

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

export default function NuevoProducto({ onClose }: Props) {
  const toast = useToast()
  const queryClient = useQueryClient()

  const { data: config } = useQuery<Config>({ queryKey: ['config'] })

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    precioCompra: '',
    precioVentaSinIva: '',
    stockMinimo: '0',
    proveedor: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const iva    = config?.iva ?? 21
  const compra = Number(form.precioCompra) || 0
  const venta  = Number(form.precioVentaSinIva) || 0
  const conIva = venta * (1 + iva / 100)
  const margen = compra > 0 ? ((venta - compra) / compra) * 100 : 0

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post('addProducto', {
      nombre:            form.nombre,
      descripcion:       form.descripcion,
      categoria:         form.categoria,
      precioCompra:      compra,
      precioVentaSinIva: venta,
      stockMinimo:       Number(form.stockMinimo),
      proveedor:         form.proveedor,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      toast.success('Producto creado correctamente')
      onClose()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const valid = form.nombre.trim() && venta > 0

  return (
    <div className="space-y-4">
      <FormField label="Nombre" required value={form.nombre} onChange={set('nombre')} placeholder="Ej: Remera básica blanca" />
      <FormField label="Descripción" value={form.descripcion} onChange={set('descripcion')} placeholder="Descripción opcional" />

      <FormField
        as="select"
        label="Categoría"
        value={form.categoria}
        onChange={set('categoria')}
        options={CATEGORIAS}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Precio compra"
          type="number"
          min="0"
          value={form.precioCompra}
          onChange={set('precioCompra')}
          placeholder="0"
        />
        <FormField
          label={`Precio venta s/IVA`}
          type="number"
          min="0"
          required
          value={form.precioVentaSinIva}
          onChange={set('precioVentaSinIva')}
          placeholder="0"
        />
      </div>

      {/* Preview calculado */}
      {venta > 0 && (
        <div className="card bg-primary-50 border-primary-100 space-y-1.5">
          <p className="text-xs font-semibold text-primary-700 mb-2">Vista previa</p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Precio c/IVA ({iva}%)</span>
            <span className="font-bold">{fmt(conIva)}</span>
          </div>
          {compra > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Margen</span>
              <span className={`font-bold ${margen >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {margen.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Stock mínimo"
          type="number"
          min="0"
          value={form.stockMinimo}
          onChange={set('stockMinimo')}
        />
        <FormField
          label="Proveedor"
          value={form.proveedor}
          onChange={set('proveedor')}
          placeholder="Opcional"
        />
      </div>

      <button
        className="btn-primary w-full"
        disabled={!valid || isPending}
        onClick={() => mutate()}
      >
        <Package size={16} />
        {isPending ? 'Guardando...' : 'Crear producto'}
      </button>
    </div>
  )
}
