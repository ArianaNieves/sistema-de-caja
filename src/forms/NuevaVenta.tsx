import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react'
import { api } from '@/api/client'
import type { Producto, ItemVenta } from '@/types'
import { useToast } from '@/components/Toast'
import FormField from '@/components/FormField'

interface Props {
  onClose: () => void
}

const MEDIOS_PAGO = [
  { value: 'efectivo',        label: 'Efectivo' },
  { value: 'debito',          label: 'Débito' },
  { value: 'credito1',        label: 'Crédito 1 cuota' },
  { value: 'credito3',        label: 'Crédito 3 cuotas' },
  { value: 'credito6',        label: 'Crédito 6 cuotas' },
  { value: 'mercadoPago',     label: 'Mercado Pago' },
  { value: 'transferencia',   label: 'Transferencia' },
  { value: 'cuentaCorriente', label: 'Cuenta corriente' },
]

const CANALES = [
  { value: 'local',      label: 'Local / Presencial' },
  { value: 'instagram',  label: 'Instagram' },
  { value: 'whatsapp',   label: 'WhatsApp' },
  { value: 'mercadolibre', label: 'Mercado Libre' },
  { value: 'web',        label: 'Tienda web' },
  { value: 'otro',       label: 'Otro' },
]

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

export default function NuevaVenta({ onClose }: Props) {
  const toast = useToast()
  const queryClient = useQueryClient()

  const [items, setItems] = useState<ItemVenta[]>([])
  const [descuento, setDescuento] = useState(0)
  const [medioPago, setMedioPago] = useState('efectivo')
  const [canal, setCanal] = useState('local')
  const [tipoPago, setTipoPago] = useState<'contado' | 'cuota' | 'senia' | 'cuenta_corriente'>('contado')
  const [cliente, setCliente] = useState('')
  const [notas, setNotas] = useState('')
  const [numeroCuotas, setNumeroCuotas] = useState(3)
  const [montoSenia, setMontoSenia] = useState(0)
  const [busqueda, setBusqueda] = useState('')

  const { data: productos = [] } = useQuery<Producto[]>({
    queryKey: ['productos'],
    queryFn: () => api.get<Producto[]>('getProductos', { soloActivos: 'true' }),
  })

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.sku.toLowerCase().includes(busqueda.toLowerCase())
  ).slice(0, 8)

  const subtotalSinDesc = useMemo(
    () => items.reduce((acc, i) => acc + i.subtotal, 0),
    [items]
  )
  const montoDescuento = subtotalSinDesc * (descuento / 100)
  const base = subtotalSinDesc - montoDescuento
  const total = base

  function agregarProducto(prod: Producto) {
    setItems(prev => {
      const existe = prev.find(i => i.sku === prod.sku)
      if (existe) {
        return prev.map(i =>
          i.sku === prod.sku
            ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precioUnitario * (1 - i.descuento / 100) }
            : i
        )
      }
      return [...prev, {
        sku: prod.sku,
        nombre: prod.nombre,
        cantidad: 1,
        precioUnitario: prod.precioVentaConIva,
        descuento: 0,
        subtotal: prod.precioVentaConIva,
      }]
    })
    setBusqueda('')
  }

  function cambiarCantidad(sku: string, delta: number) {
    setItems(prev => prev
      .map(i => i.sku === sku
        ? { ...i, cantidad: Math.max(1, i.cantidad + delta), subtotal: Math.max(1, i.cantidad + delta) * i.precioUnitario * (1 - i.descuento / 100) }
        : i
      )
    )
  }

  function cambiarDescuentoItem(sku: string, desc: number) {
    setItems(prev => prev.map(i =>
      i.sku === sku
        ? { ...i, descuento: desc, subtotal: i.cantidad * i.precioUnitario * (1 - desc / 100) }
        : i
    ))
  }

  function quitarItem(sku: string) {
    setItems(prev => prev.filter(i => i.sku !== sku))
  }

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post('addVenta', {
      fecha: new Date().toISOString(),
      cliente,
      items,
      subtotal: subtotalSinDesc,
      descuentoGeneral: descuento,
      iva: 0,
      total,
      medioPago,
      canalVenta: canal,
      tipoPago,
      numeroCuotas: tipoPago === 'cuota' ? numeroCuotas : undefined,
      montoSenia: tipoPago === 'senia' ? montoSenia : undefined,
      notas,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] })
      queryClient.invalidateQueries({ queryKey: ['kpis'] })
      queryClient.invalidateQueries({ queryKey: ['caja'] })
      queryClient.invalidateQueries({ queryKey: ['inventario'] })
      toast.success('Venta registrada correctamente')
      onClose()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="space-y-5">
      {/* Buscador de productos */}
      <div>
        <label className="label">Agregar producto</label>
        <input
          className="input"
          placeholder="Buscar por nombre o SKU..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        {busqueda && productosFiltrados.length > 0 && (
          <div className="mt-1 border border-gray-200 rounded-xl overflow-hidden shadow-md">
            {productosFiltrados.map(p => (
              <button
                key={p.sku}
                onClick={() => agregarProducto(p)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{p.nombre}</p>
                  <p className="text-xs text-gray-400">{p.sku} · Stock: {p.stock}</p>
                </div>
                <span className="text-sm font-semibold text-gray-800">{fmt(p.precioVentaConIva)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Carrito */}
      {items.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Carrito</p>
          {items.map(item => (
            <div key={item.sku} className="card space-y-2 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.nombre}</p>
                  <p className="text-xs text-gray-400">{fmt(item.precioUnitario)} c/u</p>
                </div>
                <button onClick={() => quitarItem(item.sku)} className="text-red-400 p-1">
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => cambiarCantidad(item.sku, -1)}
                    className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center active:scale-95"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-bold w-5 text-center">{item.cantidad}</span>
                  <button
                    onClick={() => cambiarCantidad(item.sku, 1)}
                    className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center active:scale-95"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-xs text-gray-400">Desc.</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="input py-1 w-16 text-center text-xs"
                    value={item.descuento}
                    onChange={e => cambiarDescuentoItem(item.sku, Number(e.target.value))}
                  />
                  <span className="text-xs text-gray-400">%</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{fmt(item.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Totales */}
      {items.length > 0 && (
        <div className="card space-y-2 bg-gray-50">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>{fmt(subtotalSinDesc)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-500">Descuento general</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                className="input py-1 w-16 text-center text-sm"
                value={descuento}
                onChange={e => setDescuento(Number(e.target.value))}
              />
              <span className="text-sm text-gray-400">%</span>
            </div>
          </div>
          {descuento > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Ahorrás</span>
              <span>-{fmt(montoDescuento)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2">
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
        </div>
      )}

      {/* Datos de la venta */}
      <FormField label="Cliente (opcional)" value={cliente} onChange={e => setCliente(e.currentTarget.value)} placeholder="Nombre del cliente" />

      <FormField
        as="select"
        label="Medio de pago"
        value={medioPago}
        onChange={e => setMedioPago(e.currentTarget.value)}
        options={MEDIOS_PAGO}
        required
      />

      <FormField
        as="select"
        label="Canal de venta"
        value={canal}
        onChange={e => setCanal(e.currentTarget.value)}
        options={CANALES}
        required
      />

      {/* Tipo de pago */}
      <div>
        <label className="label">Tipo de pago</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'contado', label: 'Contado' },
            { value: 'cuota',   label: 'Cuotas' },
            { value: 'senia',   label: 'Seña' },
            { value: 'cuenta_corriente', label: 'Cta. Cte.' },
          ].map(t => (
            <button
              key={t.value}
              onClick={() => setTipoPago(t.value as typeof tipoPago)}
              className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tipoPago === t.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tipoPago === 'cuota' && (
        <FormField
          label="Número de cuotas"
          type="number"
          min="2"
          max="24"
          value={numeroCuotas}
          onChange={e => setNumeroCuotas(Number(e.currentTarget.value))}
        />
      )}

      {tipoPago === 'senia' && (
        <FormField
          label="Monto de la seña"
          type="number"
          min="0"
          value={montoSenia}
          onChange={e => setMontoSenia(Number(e.currentTarget.value))}
          placeholder="0"
        />
      )}

      <div>
        <label className="label">Notas</label>
        <textarea
          className="input resize-none"
          rows={2}
          placeholder="Observaciones..."
          value={notas}
          onChange={e => setNotas(e.target.value)}
        />
      </div>

      <button
        className="btn-primary w-full"
        disabled={items.length === 0 || isPending}
        onClick={() => mutate()}
      >
        <ShoppingCart size={16} />
        {isPending ? 'Guardando...' : `Confirmar venta · ${fmt(total)}`}
      </button>
    </div>
  )
}
