import { useCallback, useState } from 'react'
import { queryAgent } from '../utils/api.js'

export function useAgent(agentType, defaultQuery) {
  const [state, setState] = useState({ loading: false, result: null, error: '' })

  const run = useCallback(async (query = '', docId) => {
    setState({ loading: true, result: null, error: '' })
    try {
      const result = await queryAgent(query.trim() || defaultQuery, agentType, docId)
      setState({ loading: false, result, error: '' })
    } catch (err) {
      setState({ loading: false, result: null, error: err.message })
    }
  }, [agentType, defaultQuery])

  return { ...state, run }
}
