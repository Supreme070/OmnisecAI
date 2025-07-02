import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Smartphone, 
  Key, 
  Lock, 
  Unlock,
  CheckCircle,
  AlertTriangle,
  Copy,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  QrCode,
  Clock,
  X,
  Save,
  Settings
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/contexts/ToastContext';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';

export default function SecuritySettings() {
  const { success, error, warning } = useToast();
  
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isMFADialogOpen, setIsMFADialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mfaStep, setMfaStep] = useState(1);
  const [showQR, setShowQR] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [mfaForm, setMfaForm] = useState({
    verificationCode: '',
    backupCodes: [] as string[]
  });

  const [securityStatus, setSecurityStatus] = useState({
    mfaEnabled: false,
    lastPasswordChange: '2024-01-01T10:00:00Z',
    activeSessions: 2,
    loginAttempts: 0,
    accountLocked: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    emailNotifications: true,
    loginAlerts: true,
    sessionTimeout: 480, // minutes
    passwordComplexity: true,
    deviceTrust: true
  });

  // Mock QR code data
  const qrCodeSecret = 'JBSWY3DPEHPK3PXP';
  const qrCodeUrl = `otpauth://totp/OmnisecAI:user@example.com?secret=${qrCodeSecret}&issuer=OmnisecAI`;

  const mockBackupCodes = [
    'a1b2c3d4e5',
    'f6g7h8i9j0',
    'k1l2m3n4o5',
    'p6q7r8s9t0',
    'u1v2w3x4y5',
    'z6a7b8c9d0',
    'e1f2g3h4i5',
    'j6k7l8m9n0'
  ];

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      error('All Fields Required', 'Please fill in all password fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      error('Passwords Don\'t Match', 'New password and confirmation must match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      error('Password Too Weak', 'Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setIsPasswordDialogOpen(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSecurityStatus(prev => ({ ...prev, lastPasswordChange: new Date().toISOString() }));
    success('Password Updated', 'Your password has been changed successfully');
  };

  const handleMFASetup = async () => {
    if (mfaStep === 1) {
      setMfaStep(2);
      setShowQR(true);
      return;
    }

    if (mfaStep === 2) {
      if (!mfaForm.verificationCode || mfaForm.verificationCode.length !== 6) {
        error('Invalid Code', 'Please enter the 6-digit verification code');
        return;
      }
      setMfaStep(3);
      setMfaForm(prev => ({ ...prev, backupCodes: mockBackupCodes }));
      return;
    }

    if (mfaStep === 3) {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsLoading(false);
      setIsMFADialogOpen(false);
      setMfaStep(1);
      setMfaForm({ verificationCode: '', backupCodes: [] });
      setSecurityStatus(prev => ({ ...prev, mfaEnabled: true }));
      setSecuritySettings(prev => ({ ...prev, twoFactorAuth: true }));
      success('MFA Enabled', 'Two-factor authentication has been set up successfully');
    }
  };

  const handleMFADisable = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setSecurityStatus(prev => ({ ...prev, mfaEnabled: false }));
    setSecuritySettings(prev => ({ ...prev, twoFactorAuth: false }));
    warning('MFA Disabled', 'Two-factor authentication has been disabled');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      success('Copied!', 'Text copied to clipboard');
    } catch (err) {
      error('Copy Failed', 'Failed to copy to clipboard');
    }
  };

  const downloadBackupCodes = () => {
    const content = mfaForm.backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'omnisecai-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Security Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your account security and authentication preferences
            </p>
          </div>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Security Score</p>
                  <p className="text-2xl font-bold text-green-600">95%</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2">
                <Badge variant="default" className="text-xs">Excellent</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">MFA Status</p>
                  <p className="text-2xl font-bold">
                    {securityStatus.mfaEnabled ? (
                      <span className="text-green-600">Enabled</span>
                    ) : (
                      <span className="text-red-600">Disabled</span>
                    )}
                  </p>
                </div>
                {securityStatus.mfaEnabled ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Sessions</p>
                  <p className="text-2xl font-bold">{securityStatus.activeSessions}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Settings Tabs */}
        <Tabs defaultValue="authentication" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Authentication Tab */}
          <TabsContent value="authentication">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Two-Factor Authentication */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Smartphone className="h-5 w-5 mr-2" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Authenticator App</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Use an app like Google Authenticator or Authy
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {securityStatus.mfaEnabled ? (
                        <>
                          <Badge variant="default">Enabled</Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleMFADisable}
                          >
                            Disable
                          </Button>
                        </>
                      ) : (
                        <Dialog open={isMFADialogOpen} onOpenChange={setIsMFADialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm">Setup</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>
                                Setup Two-Factor Authentication - Step {mfaStep} of 3
                              </DialogTitle>
                              <DialogDescription>
                                {mfaStep === 1 && 'Download and install an authenticator app'}
                                {mfaStep === 2 && 'Scan the QR code or enter the secret key manually'}
                                {mfaStep === 3 && 'Save these backup codes in a secure location'}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="py-4">
                              {mfaStep === 1 && (
                                <div className="space-y-4">
                                  <p className="text-sm">
                                    Install an authenticator app on your mobile device. We recommend:
                                  </p>
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                                      <Smartphone className="h-6 w-6 text-blue-600" />
                                      <div>
                                        <p className="font-medium">Google Authenticator</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">Free, reliable, and secure</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                                      <Smartphone className="h-6 w-6 text-green-600" />
                                      <div>
                                        <p className="font-medium">Authy</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">Cloud backup and multi-device sync</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {mfaStep === 2 && (
                                <div className="space-y-4">
                                  <div className="text-center">
                                    <div className="bg-white p-4 rounded-lg border inline-block">
                                      <QrCode className="h-32 w-32 text-black mx-auto" />
                                      <p className="text-xs mt-2">QR Code Placeholder</p>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label>Or enter this code manually:</Label>
                                    <div className="flex items-center space-x-2">
                                      <Input 
                                        value={qrCodeSecret} 
                                        readOnly 
                                        className="font-mono text-sm"
                                      />
                                      <Button 
                                        variant="outline" 
                                        size="icon"
                                        onClick={() => copyToClipboard(qrCodeSecret)}
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Enter verification code from your app:</Label>
                                    <Input
                                      placeholder="123456"
                                      value={mfaForm.verificationCode}
                                      onChange={(e) => setMfaForm(prev => ({ 
                                        ...prev, 
                                        verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6)
                                      }))}
                                      className="text-center text-lg tracking-widest"
                                    />
                                  </div>
                                </div>
                              )}

                              {mfaStep === 3 && (
                                <div className="space-y-4">
                                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <div className="flex items-start space-x-2">
                                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                      <div>
                                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                                          Important: Save Your Backup Codes
                                        </h4>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                          Store these codes in a secure location. You can use them to access your account if you lose your phone.
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    {mfaForm.backupCodes.map((code, index) => (
                                      <div key={index} className="flex items-center justify-between">
                                        <code className="text-sm font-mono">{code}</code>
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => copyToClipboard(code)}
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>

                                  <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={downloadBackupCodes}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Backup Codes
                                  </Button>
                                </div>
                              )}
                            </div>

                            <DialogFooter>
                              {mfaStep > 1 && (
                                <Button 
                                  variant="outline" 
                                  onClick={() => setMfaStep(mfaStep - 1)}
                                >
                                  Back
                                </Button>
                              )}
                              <Button onClick={handleMFASetup} disabled={isLoading}>
                                {isLoading ? (
                                  <LoadingSpinner size="sm" className="mr-2" />
                                ) : mfaStep === 3 ? (
                                  'Complete Setup'
                                ) : (
                                  'Continue'
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>

                  {securityStatus.mfaEnabled && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">Backup codes remaining</span>
                        <Badge variant="outline">8 codes</Badge>
                      </div>
                      <Button variant="outline" className="w-full">
                        View Backup Codes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Security Keys */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    Security Keys
                  </CardTitle>
                  <CardDescription>
                    Hardware security keys for passwordless authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <Key className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 dark:text-slate-400">No security keys registered</p>
                    <Button variant="outline" className="mt-3">
                      Add Security Key
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Password Security
                </CardTitle>
                <CardDescription>
                  Manage your password and security requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Current Password</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Last changed {formatDate(securityStatus.lastPasswordChange)}
                        </p>
                      </div>
                      
                      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Change Password
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription>
                              Enter your current password and choose a new secure password
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="currentPassword">Current Password</Label>
                              <div className="relative">
                                <Input
                                  id="currentPassword"
                                  type={showPasswords.current ? "text" : "password"}
                                  value={passwordForm.currentPassword}
                                  onChange={(e) => setPasswordForm(prev => ({ 
                                    ...prev, 
                                    currentPassword: e.target.value 
                                  }))}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                  onClick={() => togglePasswordVisibility('current')}
                                >
                                  {showPasswords.current ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="newPassword">New Password</Label>
                              <div className="relative">
                                <Input
                                  id="newPassword"
                                  type={showPasswords.new ? "text" : "password"}
                                  value={passwordForm.newPassword}
                                  onChange={(e) => setPasswordForm(prev => ({ 
                                    ...prev, 
                                    newPassword: e.target.value 
                                  }))}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                  onClick={() => togglePasswordVisibility('new')}
                                >
                                  {showPasswords.new ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">Confirm New Password</Label>
                              <div className="relative">
                                <Input
                                  id="confirmPassword"
                                  type={showPasswords.confirm ? "text" : "password"}
                                  value={passwordForm.confirmPassword}
                                  onChange={(e) => setPasswordForm(prev => ({ 
                                    ...prev, 
                                    confirmPassword: e.target.value 
                                  }))}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                  onClick={() => togglePasswordVisibility('confirm')}
                                >
                                  {showPasswords.confirm ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                              <p>Password requirements:</p>
                              <ul className="list-disc list-inside space-y-1">
                                <li>At least 8 characters long</li>
                                <li>Contains uppercase and lowercase letters</li>
                                <li>Contains at least one number</li>
                                <li>Contains at least one special character</li>
                              </ul>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setIsPasswordDialogOpen(false);
                                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                              }}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handlePasswordChange} disabled={isLoading}>
                              {isLoading ? (
                                <LoadingSpinner size="sm" className="mr-2" />
                              ) : (
                                <Save className="h-4 w-4 mr-2" />
                              )}
                              Update Password
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Password Strength</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Strong</span>
                          <span>95%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Password Requirements</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Minimum 8 characters</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Contains uppercase letter</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Contains lowercase letter</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Contains number</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Contains special character</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Active Sessions
                </CardTitle>
                <CardDescription>
                  Manage your active login sessions across devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Chrome on macOS • San Francisco, CA • Active now
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">Current</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Mobile App</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          iOS App • Last active 2 hours ago
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Revoke
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="destructive">
                      Sign Out All Other Sessions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Security Preferences</CardTitle>
                <CardDescription>
                  Configure your security and notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email security notifications</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Get notified about security events via email
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.emailNotifications}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ 
                        ...prev, 
                        emailNotifications: checked 
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Login alerts</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Notify me of new sign-ins from unrecognized devices
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.loginAlerts}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ 
                        ...prev, 
                        loginAlerts: checked 
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Device trust</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Remember trusted devices for 30 days
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.deviceTrust}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ 
                        ...prev, 
                        deviceTrust: checked 
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}