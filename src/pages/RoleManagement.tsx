import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Shield, 
  Users, 
  Plus, 
  Edit,
  Trash2,
  Check,
  X,
  Key,
  Eye,
  Settings,
  AlertTriangle
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  isBuiltIn: boolean;
  color: string;
}

// Mock permissions data
const mockPermissions: Permission[] = [
  // Model Management
  { id: 'models.view', name: 'View Models', description: 'View AI model inventory', category: 'Model Management' },
  { id: 'models.upload', name: 'Upload Models', description: 'Upload new AI models', category: 'Model Management' },
  { id: 'models.delete', name: 'Delete Models', description: 'Delete AI models', category: 'Model Management' },
  { id: 'models.scan', name: 'Run Security Scans', description: 'Perform security scans on models', category: 'Model Management' },
  
  // Security Testing
  { id: 'security.view', name: 'View Security Tests', description: 'View security test results', category: 'Security Testing' },
  { id: 'security.run', name: 'Run Security Tests', description: 'Execute security tests', category: 'Security Testing' },
  { id: 'security.configure', name: 'Configure Security Rules', description: 'Configure security testing rules', category: 'Security Testing' },
  
  // Threat Intelligence
  { id: 'threats.view', name: 'View Threats', description: 'View threat intelligence data', category: 'Threat Intelligence' },
  { id: 'threats.manage', name: 'Manage Threats', description: 'Respond to and manage threats', category: 'Threat Intelligence' },
  { id: 'incidents.respond', name: 'Incident Response', description: 'Respond to security incidents', category: 'Threat Intelligence' },
  
  // Analytics & Reporting
  { id: 'analytics.view', name: 'View Analytics', description: 'View security analytics and metrics', category: 'Analytics & Reporting' },
  { id: 'reports.generate', name: 'Generate Reports', description: 'Generate security reports', category: 'Analytics & Reporting' },
  { id: 'compliance.view', name: 'View Compliance', description: 'View compliance reports', category: 'Analytics & Reporting' },
  
  // User Management
  { id: 'users.view', name: 'View Users', description: 'View user accounts', category: 'User Management' },
  { id: 'users.manage', name: 'Manage Users', description: 'Create, edit, and delete users', category: 'User Management' },
  { id: 'roles.manage', name: 'Manage Roles', description: 'Create and manage user roles', category: 'User Management' },
  
  // System Administration
  { id: 'settings.view', name: 'View Settings', description: 'View system settings', category: 'System Administration' },
  { id: 'settings.manage', name: 'Manage Settings', description: 'Modify system settings', category: 'System Administration' },
  { id: 'api.manage', name: 'Manage API Keys', description: 'Create and manage API keys', category: 'System Administration' },
];

// Mock roles data
const mockRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all features and settings',
    userCount: 2,
    permissions: mockPermissions.map(p => p.id),
    isBuiltIn: true,
    color: 'bg-red-500'
  },
  {
    id: 'security_analyst',
    name: 'Security Analyst',
    description: 'Access to security features and threat management',
    userCount: 5,
    permissions: [
      'models.view', 'models.scan', 'security.view', 'security.run', 'security.configure',
      'threats.view', 'threats.manage', 'incidents.respond', 'analytics.view', 'reports.generate', 'compliance.view'
    ],
    isBuiltIn: true,
    color: 'bg-blue-500'
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'Access to model management and testing features',
    userCount: 8,
    permissions: [
      'models.view', 'models.upload', 'models.scan', 'security.view', 'security.run',
      'threats.view', 'analytics.view', 'api.manage'
    ],
    isBuiltIn: true,
    color: 'bg-green-500'
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to dashboards and reports',
    userCount: 9,
    permissions: [
      'models.view', 'security.view', 'threats.view', 'analytics.view', 'compliance.view'
    ],
    isBuiltIn: true,
    color: 'bg-gray-500'
  }
];

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const permissionsByCategory = mockPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setIsEditDialogOpen(true);
  };

  const handlePermissionToggle = (permissionId: string) => {
    if (!selectedRole) return;
    
    const updatedPermissions = selectedRole.permissions.includes(permissionId)
      ? selectedRole.permissions.filter(id => id !== permissionId)
      : [...selectedRole.permissions, permissionId];
    
    setSelectedRole({
      ...selectedRole,
      permissions: updatedPermissions
    });
  };

  const saveRoleChanges = () => {
    if (!selectedRole) return;
    
    setRoles(roles.map(role => 
      role.id === selectedRole.id ? selectedRole : role
    ));
    setIsEditDialogOpen(false);
    setSelectedRole(null);
  };

  const stats = {
    totalRoles: roles.length,
    customRoles: roles.filter(r => !r.isBuiltIn).length,
    totalUsers: roles.reduce((sum, role) => sum + role.userCount, 0),
    totalPermissions: mockPermissions.length
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Role Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage user roles and permissions across your organization
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Roles
                </CardTitle>
                <Shield className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalRoles}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Custom Roles
                </CardTitle>
                <Settings className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.customRoles}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalUsers}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Permissions
                </CardTitle>
                <Key className="h-4 w-4 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalPermissions}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Roles & Permissions</CardTitle>
          <CardDescription>
            Manage roles and their associated permissions
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${role.color}`} />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {role.name}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {role.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {role.userCount} users
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {role.permissions.length} permissions
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {role.isBuiltIn ? (
                        <Badge variant="default">Built-in</Badge>
                      ) : (
                        <Badge variant="secondary">Custom</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRoleSelect(role)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRoleSelect(role)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        {!role.isBuiltIn && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? `Edit Role: ${selectedRole.name}` : 'Role Details'}
            </DialogTitle>
            <DialogDescription>
              Manage permissions for this role. Changes will affect all users assigned to this role.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRole && (
            <div className="space-y-6">
              {/* Role Info */}
              <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className={`w-4 h-4 rounded-full ${selectedRole.color}`} />
                <div>
                  <h3 className="font-medium">{selectedRole.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {selectedRole.description}
                  </p>
                </div>
                <Badge variant="secondary">
                  {selectedRole.userCount} users
                </Badge>
              </div>

              {/* Permissions by Category */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900 dark:text-white">
                  Permissions ({selectedRole.permissions.length}/{mockPermissions.length})
                </h4>
                
                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <Card key={category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">
                                  {permission.name}
                                </span>
                                {selectedRole.permissions.includes(permission.id) ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <X className="h-4 w-4 text-slate-400" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {permission.description}
                              </p>
                            </div>
                            <Switch
                              checked={selectedRole.permissions.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                              disabled={selectedRole.isBuiltIn}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedRole.isBuiltIn && (
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">
                    Built-in roles cannot be modified. Create a custom role to customize permissions.
                  </span>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            {selectedRole && !selectedRole.isBuiltIn && (
              <Button onClick={saveRoleChanges}>
                Save Changes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
}