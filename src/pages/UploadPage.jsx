import React, { useRef, useState } from 'react'
import { Badge, Button, Card, ErrorBanner, Icon, PageHeader } from '../components/UI.jsx'
import { uploadDocument } from '../utils/api.js'
import { extOf, formatSize } from '../utils/format.js'

const MAX_MB = 10
const ALLOWED = ['pdf', 'txt']
const SAMPLE_URL = '/sample_rent_agreement.txt'

export default function UploadPage({ doc, onUploaded, onNavigate }) {
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const choose = (f) => {
    if (!f) return null
    if (!ALLOWED.includes(extOf(f.name))) return setError('Only PDF or TXT files are supported.')
    if (f.size > MAX_MB * 1024 * 1024) return setError(`File is larger than ${MAX_MB} MB.`)
    setFile(f)
    setError('')
    setStatus('idle')
    setProgress(0)
    return f
  }

  const upload = async (f = file) => {
    if (!f) return
    setStatus('uploading')
    setError('')
    try {
      const info = await uploadDocument(f, setProgress)
      onUploaded({ ...info, size: f.size })
      setStatus('done')
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  const useSample = async () => {
    try {
      const blob = await (await fetch(SAMPLE_URL)).blob()
      const sample = choose(new File([blob], 'sample_rent_agreement.txt', { type: 'text/plain' }))
      if (sample) upload(sample)
    } catch {
      setError('Could not load the sample document.')
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    choose(e.dataTransfer.files[0])
  }

  const uploading = status === 'uploading'

  return (
    <div className="page">
      <PageHeader
        title="Upload a legal document"
        subtitle="Add a contract, agreement or notice. LexIQ reads it so you can ask questions, review clauses and spot risks in plain language."
      />

      <div className={`dropzone ${dragging ? 'is-dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}>
        <input ref={inputRef} type="file" accept=".pdf,.txt" className="sr-only" tabIndex={-1}
          aria-label="Choose a PDF or TXT file to upload"
          onChange={(e) => choose(e.target.files[0])} />
        <Icon name="upload" size={28} />
        <p className="dropzone__title">{file ? file.name : 'Drag and drop a PDF or TXT file'}</p>
        <p className="small">{file ? formatSize(file.size) : `Up to ${MAX_MB} MB`}</p>
        <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {file ? 'Choose a different file' : 'Browse files'}
        </Button>
      </div>

      {uploading && (
        <div>
          <p className="small muted">{progress < 100 ? 'Uploading…' : 'Reading and indexing…'}</p>
          <div className="progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="btn-row">
        <Button onClick={() => upload()} disabled={!file || status === 'done'} loading={uploading}>
          Upload document
        </Button>
        <Button variant="ghost" onClick={useSample} disabled={uploading}>
          Try a sample rent agreement
        </Button>
      </div>

      <ErrorBanner message={error} />

      {status === 'done' && doc && (
        <Card>
          <div className="stat-row">
            <Badge tone="green">Ready</Badge>
            <strong>{doc.filename}</strong>
          </div>
          <div className="stats">
            <div className="stat"><div className="eyebrow">Type</div><div className="stat__value">{extOf(doc.filename).toUpperCase()}</div></div>
            <div className="stat"><div className="eyebrow">Size</div><div className="stat__value">{formatSize(doc.size)}</div></div>
            <div className="stat"><div className="eyebrow">Sections indexed</div><div className="stat__value">{doc.chunks}</div></div>
          </div>
          <div className="btn-row">
            <Button onClick={() => onNavigate('qa')}>Ask a question</Button>
            <Button variant="secondary" onClick={() => onNavigate('summary')}>Summarize</Button>
            <Button variant="secondary" onClick={() => onNavigate('risk')}>Check risks</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
