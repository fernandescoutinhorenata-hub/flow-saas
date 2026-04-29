import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useColumns() {
  const [columns, setColumns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchColumns()
    
    const interval = setInterval(() => {
      fetchColumns()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  async function fetchColumns() {
    try {
      const { data } = await supabase
        .from('columns')
        .select('*')
        .order('position')
      if (data) setColumns(data)
    } catch (err) {
      console.error('Erro colunas:', err)
    } finally {
      setLoading(false)
    }
  }

  async function addColumn(label) {
    const id = label.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '') + '_' + Date.now()
    const position = columns.length - 1
    await supabase.from('columns')
      .insert([{ id, label: label.toUpperCase(), 
                 locked: false, position }])
    await fetchColumns()
  }

  async function removeColumn(colId) {
    // Primeiro mover tarefas para backlog
    await supabase.from('tasks')
      .update({ status: 'backlog' })
      .eq('status', colId)
    // Depois deletar a coluna
    await supabase.from('columns')
      .delete().eq('id', colId)
    await fetchColumns()
  }

  async function renameColumn(colId, newLabel) {
    await supabase.from('columns')
      .update({ label: newLabel.toUpperCase() })
      .eq('id', colId)
    await fetchColumns()
  }

  return { columns, loading, addColumn, removeColumn, renameColumn }
}
