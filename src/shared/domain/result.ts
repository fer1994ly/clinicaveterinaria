/** Validation outcome carrying field-level error messages (Spanish, user facing). */
export type Result<T, K extends string = string> =
  | { ok: true; value: T }
  | { ok: false; errors: Partial<Record<K, string>> }

export const ok = <T>(value: T): { ok: true; value: T } => ({ ok: true, value })
export const fail = <K extends string>(
  errors: Partial<Record<K, string>>,
): { ok: false; errors: Partial<Record<K, string>> } => ({ ok: false, errors })
