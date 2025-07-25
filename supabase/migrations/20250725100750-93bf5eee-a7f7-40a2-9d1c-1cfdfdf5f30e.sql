-- Update the sslcommerz-payment edge function to use SSL configuration from site_settings
-- Add default SSL configuration settings to site_settings table

INSERT INTO public.site_settings (key, value, description) VALUES
('ssl_store_id', '"metasoftbd0live"', 'SSLCommerz Store ID'),
('ssl_is_live', 'false', 'SSLCommerz Live Mode'),
('ssl_success_url', '"https://metasoftbd.com/payment/success"', 'Payment Success URL'),
('ssl_fail_url', '"https://metasoftbd.com/payment/failed"', 'Payment Fail URL'),
('ssl_cancel_url', '"https://metasoftbd.com/payment/cancelled"', 'Payment Cancel URL'),
('ssl_ipn_url', '"https://rkpyvtragdluawzrlxbi.supabase.co/functions/v1/sslcommerz-ipn"', 'SSLCommerz IPN URL')
ON CONFLICT (key) DO NOTHING;