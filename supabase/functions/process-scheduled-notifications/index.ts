
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // Initialize Supabase client with service key to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY') as string

    if (!fcmServerKey) {
      throw new Error('FCM_SERVER_KEY is not set')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get current time
    const now = new Date()
    
    // Query for scheduled notifications that are due
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .is('sent_at', null)
      .lte('scheduled_for', now.toISOString())
      .order('scheduled_for')
    
    if (error) {
      throw error
    }
    
    console.log(`Found ${notifications?.length || 0} scheduled notifications to process`)
    
    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No scheduled notifications to process' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const results = []
    
    // Process each notification
    for (const notification of notifications) {
      try {
        // Mark as sent
        const { error: updateError } = await supabase
          .from('notifications')
          .update({ sent_at: now.toISOString() })
          .eq('id', notification.id)
        
        if (updateError) {
          console.error(`Error updating notification ${notification.id}:`, updateError)
          results.push({ id: notification.id, success: false, error: updateError.message })
          continue
        }
        
        // For mobile notifications, send push via FCM
        if (notification.type === 'mobile' || notification.type === 'both') {
          // Process user-specific notification
          if (notification.user_id) {
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('notification_preferences')
              .eq('id', notification.user_id)
              .single()
            
            if (userError) {
              console.error(`Error fetching user ${notification.user_id}:`, userError)
              results.push({ id: notification.id, success: false, error: userError.message })
              continue
            }
            
            const fcmToken = userData.notification_preferences?.fcm_token
            const pushEnabled = userData.notification_preferences?.push_enabled ?? true
            
            if (fcmToken && pushEnabled) {
              await sendFcmNotification(fcmServerKey, notification, [fcmToken])
            }
          } 
          // Process audience-based notification
          else {
            const query = supabase
              .from('profiles')
              .select('notification_preferences')
              .not('notification_preferences->fcm_token', 'is', null)
              .eq('notification_preferences->push_enabled', true)
            
            if (notification.audience !== 'all' && notification.audience) {
              query.contains('notification_preferences->subscriptions', [notification.audience])
            } else if (notification.target_audience !== 'all' && notification.target_audience) {
              query.contains('notification_preferences->subscriptions', [notification.target_audience])
            }
            
            const { data: usersData, error: usersError } = await query
            
            if (usersError) {
              console.error(`Error fetching users for notification ${notification.id}:`, usersError)
              results.push({ id: notification.id, success: false, error: usersError.message })
              continue
            }
            
            const fcmTokens = usersData
              .map(user => user.notification_preferences?.fcm_token)
              .filter(Boolean) as string[]
            
            if (fcmTokens.length > 0) {
              await sendFcmNotification(fcmServerKey, notification, fcmTokens)
            }
          }
        }
        
        results.push({ id: notification.id, success: true })
      } catch (processError) {
        console.error(`Error processing notification ${notification.id}:`, processError)
        results.push({ id: notification.id, success: false, error: processError.message })
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, processed: results }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing scheduled notifications:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function sendFcmNotification(
  fcmServerKey: string, 
  notification: any, 
  fcmTokens: string[]
) {
  if (fcmTokens.length === 0) return
  
  const fcmPayload = {
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: {
      notificationId: notification.id,
      linkToArticle: notification.link_to_article || '',
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
    throw new Error(`FCM request failed: ${errorText}`)
  }
  
  return await fcmResponse.json()
}
