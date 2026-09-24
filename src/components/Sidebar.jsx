import React from 'react'

const NAV = [
  { id: 'upload',  label: 'Document Upload',   icon: UploadIcon  },
  { id: 'qa',      label: 'Ask a Question',     icon: QAIcon      },
  { id: 'clause',  label: 'Extract Clauses',    icon: ClauseIcon  },
  { id: 'risk',    label: 'Risk Analysis',      icon: RiskIcon    },
  { id: 'summary', label: 'Summarize',          icon: SummaryIcon },
]

export default function Sidebar({ activePage, setActivePage, stats, docReady }) {
  return (
    <aside style={{
      width: 256,
      minWidth: 256,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      height: '100vh',
      overflowY: 'auto',
    }}>
      {/* Wordmark */}
      <div style={{
        padding: '32px 24px 24px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 26,
          fontWeight: 700,
          color: 'var(--gold)',
          letterSpacing: '0.04em',
          lineHeight: 1,
        }}>
          LexIQ
        </div>
        <div style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          marginTop: 6,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}>
          Legal Intelligence Agent
        </div>
      </div>

      {/* Status bar */}
      <div style={{
        padding: '14px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <div style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: docReady ? 'var(--green)' : 'var(--text-dim)',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {docReady
            ? `${stats.total_chunks} chunks indexed`
            : 'No document loaded'}
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = activePage === id
          return (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 24px',
                background: active ? 'var(--surface2)' : 'transparent',
                border: 'none',
                borderLeft: `3px solid ${active ? 'var(--gold)' : 'transparent'}`,
                color: active ? 'var(--gold)' : 'var(--text-muted)',
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                textAlign: 'left',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
            >
              <Icon size={16} color={active ? 'var(--gold)' : 'var(--text-dim)'} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--border)',
        fontSize: 11,
        color: 'var(--text-dim)',
        letterSpacing: '0.05em',
      }}>
        IIT Kharagpur · The Arch 2026
      </div>
    </aside>
  )
}

function UploadIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  )
}

function QAIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}

function ClauseIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  )
}

function RiskIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}

function SummaryIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="21" y1="10" x2="7" y2="10"/>
      <line x1="21" y1="6" x2="3" y2="6"/>
      <line x1="21" y1="14" x2="3" y2="14"/>
      <line x1="21" y1="18" x2="7" y2="18"/>
    </svg>
  )
}
