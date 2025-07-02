import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Mail, 
  Shield, 
  Users,
  Check,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  Info
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

// Password strength checker
const getPasswordStrength = (password: string) => {
  let strength = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  strength = Object.values(checks).filter(Boolean).length;
  
  return {
    strength,
    checks,
    label: strength < 2 ? 'Weak' : strength < 4 ? 'Medium' : 'Strong'
  };
};

// Enhanced validation schema
const userInviteSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .refine(
      (email) => {
        // Check for common business email domains
        const businessDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        const domain = email.split('@')[1];
        return !businessDomains.includes(domain);
      },
      'Please use a business email address'
    ),
  
  role: z.enum(['admin', 'security_analyst', 'developer', 'viewer'], {
    required_error: 'Please select a role',
  }),
  
  department: z.string()
    .min(2, 'Department must be at least 2 characters')
    .max(50, 'Department must be less than 50 characters'),
  
  temporaryPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .refine(
      (password) => /[A-Z]/.test(password),
      'Password must contain at least one uppercase letter'
    )
    .refine(
      (password) => /[a-z]/.test(password),
      'Password must contain at least one lowercase letter'
    )
    .refine(
      (password) => /\d/.test(password),
      'Password must contain at least one number'
    )
    .refine(
      (password) => /[^A-Za-z0-9]/.test(password),
      'Password must contain at least one special character'
    ),
  
  confirmPassword: z.string(),
  
  permissions: z.array(z.string()).min(1, 'Please select at least one permission'),
  
  sendWelcomeEmail: z.boolean().default(true),
  requirePasswordChange: z.boolean().default(true),
  enableMFA: z.boolean().default(false),
  
  accessLevel: z.enum(['full', 'limited', 'readonly'], {
    required_error: 'Please select an access level',
  }),
  
  expirationDate: z.string().optional(),
  
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
}).refine(
  (data) => data.temporaryPassword === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

type UserInviteForm = z.infer<typeof userInviteSchema>;

const rolePermissions = {
  admin: [
    'user_management',
    'role_management', 
    'model_management',
    'security_management',
    'system_settings',
    'audit_logs',
    'api_management'
  ],
  security_analyst: [
    'model_management',
    'security_management',
    'threat_analysis',
    'audit_logs',
    'compliance_reports'
  ],
  developer: [
    'model_management',
    'api_management',
    'development_tools',
    'testing_tools'
  ],
  viewer: [
    'dashboard_view',
    'reports_view',
    'model_view'
  ]
};

const permissionLabels = {
  user_management: 'User Management',
  role_management: 'Role Management',
  model_management: 'Model Management',
  security_management: 'Security Management',
  system_settings: 'System Settings',
  audit_logs: 'Audit Logs',
  api_management: 'API Management',
  threat_analysis: 'Threat Analysis',
  compliance_reports: 'Compliance Reports',
  development_tools: 'Development Tools',
  testing_tools: 'Testing Tools',
  dashboard_view: 'Dashboard View',
  reports_view: 'Reports View',
  model_view: 'Model View'
};

export default function UserInvite() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserInviteForm>({
    resolver: zodResolver(userInviteSchema),
    defaultValues: {
      sendWelcomeEmail: true,
      requirePasswordChange: true,
      enableMFA: false,
      permissions: [],
    },
  });

  const selectedRole = form.watch('role');
  const temporaryPassword = form.watch('temporaryPassword') || '';
  const passwordStrength = getPasswordStrength(temporaryPassword);

  // Update permissions when role changes
  React.useEffect(() => {
    if (selectedRole && rolePermissions[selectedRole]) {
      form.setValue('permissions', rolePermissions[selectedRole]);
    }
  }, [selectedRole, form]);

  const onSubmit = async (data: UserInviteForm) => {
    console.log('User invite submitted:', data);
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    alert('User invitation sent successfully!');
    form.reset();
  };

  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    const allChars = lowercase + uppercase + numbers + special;
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    form.setValue('temporaryPassword', password);
    form.setValue('confirmPassword', password);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Invite New User
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Invite a new team member to join your organization
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Basic information about the new user
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="john.doe@company.com" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            User will receive an invitation at this email address
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Engineering, Security, Operations" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Role and Permissions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Role and Permissions
                    </CardTitle>
                    <CardDescription>
                      Define user role and access permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="admin">Administrator</SelectItem>
                                <SelectItem value="security_analyst">Security Analyst</SelectItem>
                                <SelectItem value="developer">Developer</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="accessLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Access Level *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select access level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="full">Full Access</SelectItem>
                                <SelectItem value="limited">Limited Access</SelectItem>
                                <SelectItem value="readonly">Read Only</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {selectedRole && (
                      <FormField
                        control={form.control}
                        name="permissions"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base">Permissions</FormLabel>
                              <FormDescription>
                                Select the permissions for this user
                              </FormDescription>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {Object.entries(permissionLabels).map(([key, label]) => (
                                <FormField
                                  key={key}
                                  control={form.control}
                                  name="permissions"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={key}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(key)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, key])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== key
                                                    )
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          {label}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
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
                      Configure security options for the new user
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="temporaryPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Temporary Password *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter temporary password"
                                  {...field} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <div className="flex items-center justify-between">
                              <FormDescription>
                                User will be asked to change this password on first login
                              </FormDescription>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={generatePassword}
                              >
                                Generate
                              </Button>
                            </div>
                            {temporaryPassword && (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm">Strength:</span>
                                  <Badge 
                                    variant={
                                      passwordStrength.strength < 2 ? 'destructive' :
                                      passwordStrength.strength < 4 ? 'secondary' : 'default'
                                    }
                                  >
                                    {passwordStrength.label}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {Object.entries(passwordStrength.checks).map(([key, valid]) => (
                                    <div key={key} className="flex items-center space-x-1">
                                      {valid ? (
                                        <Check className="h-3 w-3 text-green-500" />
                                      ) : (
                                        <X className="h-3 w-3 text-red-500" />
                                      )}
                                      <span className={valid ? 'text-green-600' : 'text-red-600'}>
                                        {key === 'length' && '8+ characters'}
                                        {key === 'uppercase' && 'Uppercase'}
                                        {key === 'lowercase' && 'Lowercase'}
                                        {key === 'numbers' && 'Numbers'}
                                        {key === 'special' && 'Special chars'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Confirm temporary password"
                                  {...field} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="requirePasswordChange"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Require password change on first login</FormLabel>
                              <FormDescription>
                                User must change their password when they first log in
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="enableMFA"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Enable Multi-Factor Authentication</FormLabel>
                              <FormDescription>
                                Require MFA setup during first login
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sendWelcomeEmail"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Send welcome email</FormLabel>
                              <FormDescription>
                                Send invitation and welcome email to the user
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline">
                    Save as Draft
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending Invitation...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Role Information */}
            {selectedRole && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Role Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="font-medium capitalize">
                          {selectedRole.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {selectedRole === 'admin' && 'Full system access and user management'}
                          {selectedRole === 'security_analyst' && 'Security monitoring and threat analysis'}
                          {selectedRole === 'developer' && 'Model development and API access'}
                          {selectedRole === 'viewer' && 'Read-only access to dashboards and reports'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2">Default Permissions:</div>
                        <div className="space-y-1">
                          {rolePermissions[selectedRole]?.map(permission => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permissionLabels[permission as keyof typeof permissionLabels]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Security Notice */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Security Notice</AlertTitle>
              <AlertDescription>
                All user activities are logged and monitored. Ensure you only invite trusted individuals to maintain security.
              </AlertDescription>
            </Alert>

            {/* Best Practices */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">Strong Passwords</div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Use complex passwords with mixed characters
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">Principle of Least Privilege</div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Grant only necessary permissions
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">Regular Reviews</div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Review user access periodically
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}