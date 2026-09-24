import React, { useState } from 'react'
import { Badge, Button, Card, Disclaimer, ErrorBanner, Field, PageHeader, toneFor } from '../components/UI.jsx'
import { useAgent } from '../hooks/useAgent.js'

const DEFAULT_QUERY = 'Analyze all risks in this document'
const ORDER = { critical: 0, high: 1, medium: 2, low: 3 }
const rank = (r) => ORDER[String(r.severity).toLowerCase()] ?? 4

function RiskItem({ risk }) {
  return (
    <article className="list-item">
      <div className="list-item__head">
        <span className="list-item__title">{risk.category || 'Risk'}</span>
        <Badge tone={toneFor(risk.severity)}>{risk.severity || 'unrated'}</Badge>
      </div>
      {risk.clause && <blockquote className="quote">{risk.clause}</blockquote>}
      <p>{risk.description}</p>
      {risk.mitigation && (
        <p className="callout"><strong>What you can do: </strong>{risk.mitigation}</p>
      )}
    </article>
  )
}

export default function RiskPage() {
  const [focus, setFocus] = useState('')
  const { loading, result, error, run } = useAgent('risk', DEFAULT_QUERY)
  const risks = Array.isArray(result?.risks) ? [...result.risks].sort((a, b) => rank(a) - rank(b)) : []

  return (
    <div className="page">
      <PageHeader
        title="Risk analysis"
        subtitle="Spot one-sided or unusual terms before you sign, ranked by how serious they are."
      />
      <Card>
        <Field id="focus" label="Focus (optional)" value={focus} onChange={setFocus}
          placeholder="e.g. Anything that could cost me money. Leave blank for a full review." />
        <Button onClick={() => run(focus)} loading={loading}>Analyze risks</Button>
      </Card>
      <ErrorBanner message={error} />
      {result && (
        <>
          <Card>
            <div className="stat-row">
              <span className="eyebrow">Overall risk</span>
              <Badge tone={toneFor(result.overall_risk)}>{result.overall_risk || 'unrated'}</Badge>
              <span className="muted">· {risks.length} issue{risks.length !== 1 ? 's' : ''} found</span>
            </div>
          </Card>
          {risks.length === 0
            ? <Card><p className="muted">No risks were identified in this document.</p></Card>
            : risks.map((r, i) => <RiskItem key={i} risk={r} />)}
          <Disclaimer text={result.disclaimer} />
        </>
      )}
    </div>
  )
}
