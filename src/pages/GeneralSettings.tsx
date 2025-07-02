import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Globe,
  Shield,
  Bell,
  Database,
  Clock,
  Monitor,
  Palette,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// Validation schema for settings
const settingsSchema = z.object({
  // General Settings
  organizationName: z.string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters'),
  
  timezone: z.string({
    required_error: 'Please select a timezone',
  }),
  
  language: z.string({
    required_error: 'Please select a language',
  }),
  
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], {
    required_error: 'Please select a date format',
  }),
  
  // Security Settings
  sessionTimeout: z.number()
    .min(5, 'Session timeout must be at least 5 minutes')
    .max(480, 'Session timeout cannot exceed 8 hours'),
  
  passwordPolicy: z.object({
    minLength: z.number().min(8).max(32),
    requireUppercase: z.boolean(),
    requireLowercase: z.boolean(),
    requireNumbers: z.boolean(),
    requireSpecialChars: z.boolean(),
    passwordExpiry: z.number().min(0).max(365),
  }),
  
  enableMFA: z.boolean(),
  enableLoginNotifications: z.boolean(),
  enableFailedLoginAlerts: z.boolean(),
  maxLoginAttempts: z.number().min(3).max(10),
  
  // Model Management
  maxModelSize: z.number()
    .min(100, 'Max model size must be at least 100 MB')
    .max(50000, 'Max model size cannot exceed 50 GB'),
  
  allowedModelTypes: z.array(z.string()).min(1, 'Please select at least one model type'),
  
  autoScanNewModels: z.boolean(),
  quarantineThreats: z.boolean(),
  scanInterval: z.number().min(1).max(168), // hours
  
  // Monitoring & Alerts
  enableRealTimeMonitoring: z.boolean(),
  alertThresholds: z.object({
    threatDetection: z.enum(['low', 'medium', 'high']),
    performanceIssues: z.enum(['low', 'medium', 'high']),
    systemErrors: z.enum(['low', 'medium', 'high']),
  }),
  
  emailNotifications: z.boolean(),
  slackNotifications: z.boolean(),
  webhookNotifications: z.boolean(),
  
  // Data Retention
  logRetentionDays: z.number().min(7).max(2555), // 7 days to 7 years
  modelVersionRetention: z.number().min(1).max(50),
  auditLogRetention: z.number().min(30).max(2555),
  
  // API Settings
  rateLimitDefault: z.number().min(10).max(10000),
  enableAPIKeys: z.boolean(),
  apiKeyExpiry: z.number().min(1).max(365),
  
  // UI Preferences
  theme: z.enum(['light', 'dark', 'system']),
  compactMode: z.boolean(),
  showBetaFeatures: z.boolean(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function GeneralSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      organizationName: 'OmnisecAI Corporation',
      timezone: 'America/New_York',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      sessionTimeout: 60,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        passwordExpiry: 90,
      },
      enableMFA: true,
      enableLoginNotifications: true,
      enableFailedLoginAlerts: true,
      maxLoginAttempts: 5,
      maxModelSize: 5000,
      allowedModelTypes: ['LLM', 'Vision', 'NLP'],
      autoScanNewModels: true,
      quarantineThreats: true,
      scanInterval: 24,
      enableRealTimeMonitoring: true,
      alertThresholds: {
        threatDetection: 'medium',
        performanceIssues: 'high',
        systemErrors: 'medium',
      },
      emailNotifications: true,
      slackNotifications: false,
      webhookNotifications: false,
      logRetentionDays: 90,
      modelVersionRetention: 10,
      auditLogRetention: 365,
      rateLimitDefault: 1000,
      enableAPIKeys: true,
      apiKeyExpiry: 90,
      theme: 'system',
      compactMode: false,
      showBetaFeatures: false,
    },
  });

  const onSubmit = async (data: SettingsForm) => {
    console.log('Settings updated:', data);
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSaving(false);
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to their default values?')) {
      form.reset();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              General Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Configure system-wide settings and preferences
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={resetToDefaults}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Settings Updated</AlertTitle>
              <AlertDescription>
                Your system settings have been successfully updated.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Organization Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Organization Settings
                </CardTitle>
                <CardDescription>
                  Basic organization information and regional settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Organization Name" {...field} />
                      </FormControl>
                      <FormDescription>
                        This name will appear in reports and system logs
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="America/New_York">Eastern Time (UTC-5)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (UTC-6)</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time (UTC-7)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time (UTC-8)</SelectItem>
                            <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                            <SelectItem value="Europe/Paris">Paris (UTC+1)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo (UTC+9)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="ja">Japanese</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Format</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure security policies and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Authentication</h4>
                    
                    <FormField
                      control={form.control}
                      name="sessionTimeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Timeout (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Users will be logged out after this period of inactivity
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxLoginAttempts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Login Attempts</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Account will be locked after this many failed attempts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="enableMFA"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Multi-Factor Authentication</FormLabel>
                              <FormDescription>
                                Require MFA for all user accounts
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="enableLoginNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Login Notifications</FormLabel>
                              <FormDescription>
                                Send notifications for successful logins
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="enableFailedLoginAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Failed Login Alerts</FormLabel>
                              <FormDescription>
                                Alert administrators of failed login attempts
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Password Policy</h4>
                    
                    <FormField
                      control={form.control}
                      name="passwordPolicy.minLength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Length</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="passwordPolicy.passwordExpiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password Expiry (days)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Set to 0 for no expiry
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <Label>Password Requirements</Label>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="passwordPolicy.requireUppercase"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                Require uppercase letters
                              </FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="passwordPolicy.requireLowercase"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                Require lowercase letters
                              </FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="passwordPolicy.requireNumbers"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                Require numbers
                              </FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="passwordPolicy.requireSpecialChars"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                Require special characters
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monitoring & Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="h-5 w-5 mr-2" />
                  Monitoring & Alerts
                </CardTitle>
                <CardDescription>
                  Configure system monitoring and notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="enableRealTimeMonitoring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Real-time Monitoring</FormLabel>
                        <FormDescription>
                          Enable continuous monitoring of all system components
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="alertThresholds.threatDetection"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Threat Detection Threshold</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low Sensitivity</SelectItem>
                            <SelectItem value="medium">Medium Sensitivity</SelectItem>
                            <SelectItem value="high">High Sensitivity</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alertThresholds.performanceIssues"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Performance Alert Threshold</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low Sensitivity</SelectItem>
                            <SelectItem value="medium">Medium Sensitivity</SelectItem>
                            <SelectItem value="high">High Sensitivity</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alertThresholds.systemErrors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Error Threshold</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low Sensitivity</SelectItem>
                            <SelectItem value="medium">Medium Sensitivity</SelectItem>
                            <SelectItem value="high">High Sensitivity</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving} className="min-w-32">
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}