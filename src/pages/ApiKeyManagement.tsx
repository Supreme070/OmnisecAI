import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit3, 
  Calendar,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  Code,
  Globe,
  Smartphone,
  Server,
  Settings
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/contexts/ToastContext';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';
import { apiKeysApi } from '@/lib/api';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  description: string;
  permissions: string[];
  environment: 'production' | 'staging' | 'development';
  expiresAt: string | null;
  lastUsed: string | null;
  createdAt: string;
  isActive: boolean;
  usage: {
    requests: number;
    limit: number;
  };
}

export default function ApiKeyManagement() {
  const { success, error, warning } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [newKey, setNewKey] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    environment: 'development' as const,
    expiresAt: '',
    rateLimitEnabled: true,
    rateLimit: 1000
  });

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 'ak_1',
      name: 'Production API Access',
      key: 'omnisec_prod_1a2b3c4d5e6f7g8h9i0j',
      description: 'Primary API key for production integrations and automated systems',
      permissions: ['read', 'write', 'admin'],
      environment: 'production',
      expiresAt: '2024-12-31',
      lastUsed: '2024-01-20T10:30:00Z',
      createdAt: '2024-01-01T09:00:00Z',
      isActive: true,
      usage: { requests: 45230, limit: 100000 }
    },
    {
      id: 'ak_2',
      name: 'Mobile App Integration',
      key: 'omnisec_prod_2b3c4d5e6f7g8h9i0j1k',
      description: 'API access for mobile application features and notifications',
      permissions: ['read', 'write'],
      environment: 'production',
      expiresAt: null,
      lastUsed: '2024-01-20T14:15:00Z',
      createdAt: '2024-01-10T11:20:00Z',
      isActive: true,
      usage: { requests: 12450, limit: 50000 }
    },
    {
      id: 'ak_3',
      name: 'Staging Environment',
      key: 'omnisec_stg_3c4d5e6f7g8h9i0j1k2l',
      description: 'Testing and development API key for staging environment',
      permissions: ['read', 'write'],
      environment: 'staging',
      expiresAt: '2024-06-30',
      lastUsed: '2024-01-19T16:45:00Z',
      createdAt: '2024-01-15T14:30:00Z',
      isActive: true,
      usage: { requests: 2340, limit: 10000 }
    },
    {
      id: 'ak_4',
      name: 'Legacy Integration',
      key: 'omnisec_prod_4d5e6f7g8h9i0j1k2l3m',
      description: 'Deprecated API key for legacy system integration - scheduled for removal',
      permissions: ['read'],
      environment: 'production',
      expiresAt: '2024-03-01',
      lastUsed: '2024-01-18T08:20:00Z',
      createdAt: '2023-06-15T10:00:00Z',
      isActive: false,
      usage: { requests: 890, limit: 5000 }
    }
  ]);

  const permissions = [
    { id: 'read', label: 'Read Access', description: 'View data and configurations' },
    { id: 'write', label: 'Write Access', description: 'Create and modify resources' },
    { id: 'delete', label: 'Delete Access', description: 'Remove resources' },
    { id: 'admin', label: 'Admin Access', description: 'Full administrative privileges' }
  ];

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      success('Copied!', 'API key copied to clipboard');
    } catch (err) {
      error('Copy Failed', 'Failed to copy API key to clipboard');
    }
  };

  const handleCreateKey = async () => {
    if (!newKey.name.trim()) {
      error('Name Required', 'Please enter a name for the API key');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newApiKey: ApiKey = {
      id: `ak_${Date.now()}`,
      name: newKey.name,
      key: `omnisec_${newKey.environment}_${Math.random().toString(36).substring(2, 15)}`,
      description: newKey.description,
      permissions: newKey.permissions,
      environment: newKey.environment,
      expiresAt: newKey.expiresAt || null,
      lastUsed: null,
      createdAt: new Date().toISOString(),
      isActive: true,
      usage: { requests: 0, limit: newKey.rateLimit }
    };

    setApiKeys(prev => [newApiKey, ...prev]);
    setNewKey({
      name: '',
      description: '',
      permissions: [],
      environment: 'development',
      expiresAt: '',
      rateLimitEnabled: true,
      rateLimit: 1000
    });
    
    setIsLoading(false);
    setIsCreateDialogOpen(false);
    success('API Key Created', 'Your new API key has been generated successfully');
  };

  const handleRevokeKey = async (keyId: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId ? { ...key, isActive: false } : key
    ));
    warning('API Key Revoked', 'The API key has been deactivated');
  };

  const handleDeleteKey = async (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
    success('API Key Deleted', 'The API key has been permanently removed');
  };

  const getEnvironmentBadge = (environment: string) => {
    switch (environment) {
      case 'production':
        return <Badge variant="default">Production</Badge>;
      case 'staging':
        return <Badge variant="secondary">Staging</Badge>;
      case 'development':
        return <Badge variant="outline">Development</Badge>;
      default:
        return <Badge variant="outline">{environment}</Badge>;
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return formatDate(dateString);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              API Key Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage API keys for integrations and external access
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Generate a new API key for accessing OmnisecAI services
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="keyName">Name *</Label>
                    <Input
                      id="keyName"
                      placeholder="e.g., Production API Access"
                      value={newKey.name}
                      onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="environment">Environment</Label>
                    <Select 
                      value={newKey.environment} 
                      onValueChange={(value: any) => setNewKey(prev => ({ ...prev, environment: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the purpose of this API key..."
                    value={newKey.description}
                    onChange={(e) => setNewKey(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={permission.id}
                          checked={newKey.permissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewKey(prev => ({ 
                                ...prev, 
                                permissions: [...prev.permissions, permission.id] 
                              }));
                            } else {
                              setNewKey(prev => ({ 
                                ...prev, 
                                permissions: prev.permissions.filter(p => p !== permission.id) 
                              }));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <div>
                          <Label htmlFor={permission.id} className="text-sm font-medium cursor-pointer">
                            {permission.label}
                          </Label>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                    <Input
                      id="expiresAt"
                      type="date"
                      value={newKey.expiresAt}
                      onChange={(e) => setNewKey(prev => ({ ...prev, expiresAt: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rateLimit">Rate Limit (requests/hour)</Label>
                    <Input
                      id="rateLimit"
                      type="number"
                      value={newKey.rateLimit}
                      onChange={(e) => setNewKey(prev => ({ ...prev, rateLimit: parseInt(e.target.value) || 1000 }))}
                      min="100"
                      max="100000"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateKey} disabled={isLoading}>
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Key className="h-4 w-4 mr-2" />
                  )}
                  Create API Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* API Keys Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Keys</p>
                  <p className="text-2xl font-bold">{apiKeys.length}</p>
                </div>
                <Key className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Keys</p>
                  <p className="text-2xl font-bold">{apiKeys.filter(k => k.isActive).length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Requests</p>
                  <p className="text-2xl font-bold">
                    {apiKeys.reduce((sum, key) => sum + key.usage.requests, 0).toLocaleString()}
                  </p>
                </div>
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Expiring Soon</p>
                  <p className="text-2xl font-bold">
                    {apiKeys.filter(k => 
                      k.expiresAt && new Date(k.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    ).length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Keys List */}
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage your API keys and monitor their usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <motion.div
                  key={apiKey.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 border rounded-lg ${
                    !apiKey.isActive ? 'bg-slate-50 dark:bg-slate-900/50 opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{apiKey.name}</h3>
                        {getEnvironmentBadge(apiKey.environment)}
                        {!apiKey.isActive && <Badge variant="destructive">Inactive</Badge>}
                        {apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                          <Badge variant="destructive">Expires Soon</Badge>
                        )}
                      </div>
                      
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        {apiKey.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">API Key</p>
                          <div className="flex items-center space-x-2">
                            <code className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                              {visibleKeys.has(apiKey.id) 
                                ? apiKey.key 
                                : `${apiKey.key.substring(0, 12)}...${apiKey.key.slice(-4)}`
                              }
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleKeyVisibility(apiKey.id)}
                            >
                              {visibleKeys.has(apiKey.id) ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(apiKey.key)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Permissions</p>
                          <div className="flex flex-wrap gap-1">
                            {apiKey.permissions.map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Usage</p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{apiKey.usage.requests.toLocaleString()}</span>
                              <span className="text-slate-500">/ {apiKey.usage.limit.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  getUsagePercentage(apiKey.usage.requests, apiKey.usage.limit) > 80 
                                    ? 'bg-red-500' 
                                    : getUsagePercentage(apiKey.usage.requests, apiKey.usage.limit) > 60
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ 
                                  width: `${Math.min(getUsagePercentage(apiKey.usage.requests, apiKey.usage.limit), 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Last Used</p>
                          <p className="text-sm">
                            {apiKey.lastUsed ? getTimeAgo(apiKey.lastUsed) : 'Never'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Created {formatDate(apiKey.createdAt)}
                          </span>
                          {apiKey.expiresAt && (
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Expires {formatDate(apiKey.expiresAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Key
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Key
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Code className="h-4 w-4 mr-2" />
                          View Usage Analytics
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {apiKey.isActive ? (
                          <DropdownMenuItem 
                            onClick={() => handleRevokeKey(apiKey.id)}
                            className="text-yellow-600"
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Revoke Key
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => handleDeleteKey(apiKey.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Key
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="h-5 w-5 mr-2" />
              API Documentation
            </CardTitle>
            <CardDescription>
              Quick reference for using your API keys
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="authentication">
              <TabsList>
                <TabsTrigger value="authentication">Authentication</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
                <TabsTrigger value="limits">Rate Limits</TabsTrigger>
              </TabsList>
              
              <TabsContent value="authentication" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Authentication Header</h4>
                    <div className="bg-slate-900 dark:bg-slate-800 rounded-lg p-4">
                      <code className="text-green-400 text-sm">
                        Authorization: Bearer YOUR_API_KEY
                      </code>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Base URL</h4>
                    <div className="bg-slate-900 dark:bg-slate-800 rounded-lg p-4">
                      <code className="text-blue-400 text-sm">
                        https://api.omnisecai.com/v1
                      </code>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="examples" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">cURL Example</h4>
                    <div className="bg-slate-900 dark:bg-slate-800 rounded-lg p-4 overflow-x-auto">
                      <code className="text-sm whitespace-pre">
{`curl -X GET "https://api.omnisecai.com/v1/models" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                      </code>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">JavaScript Example</h4>
                    <div className="bg-slate-900 dark:bg-slate-800 rounded-lg p-4 overflow-x-auto">
                      <code className="text-sm whitespace-pre">
{`const response = await fetch('https://api.omnisecai.com/v1/models', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();`}
                      </code>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="limits" className="mt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-green-600">Development</h4>
                      <p className="text-2xl font-bold">1,000</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">requests/hour</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-blue-600">Staging</h4>
                      <p className="text-2xl font-bold">10,000</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">requests/hour</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-purple-600">Production</h4>
                      <p className="text-2xl font-bold">100,000</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">requests/hour</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <p>• Rate limits are per API key and reset every hour</p>
                    <p>• Exceeded limits return HTTP 429 status code</p>
                    <p>• Contact support for higher limits if needed</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}