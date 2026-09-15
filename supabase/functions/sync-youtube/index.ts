import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function extractVideoId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

serve(async (_req) => {
  const apiKey = Deno.env.get('YOUTUBE_API_KEY') ?? ''
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  const headers = { 'Content-Type': 'application/json' }

  if (!apiKey) {
    return new Response(JSON.stringify({ success: false, error: 'YOUTUBE_API_KEY não configurada' }), { status: 500, headers })
  }

  const supabase = createClient(supabaseUrl, serviceRole)

  const { data: videos, error } = await supabase
    .from('videos')
    .select('id, youtube_url')
    .not('youtube_url', 'is', null)

  if (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers })
  }

  const map = new Map<string, string>()
  for (const v of videos ?? []) {
    const vid = extractVideoId(v.youtube_url)
    if (vid) map.set(vid, v.id)
  }

  const ids = [...map.keys()]
  const today = new Date().toISOString().split('T')[0]
  let synced = 0
  const errors: string[] = []

  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50).join(',')
    const resp = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${batch}&key=${apiKey}`)
    if (!resp.ok) {
      errors.push(`YouTube API respondeu ${resp.status}`)
      continue
    }
    const json = await resp.json()

    for (const item of json.items ?? []) {
      const dbId = map.get(item.id)
      const stats = item.statistics ?? {}

      const metric = {
        video_id: dbId,
        snapshot_date: today,
        views: parseInt(stats.viewCount || '0', 10),
        likes: parseInt(stats.likeCount || '0', 10),
        comments: parseInt(stats.commentCount || '0', 10),
      }

      const { error: upErr } = await supabase
        .from('video_metrics')
        .upsert(metric, { onConflict: 'video_id,snapshot_date' })

      if (upErr) errors.push(upErr.message)
      else synced++
    }
  }

  return new Response(JSON.stringify({ success: true, synced, errors }), { status: 200, headers })
})
