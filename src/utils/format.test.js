import { describe, expect, it } from 'vitest'
import { extOf, formatSize } from './format.js'

describe('formatSize', () => {
  it('formats bytes under 1MB as KB', () => {
    expect(formatSize(2048)).toBe('2.0 KB')
  })

  it('formats bytes over 1MB as MB', () => {
    expect(formatSize(5 * 1024 * 1024)).toBe('5.0 MB')
  })

  it('returns empty string for non-numeric input', () => {
    expect(formatSize(undefined)).toBe('')
  })
})

describe('extOf', () => {
  it('returns the lowercase extension', () => {
    expect(extOf('Lease_Agreement.PDF')).toBe('pdf')
  })

  it('returns empty string when there is no extension', () => {
    expect(extOf('README')).toBe('')
  })
})
