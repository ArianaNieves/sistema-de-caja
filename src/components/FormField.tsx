import { type InputHTMLAttributes, type SelectHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface BaseProps {
  label: string
  error?: string
  required?: boolean
}

interface InputProps extends BaseProps, InputHTMLAttributes<HTMLInputElement> {
  as?: 'input'
}

interface SelectProps extends BaseProps, SelectHTMLAttributes<HTMLSelectElement> {
  as: 'select'
  options: { value: string; label: string }[]
}

type Props = InputProps | SelectProps

export default function FormField(props: Props) {
  const { label, error, required, as = 'input', ...rest } = props

  return (
    <div className="space-y-1">
      <label className={clsx('label', required && "after:content-['*'] after:text-red-400 after:ml-0.5")}>
        {label}
      </label>
      {as === 'select' ? (
        <select
          className={clsx('input', error && 'border-red-400 focus:ring-red-400')}
          {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {(props as SelectProps).options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <input
          className={clsx('input', error && 'border-red-400 focus:ring-red-400')}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
