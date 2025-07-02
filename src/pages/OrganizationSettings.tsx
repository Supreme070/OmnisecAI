import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Globe, 
  Mail, 
  Phone,
  MapPin,
  Upload,
  Save,
  Edit3,
  X,
  Shield,
  Database,
  Key,
  Clock,
  AlertTriangle,
  Check,
  Settings,
  Trash2,
  Download
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/contexts/ToastContext';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';

export default function OrganizationSettings() {
  const { success, error, warning } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const [organization, setOrganization] = useState({
    name: 'OmnisecAI Technologies',
    industry: 'cybersecurity',
    size: '100-500',
    website: 'https://omnisecai.com',
    description: 'Leading provider of AI-powered cybersecurity solutions, specializing in threat detection and response for enterprise organizations.',
    address: '123 Security Blvd, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94107',
    country: 'United States',
    phone: '+1 (555) 987-6543',
    email: 'contact@omnisecai.com',
    timezone: 'America/Los_Angeles',
    fiscalYearStart: 'january'
  });

  const [securitySettings, setSecuritySettings] = useState({
    enforceSSO: true,
    requireMFA: true,
    passwordComplexity: 'high',
    sessionTimeout: 480, // minutes
    ipWhitelisting: false,
    auditLogging: true,
    dataRetention: 365, // days
    encryptionAtRest: true
  });

  const [billingSettings, setBillingSettings] = useState({
    plan: 'enterprise',
    billingEmail: 'billing@omnisecai.com',
    billingCycle: 'annual',
    autoRenewal: true,
    invoiceDelivery: 'email',
    paymentMethod: 'card'
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    slackNotifications: true,
    emailIntegration: true,
    webhookEnabled: false,
    apiAccessEnabled: true,
    thirdPartyIntegrations: true
  });

  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setIsEditing(false);
    success('Settings Updated', 'Organization settings have been saved successfully.');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values if needed
  };

  const handleSecurityChange = (key: string, value: boolean | string | number) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleBillingChange = (key: string, value: boolean | string) => {
    setBillingSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleIntegrationChange = (key: string, value: boolean) => {
    setIntegrationSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleDangerousAction = (action: string) => {
    warning('Destructive Action', `This action (${action}) requires additional confirmation.`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Organization Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your organization's configuration and preferences
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Settings
              </Button>
            )}
          </div>
        </div>

        {/* Organization Overview Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/logos/omnisecai-logo.png" alt="Organization" />
                  <AvatarFallback className="text-lg">
                    <Building2 className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{organization.name}</CardTitle>
                  <CardDescription>
                    {organization.industry} • {organization.size} employees
                  </CardDescription>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="default">Enterprise Plan</Badge>
                    <Badge variant="outline">
                      <Shield className="h-3 w-3 mr-1" />
                      SOC 2 Compliant
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-slate-600 dark:text-slate-400">Organization ID</p>
                <p className="font-mono text-sm">org_2NvP8yKRjZvEjQ1</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Organization Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                  <CardDescription>
                    Basic information about your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input
                      id="orgName"
                      value={organization.name}
                      onChange={(e) => setOrganization(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Select 
                        value={organization.industry}
                        onValueChange={(value) => setOrganization(prev => ({ ...prev, industry: value }))}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size">Company Size</Label>
                      <Select 
                        value={organization.size}
                        onValueChange={(value) => setOrganization(prev => ({ ...prev, size: value }))}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-100">51-100 employees</SelectItem>
                          <SelectItem value="100-500">100-500 employees</SelectItem>
                          <SelectItem value="500+">500+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="website"
                        value={organization.website}
                        onChange={(e) => setOrganization(prev => ({ ...prev, website: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={organization.description}
                      onChange={(e) => setOrganization(prev => ({ ...prev, description: e.target.value }))}
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Primary contact details for your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Primary Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        value={organization.email}
                        onChange={(e) => setOrganization(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="phone"
                        value={organization.phone}
                        onChange={(e) => setOrganization(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="address"
                        value={organization.address}
                        onChange={(e) => setOrganization(prev => ({ ...prev, address: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={organization.city}
                        onChange={(e) => setOrganization(prev => ({ ...prev, city: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={organization.state}
                        onChange={(e) => setOrganization(prev => ({ ...prev, state: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={organization.zipCode}
                        onChange={(e) => setOrganization(prev => ({ ...prev, zipCode: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select 
                        value={organization.country}
                        onValueChange={(value) => setOrganization(prev => ({ ...prev, country: value }))}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Authentication Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Authentication
                  </CardTitle>
                  <CardDescription>
                    Configure authentication and access controls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Enforce Single Sign-On (SSO)</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Require SSO for all user logins
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.enforceSSO}
                      onCheckedChange={(checked) => handleSecurityChange('enforceSSO', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Require Multi-Factor Authentication</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Mandate MFA for all users
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.requireMFA}
                      onCheckedChange={(checked) => handleSecurityChange('requireMFA', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Password Complexity</Label>
                    <Select 
                      value={securitySettings.passwordComplexity}
                      onValueChange={(value) => handleSecurityChange('passwordComplexity', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (8+ characters)</SelectItem>
                        <SelectItem value="medium">Medium (12+ chars, mixed case)</SelectItem>
                        <SelectItem value="high">High (16+ chars, symbols required)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                      min="15"
                      max="1440"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Data Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Data Security
                  </CardTitle>
                  <CardDescription>
                    Data protection and compliance settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Encryption at Rest</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Encrypt all stored data
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Enabled</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Audit Logging</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Log all user actions and system events
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.auditLogging}
                      onCheckedChange={(checked) => handleSecurityChange('auditLogging', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">IP Whitelisting</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Restrict access to specific IP addresses
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.ipWhitelisting}
                      onCheckedChange={(checked) => handleSecurityChange('ipWhitelisting', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data Retention Period (days)</Label>
                    <Input
                      type="number"
                      value={securitySettings.dataRetention}
                      onChange={(e) => handleSecurityChange('dataRetention', parseInt(e.target.value))}
                      min="30"
                      max="2555"
                    />
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      How long to retain audit logs and activity data
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subscription Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                  <CardDescription>
                    Your current plan and billing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div>
                      <h4 className="font-semibold">Enterprise Plan</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Unlimited users, advanced security features
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">$2,500</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">per month</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Next billing date:</span>
                      <span className="font-medium">March 15, 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment method:</span>
                      <span className="font-medium">•••• •••• •••• 4242</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Billing email:</span>
                      <span className="font-medium">{billingSettings.billingEmail}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="outline" className="flex-1">
                      Update Payment Method
                    </Button>
                    <Button variant="outline" className="flex-1">
                      View Invoices
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing Preferences</CardTitle>
                  <CardDescription>
                    Configure billing and invoice settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Billing Email</Label>
                    <Input
                      type="email"
                      value={billingSettings.billingEmail}
                      onChange={(e) => handleBillingChange('billingEmail', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Billing Cycle</Label>
                    <Select 
                      value={billingSettings.billingCycle}
                      onValueChange={(value) => handleBillingChange('billingCycle', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="annual">Annual (10% discount)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-renewal</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Automatically renew subscription
                      </p>
                    </div>
                    <Switch
                      checked={billingSettings.autoRenewal}
                      onCheckedChange={(checked) => handleBillingChange('autoRenewal', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Invoice Delivery</Label>
                    <Select 
                      value={billingSettings.invoiceDelivery}
                      onValueChange={(value) => handleBillingChange('invoiceDelivery', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="portal">Customer Portal Only</SelectItem>
                        <SelectItem value="both">Email + Portal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Latest Invoice
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Communication */}
              <Card>
                <CardHeader>
                  <CardTitle>Communication</CardTitle>
                  <CardDescription>
                    Connect with your team communication tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">S</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Slack Notifications</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Send alerts to Slack channels
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={integrationSettings.slackNotifications}
                      onCheckedChange={(checked) => handleIntegrationChange('slackNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">Email Integration</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          SMTP server for email notifications
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={integrationSettings.emailIntegration}
                      onCheckedChange={(checked) => handleIntegrationChange('emailIntegration', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* API & Webhooks */}
              <Card>
                <CardHeader>
                  <CardTitle>API & Webhooks</CardTitle>
                  <CardDescription>
                    Configure API access and webhook endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">API Access</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Enable REST API access for integrations
                      </p>
                    </div>
                    <Switch
                      checked={integrationSettings.apiAccessEnabled}
                      onCheckedChange={(checked) => handleIntegrationChange('apiAccessEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Webhook Events</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Send events to external endpoints
                      </p>
                    </div>
                    <Switch
                      checked={integrationSettings.webhookEnabled}
                      onCheckedChange={(checked) => handleIntegrationChange('webhookEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Third-party Integrations</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Allow connections to external services
                      </p>
                    </div>
                    <Switch
                      checked={integrationSettings.thirdPartyIntegrations}
                      onCheckedChange={(checked) => handleIntegrationChange('thirdPartyIntegrations', checked)}
                    />
                  </div>

                  <Button variant="outline" className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Manage API Keys
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced">
            <div className="space-y-6">
              {/* Advanced Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Advanced Configuration
                  </CardTitle>
                  <CardDescription>
                    Advanced settings for power users and administrators
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Default Timezone</Label>
                      <Select value={organization.timezone}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Fiscal Year Start</Label>
                      <Select value={organization.fiscalYearStart}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="january">January</SelectItem>
                          <SelectItem value="april">April</SelectItem>
                          <SelectItem value="july">July</SelectItem>
                          <SelectItem value="october">October</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                        Reset Organization Settings
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Reset all settings to default values
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-300"
                        onClick={() => handleDangerousAction('reset settings')}
                      >
                        Reset Settings
                      </Button>
                    </div>

                    <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg">
                      <h4 className="font-medium text-red-800 dark:text-red-200">
                        Delete Organization
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        Permanently delete this organization and all data
                      </p>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => handleDangerousAction('delete organization')}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Organization
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}