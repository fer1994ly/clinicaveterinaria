import { useSyncExternalStore } from 'react'
import { useContainer } from './AppProviders'

/** Non-blocking warning shown while the browser refuses to save (full or blocked storage). */
export function StorageErrorBanner() {
  const { storageStatus } = useContainer()
  const failed = useSyncExternalStore(storageStatus.subscribe.bind(storageStatus), () => storageStatus.hasFailed())
  if (!failed) return null
  return (
    <div role="alert" className="mx-4 mb-2 flex items-start gap-3 rounded-2xl border-2 border-danger bg-white p-3 shadow-card">
      <p className="min-w-0 flex-1 text-sm font-semibold text-danger-dark">
        No se pudo guardar. Verifique el espacio disponible del navegador.
      </p>
      <button
        type="button"
        onClick={() => storageStatus.dismiss()}
        className="min-h-[44px] shrink-0 rounded-xl px-3 text-sm font-semibold text-ink-soft"
      >
        Cerrar aviso
      </button>
    </div>
  )
}
