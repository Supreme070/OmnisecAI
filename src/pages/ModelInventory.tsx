import { useState } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Shield, 
  Cpu, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  MoreVertical
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTable, SortableHeader, RowActions } from '@/components/ui/data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AIModel {
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
  vulnerabilities: {
    high: number;
    medium: number;
    low: number;
  };
  framework: string;
  environment: 'production' | 'staging' | 'development';
}

// Mock data for AI models
const mockModels: AIModel[] = [
  {
    id: '1',
    name: 'GPT-4 Security Model',
    type: 'LLM',
    version: 'v2.1.0',
    status: 'active',
    securityScore: 95,
    size: '1.2 GB',
    uploadedBy: 'sarah@company.com',
    uploadDate: '2024-01-15T10:30:00Z',
    lastScan: '2024-01-15T14:22:00Z',
    vulnerabilities: { high: 0, medium: 2, low: 5 },
    framework: 'PyTorch',
    environment: 'production'
  },
  {
    id: '2',
    name: 'BERT Classifier v3',
    type: 'NLP',
    version: 'v3.0.1',
    status: 'scanning',
    securityScore: 88,
    size: '445 MB',
    uploadedBy: 'mike@company.com',
    uploadDate: '2024-01-14T09:15:00Z',
    lastScan: '2024-01-14T16:45:00Z',
    vulnerabilities: { high: 1, medium: 3, low: 8 },
    framework: 'TensorFlow',
    environment: 'staging'
  },
  {
    id: '3',
    name: 'ResNet Vision Model',
    type: 'Vision',
    version: 'v1.5.2',
    status: 'active',
    securityScore: 92,
    size: '850 MB',
    uploadedBy: 'emma@company.com',
    uploadDate: '2024-01-13T14:20:00Z',
    lastScan: '2024-01-15T11:30:00Z',
    vulnerabilities: { high: 0, medium: 1, low: 3 },
    framework: 'PyTorch',
    environment: 'production'
  },
  {
    id: '4',
    name: 'Custom Fraud Detection',
    type: 'Custom',
    version: 'v2.0.0',
    status: 'error',
    securityScore: 67,
    size: '320 MB',
    uploadedBy: 'james@company.com',
    uploadDate: '2024-01-12T16:45:00Z',
    lastScan: '2024-01-13T08:15:00Z',
    vulnerabilities: { high: 3, medium: 7, low: 12 },
    framework: 'Scikit-learn',
    environment: 'development'
  },
  {
    id: '5',
    name: 'Sentiment Analysis Pro',
    type: 'NLP',
    version: 'v1.8.3',
    status: 'inactive',
    securityScore: 85,
    size: '230 MB',
    uploadedBy: 'sarah@company.com',
    uploadDate: '2024-01-11T12:30:00Z',
    lastScan: '2024-01-12T09:45:00Z',
    vulnerabilities: { high: 0, medium: 4, low: 6 },
    framework: 'Transformers',
    environment: 'staging'
  }
];

export default function ModelInventory() {
  const [models, setModels] = useState<AIModel[]>(mockModels);
  const [selectedModels, setSelectedModels] = useState<AIModel[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'scanning':
        return <Shield className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleModelAction = (action: string, modelId: string) => {
    console.log(`${action} model:`, modelId);
    // In real app, this would make API calls
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action}:`, selectedModels.map(m => m.id));
    // Handle bulk operations
  };

  const columns: ColumnDef<AIModel>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Model Name
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const model = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                <Cpu className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-slate-900 dark:text-white">
                {model.name}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {model.framework} • {model.size}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Type
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        const colorMap = {
          'LLM': 'bg-purple-500',
          'Vision': 'bg-blue-500',
          'NLP': 'bg-green-500',
          'Custom': 'bg-orange-500'
        };
        return (
          <Badge variant="secondary" className={`${colorMap[type as keyof typeof colorMap]} text-white`}>
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "version",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Version
        </SortableHeader>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Status
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <div className="flex items-center space-x-2">
            {getStatusIcon(status)}
            <Badge variant={getStatusBadgeVariant(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "securityScore",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Security Score
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const score = row.getValue("securityScore") as number;
        return (
          <div className="flex items-center space-x-2">
            <span className={`font-medium ${getSecurityScoreColor(score)}`}>
              {score}%
            </span>
            <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  score >= 90 ? 'bg-green-500' : 
                  score >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "vulnerabilities",
      header: "Vulnerabilities",
      cell: ({ row }) => {
        const vulns = row.getValue("vulnerabilities") as AIModel['vulnerabilities'];
        return (
          <div className="flex space-x-1">
            {vulns.high > 0 && (
              <Badge variant="destructive" className="text-xs">
                {vulns.high}H
              </Badge>
            )}
            {vulns.medium > 0 && (
              <Badge variant="secondary" className="text-xs bg-yellow-500 text-white">
                {vulns.medium}M
              </Badge>
            )}
            {vulns.low > 0 && (
              <Badge variant="outline" className="text-xs">
                {vulns.low}L
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "environment",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Environment
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const env = row.getValue("environment") as string;
        const colorMap = {
          'production': 'bg-green-500',
          'staging': 'bg-yellow-500',
          'development': 'bg-blue-500'
        };
        return (
          <Badge variant="secondary" className={`${colorMap[env as keyof typeof colorMap]} text-white`}>
            {env}
          </Badge>
        );
      },
    },
    {
      accessorKey: "lastScan",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Last Scan
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const lastScan = row.getValue("lastScan") as string;
        return (
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {formatDate(lastScan)}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const model = row.original;
        return (
          <RowActions
            row={row}
            onView={() => handleModelAction('view', model.id)}
            onEdit={() => handleModelAction('edit', model.id)}
            onDelete={() => handleModelAction('delete', model.id)}
          />
        );
      },
    },
  ];

  // Filter data based on selected filters
  const filteredModels = models.filter(model => {
    const statusMatch = statusFilter === 'all' || model.status === statusFilter;
    const typeMatch = typeFilter === 'all' || model.type === typeFilter;
    return statusMatch && typeMatch;
  });

  const stats = {
    total: models.length,
    active: models.filter(m => m.status === 'active').length,
    scanning: models.filter(m => m.status === 'scanning').length,
    errors: models.filter(m => m.status === 'error').length
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Model Inventory
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage and monitor your AI model collection
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Model
            </Button>
          </div>
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
                    Total Models
                  </CardTitle>
                  <Cpu className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.total}
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
                    Active Models
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.active}
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
                    Scanning
                  </CardTitle>
                  <Shield className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.scanning}
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
                    Errors
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.errors}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div>
                <CardTitle>AI Models ({filteredModels.length})</CardTitle>
                <CardDescription>
                  Comprehensive model inventory with security assessments
                </CardDescription>
              </div>
              
              <div className="flex items-center space-x-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="scanning">Scanning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="LLM">LLM</SelectItem>
                    <SelectItem value="Vision">Vision</SelectItem>
                    <SelectItem value="NLP">NLP</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {selectedModels.length > 0 && (
              <div className="flex items-center space-x-2 mt-4">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedModels.length} models selected:
                </span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('scan')}
                >
                  Bulk Scan
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('delete')}
                >
                  Bulk Delete
                </Button>
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredModels}
              searchKey="name"
              placeholder="Search models..."
              enableRowSelection={true}
              onRowSelectionChange={setSelectedModels}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}