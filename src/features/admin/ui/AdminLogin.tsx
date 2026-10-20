import { useState, type FormEvent } from 'react'
import { Button } from '../../../shared/ui/Button'
import { TextField } from '../../../shared/ui/fields'
import { ADMIN_PASSWORD, SHOW_DEMO_PASSWORD_HINT } from '../domain/auth'

export function AdminLogin({ onSubmit }: { onSubmit: (password: string) => boolean }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | undefined>()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!onSubmit(password)) {
      setError('La clave es incorrecta. Intente nuevamente.')
      setPassword('')
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Administración</h1>
      <p className="text-ink-soft">Ingrese la clave para modificar los presupuestos mensuales.</p>
      <form noValidate onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-4 shadow-card">
        <TextField
          id="admin-password"
          label="Clave de administración"
          type="password"
          autoComplete="current-password"
          value={password}
          error={error}
          onChange={(e) => {
            setPassword(e.target.value)
            setError(undefined)
          }}
        />
        <Button type="submit" className="w-full">
          Ingresar
        </Button>
        {SHOW_DEMO_PASSWORD_HINT ? (
          <p className="text-center text-xs text-ink-soft">Clave de demostración: {ADMIN_PASSWORD}</p>
        ) : null}
      </form>
    </div>
  )
}
