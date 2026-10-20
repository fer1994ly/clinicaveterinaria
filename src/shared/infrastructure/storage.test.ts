import { beforeEach, describe, expect, it } from 'vitest'
import { StorageWriteError } from '../domain/storage'
import { LocalStorageAdapter } from './localStorageAdapter'
import { MemoryStorage } from './memoryStorage'
import { readJson, writeJson } from './jsonStorage'

describe.each([
  ['MemoryStorage', () => new MemoryStorage()],
  ['LocalStorageAdapter', () => new LocalStorageAdapter()],
])('%s', (_name, make) => {
  beforeEach(() => window.localStorage.clear())

  it('stores, reads and removes values', () => {
    const s = make()
    expect(s.getItem('k')).toBeNull()
    s.setItem('k', 'v')
    expect(s.getItem('k')).toBe('v')
    s.removeItem('k')
    expect(s.getItem('k')).toBeNull()
  })
})

describe('json helpers', () => {
  it('round-trips JSON values', () => {
    const s = new MemoryStorage()
    writeJson(s, 'a', { x: 1 })
    expect(readJson(s, 'a', (v): v is { x: number } => typeof (v as { x?: unknown })?.x === 'number')).toEqual({ x: 1 })
  })

  it('returns null for missing, corrupt or invalid shaped data', () => {
    const s = new MemoryStorage()
    const isArr = (v: unknown): v is unknown[] => Array.isArray(v)
    expect(readJson(s, 'missing', isArr)).toBeNull()
    s.setItem('bad', '{not json')
    expect(readJson(s, 'bad', isArr)).toBeNull()
    s.setItem('shape', '{"a":1}')
    expect(readJson(s, 'shape', isArr)).toBeNull()
  })
})

describe('LocalStorageAdapter write failures', () => {
  it('raises a typed StorageWriteError when the browser storage refuses a write', () => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = () => {
      throw new Error('quota')
    }
    try {
      expect(() => new LocalStorageAdapter().setItem('k', 'v')).toThrow(StorageWriteError)
    } finally {
      Storage.prototype.setItem = original
    }
  })

  it('still reads and removes safely when the browser storage throws', () => {
    const original = Storage.prototype.getItem
    Storage.prototype.getItem = () => {
      throw new Error('blocked')
    }
    try {
      expect(new LocalStorageAdapter().getItem('k')).toBeNull()
    } finally {
      Storage.prototype.getItem = original
    }
  })
})
