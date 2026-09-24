import React, { useState } from 'react'
import { PageHeader, Card, QueryTextarea, SubmitButton, ErrorBanner, CacheBadge, Divider } from '../components/UI.jsx'
import { queryAgent } from '../utils/api.js'

const RISK_CONFIG = {
  LOW:      { color: 'var(--green)',  bg: 'rgba(39,174,96,0.12)',   border: 'rgba(39,174,96,0.3)',   width: '25%',  label: 'LOW' },
  MEDIUM:   { color: 'var(--yellow)', bg: 'rgba(243,156,18,0.12)',  border: 'rgba(243,156,18,0.3)',  width: '50%',  label: 'MEDIUM' },
  HIGH:     { color: 'var(--orange)', bg: 'rgba(211,84,0,0.12)',    border: 'rgba(211,84,0,0.3)',    width: '75%',  label: 'HIGH' },
  CRITICAL: { color: 'var(--red)',    bg: 'rgba(192,57,43,0.12)',   border: 'rgba(192,57,43,0.3)',   width: '100%', label: 'CRITICAL' },
}

const SEV_BADGE = {
  LOW:      { bg: 'rgba(39,174,96,0.12)',   border: 'rgba(39,174,96,0.3)',   color: '#6FCF97' },
  MEDIUM:   { bg: 'rgba(243,156,18,0.12)',  border: 'rgba(243,156,18,0.3)',  color: '#F9CA74' },
  HIGH:     { bg: 'rgba(211,84,0,0.12)',    border: 'rgba(211,84,0,0.3)',    color: '#E07B39' },
  CRITICAL: { bg: 'rgba(192,57,43,0.12)',   border: 'rgba(192,57,43,0.3)',   color: '#E57373' },
}

function RiskMeter({ level }) {
  const cfg = RISK_CONFIG[level?.toUpperCase()] || RISK_CONFIG.LOW
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
          Overall Risk
        </span>
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          color: cfg.color,
          letterSpacing: '0.12em',
          padding: '3px 12px',
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          borderRadius: 3,
        }}>
          {cfg.label}
        </span>
      </div>
      <div style={{
        height: 6,
        background: 'var(--surface2)',
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: cfg.width,
          background: cfg.color,
          borderRadius: 3,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}

function RiskCard({ risk, index }) {
  const sev = SEV_BADGE[risk.severity?.toUpperCase()] || SEV_BADGE.LOW
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
          <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600 }}>#{String(index + 1).padStart(2, '0')}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{risk.category}</span>
        </div>
        <span style={{
          fontSize: 10,
          padding: '2px 9px',
          background: sev.bg,
          border: `1px solid ${sev.border}`,
          borderRadius: 3,
          color: sev.color,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          {risk.severity}
        </span>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7, marginBottom: 10 }}>
        {risk.description}
      </p>

      {risk.mitigation && (
        <div style={{
          background: 'rgba(74, 127, 165, 0.08)',
          border: '1px solid rgba(74, 127, 165, 0.2)',
          borderRadius: 4,
          padding: '10px 14px',
          marginBottom: risk.relevant_law ? 10 : 0,
        }}>
          <div style={{ fontSize: 10, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>
            Mitigation
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{risk.mitigation}</p>
        </div>
      )}

      {risk.relevant_law && (
        <div style={{ fontSize: 11, color: 'var(--text-dim)', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 8 }}>
          Relevant law: {risk.relevant_law}
        </div>
      )}
    </div>
  )
}

export default function RiskPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const submit = async () => {
    const q = query.trim() || 'Analyze all risks in this document'
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await queryAgent(q, 'risk_analyzer')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const risks = result?.result?.risks || []
  const riskLevel = result?.result?.risk_summary || 'LOW'

  return (
    <div style={{ maxWidth: 760 }}>
      <PageHeader
        title="Risk Analysis"
        subtitle="Identify legal, financial, and compliance risks present in the document, with severity classification and mitigation guidance."
      />

      <Card>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontWeight: 500 }}>
          Analysis Focus (optional)
        </div>
        <QueryTextarea
          value={query}
          onChange={setQuery}
          placeholder="e.g. Focus on liability and indemnification risks — or leave blank for full analysis"
        />
        <SubmitButton onClick={submit} loading={loading} label="Run Risk Analysis" />
      </Card>

      <ErrorBanner message={error} />

      {result && (
        <div style={{ marginTop: 24 }}>
          <Card style={{ marginBottom: 20 }}>
            <RiskMeter level={riskLevel} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {risks.length} risk area{risks.length !== 1 ? 's' : ''} identified
              </span>
              <CacheBadge fromCache={result.from_cache} />
            </div>
          </Card>

          {risks.length === 0 ? (
            <Card>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No risks identified. This may indicate a well-structured document or insufficient context.</p>
            </Card>
          ) : (
            risks.map((r, i) => <RiskCard key={i} risk={r} index={i} />)
          )}
        </div>
      )}
    </div>
  )
}
