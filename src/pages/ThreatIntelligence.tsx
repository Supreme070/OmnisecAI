import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import { 
  AlertTriangle, 
  Shield, 
  Clock, 
  Eye,
  Filter,
  RefreshCw,
  Download,
  Bell,
  Target,
  Activity,
  Zap,
  Globe
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, SortableHeader, RowActions } from '@/components/ui/data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ThreatAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'prompt_injection' | 'data_extraction' | 'model_evasion' | 'adversarial_input' | 'suspicious_activity';
  source: string;
  targetModel: string;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  detectedAt: string;
  lastUpdate: string;
  assignedTo?: string;
  attackVector: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  country?: string;
  ipAddress: string;
}

// Mock threat data
const mockThreats: ThreatAlert[] = [
  {
    id: '1',
    title: 'Sophisticated Prompt Injection Detected',
    description: 'Advanced injection attempt targeting GPT-4 model with role manipulation techniques',
    severity: 'critical',
    category: 'prompt_injection',
    source: 'API Gateway',
    targetModel: 'GPT-4 Security Model',
    status: 'investigating',
    detectedAt: '2024-01-15T14:30:00Z',
    lastUpdate: '2024-01-15T15:45:00Z',
    assignedTo: 'sarah@company.com',
    attackVector: 'System prompt override',
    confidence: 95,
    impact: 'high',
    country: 'Unknown',
    ipAddress: '192.168.1.45'
  },
  {
    id: '2',
    title: 'Data Extraction Attempt',
    description: 'Multiple attempts to extract training data from BERT classifier',
    severity: 'high',
    category: 'data_extraction',
    source: 'Model API',
    targetModel: 'BERT Classifier v3',
    status: 'active',
    detectedAt: '2024-01-15T13:15:00Z',
    lastUpdate: '2024-01-15T14:22:00Z',
    attackVector: 'Membership inference',
    confidence: 87,
    impact: 'medium',
    country: 'Russia',
    ipAddress: '78.142.18.202'
  },
  {
    id: '3',
    title: 'Model Evasion Attack',
    description: 'Adversarial examples designed to bypass ResNet security filters',
    severity: 'medium',
    category: 'model_evasion',
    source: 'Vision API',
    targetModel: 'ResNet Vision Model',
    status: 'resolved',
    detectedAt: '2024-01-14T16:20:00Z',
    lastUpdate: '2024-01-15T09:30:00Z',
    assignedTo: 'mike@company.com',
    attackVector: 'Adversarial perturbation',
    confidence: 78,
    impact: 'low',
    country: 'China',
    ipAddress: '115.239.210.26'
  },
  {
    id: '4',
    title: 'Suspicious API Usage Pattern',
    description: 'Unusual request patterns suggesting automated scanning',
    severity: 'medium',
    category: 'suspicious_activity',
    source: 'Rate Limiter',
    targetModel: 'Multiple Models',
    status: 'investigating',
    detectedAt: '2024-01-14T11:45:00Z',
    lastUpdate: '2024-01-14T18:30:00Z',
    attackVector: 'Automated scanning',
    confidence: 65,
    impact: 'medium',
    country: 'USA',
    ipAddress: '203.0.113.42'
  },
  {
    id: '5',
    title: 'Jailbreak Attempt',
    description: 'Multiple attempts to bypass safety filters using roleplay scenarios',
    severity: 'high',
    category: 'prompt_injection',
    source: 'Content Filter',
    targetModel: 'Custom Fraud Detection',
    status: 'false_positive',
    detectedAt: '2024-01-13T20:10:00Z',
    lastUpdate: '2024-01-14T08:15:00Z',
    assignedTo: 'emma@company.com',
    attackVector: 'Roleplay bypass',
    confidence: 52,
    impact: 'low',
    country: 'Germany',
    ipAddress: '46.4.91.15'
  }
];

