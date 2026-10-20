import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../test-utils/renderApp'

describe('Clinic info page', () => {
  it('is reachable from the main navigation', async () => {
    const { user } = renderApp()
    const navLink = screen.getByRole('link', { name: /^Clínica$/ })
    expect(navLink).not.toHaveAttribute('aria-current')
    await user.click(navLink)
    expect(await screen.findByRole('heading', { level: 1, name: 'Clínica Veterinaria Sienra' })).toBeInTheDocument()
    expect(navLink).toHaveAttribute('aria-current', 'page')
  })

  it('shows the clinic name, description and address', async () => {
    renderApp({ route: '/clinica' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Clínica Veterinaria Sienra' })).toBeInTheDocument()
    expect(screen.getByText(/Clínica veterinaria en Maldonado, Uruguay/)).toBeInTheDocument()
    expect(screen.getByText('Román Guerra 721 esq. Arturo Santana, Maldonado, Uruguay')).toBeInTheDocument()
  })

  it('offers a phone link that dials the clinic', async () => {
    renderApp({ route: '/clinica' })
    const phone = await screen.findByRole('link', { name: /4223 1258/ })
    expect(phone).toHaveAttribute('href', 'tel:+59842231258')
  })

  it('opens Google Maps in a new tab without leaking the opener', async () => {
    renderApp({ route: '/clinica' })
    const maps = await screen.findByRole('link', { name: /Ver en Google Maps/ })
    expect(maps).toHaveAttribute(
      'href',
      'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent('Clínica Veterinaria Sienra, Román Guerra 721, Maldonado, Uruguay'),
    )
    expect(maps).toHaveAttribute('target', '_blank')
    expect(maps).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('links to the Facebook page in a new tab', async () => {
    renderApp({ route: '/clinica' })
    const facebook = await screen.findByRole('link', { name: /^Facebook/ })
    expect(facebook).toHaveAttribute('href', 'https://www.facebook.com/clinicaveterinaria.sienra/')
    expect(facebook).toHaveAttribute('target', '_blank')
    expect(facebook).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
