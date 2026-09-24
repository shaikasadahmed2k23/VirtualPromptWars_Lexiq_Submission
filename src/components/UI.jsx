import React from 'react'

export function PageHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h1 style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 28,
        fontWeight: 600,
        color: 'var(--text)',
        lineHeight: 1.2,
        marginBottom: 8,
      }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 24,
      ...style,
    }}>
      {children}
    </div>
  )
}

export function QueryTextarea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      style={{
        width: '100%',
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        color: 'var(--text)',
        fontSize: 14,
        padding: '12px 16px',
        resize: 'vertical',
        outline: 'none',
        lineHeight: 1.6,
        transition: 'border-color 0.15s',
      }}
      onFocus={e => e.target.style.borderColor = 'var(--gold-dim)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
    />
  )
}

export function SubmitButton({ onClick, loading, label = 'Submit' }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        marginTop: 12,
        padding: '10px 28px',
        background: loading ? 'var(--surface2)' : 'var(--gold)',
        color: loading ? 'var(--text-dim)' : '#0F1117',
        border: 'none',
        borderRadius: 5,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '0.04em',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s, opacity 0.15s',
      }}
    >
      {loading ? 'Processing...' : label}
    </button>
  )
}

export function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div style={{
      marginTop: 16,
      padding: '12px 16px',
      background: 'rgba(192, 57, 43, 0.1)',
      border: '1px solid rgba(192, 57, 43, 0.3)',
      borderRadius: 6,
      color: '#E57373',
      fontSize: 13,
    }}>
      {message}
    </div>
  )
}

export function CacheBadge({ fromCache }) {
  if (!fromCache) return null
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 10,
      padding: '2px 8px',
      background: 'rgba(74, 127, 165, 0.15)',
      border: '1px solid rgba(74, 127, 165, 0.3)',
      borderRadius: 3,
      color: 'var(--blue)',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      marginLeft: 10,
      verticalAlign: 'middle',
      fontWeight: 500,
    }}>
      Cached
    </span>
  )
}

export function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />
}

export function Spinner() {
  return (
    <div style={{
      display: 'inline-block',
      width: 18,
      height: 18,
      border: '2px solid var(--border)',
      borderTopColor: 'var(--gold)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  )
}

// Inject keyframes once
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`
  document.head.appendChild(style)
}
