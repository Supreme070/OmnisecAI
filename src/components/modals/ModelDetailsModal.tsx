import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Cpu, 
  Calendar, 
  User,
  Database,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Download,
  Edit,
  Trash2,
  Play,
  Pause
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ModelData {
  id: string;
  name: string;
  type: 'LLM' | 'Vision' | 'NLP' | 'Custom';
  version: string;
  status: 'active' | 'inactive' | 'scanning' | 'error';
  securityScore: number;
  size: string;
  uploadedBy: string;
  uploadDate: string;
  lastScan: string;
  description: string;
  framework: string;
  environment: 'production' | 'staging' | 'development';
  vulnerabilities: {
    high: number;
    medium: number;
    low: number;
  };
  metrics: {
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    uptime: number;
  };
  scanHistory: Array<{
    id: string;
    date: string;
    score: number;
    status: 'completed' | 'failed';
    findings: number;
  }>;
}

interface ModelDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: ModelData | null;
  onEdit?: (modelId: string) => void;
  onDelete?: (modelId: string) => void;
  onStartScan?: (modelId: string) => void;
  onToggleStatus?: (modelId: string) => void;
}

export default function ModelDetailsModal({
  isOpen,
  onClose,
  model,
  onEdit,
  onDelete,
  onStartScan,
  onToggleStatus,
}: ModelDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!model) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <Pause className="h-4 w-4 text-gray-500" />;
      case 'scanning':
        return <Shield className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'scanning':
        return 'outline';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Cpu className="h-6 w-6 text-blue-500" />
              <div>
                <DialogTitle className="text-xl">{model.name}</DialogTitle>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(model.status)}
                  <Badge variant={getStatusBadgeVariant(model.status)}>
                    {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                  </Badge>
                  <Badge variant="outline">{model.type}</Badge>
                  <Badge variant="secondary">{model.version}</Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(model.id)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {onStartScan && (
                <Button variant="outline" size="sm" onClick={() => onStartScan(model.id)}>
                  <Shield className="h-4 w-4 mr-1" />
                  Scan
                </Button>
              )}
              {onToggleStatus && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onToggleStatus(model.id)}
                >
                  {model.status === 'active' ? (
                    <>
                      <Pause className="h-4 w-4 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </>
                  )}
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onDelete(model.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Model Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Framework</span>
                    <span className="text-sm font-medium">{model.framework}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Size</span>
                    <span className="text-sm font-medium">{model.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Environment</span>
                    <Badge variant="secondary" className="capitalize">
                      {model.environment}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Uploaded by</span>
                    <span className="text-sm font-medium">{model.uploadedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Upload date</span>
                    <span className="text-sm font-medium">{formatDate(model.uploadDate)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Security Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Security Score</span>
                      <span className={`text-lg font-bold ${getSecurityScoreColor(model.securityScore)}`}>
                        {model.securityScore}%
                      </span>
                    </div>
                    <Progress value={model.securityScore} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Vulnerabilities</span>
                    <div className="flex space-x-2">
                      {model.vulnerabilities.high > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {model.vulnerabilities.high} High
                        </Badge>
                      )}
                      {model.vulnerabilities.medium > 0 && (
                        <Badge variant="secondary" className="text-xs bg-yellow-500 text-white">
                          {model.vulnerabilities.medium} Medium
                        </Badge>
                      )}
                      {model.vulnerabilities.low > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {model.vulnerabilities.low} Low
                        </Badge>
                      )}
                      {model.vulnerabilities.high === 0 && 
                       model.vulnerabilities.medium === 0 && 
                       model.vulnerabilities.low === 0 && (
                        <Badge variant="default" className="text-xs">
                          No vulnerabilities found
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Last scan</span>
                    <span className="text-sm font-medium">{formatDate(model.lastScan)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {model.description}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Vulnerability Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm">Critical/High</span>
                      </div>
                      <span className="text-sm font-medium">{model.vulnerabilities.high}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm">Medium</span>
                      </div>
                      <span className="text-sm font-medium">{model.vulnerabilities.medium}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Low/Info</span>
                      </div>
                      <span className="text-sm font-medium">{model.vulnerabilities.low}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Security Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Input Validation</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rate Limiting</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Content Filtering</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Anomaly Detection</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Audit Logging</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total Requests</span>
                    <span className="text-sm font-medium">{model.metrics.totalRequests.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Avg Response Time</span>
                    <span className="text-sm font-medium">{model.metrics.avgResponseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Error Rate</span>
                    <span className="text-sm font-medium">{model.metrics.errorRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Uptime</span>
                    <span className="text-sm font-medium">{model.metrics.uptime}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Resource Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">CPU Usage</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Memory Usage</span>
                      <span className="text-sm font-medium">67%</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Network I/O</span>
                      <span className="text-sm font-medium">23%</span>
                    </div>
                    <Progress value={23} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Scan History</CardTitle>
                <CardDescription>
                  Recent security scans and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {model.scanHistory.map((scan) => (
                    <div key={scan.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {scan.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <div className="text-sm font-medium">
                            Security Scan {scan.id}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(scan.date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">Score: {scan.score}%</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {scan.findings} findings
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}