export default function ThreatIntelligence() {
  const [threats, setThreats] = useState<ThreatAlert[]>(mockThreats);
  const [selectedThreats, setSelectedThreats] = useState<ThreatAlert[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'destructive';
      case 'investigating':
        return 'secondary';
      case 'resolved':
        return 'default';
      case 'false_positive':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'prompt_injection':
        return <Zap className="h-4 w-4" />;
      case 'data_extraction':
        return <Shield className="h-4 w-4" />;
      case 'model_evasion':
        return <Target className="h-4 w-4" />;
      case 'adversarial_input':
        return <Activity className="h-4 w-4" />;
      case 'suspicious_activity':
        return <Eye className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleThreatAction = (action: string, threatId: string) => {
    console.log(`${action} threat:`, threatId);
    if (action === 'resolve') {
      setThreats(prev => 
        prev.map(threat => 
          threat.id === threatId 
            ? { ...threat, status: 'resolved' as const, lastUpdate: new Date().toISOString() }
            : threat
        )
      );
    }
  };

  const columns: ColumnDef<ThreatAlert>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Threat
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const threat = row.original;
        return (
          <div className="flex items-start space-x-3 max-w-md">
            <div className="mt-1">
              {getCategoryIcon(threat.category)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-slate-900 dark:text-white truncate">
                {threat.title}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                {threat.description}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "severity",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Severity
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const severity = row.getValue("severity") as string;
        return (
          <div className="flex items-center space-x-2">
            {getSeverityIcon(severity)}
            <Badge variant={getSeverityBadgeVariant(severity)}>
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        const categoryMap = {
          'prompt_injection': 'Prompt Injection',
          'data_extraction': 'Data Extraction',
          'model_evasion': 'Model Evasion',
          'adversarial_input': 'Adversarial Input',
          'suspicious_activity': 'Suspicious Activity'
        };
        return (
          <Badge variant="outline">
            {categoryMap[category as keyof typeof categoryMap]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "targetModel",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Target Model
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const model = row.getValue("targetModel") as string;
        return (
          <div className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
            {model}
          </div>
        );
      },
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
        const statusMap = {
          'active': 'Active',
          'investigating': 'Investigating',
          'resolved': 'Resolved',
          'false_positive': 'False Positive'
        };
        return (
          <Badge variant={getStatusBadgeVariant(status)}>
            {statusMap[status as keyof typeof statusMap]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "confidence",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Confidence
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const confidence = row.getValue("confidence") as number;
        return (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{confidence}%</span>
            <div className="w-12 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${
                  confidence >= 80 ? 'bg-green-500' : 
                  confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "country",
      header: "Location",
      cell: ({ row }) => {
        const country = row.getValue("country") as string;
        const ipAddress = row.original.ipAddress;
        return (
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-slate-400" />
            <div className="text-sm">
              <div className="text-slate-900 dark:text-white">{country || 'Unknown'}</div>
              <div className="text-slate-500 dark:text-slate-400 text-xs">{ipAddress}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "detectedAt",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Detected
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const detectedAt = row.getValue("detectedAt") as string;
        return (
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {formatDate(detectedAt)}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const threat = row.original;
        return (
          <RowActions
            row={row}
            onView={() => handleThreatAction('view', threat.id)}
            onEdit={() => handleThreatAction('investigate', threat.id)}
            onDelete={() => handleThreatAction('resolve', threat.id)}
          />
        );
      },
    },
  ];

  // Filter data based on selected filters
  const filteredThreats = threats.filter(threat => {
    const severityMatch = severityFilter === 'all' || threat.severity === severityFilter;
    const statusMatch = statusFilter === 'all' || threat.status === statusFilter;
    const categoryMatch = categoryFilter === 'all' || threat.category === categoryFilter;
    return severityMatch && statusMatch && categoryMatch;
  });

  const stats = {
    total: threats.length,
    active: threats.filter(t => t.status === 'active').length,
    critical: threats.filter(t => t.severity === 'critical').length,
    investigating: threats.filter(t => t.status === 'investigating').length
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Threat Intelligence
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Monitor and respond to security threats in real-time
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing} 
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Bell className="h-4 w-4 mr-2" />
              Configure Alerts
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
                    Total Threats
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
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
                    Active Threats
                  </CardTitle>
                  <Activity className="h-4 w-4 text-red-500" />
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
                    Critical Threats
                  </CardTitle>
                  <Shield className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.critical}
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
                    Under Investigation
                  </CardTitle>
                  <Eye className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.investigating}
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
                <CardTitle>Security Threats ({filteredThreats.length})</CardTitle>
                <CardDescription>
                  Real-time threat detection and response management
                </CardDescription>
              </div>
              
              <div className="flex items-center space-x-4">
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="false_positive">False Positive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="prompt_injection">Prompt Injection</SelectItem>
                    <SelectItem value="data_extraction">Data Extraction</SelectItem>
                    <SelectItem value="model_evasion">Model Evasion</SelectItem>
                    <SelectItem value="adversarial_input">Adversarial Input</SelectItem>
                    <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredThreats}
              searchKey="title"
              placeholder="Search threats..."
              enableRowSelection={true}
              onRowSelectionChange={setSelectedThreats}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}