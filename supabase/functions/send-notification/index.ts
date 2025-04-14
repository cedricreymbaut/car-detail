
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  recipient: string;
  subject: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipient, subject, message }: NotificationRequest = await req.json();

    // Validate request
    if (!recipient || !subject || !message) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: recipient, subject, and message are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Log email details for debugging
    console.log(`Sending email to: ${recipient}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message length: ${message.length} characters`);

    // In a real implementation, this would use a service like Resend, SendGrid, etc.
    // For now, we'll just log the email and return a success response
    // The implementation can be enhanced later to use a real email service

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email notification sent (simulated)",
        to: recipient,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
