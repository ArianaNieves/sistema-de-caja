import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { api } from '@/api/client'
import { useToast } from '@/components/Toast'
import FormField from '@/components/FormField'

interface Props {
  onClose: () => void
}

export default function NuevoCliente({ onClose }: Props) {
  const toast = useToast()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    notas: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post('addCliente', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      toast.success('Cliente creado correctamente')
      onClose()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="space-y-4">
      <FormField required label="Nombre" value={form.nombre} onChange={set('nombre')} placeholder="Nombre completo" />
      <FormField label="Teléfono" type="tel" value={form.telefono} onChange={set('telefono')} placeholder="+54 11 1234-5678" />
      <FormField label="Email" type="email" value={form.email} onChange={set('email')} placeholder="cliente@email.com" />
      <FormField label="Dirección" value={form.direccion} onChange={set('direccion')} placeholder="Dirección opcional" />

      <div>
        <label className="label">Notas</label>
        <textarea
          className="input resize-none"
          rows={2}
          placeholder="Información adicional..."
          value={form.notas}
          onChange={set('notas')}
        />
      </div>

      <button
        className="btn-primary w-full"
        disabled={!form.nombre.trim() || isPending}
        onClick={() => mutate()}
      >
        <UserPlus size={16} />
        {isPending ? 'Guardando...' : 'Crear cliente'}
      </button>
    </div>
  )
}
