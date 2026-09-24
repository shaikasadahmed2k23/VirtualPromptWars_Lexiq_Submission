import React, { useState } from 'react'
import { PageHeader, Card, QueryTextarea, SubmitButton, ErrorBanner, CacheBadge, Divider } from '../components/UI.jsx'
import { queryAgent } from '../utils/api.js'

export default function SummaryPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const submit = async () => {
    const q = query.trim() || 'Summarize this legal document in plain language'
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await queryAgent(q, 'summarizer')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    if (result?.summary) {
      navigator.clipboard.writeText(result.summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Parse sections if summary contains structured output
  const formatSummary = (text) => {
    if (!text) return []
    // Split on numbered sections or double newlines for clean rendering
    const paragraphs = text.split(/\n\n+/).filter(Boolean)
    return paragraphs
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader
        title="Summarize"
        subtitle="Generate a plain-language summary of the document. Useful for quick comprehension without reading the full legal text."
      />

      <Card>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontWeight: 500 }}>
          Summary Instruction (optional)
        </div>
        <QueryTextarea
          value={query}
          onChange={setQuery}
          placeholder="e.g. Summarize the key obligations of both parties — or leave blank for a full summary"
        />
        <SubmitButton onClick={submit} loading={loading} label="Generate Summary" />
      </Card>

      <ErrorBanner message={error} />

      {result && (
        <Card style={{ marginTop: 20 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
              Summary
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CacheBadge fromCache={result.from_cache} />
              <button
                onClick={copy}
                style={{
                  fontSize: 11,
                  padding: '3px 12px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  color: copied ? 'var(--green)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                  letterSpacing: '0.04em',
                }}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <Divider />

          <div>
            {formatSummary(result.summary).map((para, i) => (
              <p key={i} style={{
                fontSize: 14,
                color: 'var(--text)',
                lineHeight: 1.8,
                marginBottom: 14,
              }}>
                {para}
              </p>
            ))}
          </div>

          <div style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            color: 'var(--text-dim)',
          }}>
            <span>{result.summary?.split(' ').length || 0} words</span>
            <span>{result.summary?.length || 0} characters</span>
          </div>
        </Card>
      )}
    </div>
  )
}
