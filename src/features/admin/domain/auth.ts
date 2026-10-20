/**
 * DEMO BUILD ONLY.
 * The admin password is a plain constant because this app has no backend.
 * For production, replace this module with a real authentication call and
 * remove the hint below.
 */
export const ADMIN_PASSWORD = 'sienra2026'

/** Shows "Clave de demostración: ..." on the login screen. Set to false to hide it. */
export const SHOW_DEMO_PASSWORD_HINT = true

export function checkAdminPassword(attempt: string): boolean {
  return attempt === ADMIN_PASSWORD
}
