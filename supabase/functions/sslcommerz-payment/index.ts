import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { courseId, amount, currency = 'BDT' } = await req.json()
    
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      throw new Error('Profile not found')
    }

    // Get course details
    const { data: course } = await supabase
      .from('courses')
      .select('title, price')
      .eq('id', courseId)
      .single()

    if (!course) {
      throw new Error('Course not found')
    }

    // Generate transaction ID
    const tranId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // SSLCommerz configuration
    const storeId = 'metasoftbd0live'
    const storePassword = Deno.env.get('SSLCOMMERZ_STORE_PASSWORD')
    const isLive = false // Set to true for production

    const sslcommerzUrl = isLive 
      ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
      : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'

    // Prepare payment data
    const paymentData = new URLSearchParams({
      store_id: storeId,
      store_passwd: storePassword!,
      total_amount: amount.toString(),
      currency: currency,
      tran_id: tranId,
      success_url: `https://metasoftbd.com/payment/success?course_id=${courseId}&tran_id=${tranId}`,
      fail_url: `https://metasoftbd.com/payment/failed?course_id=${courseId}&tran_id=${tranId}`,
      cancel_url: `https://metasoftbd.com/payment/cancelled?course_id=${courseId}&tran_id=${tranId}`,
      ipn_url: `https://rkpyvtragdluawzrlxbi.supabase.co/functions/v1/sslcommerz-ipn`,
      product_name: course.title,
      product_category: 'Course',
      product_profile: 'digital-goods',
      cus_name: profile.full_name || profile.email,
      cus_email: profile.email,
      cus_add1: 'N/A',
      cus_city: 'N/A',
      cus_state: 'N/A',
      cus_postcode: 'N/A',
      cus_country: 'Bangladesh',
      cus_phone: profile.phone || 'N/A',
      ship_name: profile.full_name || profile.email,
      ship_add1: 'N/A',
      ship_city: 'N/A',
      ship_state: 'N/A',
      ship_postcode: 'N/A',
      ship_country: 'Bangladesh'
    })

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: profile.id,
        course_id: courseId,
        amount: amount,
        currency: currency,
        transaction_id: tranId,
        status: 'pending',
        payment_method: 'sslcommerz'
      })

    if (paymentError) {
      throw new Error('Failed to create payment record')
    }

    // Make request to SSLCommerz
    const response = await fetch(sslcommerzUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: paymentData.toString()
    })

    const result = await response.json()

    if (result.status === 'SUCCESS') {
      return new Response(
        JSON.stringify({
          success: true,
          payment_url: result.GatewayPageURL,
          transaction_id: tranId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      throw new Error(result.failedreason || 'Payment initialization failed')
    }

  } catch (error) {
    console.error('SSLCommerz payment error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})