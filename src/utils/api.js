const BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')

function errorMessage(body, fallback) {
  if (typeof body?.detail === 'string') return body.detail
  if (Array.isArray(body?.detail)) return 'Invalid request. Please check your input.'
  return fallback
}

async function request(path, options, fallback) {
  let res
  try {
    res = await fetch(`${BASE}${path}`, options)
  } catch {
    throw new Error('Cannot reach the server. It may be waking up, please retry in a moment.')
  }
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(errorMessage(body, `${fallback} (${res.status})`))
  return body
}

export function uploadDocument(file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${BASE}/upload`)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      let body = {}
      try { body = JSON.parse(xhr.responseText) } catch { /* non-JSON error page */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(body)
      else reject(new Error(errorMessage(body, `Upload failed (${xhr.status})`)))
    }
    xhr.onerror = () => reject(new Error('Cannot reach the server. It may be waking up, please retry in a moment.'))
    xhr.send(formData)
  })
}

export function queryAgent(query, agentType, docId) {
  return request(
    '/query',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, agent_type: agentType, doc_id: docId || null }),
    },
    'Request failed',
  )
}

export function fetchStats(docId) {
  const query = docId ? `?doc_id=${encodeURIComponent(docId)}` : ''
  return request(`/stats${query}`, undefined, 'Could not reach backend')
}

export function compareDocuments(fileA, fileB) {
  const formData = new FormData()
  formData.append('file_a', fileA)
  formData.append('file_b', fileB)
  return request('/compare', { method: 'POST', body: formData }, 'Compare failed')
}
