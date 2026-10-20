import { buttonClasses } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { CLINIC_INFO } from '../domain/clinicInfo'

const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' } as const

/** Contact and location details; external links only (no embeds, the CSP stays strict). */
export function ClinicInfoPage() {
  const info = CLINIC_INFO
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-extrabold">{info.name}</h1>
        <p className="text-ink-soft">{info.description}</p>
      </header>

      <Card className="space-y-4">
        <section aria-labelledby="clinic-address">
          <h2 id="clinic-address" className="text-sm font-semibold text-ink-soft">
            Dirección
          </h2>
          <p className="break-words">{info.address}</p>
          <a
            href={info.mapsUrl}
            {...EXTERNAL}
            className={buttonClasses('secondary', 'mt-2 w-full sm:w-auto')}
          >
            Ver en Google Maps
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
        </section>

        <section aria-labelledby="clinic-phone">
          <h2 id="clinic-phone" className="text-sm font-semibold text-ink-soft">
            Teléfono
          </h2>
          <a href={info.phoneHref} className={buttonClasses('secondary', 'mt-1 w-full sm:w-auto')}>
            Llamar al {info.phoneDisplay}
          </a>
        </section>

        <section aria-labelledby="clinic-social">
          <h2 id="clinic-social" className="text-sm font-semibold text-ink-soft">
            Redes sociales
          </h2>
          <a
            href={info.facebookUrl}
            {...EXTERNAL}
            className={buttonClasses('secondary', 'mt-1 w-full sm:w-auto')}
          >
            Facebook
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
        </section>
      </Card>
    </div>
  )
}
