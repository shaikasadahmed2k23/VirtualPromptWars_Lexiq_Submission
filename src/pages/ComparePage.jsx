import React, { useState } from 'react'
import { PageHeader, Card, ErrorBanner, SubmitButton, Divider } from '../components/UI.jsx'
import { compareDocuments } from '../utils/api.js'

export default function ComparePage() {
  const [fileA, setFileA] = useState(null)
  const [fileB, setFileB] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleCompare = async () => {
    if (!fileA || !fileB) {
      setError('Please select two documents to compare.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const data = await compareDocuments(fileA, fileB)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const diffs = result?.differences || []

  return (
    <div style={{ maxWidth: 820 }}>
      <PageHeader
        title="Compare Documents"
        subtitle="Upload two legal documents to identify key differences in obligations, risk, and commercial terms."
      />

      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <label style={{ display: 'block' }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 500 }}>
              Document A
            </div>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={e => setFileA(e.target.files?.[0] || null)}
              style={{ width: '100%', color: 'var(--text-muted)' }}
            />
          </label>

          <label style={{ display: 'block' }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 500 }}>
              Document B
            </div>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={e => setFileB(e.target.files?.[0] || null)}
              style={{ width: '100%', color: 'var(--text-muted)' }}
            />
          </label>
        </div>

        <div style={{ marginTop: 16 }}>
          <SubmitButton onClick={handleCompare} loading={loading} label="Compare Documents" />
        </div>
      </Card>

      <ErrorBanner message={error} />

      {result && (
        <Card style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: 10 }}>
            Comparison Summary
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
            {result.summary}
          </p>

          <Divider />

          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            {diffs.length} key difference{diffs.length !== 1 ? 's' : ''}
          </div>

          {diffs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No material differences were identified.</p>
          ) : (
            diffs.map((item, index) => (
              <div key={index} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '16px 18px', marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {item.topic}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Document A</div>
                    <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>{item.document_a}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Document B</div>
                    <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>{item.document_b}</p>
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  <strong style={{ color: 'var(--text)' }}>Impact:</strong> {item.impact}
                </div>
              </div>
            ))
          )}
        </Card>
      )}
    </div>
  )
}
