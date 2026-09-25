import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import UploadPage from './UploadPage.jsx'

vi.mock('../utils/api.js', () => ({
  uploadDocument: vi.fn(),
}))

function file(name, sizeBytes, type = 'text/plain') {
  const f = new File(['x'.repeat(Math.min(sizeBytes, 10))], name, { type })
  Object.defineProperty(f, 'size', { value: sizeBytes })
  return f
}

describe('UploadPage', () => {
  it('rejects an unsupported file type', () => {
    render(<UploadPage doc={null} onUploaded={() => {}} onNavigate={() => {}} />)
    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [file('resume.docx', 1024)] } })
    expect(screen.getByRole('alert')).toHaveTextContent(/pdf or txt/i)
  })

  it('rejects a file over the size limit', () => {
    render(<UploadPage doc={null} onUploaded={() => {}} onNavigate={() => {}} />)
    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [file('big.txt', 11 * 1024 * 1024)] } })
    expect(screen.getByRole('alert')).toHaveTextContent(/larger than/i)
  })

  it('accepts a valid TXT file and enables the upload button', () => {
    render(<UploadPage doc={null} onUploaded={() => {}} onNavigate={() => {}} />)
    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [file('lease.txt', 2048)] } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('Upload document')).toBeEnabled()
  })
})
