import React, { useEffect, useRef, useState } from 'react'
import { Badge, Button, ErrorBanner, Icon } from '../components/UI.jsx'

const SUGGESTIONS = [
  'What are the payment terms?',
  'Can either party terminate early?',
  'What are the penalties for late payment?',
  'What should I be careful about here?',
]

const CONFIDENCE_TONE = { high: 'green', medium: 'amber', low: 'red' }

function Message({ message }) {
  if (message.role === 'user') return <div className="msg--user">{message.text}</div>
  return (
    <div className="msg--assistant">
      <div className="msg__avatar"><Icon name="scale" size={16} /></div>
      <div className="msg__body">
        {message.error ? <ErrorBanner message={message.text} /> : <p className="msg__text">{message.text}</p>}
        {message.confidence && (
          <Badge tone={CONFIDENCE_TONE[String(message.confidence).toLowerCase()] || 'neutral'}>
            {message.confidence} confidence
          </Badge>
        )}
        {message.citations?.length > 0 && (
          <details className="sources">
            <summary>{message.citations.length} source{message.citations.length > 1 ? 's' : ''} from the document</summary>
            {message.citations.map((c, i) => <blockquote key={i} className="quote">{c}</blockquote>)}
          </details>
        )}
      </div>
    </div>
  )
}

export default function QAPage({ doc, chat }) {
  const { messages, busy, send, clear } = chat
  const [draft, setDraft] = useState('')
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, busy])

  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [draft])

  const submit = () => {
    if (!draft.trim() || busy) return
    send(draft, doc?.doc_id)
    setDraft('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="page page--chat">
      <div className="chat-header">
        <span className="doc-chip">
          <Icon name="file" size={16} />
          <span className="doc-chip__name">{doc.filename}</span>
          <span className="muted small">{doc.chunks} {doc.chunks === 1 ? 'section' : 'sections'}</span>
        </span>
        {messages.length > 0 && <Button variant="ghost" onClick={clear}>New chat</Button>}
      </div>

      <div className="chat-scroll" role="log" aria-live="polite" aria-label="Conversation">
        <div className="chat-thread">
          {messages.length === 0 && (
            <div className="chat-empty">
              <h1>Ask about your document</h1>
              <p>Answers come only from the file you uploaded, with the supporting text shown.</p>
              <div className="chips">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="chip" onClick={() => send(s, doc?.doc_id)}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => <Message key={m.id} message={m} />)}
          {busy && (
            <div className="msg--assistant">
              <div className="msg__avatar"><Icon name="scale" size={16} /></div>
              <div className="typing" role="status" aria-label="LexIQ is thinking"><span /><span /><span /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="composer">
        <div className="composer__box">
          <label htmlFor="question" className="sr-only">Your question</label>
          <textarea id="question" ref={inputRef} rows={1} value={draft} placeholder="Ask about this document…"
            onChange={(e) => setDraft(e.target.value)} onKeyDown={onKeyDown} />
          <button className="composer__send" onClick={submit} disabled={busy || !draft.trim()} aria-label="Send question">
            <Icon name="send" size={16} />
          </button>
        </div>
        <p className="composer__note">General information, not legal advice. Press Enter to send, Shift+Enter for a new line.</p>
      </div>
    </div>
  )
}
