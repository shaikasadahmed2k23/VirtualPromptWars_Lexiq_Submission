import React, { useState } from 'react'
import { Badge, Button, Card, Disclaimer, ErrorBanner, Field, PageHeader } from '../components/UI.jsx'
import { useAgent } from '../hooks/useAgent.js'

const DEFAULT_QUERY = 'Summarize this legal document in plain language'

export default function SummaryPage({ doc }) {
  const [instruction, setInstruction] = useState('')
  const [copied, setCopied] = useState(false)
  const { loading, result, error, run } = useAgent('summary', DEFAULT_QUERY)

  const keyPoints = Array.isArray(result?.key_points) ? result.key_points : []
  const parties = Array.isArray(result?.parties) ? result.parties : []

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Plain-language summary"
        subtitle="Understand the document in a minute, without reading every line."
      />
      <Card>
        <Field id="instruction" label="Instruction (optional)" value={instruction} onChange={setInstruction}
          placeholder="e.g. Focus on what the tenant must do. Leave blank for a full summary." />
        <Button onClick={() => run(instruction, doc?.doc_id)} loading={loading}>Generate summary</Button>
      </Card>
      <ErrorBanner message={error} />
      {result && (
        <>
          <Card>
            <div className="list-item__head">
              <span className="eyebrow">Summary</span>
              <Button variant="ghost" onClick={copy}>{copied ? 'Copied' : 'Copy'}</Button>
            </div>
            <p className="msg__text">{result.summary}</p>
            {parties.length > 0 && (
              <div className="stat-row">
                <span className="eyebrow">Parties</span>
                {parties.map((p, i) => <Badge key={i} tone="blue">{p}</Badge>)}
              </div>
            )}
          </Card>
          {keyPoints.length > 0 && (
            <Card>
              <span className="eyebrow">Key points</span>
              <ul className="bullets">{keyPoints.map((k, i) => <li key={i}>{k}</li>)}</ul>
            </Card>
          )}
          <Disclaimer text={result.disclaimer} />
        </>
      )}
    </div>
  )
}
