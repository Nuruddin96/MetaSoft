import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('bKash payment verification function invoked');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const body = await req.json();
    const { paymentID } = body;

    if (!paymentID) {
      console.error('Missing paymentID parameter');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing paymentID' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Verifying bKash payment:', paymentID);

    // Get bKash configuration
    const { data: settings } = await supabaseClient
      .from('site_settings')
      .select('key, value')
      .in('key', ['bkash_app_key', 'bkash_app_secret', 'bkash_username', 'bkash_password', 'bkash_is_live']);

    const config = settings?.reduce((acc: any, setting) => {
      const key = setting.key.replace('bkash_', '');
      acc[key] = setting.value;
      return acc;
    }, {});

    if (!config?.app_key || !config?.app_secret || !config?.username || !config?.password) {
      console.error('bKash configuration incomplete');
      return new Response(
        JSON.stringify({ success: false, error: 'bKash payment gateway not configured properly' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // bKash API endpoints
    const baseUrl = config.is_live 
      ? 'https://tokenized.pay.bka.sh' 
      : 'https://tokenized.sandbox.bka.sh';

    // Step 1: Grant Token
    console.log('Getting bKash grant token');
    const tokenResponse = await fetch(`${baseUrl}/v1.2.0-beta/tokenized/checkout/token/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'username': config.username,
        'password': config.password
      },
      body: JSON.stringify({
        app_key: config.app_key,
        app_secret: config.app_secret
      })
    });

    const tokenData = await tokenResponse.json();
    console.log('Token response status:', tokenResponse.status);

    if (!tokenResponse.ok || !tokenData.id_token) {
      console.error('bKash token request failed:', tokenData);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to authenticate with bKash' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Step 2: Execute Payment (verify and complete)
    console.log('Executing bKash payment verification');
    const executeResponse = await fetch(`${baseUrl}/v1.2.0-beta/tokenized/checkout/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'authorization': tokenData.id_token,
        'x-app-key': config.app_key
      },
      body: JSON.stringify({
        paymentID: paymentID
      })
    });

    const executeData = await executeResponse.json();
    console.log('Execute response:', { status: executeResponse.status, trxID: executeData.trxID });

    if (!executeResponse.ok || !executeData.trxID) {
      console.error('bKash payment execution failed:', executeData);
      return new Response(
        JSON.stringify({ success: false, error: 'Payment verification failed' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Step 3: Update payment status in database
    console.log('Updating payment status to completed');
    const { data: payment, error: updateError } = await supabaseClient
      .from('payments')
      .update({
        status: 'completed',
        payment_date: new Date().toISOString(),
        transaction_id: executeData.trxID
      })
      .eq('transaction_id', paymentID)
      .select('user_id, course_id')
      .single();

    if (updateError) {
      console.error('Failed to update payment status:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update payment status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Payment verified and completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment verified and completed successfully',
        transaction_id: executeData.trxID,
        payment_id: paymentID
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error in bKash verification function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})