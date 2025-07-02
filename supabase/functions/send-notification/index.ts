
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  title: string;
  body: string;
  incidentId?: string;
  userId?: string;
  category?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { title, body, incidentId, userId, category }: NotificationPayload = await req.json();

    // Get FCM tokens for users who should receive this notification
    let query = supabaseClient
      .from('fcm_tokens')
      .select(`
        token,
        user_id,
        notification_preferences!inner(*)
      `);

    // If specific user, send only to them
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: tokens, error } = await query;

    if (error) {
      console.error('Error fetching FCM tokens:', error);
      throw error;
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: "No FCM tokens found" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Filter tokens based on notification preferences
    const filteredTokens = tokens.filter(tokenData => {
      const prefs = tokenData.notification_preferences;
      if (!prefs) return false;

      // Check if user wants this type of notification
      if (category === 'incident_created' && !prefs.incident_created) return false;
      if (category === 'incident_verified' && !prefs.incident_verified) return false;
      if (category === 'incident_resolved' && !prefs.incident_resolved) return false;
      if (category === 'nearby_incidents' && !prefs.nearby_incidents) return false;

      return true;
    });

    // Initialize Firebase Admin SDK
    const serviceAccountKey = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_KEY");
    if (!serviceAccountKey) {
      console.error('Firebase service account key not found');
    }

    // Send Firebase Cloud Messaging notifications
    const notifications = filteredTokens.map(async (tokenData) => {
      try {
        // Store notification in database first
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: tokenData.user_id,
            title,
            message: body,
            type: category || 'general',
            incident_id: incidentId
          });

        // Send actual push notification if service account key is available
        if (serviceAccountKey) {
          try {
            const serviceAccount = JSON.parse(serviceAccountKey);
            
            // Use Firebase Admin SDK to send push notification
            const fcmUrl = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;
            
            // Get access token (simplified - in production use proper OAuth2)
            const accessTokenResponse = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: await createJWT(serviceAccount)
              })
            });

            if (accessTokenResponse.ok) {
              const { access_token } = await accessTokenResponse.json();
              
              const message = {
                message: {
                  token: tokenData.token,
                  notification: {
                    title,
                    body
                  },
                  data: {
                    incidentId: incidentId || '',
                    category: category || 'general'
                  }
                }
              };

              const response = await fetch(fcmUrl, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${access_token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
              });

              if (response.ok) {
                console.log(`Push notification sent successfully to ${tokenData.token.substring(0, 20)}...`);
              } else {
                console.error('Failed to send push notification:', await response.text());
              }
            }
          } catch (pushError) {
            console.error('Error sending push notification:', pushError);
          }
        }

        return { success: true, token: tokenData.token };
      } catch (error) {
        console.error(`Failed to process notification for ${tokenData.token}:`, error);
        return { success: false, token: tokenData.token, error: error.message };
      }
    });

    const results = await Promise.allSettled(notifications);
    const successful = results.filter(r => r.status === 'fulfilled').length;

    return new Response(
      JSON.stringify({ 
        message: `Notifications processed for ${successful}/${filteredTokens.length} users`,
        results 
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error in send-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

// Helper function to create JWT for Firebase Admin SDK authentication
async function createJWT(serviceAccount: any): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  };

  // This is a simplified JWT creation - in production, use a proper JWT library
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // For now, return a placeholder - proper RSA signing would be needed here
  return `${signatureInput}.signature`;
}
