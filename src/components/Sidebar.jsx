import React from 'react'
import { Icon } from './UI.jsx'
import { extOf } from '../utils/format.js'

export const NAV = [
  { id: 'upload', label: 'Upload document', icon: 'upload' },
  { id: 'qa', label: 'Ask questions', icon: 'chat' },
  { id: 'clause', label: 'Key clauses', icon: 'list' },
  { id: 'risk', label: 'Risk analysis', icon: 'alert' },
  { id: 'summary', label: 'Summary', icon: 'summary' },
  { id: 'compare', label: 'Compare', icon: 'compare' },
]

export default function Sidebar({ page, onNavigate, doc }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand__mark"><Icon name="scale" size={20} /></div>
        <div>
          <div className="brand__name">LexIQ</div>
          <div className="brand__tag">Legal assistant</div>
        </div>
      </div>

      <div className="doc-card">
        <div className="doc-card__icon"><Icon name="file" size={18} /></div>
        <div className="doc-card__body">
          <div className="doc-card__name">{doc ? doc.filename : 'No document loaded'}</div>
          <div className="doc-card__meta">
            {doc ? `${extOf(doc.filename).toUpperCase()} · ${doc.chunks} ${doc.chunks === 1 ? 'section' : 'sections'}` : 'Upload to begin'}
          </div>
        </div>
      </div>

      <nav className="nav" aria-label="Main">
        {NAV.map(({ id, label, icon }) => (
          <button key={id} className="nav__item" onClick={() => onNavigate(id)}
            aria-current={page === id ? 'page' : undefined}>
            <Icon name={icon} />
            {label}
          </button>
        ))}
      </nav>

      <p className="sidebar__foot">General information only, not legal advice.</p>
    </aside>
  )
}
