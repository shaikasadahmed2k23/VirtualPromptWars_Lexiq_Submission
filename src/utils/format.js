/** Human-readable file size. */
export function formatSize(bytes) {
  if (typeof bytes !== 'number') return ''
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** Lower-case file extension without the dot. */
export function extOf(name = '') {
  return name.includes('.') ? name.split('.').pop().toLowerCase() : ''
}
