import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function usePedidos(projectId) {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPedidos = useCallback(async () => {
    try {
      let query = supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false })

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data } = await query
      setPedidos(data || [])
    } catch (err) {
      console.error('Erro pedidos:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchPedidos()
    const interval = setInterval(fetchPedidos, 3000)
    return () => clearInterval(interval)
  }, [fetchPedidos])

  async function createPedido(pedido) {
    const { error } = await supabase.from('pedidos').insert([{
      ...pedido,
      status: 'pendente',
      project_id: projectId || null
    }])
    if (error) throw error
    await fetchPedidos()
  }

  async function updatePedidoStatus(id, status) {
    const { error } = await supabase.from('pedidos').update({ status }).eq('id', id)
    if (error) throw error
    await fetchPedidos()
  }

  async function deletePedido(id) {
    const { error } = await supabase.from('pedidos').delete().eq('id', id)
    if (error) throw error
    await fetchPedidos()
  }

  return { pedidos, loading, createPedido, updatePedidoStatus, deletePedido }
}
