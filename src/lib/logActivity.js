import { supabase } from './supabase'

export async function logActivity({ userName, action, newStatus = null }) {
  try {
    await supabase.from('activity_log').insert([{
      user_name: userName || 'Sistema',
      action: action,
      new_status: newStatus
    }])
  } catch (err) {
    console.error('Erro ao registrar log de atividade:', err)
  }
}
