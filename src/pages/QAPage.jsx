import React, { useState } from 'react'
import { PageHeader, Card, QueryTextarea, SubmitButton, ErrorBanner, CacheBadge, Divider } from '../components/UI.jsx'
import { queryAgent } from '../utils/api.js'

export default function QAPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await queryAgent(query, 'qa')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit()
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader
        title="Ask a Question"
        subtitle="Query the indexed document using natural language. The system retrieves relevant clauses and synthesizes a precise answer."
      />

      <Card>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontWeight: 500 }}>
          Your Question
        </div>
        <div onKeyDown={handleKey}>
          <QueryTextarea
            value={query}
            onChange={setQuery}
            placeholder="e.g. What are the termination conditions in this contract?"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SubmitButton onClick={submit} loading={loading} label="Get Answer" />
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Ctrl+Enter to submit</span>
        </div>
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
              Answer
            </div>
            <CacheBadge fromCache={result.from_cache} />
          </div>
          <Divider />
          <p style={{
            fontSize: 14,
            color: 'var(--text)',
            lineHeight: 1.75,
            whiteSpace: 'pre-wrap',
          }}>
            {result.answer}
          </p>
        </Card>
      )}
    </div>
  )
}
