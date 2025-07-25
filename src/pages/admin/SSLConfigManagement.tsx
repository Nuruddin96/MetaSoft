import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Shield, Settings } from "lucide-react";

interface SSLConfig {
  store_id: string;
  store_password: string;
  is_live: boolean;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url: string;
}

export default function SSLConfigManagement() {
  const [config, setConfig] = useState<SSLConfig>({
    store_id: '',
    store_password: '',
    is_live: false,
    success_url: `${window.location.origin}/payment/success`,
    fail_url: `${window.location.origin}/payment/failed`,
    cancel_url: `${window.location.origin}/payment/cancelled`,
    ipn_url: `https://rkpyvtragdluawzrlxbi.supabase.co/functions/v1/sslcommerz-ipn`
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSSLConfig();
  }, []);

  const fetchSSLConfig = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', [
          'ssl_store_id',
          'ssl_store_password', 
          'ssl_is_live',
          'ssl_success_url',
          'ssl_fail_url',
          'ssl_cancel_url',
          'ssl_ipn_url'
        ]);

      if (data) {
        const configData = data.reduce((acc: any, setting) => {
          const key = setting.key.replace('ssl_', '');
          acc[key] = setting.value;
          return acc;
        }, {});

        setConfig({
          store_id: configData.store_id || '',
          store_password: configData.store_password || '',
          is_live: configData.is_live || false,
          success_url: configData.success_url || `${window.location.origin}/payment/success`,
          fail_url: configData.fail_url || `${window.location.origin}/payment/failed`,
          cancel_url: configData.cancel_url || `${window.location.origin}/payment/cancelled`,
          ipn_url: configData.ipn_url || `https://rkpyvtragdluawzrlxbi.supabase.co/functions/v1/sslcommerz-ipn`
        });
      }
    } catch (error) {
      console.error('Error fetching SSL config:', error);
      toast({
        title: "Error",
        description: "Failed to load SSL configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSSLConfig = async () => {
    setSaving(true);
    try {
      const settings = [
        { key: 'ssl_store_id', value: config.store_id },
        { key: 'ssl_store_password', value: config.store_password },
        { key: 'ssl_is_live', value: config.is_live },
        { key: 'ssl_success_url', value: config.success_url },
        { key: 'ssl_fail_url', value: config.fail_url },
        { key: 'ssl_cancel_url', value: config.cancel_url },
        { key: 'ssl_ipn_url', value: config.ipn_url }
      ];

      for (const setting of settings) {
        await supabase
          .from('site_settings')
          .upsert({
            key: setting.key,
            value: setting.value,
            description: `SSL Configuration - ${setting.key}`
          });
      }

      toast({
        title: "Success",
        description: "SSL configuration saved successfully",
      });
    } catch (error) {
      console.error('Error saving SSL config:', error);
      toast({
        title: "Error",
        description: "Failed to save SSL configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-card rounded w-64 mb-6"></div>
          <div className="bg-card rounded-lg h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="h-8 w-8 mr-2 text-primary" />
            SSL Payment Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure your SSLCommerz payment gateway settings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Payment Gateway Settings
          </CardTitle>
          <CardDescription>
            Configure your SSLCommerz payment gateway for secure transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="store_id">Store ID</Label>
              <Input
                id="store_id"
                value={config.store_id}
                onChange={(e) => setConfig({ ...config, store_id: e.target.value })}
                placeholder="Enter your SSLCommerz Store ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store_password">Store Password</Label>
              <Input
                id="store_password"
                type="password"
                value={config.store_password}
                onChange={(e) => setConfig({ ...config, store_password: e.target.value })}
                placeholder="Enter your SSLCommerz Store Password"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_live"
              checked={config.is_live}
              onCheckedChange={(checked) => setConfig({ ...config, is_live: checked })}
            />
            <Label htmlFor="is_live">
              Live Mode (Uncheck for Sandbox/Testing)
            </Label>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Callback URLs</h3>
            
            <div className="space-y-2">
              <Label htmlFor="success_url">Success URL</Label>
              <Input
                id="success_url"
                value={config.success_url}
                onChange={(e) => setConfig({ ...config, success_url: e.target.value })}
                placeholder="URL for successful payments"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fail_url">Fail URL</Label>
              <Input
                id="fail_url"
                value={config.fail_url}
                onChange={(e) => setConfig({ ...config, fail_url: e.target.value })}
                placeholder="URL for failed payments"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancel_url">Cancel URL</Label>
              <Input
                id="cancel_url"
                value={config.cancel_url}
                onChange={(e) => setConfig({ ...config, cancel_url: e.target.value })}
                placeholder="URL for cancelled payments"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipn_url">IPN URL</Label>
              <Input
                id="ipn_url"
                value={config.ipn_url}
                onChange={(e) => setConfig({ ...config, ipn_url: e.target.value })}
                placeholder="Instant Payment Notification URL"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveSSLConfig} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}