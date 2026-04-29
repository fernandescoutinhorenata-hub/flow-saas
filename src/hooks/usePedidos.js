import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePedidos(projectId) {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPedidos()
    const interval = setInterval(fetchPedidos, 3000)
    return () => clearInterval(interval)
  }, [projectId])

  async function fetchPedidos() {
    try {
      const { data } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false })
      setPedidos(data || [])
    } catch(err) {
      console.error('Erro pedidos:', err)
    } finally {
      setLoading(false)
    }
  }

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
