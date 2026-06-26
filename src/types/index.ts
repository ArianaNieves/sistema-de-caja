// ─── Configuración ───────────────────────────────────────────────────────────
export interface Config {
  nombreNegocio: string
  email: string
  iva: number
  colorPrimario: string
  colorSecundario: string
  comisiones: Record<string, number>
}

// ─── Producto ─────────────────────────────────────────────────────────────────
export interface Producto {
  sku: string
  nombre: string
  descripcion: string
  categoria: string
  precioCompra: number
  precioVentaSinIva: number
  precioVentaConIva: number
  margen: number
  stock: number
  stockMinimo: number
  proveedor: string
  activo: boolean
}

// ─── Venta ────────────────────────────────────────────────────────────────────
export interface ItemVenta {
  sku: string
  nombre: string
  cantidad: number
  precioUnitario: number
  descuento: number
  subtotal: number
}

export interface Venta {
  id: string
  fecha: string
  cliente: string
  items: ItemVenta[]
  subtotal: number
  descuentoGeneral: number
  iva: number
  total: number
  medioPago: string
  canalVenta: string
  comision: number
  montoComision: number
  gananciaReal: number
  margenNeto: number
  notas: string
  tipoPago: 'contado' | 'cuota' | 'senia' | 'cuenta_corriente'
}

// ─── Caja ─────────────────────────────────────────────────────────────────────
export interface MovimientoCaja {
  id: string
  fecha: string
  tipo: 'ingreso' | 'egreso'
  concepto: string
  categoria: string
  monto: number
  medioPago: string
  referencia: string
  saldoAcumulado: number
}

// ─── Inventario ───────────────────────────────────────────────────────────────
export interface MovimientoInventario {
  id: string
  fecha: string
  tipo: 'entrada' | 'salida' | 'ajuste'
  sku: string
  nombreProducto: string
  cantidad: number
  motivo: string
  referencia: string
  stockResultante: number
}

// ─── Cliente ──────────────────────────────────────────────────────────────────
export interface Cliente {
  id: string
  nombre: string
  email: string
  telefono: string
  direccion: string
  fechaAlta: string
  totalCompras: number
  cantidadCompras: number
  ultimaCompra: string
  saldoCuentaCorriente: number
  notas: string
}

// ─── Cuota ────────────────────────────────────────────────────────────────────
export interface Cuota {
  id: string
  ventaId: string
  cliente: string
  fechaVencimiento: string
  montoCuota: number
  montoPagado: number
  saldoPendiente: number
  estado: 'pendiente' | 'pagada' | 'vencida' | 'parcial'
  numeroCuota: number
  totalCuotas: number
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface KPIs {
  ventasMes: number
  ventasMesAnterior: number
  gananciasMes: number
  saldoCaja: number
  productosStockCritico: number
  cuotasVencidas: number
  cuotasPendientesMes: number
  topProductos: { nombre: string; cantidad: number; total: number }[]
}

// ─── API ──────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  ok: boolean
  data: T
  error?: string
}
