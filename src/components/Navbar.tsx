import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Wallet,
  BarChart3,
  Users,
  CreditCard
} from 'lucide-react'

const links = [
  { to: '/dashboard',  label: 'Inicio',    icon: LayoutDashboard },
  { to: '/ventas',     label: 'Ventas',    icon: ShoppingCart },
  { to: '/productos',  label: 'Productos', icon: Package },
  { to: '/caja',       label: 'Caja',      icon: Wallet },
  { to: '/clientes',   label: 'Clientes',  icon: Users },
  { to: '/cuotas',     label: 'Cuotas',    icon: CreditCard },
  { to: '/inventario', label: 'Stock',     icon: BarChart3 },
]

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16 px-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-400'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
