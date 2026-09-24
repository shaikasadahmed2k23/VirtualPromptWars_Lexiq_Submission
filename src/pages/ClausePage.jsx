import React, { useState } from 'react'
import { PageHeader, Card, QueryTextarea, SubmitButton, ErrorBanner, CacheBadge, Divider } from '../components/UI.jsx'
import { queryAgent } from '../utils/api.js'

const IMPORTANCE_STYLE = {
  HIGH:     { bg: 'rgba(192, 57, 43, 0.12)',  border: 'rgba(192, 57, 43, 0.3)',  color: '#E57373', label: 'High' },
  MEDIUM:   { bg: 'rgba(243, 156, 18, 0.12)', border: 'rgba(243, 156, 18, 0.3)', color: '#F9CA74', label: 'Medium' },
  LOW:      { bg: 'rgba(39, 174, 96, 0.12)',  border: 'rgba(39, 174, 96, 0.3)',  color: '#6FCF97', label: 'Low' },
}

function ImportanceBadge({ level }) {
  const s = IMPORTANCE_STYLE[level?.toUpperCase()] || IMPORTANCE_STYLE.LOW
  return (
    <span style={{
      fontSize: 10,
      padding: '2px 9px',
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: 3,
      color: s.color,
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    }}>
      {s.label}
    </span>
  )
}

function ClauseCard({ clause, index }) {
  return (
    <div style={{
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      padding: '16px 18px',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600 }}>
            #{String(index + 1).padStart(2, '0')}
          </span>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--gold)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            {clause.type}
          </span>
        </div>
        <ImportanceBadge level={clause.importance} />
      </div>
      <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7, marginBottom: clause.source ? 10 : 0 }}>
        {clause.content}
      </p>
      {clause.source && (
        <div style={{ fontSize: 11, color: 'var(--text-dim)', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 8 }}>
          Source: {clause.source}
        </div>
      )}
    </div>
  )
}

export default function ClausePage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const submit = async () => {
    const q = query.trim() || 'Extract all key clauses from this document'
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await queryAgent(q, 'clause_extractor')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const clauses = result?.result?.clauses || []

  return (
    <div style={{ maxWidth: 760 }}>
      <PageHeader
        title="Extract Clauses"
        subtitle="Identify and categorize key clauses in the document — payment terms, liability, termination, confidentiality, and more."
      />

      <Card>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontWeight: 500 }}>
          Extraction Scope (optional)
        </div>
        <QueryTextarea
          value={query}
          onChange={setQuery}
          placeholder="e.g. Extract clauses related to payment and penalty — or leave blank for full extraction"
        />
        <SubmitButton onClick={submit} loading={loading} label="Extract Clauses" />
      </Card>

      <ErrorBanner message={error} />

      {result && (
        <div style={{ marginTop: 24 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
              {clauses.length} clause{clauses.length !== 1 ? 's' : ''} identified
            </div>
            <CacheBadge fromCache={result.from_cache} />
          </div>

          {clauses.length === 0 ? (
            <Card>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No clauses were extracted. Try rephrasing your query or uploading a different document.</p>
            </Card>
          ) : (
            clauses.map((c, i) => <ClauseCard key={i} clause={c} index={i} />)
          )}
        </div>
      )}
    </div>
  )
}
