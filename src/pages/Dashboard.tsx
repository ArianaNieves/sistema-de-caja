import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Wallet, AlertTriangle, CreditCard } from 'lucide-react'
import { api } from '@/api/client'
import type { KPIs } from '@/types'
import StatCard from '@/components/StatCard'
import Spinner from '@/components/Spinner'

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

export default function Dashboard() {
  const { data: kpis, isLoading } = useQuery<KPIs>({
    queryKey: ['kpis'],
    queryFn: () => api.get<KPIs>('getKPIs'),
  })

  if (isLoading) return <Spinner className="h-64" />

  const ventasTrend = kpis && kpis.ventasMesAnterior > 0
    ? ((kpis.ventasMes - kpis.ventasMesAnterior) / kpis.ventasMesAnterior) * 100
    : undefined

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Ventas del mes"
          value={fmt(kpis?.ventasMes ?? 0)}
          icon={TrendingUp}
          trend={ventasTrend}
          color="primary"
        />
        <StatCard
          label="Saldo en caja"
          value={fmt(kpis?.saldoCaja ?? 0)}
          icon={Wallet}
          color="green"
        />
        <StatCard
          label="Stock crítico"
          value={kpis?.productosStockCritico ?? 0}
          icon={AlertTriangle}
          color="yellow"
        />
        <StatCard
          label="Cuotas vencidas"
          value={kpis?.cuotasVencidas ?? 0}
          icon={CreditCard}
          color="red"
        />
      </div>

      {kpis?.topProductos && kpis.topProductos.length > 0 && (
        <div className="card space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Top productos del mes</h2>
          {kpis.topProductos.map((p, i) => (
            <div key={p.nombre} className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.nombre}</p>
                <p className="text-xs text-gray-400">{p.cantidad} unidades</p>
              </div>
              <span className="text-sm font-semibold text-gray-900">{fmt(p.total)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
