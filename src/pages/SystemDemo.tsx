import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Square, 
  Zap, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
  Play,
  Settings
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import ModelDetailsModal from '@/components/modals/ModelDetailsModal';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { useToast } from '@/contexts/ToastContext';

// Mock data for demo
const mockModel = {
  id: '1',
  name: 'GPT-4 Security Model',
  type: 'LLM' as const,
  version: 'v2.1.0',
  status: 'active' as const,
  securityScore: 95,
  size: '1.2 GB',
  uploadedBy: 'sarah@company.com',
  uploadDate: '2024-01-15T10:30:00Z',
  lastScan: '2024-01-15T14:22:00Z',
  description: 'Advanced large language model optimized for security applications with built-in threat detection capabilities.',
  framework: 'PyTorch',
  environment: 'production' as const,
  vulnerabilities: { high: 0, medium: 2, low: 5 },
  metrics: {
    totalRequests: 125847,
    avgResponseTime: 245,
    errorRate: 0.12,
    uptime: 99.8,
  },
  scanHistory: [
    {
      id: 'scan_001',
      date: '2024-01-15T14:22:00Z',
      score: 95,
      status: 'completed' as const,
      findings: 7
    },
    {
      id: 'scan_002',
      date: '2024-01-14T09:15:00Z',
      score: 92,
      status: 'completed' as const,
      findings: 9
    },
    {
      id: 'scan_003',
      date: '2024-01-13T16:45:00Z',
      score: 89,
      status: 'completed' as const,
      findings: 12
    }
  ]
};

const mockNotifications = [
  {
    id: '1',
    title: 'Security Threat Detected',
    message: 'Potential prompt injection attempt detected on GPT-4 Security Model',
    type: 'security' as const,
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    category: 'security' as const,
    priority: 'critical' as const,
  },
  {
    id: '2',
    title: 'Model Upload Complete',
    message: 'BERT Classifier v3.0 has been successfully uploaded and is ready for deployment',
    type: 'success' as const,
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
    category: 'model' as const,
    priority: 'medium' as const,
  },
  {
    id: '3',
    title: 'System Maintenance Scheduled',
    message: 'Scheduled maintenance window from 2:00 AM to 4:00 AM UTC tomorrow',
    type: 'info' as const,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    category: 'system' as const,
    priority: 'low' as const,
  },
  {
    id: '4',
    title: 'Performance Alert',
    message: 'High CPU usage detected on production servers (85% average)',
    type: 'warning' as const,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: false,
    category: 'performance' as const,
    priority: 'high' as const,
  },
  {
    id: '5',
    title: 'New User Invitation Sent',
    message: 'Invitation sent to john.doe@company.com for Developer role',
    type: 'info' as const,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    read: true,
    category: 'user' as const,
    priority: 'low' as const,
  }
];

