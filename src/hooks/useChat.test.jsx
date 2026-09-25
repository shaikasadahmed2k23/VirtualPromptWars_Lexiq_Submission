import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useChat } from './useChat.js'

vi.mock('../utils/api.js', () => ({
  queryAgent: vi.fn(),
}))
import { queryAgent } from '../utils/api.js'

describe('useChat', () => {
  it('appends the user question immediately, then the answer', async () => {
    queryAgent.mockResolvedValueOnce({ answer: 'Yes, with 3 months notice.', confidence: 'high', citations: ['clause 4'] })
    const { result } = renderHook(() => useChat())

    act(() => { result.current.send('Can the landlord terminate?', 'doc-1') })
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0]).toMatchObject({ role: 'user', text: 'Can the landlord terminate?' })

    await waitFor(() => expect(result.current.messages).toHaveLength(2))
    expect(result.current.messages[1]).toMatchObject({ role: 'assistant', confidence: 'high' })
    expect(queryAgent).toHaveBeenCalledWith('Can the landlord terminate?', 'qa', 'doc-1')
  })

  it('records a failed request as an error message instead of throwing', async () => {
    queryAgent.mockRejectedValueOnce(new Error('Cannot reach the server.'))
    const { result } = renderHook(() => useChat())

    await act(async () => { await result.current.send('What is the rent?', 'doc-1') })

    expect(result.current.messages[1]).toMatchObject({ role: 'assistant', error: true })
  })

  it('clear() empties the conversation', async () => {
    queryAgent.mockResolvedValueOnce({ answer: 'ok' })
    const { result } = renderHook(() => useChat())
    await act(async () => { await result.current.send('hi', 'doc-1') })
    expect(result.current.messages.length).toBeGreaterThan(0)

    act(() => { result.current.clear() })
    expect(result.current.messages).toHaveLength(0)
  })
})
