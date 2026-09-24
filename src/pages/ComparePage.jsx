import React, { useState } from 'react'
import { Button, Card, Disclaimer, ErrorBanner, PageHeader } from '../components/UI.jsx'
import { compareDocuments } from '../utils/api.js'
import { formatSize } from '../utils/format.js'

function FilePick({ id, label, file, onChange }) {
  return (
    <div>
      <label className="eyebrow field__label" htmlFor={id}>{label}</label>
      <input id={id} className="file-input" type="file" accept=".pdf,.txt"
        onChange={(e) => onChange(e.target.files?.[0] || null)} />
      {file && <p className="muted small">{file.name} · {formatSize(file.size)}</p>}
    </div>
  )
}

export default function ComparePage() {
  const [fileA, setFileA] = useState(null)
  const [fileB, setFileB] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const compare = async () => {
    if (!fileA || !fileB) return setError('Please choose two documents to compare.')
    setLoading(true)
    setError('')
    setResult(null)
    try {
      setResult(await compareDocuments(fileA, fileB))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const diffs = Array.isArray(result?.differences) ? result.differences : []

  return (
    <div className="page">
      <PageHeader
        title="Compare two documents"
        subtitle="See how two agreements differ, such as rent, notice periods and penalties, and what each difference means for you."
      />
      <Card>
        <div className="grid-2">
          <FilePick id="file-a" label="Document A" file={fileA} onChange={setFileA} />
          <FilePick id="file-b" label="Document B" file={fileB} onChange={setFileB} />
        </div>
        <Button onClick={compare} loading={loading}>Compare documents</Button>
      </Card>
      <ErrorBanner message={error} />
      {result && (
        <>
          <Card>
            <span className="eyebrow">Overview</span>
            <p className="msg__text">{result.summary}</p>
          </Card>
          <p className="muted">{diffs.length} difference{diffs.length !== 1 ? 's' : ''} found</p>
          {diffs.map((d, i) => (
            <article key={i} className="list-item">
              <span className="list-item__title">{d.topic}</span>
              <div className="grid-2">
                <div><div className="eyebrow">Document A</div><p>{d.document_a}</p></div>
                <div><div className="eyebrow">Document B</div><p>{d.document_b}</p></div>
              </div>
              {d.impact && <p className="callout"><strong>Impact: </strong>{d.impact}</p>}
            </article>
          ))}
          <Disclaimer text={result.disclaimer} />
        </>
      )}
    </div>
  )
}
