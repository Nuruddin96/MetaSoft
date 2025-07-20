import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const formData = await req.formData()
    const tranId = formData.get('tran_id') as string
    const status = formData.get('status') as string
    const amount = formData.get('amount') as string
    const valId = formData.get('val_id') as string

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('IPN received:', { tranId, status, amount, valId })

    // Verify transaction with SSLCommerz
    const storeId = 'metasoftbd0live'
    const storePassword = Deno.env.get('SSLCOMMERZ_STORE_PASSWORD')
    const isLive = false

    const validationUrl = isLive
      ? `https://securepay.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${storeId}&store_passwd=${storePassword}&format=json`
      : `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${storeId}&store_passwd=${storePassword}&format=json`

    const validationResponse = await fetch(validationUrl)
    const validationData = await validationResponse.json()

    console.log('Validation response:', validationData)

    if (validationData.status === 'VALID' || validationData.status === 'VALIDATED') {
      // Update payment status
      const { data: payment } = await supabase
        .from('payments')
        .select('*, course_id')
        .eq('transaction_id', tranId)
        .single()

      if (payment) {
        // Update payment status
        await supabase
          .from('payments')
          .update({
            status: 'completed',
            payment_date: new Date().toISOString()
          })
          .eq('transaction_id', tranId)

        // Create enrollment
        await supabase
          .from('enrollments')
          .insert({
            student_id: payment.user_id,
            course_id: payment.course_id,
            status: 'active'
          })

        console.log('Payment completed and enrollment created for:', tranId)
      }
    } else {
      // Update payment as failed
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('transaction_id', tranId)

      console.log('Payment validation failed for:', tranId)
    }

    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('IPN processing error:', error)
    return new Response('Error', { status: 500 })
  }
})