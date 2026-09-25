import React, { useState } from 'react'
import { Badge, Button, Card, Disclaimer, ErrorBanner, Field, PageHeader, toneFor } from '../components/UI.jsx'
import { useAgent } from '../hooks/useAgent.js'

const DEFAULT_QUERY = 'Extract all key clauses from this document'

function ClauseItem({ clause }) {
  return (
    <article className="list-item">
      <div className="list-item__head">
        <span className="list-item__title">{clause.title || clause.type}</span>
        <div className="stat-row">
          {clause.type && clause.title && <Badge>{clause.type}</Badge>}
          {clause.importance && <Badge tone={toneFor(clause.importance)}>{clause.importance}</Badge>}
        </div>
      </div>
      {clause.content && <blockquote className="quote">{clause.content}</blockquote>}
      {clause.explanation && <p className="callout">{clause.explanation}</p>}
    </article>
  )
}

export default function ClausePage({ doc }) {
  const [scope, setScope] = useState('')
  const { loading, result, error, run } = useAgent('clause', DEFAULT_QUERY)
  const clauses = Array.isArray(result?.clauses) ? result.clauses : []

  return (
    <div className="page">
      <PageHeader
        title="Key clauses"
        subtitle="Find the clauses that matter, such as payment, termination, liability and penalties, each explained in plain language."
      />
      <Card>
        <Field id="scope" label="Focus (optional)" value={scope} onChange={setScope}
          placeholder="e.g. Only clauses about payment and penalties. Leave blank for all key clauses." />
        <Button onClick={() => run(scope, doc?.doc_id)} loading={loading}>Extract clauses</Button>
      </Card>
      <ErrorBanner message={error} />
      {result && (
        <>
          <p className="muted">{clauses.length} clause{clauses.length !== 1 ? 's' : ''} found</p>
          {clauses.length === 0
            ? <Card><p className="muted">No clauses were found. Try a different focus or document.</p></Card>
            : clauses.map((c, i) => <ClauseItem key={i} clause={c} />)}
          <Disclaimer text={result.disclaimer} />
        </>
      )}
    </div>
  )
}
