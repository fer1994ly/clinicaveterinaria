import { describe, expect, it } from 'vitest'
import { ADMIN_PASSWORD, checkAdminPassword } from './auth'

describe('checkAdminPassword', () => {
  it('uses the documented demo password', () => {
    expect(ADMIN_PASSWORD).toBe('sienra2026')
  })

  it('accepts the exact password', () => {
    expect(checkAdminPassword('sienra2026')).toBe(true)
  })

  it.each(['', ' ', 'Sienra2026', 'sienra2026 ', 'sienra', '2026'])('rejects %j', (attempt) => {
    expect(checkAdminPassword(attempt)).toBe(false)
  })
})
