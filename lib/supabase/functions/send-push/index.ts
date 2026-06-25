import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    const { record } = payload
    const userId = record.user_id


    // 1. Fetch user's push token from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.log(`Profile fetch error or profile not found for user ${userId}:`, profileError)
      return new Response(JSON.stringify({ message: 'User profile not found' }), { status: 200 })
    }

    const token = profile.push_token
    if (!token) {
      console.log(`No push token registered for user ${userId}`)
      return new Response(JSON.stringify({ message: 'No push token found for user' }), { status: 200 })
    }

    // 2. Call Expo Push API
    const message = {
      to: token,
      sound: 'default',
      title: record.title,
      body: record.body,
      data: { notificationId: record.id, type: record.type },
    }

    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    const result = await expoResponse.json()
    return new Response(JSON.stringify(result), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || err }), { status: 500 })
  }
})
