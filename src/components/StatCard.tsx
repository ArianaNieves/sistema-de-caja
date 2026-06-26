import { type LucideIcon } from 'lucide-react'
import { clsx } from 'clsx'

interface Props {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: number
  color?: 'primary' | 'green' | 'yellow' | 'red'
}

const colorMap = {
  primary: 'bg-primary-50 text-primary-600',
  green:   'bg-green-50 text-green-600',
  yellow:  'bg-yellow-50 text-yellow-600',
  red:     'bg-red-50 text-red-600',
}

export default function StatCard({ label, value, icon: Icon, trend, color = 'primary' }: Props) {
  return (
    <div className="card flex items-start gap-3">
      <div className={clsx('p-2.5 rounded-xl', colorMap[color])}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
        {trend !== undefined && (
          <p className={clsx('text-xs mt-0.5', trend >= 0 ? 'text-green-600' : 'text-red-500')}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}% vs mes anterior
          </p>
        )}
      </div>
    </div>
  )
}
