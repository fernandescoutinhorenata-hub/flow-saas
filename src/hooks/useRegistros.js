import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useRegistros() {
  const [tickets, setTickets] = useState([])

  useEffect(() => {
    fetchTickets()
    
    const interval = setInterval(() => {
      fetchTickets()
    }, 3000)

    return () => clearInterval(interval)
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
    await fetchTickets()
  }

  async function respondTicket(ticketId, response) {
    await supabase.from('ticket_responses')
      .insert([{ ...response, ticket_id: ticketId }])
    await fetchTickets()
  }

  async function updateTicketStatus(id, status) {
    await supabase.from('tickets')
      .update({ status }).eq('id', id)
    await fetchTickets()
  }

  return { tickets, createTicket, 
           respondTicket, updateTicketStatus }
}