export default function SystemDemo() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: 'delete' | 'reset' | 'deploy' | null;
    isLoading: boolean;
  }>({ isOpen: false, type: null, isLoading: false });
  const [modelDetailsOpen, setModelDetailsOpen] = useState(false);

  const { success, error, warning, info, security } = useToast();

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleDeleteAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification);
  };

  const handleConfirmAction = async () => {
    setConfirmationModal(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (confirmationModal.type === 'delete') {
      error('Model Deleted', 'The model has been permanently removed from the system');
    } else if (confirmationModal.type === 'reset') {
      warning('System Reset', 'All settings have been reset to default values');
    } else if (confirmationModal.type === 'deploy') {
      success('Model Deployed', 'The model is now live in production environment');
    }
    
    setConfirmationModal({ isOpen: false, type: null, isLoading: false });
  };

  const openConfirmationModal = (type: 'delete' | 'reset' | 'deploy') => {
    setConfirmationModal({ isOpen: true, type, isLoading: false });
  };

  const getConfirmationModalProps = () => {
    switch (confirmationModal.type) {
      case 'delete':
        return {
          title: 'Delete Model',
          description: 'Are you sure you want to delete this model? This action cannot be undone.',
          confirmText: 'Delete',
          variant: 'destructive' as const,
          details: [
            'All model data will be permanently removed',
            'Active deployments will be stopped',
            'Historical scan data will be deleted'
          ]
        };
      case 'reset':
        return {
          title: 'Reset System Settings',
          description: 'This will reset all system settings to their default values.',
          confirmText: 'Reset',
          variant: 'warning' as const,
          details: [
            'All custom configurations will be lost',
            'User preferences will be reset',
            'API keys will remain unchanged'
          ]
        };
      case 'deploy':
        return {
          title: 'Deploy to Production',
          description: 'Deploy this model to the production environment?',
          confirmText: 'Deploy',
          variant: 'success' as const,
          details: [
            'Model will be available for live requests',
            'Security monitoring will be enabled',
            'Performance metrics will be tracked'
          ]
        };
      default:
        return {
          title: 'Confirm Action',
          description: 'Are you sure you want to proceed?',
          confirmText: 'Confirm',
          variant: 'default' as const
        };
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              System Demo
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Demonstration of modal dialogs and notification systems
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDeleteNotification={handleDeleteNotification}
              onDeleteAll={handleDeleteAll}
              onNotificationClick={handleNotificationClick}
            />
          </div>
        </div>

        {/* Toast Notification Demos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Toast Notifications
            </CardTitle>
            <CardDescription>
              Test different types of toast notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Button 
                variant="outline" 
                onClick={() => success('Success!', 'Operation completed successfully')}
                className="flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Success Toast
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => error('Error!', 'Something went wrong. Please try again.')}
                className="flex items-center"
              >
                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                Error Toast
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => warning('Warning!', 'Please review your settings before proceeding')}
                className="flex items-center"
              >
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                Warning Toast
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => info('Information', 'New features are now available in the dashboard')}
                className="flex items-center"
              >
                <Info className="h-4 w-4 mr-2 text-blue-500" />
                Info Toast
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => security('Security Alert!', 'Suspicious activity detected on your account', {
                  label: 'View Details',
                  onClick: () => console.log('Security action clicked')
                })}
                className="flex items-center"
              >
                <Shield className="h-4 w-4 mr-2 text-red-600" />
                Security Toast
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modal Demos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Confirmation Modals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Square className="h-5 w-5 mr-2" />
                Confirmation Modals
              </CardTitle>
              <CardDescription>
                Test different types of confirmation dialogs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="destructive" 
                onClick={() => openConfirmationModal('delete')}
                className="w-full flex items-center justify-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Model
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => openConfirmationModal('reset')}
                className="w-full flex items-center justify-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                Reset Settings
              </Button>
              
              <Button 
                variant="default" 
                onClick={() => openConfirmationModal('deploy')}
                className="w-full flex items-center justify-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Deploy to Production
              </Button>
            </CardContent>
          </Card>

          {/* Model Details Modal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Detailed Modals
              </CardTitle>
              <CardDescription>
                Complex modal with multiple tabs and rich content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{mockModel.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {mockModel.type} • {mockModel.version}
                      </p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => setModelDetailsOpen(true)}
                  className="w-full"
                >
                  View Model Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Notifications</CardTitle>
            <CardDescription>
              Examples of different notification types and priorities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockNotifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {notification.type === 'security' && <Shield className="h-4 w-4 text-red-600" />}
                      {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {notification.type === 'info' && <Info className="h-4 w-4 text-blue-500" />}
                      {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {notification.category}
                    </Badge>
                    {notification.priority === 'critical' && (
                      <Badge variant="destructive" className="text-xs">
                        Critical
                      </Badge>
                    )}
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal({ isOpen: false, type: null, isLoading: false })}
          onConfirm={handleConfirmAction}
          isLoading={confirmationModal.isLoading}
          {...getConfirmationModalProps()}
        />

        {/* Model Details Modal */}
        <ModelDetailsModal
          isOpen={modelDetailsOpen}
          onClose={() => setModelDetailsOpen(false)}
          model={mockModel}
          onEdit={(id) => console.log('Edit model:', id)}
          onDelete={(id) => console.log('Delete model:', id)}
          onStartScan={(id) => console.log('Start scan:', id)}
          onToggleStatus={(id) => console.log('Toggle status:', id)}
        />
      </div>
    </DashboardLayout>
  );
}