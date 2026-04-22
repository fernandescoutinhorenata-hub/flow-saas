import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTickets() {
  const [tickets, setTickets] = useState([])

  useEffect(() => {
    fetchTickets()
    const channel = supabase
      .channel('tickets')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => fetchTickets()
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchTickets() {
    const { data } = await supabase
      .from('tickets')
      .select('*, ticket_responses(*)')
      .order('created_at', { ascending: false })
    if (data) setTickets(data)
  }

  async function createTicket(ticket) {
    await supabase.from('tickets').insert([ticket])
  }

  async function respondTicket(ticketId, response) {
    await supabase.from('ticket_responses')
      .insert([{ ...response, ticket_id: ticketId }])
  }

  async function updateTicketStatus(id, status) {
    await supabase.from('tickets')
      .update({ status }).eq('id', id)
  }

  return { tickets, createTicket, 
           respondTicket, updateTicketStatus }
}
