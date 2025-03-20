
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushNotificationPayload {
  title: string
  body: string
  userId?: string
  audience?: string
  data?: Record<string, string>
  linkToArticle?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY') as string

    if (!fcmServerKey) {
      throw new Error('FCM_SERVER_KEY is not set')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { title, body, userId, audience = 'all', data = {}, linkToArticle } = await req.json() as PushNotificationPayload

    console.log(`Processing push notification: ${title}`)

    // Validation
    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let fcmTokens: string[] = []

    // Get FCM tokens based on audience or userId
    if (userId) {
      // Individual notification
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('Error fetching user data:', userError)
        throw new Error(`Error fetching user data: ${userError.message}`)
      }

      const fcmToken = userData.notification_preferences?.fcm_token
      const pushEnabled = userData.notification_preferences?.push_enabled ?? true

      if (fcmToken && pushEnabled) {
        fcmTokens.push(fcmToken)
      }
    } else {
      // Audience-based notification
      const query = supabase
        .from('profiles')
        .select('id, notification_preferences')
        .not('notification_preferences->fcm_token', 'is', null)
        .eq('notification_preferences->push_enabled', true)

      if (audience !== 'all') {
        query.contains('notification_preferences->subscriptions', [audience])
      }

      const { data: usersData, error: usersError } = await query

      if (usersError) {
        console.error('Error fetching users data:', usersError)
        throw new Error(`Error fetching users data: ${usersError.message}`)
      }

      fcmTokens = usersData
        .map(user => user.notification_preferences?.fcm_token)
        .filter(Boolean) as string[]
    }

    if (fcmTokens.length === 0) {
      console.log('No valid FCM tokens found for the notification')
      return new Response(
        JSON.stringify({ success: true, message: 'No recipients found with valid FCM tokens' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Sending push notification to ${fcmTokens.length} recipients`)

    // Insert notification record into the database
    const { data: notificationData, error: insertError } = await supabase
      .from('notifications')
      .insert({
        title,
        body,
        user_id: userId || null,
        audience: audience,
        link_to_article: linkToArticle || null,
        type: 'mobile',
        sent_at: new Date().toISOString(),
      })
      .select()

    if (insertError) {
      console.error('Error inserting notification record:', insertError)
      throw new Error(`Error inserting notification: ${insertError.message}`)
    }

    // Send to FCM
    const notificationId = notificationData?.[0]?.id
    const fcmPayload = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        notificationId: notificationId || '',
        linkToArticle: linkToArticle || '',
      },
      registration_ids: fcmTokens,
    }

    const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${fcmServerKey}`,
      },
      body: JSON.stringify(fcmPayload),
    })

    if (!fcmResponse.ok) {
      const errorText = await fcmResponse.text()
      console.error('FCM error:', errorText)
      throw new Error(`FCM request failed: ${errorText}`)
    }

    const result = await fcmResponse.json()
    console.log('FCM response:', result)

    return new Response(
      JSON.stringify({ success: true, fcmResult: result, notificationId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing push notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
