import React, { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import { Button, EmptyState } from './components/UI.jsx'
import UploadPage from './pages/UploadPage.jsx'
import QAPage from './pages/QAPage.jsx'
import ClausePage from './pages/ClausePage.jsx'
import RiskPage from './pages/RiskPage.jsx'
import SummaryPage from './pages/SummaryPage.jsx'
import ComparePage from './pages/ComparePage.jsx'
import { useChat } from './hooks/useChat.js'
import { fetchStats } from './utils/api.js'

const NEEDS_DOCUMENT = new Set(['qa', 'clause', 'risk', 'summary'])

export default function App() {
  const [page, setPage] = useState('upload')
  const [doc, setDoc] = useState(null)
  const chat = useChat()

  useEffect(() => {
    fetchStats()
      .then((s) => s.active_document && setDoc({ filename: s.active_document, chunks: s.chunks }))
      .catch(() => {})
  }, [])

  const handleUploaded = (info) => {
    setDoc({ filename: info.filename, chunks: info.chunks, size: info.size })
    chat.clear()
  }

  const renderPage = () => {
    if (NEEDS_DOCUMENT.has(page) && !doc) {
      return (
        <div className="page">
          <EmptyState
            title="Upload a document first"
            text="Add a PDF or TXT file and LexIQ will be ready to answer questions about it."
            action={<Button onClick={() => setPage('upload')}>Upload document</Button>}
          />
        </div>
      )
    }

    switch (page) {
      case 'qa':
        return <QAPage doc={doc} chat={chat} />
      case 'clause':
        return <ClausePage />
      case 'risk':
        return <RiskPage />
      case 'summary':
        return <SummaryPage />
      case 'compare':
        return <ComparePage />
      default:
        return <UploadPage doc={doc} onUploaded={handleUploaded} onNavigate={setPage} />
    }
  }

  return (
    <div className="app">
      <a className="skip-link" href="#main">Skip to content</a>
      <Sidebar page={page} onNavigate={setPage} doc={doc} />
      <main id="main" className="main">{renderPage()}</main>
    </div>
  )
}
