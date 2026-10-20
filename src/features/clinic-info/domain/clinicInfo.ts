/** Static, verified facts about the clinic shown on the info page. */
export interface ClinicInfo {
  name: string
  description: string
  address: string
  phoneDisplay: string
  phoneHref: string
  mapsUrl: string
  facebookUrl: string
}

const MAPS_QUERY = 'Clínica Veterinaria Sienra, Román Guerra 721, Maldonado, Uruguay'

export const CLINIC_INFO: ClinicInfo = {
  name: 'Clínica Veterinaria Sienra',
  description:
    'Clínica veterinaria en Maldonado, Uruguay, dedicada a la atención y el cuidado de la salud de las mascotas.',
  address: 'Román Guerra 721 esq. Arturo Santana, Maldonado, Uruguay',
  phoneDisplay: '4223 1258',
  phoneHref: 'tel:+59842231258',
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAPS_QUERY)}`,
  facebookUrl: 'https://www.facebook.com/clinicaveterinaria.sienra/',
}
