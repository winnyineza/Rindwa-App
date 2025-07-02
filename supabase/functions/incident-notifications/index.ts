
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { type, record, old_record } = await req.json();

    let notificationTitle = '';
    let notificationBody = '';
    let notificationCategory = '';

    if (type === 'INSERT') {
      notificationTitle = `New ${record.category} incident reported`;
      notificationBody = `${record.title} - ${record.location_address || 'Location not specified'}`;
      notificationCategory = 'incident_created';
    } else if (type === 'UPDATE') {
      if (old_record.status !== record.status) {
        if (record.status === 'verified') {
          notificationTitle = 'Incident Verified';
          notificationBody = `${record.title} has been verified by authorities`;
          notificationCategory = 'incident_verified';
        } else if (record.status === 'resolved') {
          notificationTitle = 'Incident Resolved';
          notificationBody = `${record.title} has been marked as resolved`;
          notificationCategory = 'incident_resolved';
        }
      }
    }

    if (notificationTitle && notificationBody) {
      // Call the send-notification function
      const notificationResponse = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-notification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
          },
          body: JSON.stringify({
            title: notificationTitle,
            body: notificationBody,
            incidentId: record.id,
            category: notificationCategory
          })
        }
      );

      if (!notificationResponse.ok) {
        console.error('Failed to send notification:', await notificationResponse.text());
      }
    }

    return new Response(
      JSON.stringify({ message: "Notification processed successfully" }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error in incident-notifications function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
