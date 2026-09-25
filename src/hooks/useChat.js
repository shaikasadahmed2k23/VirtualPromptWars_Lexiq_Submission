import { useCallback, useState } from 'react'
import { queryAgent } from '../utils/api.js'

let nextId = 0
const uid = () => ++nextId

export function useChat() {
  const [messages, setMessages] = useState([])
  const [busy, setBusy] = useState(false)

  const send = useCallback(async (text, docId) => {
    const question = text.trim()
    if (!question || busy) return
    setMessages((m) => [...m, { id: uid(), role: 'user', text: question }])
    setBusy(true)
    try {
      const data = await queryAgent(question, 'qa', docId)
      setMessages((m) => [...m, {
        id: uid(),
        role: 'assistant',
        text: String(data.answer ?? 'No answer was returned.'),
        confidence: data.confidence,
        citations: Array.isArray(data.citations) ? data.citations.filter(Boolean).map(String) : [],
      }])
    } catch (err) {
      setMessages((m) => [...m, { id: uid(), role: 'assistant', error: true, text: err.message }])
    } finally {
      setBusy(false)
    }
  }, [busy])

  const clear = useCallback(() => setMessages([]), [])

  return { messages, busy, send, clear }
}
