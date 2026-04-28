import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useRegistros() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
    const interval = setInterval(fetchTickets, 3000)
    return () => clearInterval(interval)
  }, [])

  async function fetchTickets() {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, ticket_responses(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro registros:', JSON.stringify(error))
      setLoading(false)
      return
    }
    setTickets(data || [])
    setLoading(false)
  }

  async function createTicket(ticket) {
    const { error } = await supabase.from('tickets').insert([ticket])
    if (error) {
      console.error('Erro ao criar ticket:', error)
      return
    }
    await fetchTickets()
  }

  async function respondTicket(ticketId, response) {
    const { error } = await supabase.from('ticket_responses')
      .insert([{ ...response, ticket_id: ticketId }])
    if (error) {
      console.error('Erro ao responder ticket:', error)
      return
    }
    await fetchTickets()
  }

  async function updateTicketStatus(id, status) {
    const { error } = await supabase.from('tickets')
      .update({ status }).eq('id', id)
    if (error) {
      console.error('Erro ao atualizar status:', error)
      return
    }
    await fetchTickets()
  }

  async function deleteTicket(id) {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id)
    if (error) {
      console.error('Erro ao excluir:', error)
      return
    }
    await fetchTickets()
  }

  return { tickets, loading, createTicket, respondTicket, updateTicketStatus, deleteTicket }
}
