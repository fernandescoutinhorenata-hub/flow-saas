import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useColumns() {
  const [columns, setColumns] = useState([])

  useEffect(() => {
    fetchColumns()
    const channel = supabase
      .channel('columns')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'columns' },
        () => fetchColumns()
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchColumns() {
    const { data } = await supabase
      .from('columns')
      .select('*')
      .order('position')
    if (data) setColumns(data)
  }

  async function addColumn(label) {
    const id = label.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '') + '_' + Date.now()
    const position = columns.length - 1
    await supabase.from('columns')
      .insert([{ id, label: label.toUpperCase(), 
                 locked: false, position }])
  }

  async function removeColumn(colId) {
    // Primeiro mover tarefas para backlog
    await supabase.from('tasks')
      .update({ status: 'backlog' })
      .eq('status', colId)
    // Depois deletar a coluna
    await supabase.from('columns')
      .delete().eq('id', colId)
  }

  async function renameColumn(colId, newLabel) {
    await supabase.from('columns')
      .update({ label: newLabel.toUpperCase() })
      .eq('id', colId)
  }

  return { columns, addColumn, removeColumn, renameColumn }
}
