import React, { useState, useRef } from 'react'
import { PageHeader, Card, ErrorBanner } from '../components/UI.jsx'
import { uploadDocument } from '../utils/api.js'

export default function UploadPage({ onUploadSuccess }) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const inputRef = useRef()

  const handleFile = (f) => {
    if (!f) return
    if (f.type !== 'application/pdf') {
      setError('Only PDF files are accepted.')
      return
    }
    setFile(f)
    setError('')
    setStatus('idle')
    setResult(null)
    setProgress(0)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleUpload = async () => {
    if (!file) return
    setStatus('uploading')
    setProgress(0)
    setError('')
    try {
      const res = await uploadDocument(file, setProgress)
      setResult(res)
      setStatus('success')
      onUploadSuccess?.()
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  const reset = () => {
    setFile(null)
    setProgress(0)
    setStatus('idle')
    setResult(null)
    setError('')
  }

  return (
    <div style={{ maxWidth: 660 }}>
      <PageHeader
        title="Document Upload"
        subtitle="Upload a legal PDF document to begin analysis. The document will be chunked, embedded, and indexed for retrieval."
      />

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--gold)' : file ? 'var(--blue-dim)' : 'var(--border)'}`,
          borderRadius: 8,
          padding: '48px 32px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.2s, background 0.2s',
          background: dragging ? 'rgba(201, 168, 76, 0.04)' : 'var(--surface)',
          userSelect: 'none',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />

        {/* Upload icon */}
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
          stroke={file ? 'var(--blue)' : 'var(--text-dim)'}
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ margin: '0 auto 16px' }}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>

        {file ? (
          <>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>
              {file.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {(file.size / 1024).toFixed(1)} KB · PDF
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>
              Drag and drop a PDF here, or click to browse
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
              Supported format: PDF
            </div>
          </>
        )}
      </div>

      {/* Progress bar */}
      {status === 'uploading' && (
        <div style={{ marginTop: 20 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            color: 'var(--text-muted)',
            marginBottom: 6,
          }}>
            <span>Ingesting document...</span>
            <span>{progress}%</span>
          </div>
          <div style={{
            height: 4,
            background: 'var(--surface2)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--gold)',
              borderRadius: 2,
              transition: 'width 0.2s ease',
            }} />
          </div>
        </div>
      )}

      {/* Actions */}
      {file && status !== 'success' && (
        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          <button
            onClick={handleUpload}
            disabled={status === 'uploading'}
            style={{
              padding: '10px 28px',
              background: status === 'uploading' ? 'var(--surface2)' : 'var(--gold)',
              color: status === 'uploading' ? 'var(--text-dim)' : '#0F1117',
              border: 'none',
              borderRadius: 5,
              fontSize: 13,
              fontWeight: 600,
              cursor: status === 'uploading' ? 'not-allowed' : 'pointer',
            }}
          >
            {status === 'uploading' ? 'Uploading...' : 'Upload Document'}
          </button>
          <button
            onClick={reset}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              borderRadius: 5,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      )}

      <ErrorBanner message={error} />

      {/* Success state */}
      {status === 'success' && result && (
        <Card style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(39, 174, 96, 0.15)',
              border: '1px solid rgba(39, 174, 96, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
              Document indexed successfully
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['File', result.filename || file.name],
              ['Chunks', result.chunks_created ?? result.total_chunks ?? '—'],
              ['Status', result.status || 'Processed'],
              ['Model', result.embedding_model || 'MiniLM-L6-v2'],
            ].map(([k, v]) => (
              <div key={k} style={{
                background: 'var(--surface2)',
                borderRadius: 6,
                padding: '10px 14px',
              }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, wordBreak: 'break-all' }}>{String(v)}</div>
              </div>
            ))}
          </div>

          <button
            onClick={reset}
            style={{
              marginTop: 16,
              padding: '8px 20px',
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              borderRadius: 5,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Upload another document
          </button>
        </Card>
      )}
    </div>
  )
}
