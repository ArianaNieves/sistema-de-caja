import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useConfig } from '@/hooks/useConfig'
import { ToastProvider } from '@/components/Toast'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Ventas from '@/pages/Ventas'
import Productos from '@/pages/Productos'
import Caja from '@/pages/Caja'
import Inventario from '@/pages/Inventario'
import Clientes from '@/pages/Clientes'
import Cuotas from '@/pages/Cuotas'

function AppRoutes() {
  useConfig()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"  element={<Dashboard />} />
          <Route path="ventas"     element={<Ventas />} />
          <Route path="productos"  element={<Productos />} />
          <Route path="caja"       element={<Caja />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="clientes"   element={<Clientes />} />
          <Route path="cuotas"     element={<Cuotas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  )
}
