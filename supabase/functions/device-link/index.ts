// @ts-expect-error - Deno imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-expect-error - Deno imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { method } = req
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    if (method === 'POST' && path === 'generate') {
      // Generate a device link code
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate a random 6-character code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

      // Store the code in the database
      const { error: insertError } = await supabase
        .from('device_link_codes')
        .insert({
          code,
          user_id: user.id,
          expires_at: expiresAt.toISOString(),
          used: false
        })

      if (insertError) {
        console.error('Error inserting device link code:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to generate code' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ code, expires_at: expiresAt.toISOString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (method === 'POST' && path === 'exchange') {
      // Exchange code for session tokens
      const { code } = await req.json()

      if (!code) {
        return new Response(
          JSON.stringify({ error: 'Code is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Find and validate the code
      const { data: linkData, error: linkError } = await supabase
        .from('device_link_codes')
        .select('*')
        .eq('code', code)
        .eq('used', false)
        .single()

      if (linkError || !linkData) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if code has expired
      if (new Date(linkData.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Code has expired' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Mark code as used
      await supabase
        .from('device_link_codes')
        .update({ used: true })
        .eq('id', linkData.id)

      // Get user data for the session
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(linkData.user_id)
      
      if (userError || !userData.user) {
        console.error('Error getting user data:', userError)
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create a session for the extension
      // Note: In production, you might want to use a more secure method
      // For now, we'll return the user data and let the extension handle auth
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: userData.user.email || 'temp@example.com',
        options: {
          redirectTo: 'chrome-extension://your-extension-id'
        }
      })

      if (sessionError) {
        console.error('Error generating session:', sessionError)
        return new Response(
          JSON.stringify({ error: 'Failed to generate session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (!userData.user) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ 
          user: userData.user,
          session: sessionData,
          message: 'Successfully linked device'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in device-link function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
