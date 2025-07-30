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
    console.log('bKash payment function invoked');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header found');
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify the user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User authenticated:', user.id);

    // Parse request body
    const body = await req.json();
    const { courseId, amount, currency = 'BDT' } = body;

    if (!courseId || !amount) {
      console.error('Missing required parameters:', { courseId, amount });
      return new Response(
        JSON.stringify({ success: false, error: 'Missing courseId or amount' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Processing bKash payment for:', { courseId, amount, currency, userId: user.id });

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ success: false, error: 'User profile not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get course details
    const { data: course, error: courseError } = await supabaseClient
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      console.error('Course fetch error:', courseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Course not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get bKash configuration
    const { data: settings } = await supabaseClient
      .from('site_settings')
      .select('key, value')
      .in('key', ['bkash_app_key', 'bkash_app_secret', 'bkash_username', 'bkash_password', 'bkash_is_live', 'bkash_success_url', 'bkash_fail_url', 'bkash_cancel_url']);

    const config = settings?.reduce((acc: any, setting) => {
      const key = setting.key.replace('bkash_', '');
      acc[key] = setting.value;
      return acc;
    }, {});

    if (!config?.app_key || !config?.app_secret || !config?.username || !config?.password) {
      console.error('bKash configuration incomplete:', config);
      return new Response(
        JSON.stringify({ success: false, error: 'bKash payment gateway not configured properly' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('bKash configuration loaded, is_live:', config.is_live);

    // Generate unique invoice
    const invoice = `COURSE_${courseId}_${Date.now()}`;
    
    // bKash API endpoints
    const baseUrl = config.is_live 
      ? 'https://tokenized.pay.bka.sh' 
      : 'https://tokenized.sandbox.bka.sh';

    // Step 1: Grant Token
    console.log('Step 1: Requesting bKash grant token');
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
    console.log('Token response:', { status: tokenResponse.status, success: tokenData.msg === 'success' });

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

    // Step 2: Create Payment
    console.log('Step 2: Creating bKash payment');
    const paymentPayload = {
      mode: '0011',
      payerReference: profile.phone || profile.email || user.id.substring(0, 8),
      callbackURL: config.success_url,
      amount: amount.toString(),
      currency: currency,
      intent: 'sale',
      merchantInvoiceNumber: invoice
    };

    console.log('Payment payload:', paymentPayload);

    const paymentResponse = await fetch(`${baseUrl}/v1.2.0-beta/tokenized/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'authorization': tokenData.id_token,
        'x-app-key': config.app_key
      },
      body: JSON.stringify(paymentPayload)
    });

    const paymentData = await paymentResponse.json();
    console.log('Payment response:', { status: paymentResponse.status, paymentID: paymentData.paymentID });

    if (!paymentResponse.ok || !paymentData.paymentID) {
      console.error('bKash payment creation failed:', paymentData);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create bKash payment' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Step 3: Store payment record
    console.log('Step 3: Storing payment record');
    const { error: paymentInsertError } = await supabaseClient
      .from('payments')
      .insert({
        user_id: profile.id,
        course_id: courseId,
        amount: amount,
        currency: currency,
        status: 'pending',
        payment_method: 'bkash',
        transaction_id: paymentData.paymentID
      });

    if (paymentInsertError) {
      console.error('Failed to store payment record:', paymentInsertError);
      // Continue anyway, don't fail the payment creation
    }

    console.log('bKash payment created successfully:', paymentData.paymentID);

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: paymentData.bkashURL,
        payment_id: paymentData.paymentID,
        message: 'Payment created successfully'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error in bKash payment function:', error);
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