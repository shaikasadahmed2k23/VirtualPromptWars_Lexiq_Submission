import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import UploadPage from './pages/UploadPage.jsx'
import QAPage from './pages/QAPage.jsx'
import ClausePage from './pages/ClausePage.jsx'
import RiskPage from './pages/RiskPage.jsx'
import SummaryPage from './pages/SummaryPage.jsx'
import ComparePage from './pages/ComparePage.jsx'
import { fetchStats } from './utils/api.js'

export default function App() {
  const [activePage, setActivePage] = useState('upload')
  const [stats, setStats] = useState({ chunks: 0, documents_loaded: 0 })
  const [docReady, setDocReady] = useState(false)

  useEffect(() => {
    fetchStats()
      .then(s => {
        setStats(s)
        if ((s.chunks ?? 0) > 0) setDocReady(true)
      })
      .catch(() => {})
  }, [])

  const refreshStats = () => {
    fetchStats()
      .then(s => {
        setStats(s)
        if ((s.chunks ?? 0) > 0) setDocReady(true)
      })
      .catch(() => {})
  }

  const pages = {
    upload: <UploadPage onUploadSuccess={refreshStats} />,
    qa: <QAPage />,
    clause: <ClausePage />,
    risk: <RiskPage />,
    summary: <SummaryPage />,
    compare: <ComparePage />,
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        stats={stats}
        docReady={docReady}
      />
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '40px 48px',
        background: 'var(--bg)',
      }}>
        {pages[activePage]}
      </main>
    </div>
  )
}
