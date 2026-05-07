import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { logActivity } from '../lib/logActivity'

export function useRegistros() {
  const { currentUser } = useAuth()
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
    
    logActivity({ userName: currentUser?.name, action: `abriu um registro: "${ticket.title}"` })
    
    await fetchTickets()
  }

  async function respondTicket(ticketId, text) {
    const { error } = await supabase
      .from('ticket_responses')
      .insert([{
        ticket_id: ticketId,
        author_id: currentUser?.id,
        author_name: currentUser?.name,
        author_role: currentUser?.role,
        text
      }])
    
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
