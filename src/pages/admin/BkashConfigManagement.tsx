import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Smartphone, Settings } from "lucide-react";

interface BkashConfig {
  app_key: string;
  app_secret: string;
  username: string;
  password: string;
  is_live: boolean;
  success_url: string;
  fail_url: string;
  cancel_url: string;
}

export default function BkashConfigManagement() {
  const [config, setConfig] = useState<BkashConfig>({
    app_key: '',
    app_secret: '',
    username: '',
    password: '',
    is_live: false,
    success_url: `${window.location.origin}/payment/success`,
    fail_url: `${window.location.origin}/payment/failed`,
    cancel_url: `${window.location.origin}/payment/cancelled`
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBkashConfig();
  }, []);

  const fetchBkashConfig = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', [
          'bkash_app_key',
          'bkash_app_secret', 
          'bkash_username',
          'bkash_password',
          'bkash_is_live',
          'bkash_success_url',
          'bkash_fail_url',
          'bkash_cancel_url'
        ]);

      if (data) {
        const configData = data.reduce((acc: any, setting) => {
          const key = setting.key.replace('bkash_', '');
          acc[key] = setting.value;
          return acc;
        }, {});

        setConfig({
          app_key: configData.app_key || '',
          app_secret: configData.app_secret || '',
          username: configData.username || '',
          password: configData.password || '',
          is_live: configData.is_live || false,
          success_url: configData.success_url || `${window.location.origin}/payment/success`,
          fail_url: configData.fail_url || `${window.location.origin}/payment/failed`,
          cancel_url: configData.cancel_url || `${window.location.origin}/payment/cancelled`
        });
      }
    } catch (error) {
      console.error('Error fetching bKash config:', error);
      toast({
        title: "Error",
        description: "Failed to load bKash configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveBkashConfig = async () => {
    setSaving(true);
    try {
      const settings = [
        { key: 'bkash_app_key', value: config.app_key },
        { key: 'bkash_app_secret', value: config.app_secret },
        { key: 'bkash_username', value: config.username },
        { key: 'bkash_password', value: config.password },
        { key: 'bkash_is_live', value: config.is_live },
        { key: 'bkash_success_url', value: config.success_url },
        { key: 'bkash_fail_url', value: config.fail_url },
        { key: 'bkash_cancel_url', value: config.cancel_url }
      ];

      for (const setting of settings) {
        await supabase
          .from('site_settings')
          .upsert({
            key: setting.key,
            value: setting.value,
            description: `bKash Configuration - ${setting.key}`
          });
      }

      toast({
        title: "Success",
        description: "bKash configuration saved successfully",
      });
    } catch (error) {
      console.error('Error saving bKash config:', error);
      toast({
        title: "Error",
        description: "Failed to save bKash configuration",
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
            <Smartphone className="h-8 w-8 mr-2 text-primary" />
            bKash Payment Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure your bKash payment gateway settings
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
            Configure your bKash payment gateway for secure mobile payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="app_key">App Key</Label>
              <Input
                id="app_key"
                value={config.app_key}
                onChange={(e) => setConfig({ ...config, app_key: e.target.value })}
                placeholder="Enter your bKash App Key"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="app_secret">App Secret</Label>
              <Input
                id="app_secret"
                type="password"
                value={config.app_secret}
                onChange={(e) => setConfig({ ...config, app_secret: e.target.value })}
                placeholder="Enter your bKash App Secret"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={config.username}
                onChange={(e) => setConfig({ ...config, username: e.target.value })}
                placeholder="Enter your bKash Username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                placeholder="Enter your bKash Password"
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
          </div>

          <div className="flex justify-end">
            <Button onClick={saveBkashConfig} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}