import React from 'react'

const ICONS = {
  scale: 'M12 3v18 M6 21h12 M4 7h16 M7 7l-3.5 7a3.5 3.5 0 0 0 7 0z M17 7l-3.5 7a3.5 3.5 0 0 0 7 0z',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  list: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
  alert: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
  summary: 'M17 10H3 M21 6H3 M21 14H3 M17 18H3',
  compare: 'M12 3v18 M3 5h6v14H3z M15 5h6v14h-6z',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
  send: 'M22 2L11 13 M22 2l-7 20-4-9-9-4z',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01',
}

export function toneFor(level = '') {
  const tones = { low: 'green', medium: 'amber', high: 'red', critical: 'critical' }
  return tones[String(level).toLowerCase()] || 'neutral'
}

export function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  )
}

export function PageHeader({ title, subtitle }) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  )
}

export function Card({ children }) {
  return <section className="card">{children}</section>
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

export function Spinner() {
  return <span className="spinner" role="status" aria-label="Loading" />
}

export function Button({ variant = 'primary', loading = false, children, ...props }) {
  return (
    <button className={`btn btn--${variant}`} {...props} disabled={loading || props.disabled}>
      {loading && <Spinner />}
      {children}
    </button>
  )
}

export function ErrorBanner({ message }) {
  if (!message) return null
  return <div className="alert" role="alert">{message}</div>
}

export function Disclaimer({ text }) {
  return (
    <p className="disclaimer">
      <Icon name="info" size={16} />
      <span>{text || 'LexIQ gives general information, not legal advice. Consult a qualified lawyer for your situation.'}</span>
    </p>
  )
}

export function Field({ id, label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <label className="eyebrow field__label" htmlFor={id}>{label}</label>
      <textarea id={id} className="field__input" rows={rows} value={value}
        placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export function EmptyState({ icon = 'file', title, text, action }) {
  return (
    <section className="empty">
      <div className="empty__icon"><Icon name={icon} size={22} /></div>
      <h2>{title}</h2>
      <p>{text}</p>
      {action}
    </section>
  )
}
