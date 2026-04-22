import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { email, name, role } = await req.json()
  
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { error } = await supabaseAdmin.auth.admin
    .inviteUserByEmail(email, {
      data: { name, role },
      redirectTo: 'https://flow-saas-pi.vercel.app'
    })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true }), 
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})
