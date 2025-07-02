import { useState } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import { 
  FileText, 
  User, 
  Settings, 
  Shield,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Calendar,
  Clock,
  Search,
  Activity,
  Database,
  Key
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: 'authentication' | 'model_management' | 'security' | 'user_management' | 'system' | 'api';
  actor: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  target: {
    type: 'user' | 'model' | 'setting' | 'api_key' | 'role' | 'system';
    id: string;
    name: string;
  };
  details: string;
  outcome: 'success' | 'failure' | 'warning';
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  risk: 'low' | 'medium' | 'high';
}

// Mock audit log data
const mockAuditLogs: AuditLogEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-15T15:30:22Z',
    action: 'User Login',
    category: 'authentication',
    actor: {
      id: 'user1',
      name: 'Kola Admin',
      email: 'kola@omnisecai.com',
      role: 'admin'
    },
    target: {
      type: 'system',
      id: 'auth_system',
      name: 'Authentication System'
    },
    details: 'Successful login with MFA',
    outcome: 'success',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    sessionId: 'sess_abc123',
    risk: 'low'
  },
  {
    id: '2',
    timestamp: '2024-01-15T14:45:18Z',
    action: 'Model Upload',
    category: 'model_management',
    actor: {
      id: 'user2',
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      role: 'security_analyst'
    },
    target: {
      type: 'model',
      id: 'model_gpt4_sec',
      name: 'GPT-4 Security Model'
    },
    details: 'Uploaded new model version v2.1.0 (1.2GB)',
    outcome: 'success',
    ipAddress: '203.0.113.42',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    sessionId: 'sess_def456',
    risk: 'medium'
  },
  {
    id: '3',
    timestamp: '2024-01-15T13:22:07Z',
    action: 'Failed Login Attempt',
    category: 'authentication',
    actor: {
      id: 'unknown',
      name: 'Unknown User',
      email: 'attacker@malicious.com',
      role: 'unknown'
    },
    target: {
      type: 'system',
      id: 'auth_system',
      name: 'Authentication System'
    },
    details: 'Multiple failed login attempts detected',
    outcome: 'failure',
    ipAddress: '45.76.123.89',
    userAgent: 'curl/7.68.0',
    sessionId: 'sess_invalid',
    risk: 'high'
  },
  {
    id: '4',
    timestamp: '2024-01-15T12:15:33Z',
    action: 'Security Scan Initiated',
    category: 'security',
    actor: {
      id: 'user3',
      name: 'Mike Chen',
      email: 'mike@company.com',
      role: 'developer'
    },
    target: {
      type: 'model',
      id: 'model_bert_v3',
      name: 'BERT Classifier v3'
    },
    details: 'Comprehensive security scan started',
    outcome: 'success',
    ipAddress: '10.0.1.45',
    userAgent: 'OmnisecAI-Scanner/1.0',
    sessionId: 'sess_ghi789',
    risk: 'low'
  },
  {
    id: '5',
    timestamp: '2024-01-15T11:08:12Z',
    action: 'User Role Modified',
    category: 'user_management',
    actor: {
      id: 'user1',
      name: 'Kola Admin',
      email: 'kola@omnisecai.com',
      role: 'admin'
    },
    target: {
      type: 'user',
      id: 'user4',
      name: 'Emma Davis'
    },
    details: 'Changed role from viewer to developer',
    outcome: 'success',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    sessionId: 'sess_abc123',
    risk: 'medium'
  },
  {
    id: '6',
    timestamp: '2024-01-15T10:45:55Z',
    action: 'API Key Generated',
    category: 'api',
    actor: {
      id: 'user2',
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      role: 'security_analyst'
    },
    target: {
      type: 'api_key',
      id: 'key_prod_001',
      name: 'Production API Key'
    },
    details: 'Generated new production API key with model access',
    outcome: 'success',
    ipAddress: '203.0.113.42',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    sessionId: 'sess_def456',
    risk: 'medium'
  }
];

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication':
        return <Key className="h-4 w-4 text-blue-500" />;
      case 'model_management':
        return <Database className="h-4 w-4 text-green-500" />;
      case 'security':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'user_management':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'system':
        return <Settings className="h-4 w-4 text-orange-500" />;
      case 'api':
        return <Activity className="h-4 w-4 text-cyan-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOutcomeBadgeVariant = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return 'default';
      case 'failure':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const columns: ColumnDef<AuditLogEntry>[] = [
    {
      accessorKey: "timestamp",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Time
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const timestamp = row.getValue("timestamp") as string;
        const { date, time } = formatTimestamp(timestamp);
        return (
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <div className="text-sm">
              <div className="font-medium text-slate-900 dark:text-white">{time}</div>
              <div className="text-slate-500 dark:text-slate-400">{date}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Action
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div className="flex items-center space-x-3">
            {getCategoryIcon(log.category)}
            <div>
              <div className="font-medium text-slate-900 dark:text-white">
                {log.action}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                {log.category.replace('_', ' ')}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "actor",
      header: "Actor",
      cell: ({ row }) => {
        const actor = row.getValue("actor") as AuditLogEntry['actor'];
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(actor.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-slate-900 dark:text-white text-sm">
                {actor.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {actor.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "target",
      header: "Target",
      cell: ({ row }) => {
        const target = row.getValue("target") as AuditLogEntry['target'];
        const getTargetIcon = (type: string) => {
          switch (type) {
            case 'user': return <User className="h-3 w-3" />;
            case 'model': return <Database className="h-3 w-3" />;
            case 'setting': return <Settings className="h-3 w-3" />;
            case 'api_key': return <Key className="h-3 w-3" />;
            case 'role': return <Shield className="h-3 w-3" />;
            case 'system': return <Activity className="h-3 w-3" />;
            default: return <FileText className="h-3 w-3" />;
          }
        };
        
        return (
          <div className="flex items-center space-x-2">
            {getTargetIcon(target.type)}
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                {target.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {target.type.replace('_', ' ')}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => {
        const details = row.getValue("details") as string;
        return (
          <div className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
            {details}
          </div>
        );
      },
    },
    {
      accessorKey: "outcome",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Outcome
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const outcome = row.getValue("outcome") as string;
        return (
          <Badge variant={getOutcomeBadgeVariant(outcome)}>
            {outcome.charAt(0).toUpperCase() + outcome.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "risk",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Risk
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const risk = row.getValue("risk") as string;
        return (
          <Badge variant={getRiskBadgeVariant(risk)}>
            {risk.charAt(0).toUpperCase() + risk.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ row }) => {
        const ipAddress = row.getValue("ipAddress") as string;
        return (
          <div className="text-sm font-mono text-slate-600 dark:text-slate-400">
            {ipAddress}
          </div>
        );
      },
    },
  ];

  // Filter data
  const filteredLogs = logs.filter(log => {
    const categoryMatch = categoryFilter === 'all' || log.category === categoryFilter;
    const outcomeMatch = outcomeFilter === 'all' || log.outcome === outcomeFilter;
    const riskMatch = riskFilter === 'all' || log.risk === riskFilter;
    return categoryMatch && outcomeMatch && riskMatch;
  });

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.outcome === 'success').length,
    failures: logs.filter(l => l.outcome === 'failure').length,
    highRisk: logs.filter(l => l.risk === 'high').length
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Audit Logs
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Comprehensive audit trail of all system activities
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filter
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
                    Total Events
                  </CardTitle>
                  <FileText className="h-4 w-4 text-blue-500" />
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
                    Successful Actions
                  </CardTitle>
                  <Eye className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.success}
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
                    Failed Actions
                  </CardTitle>
                  <Shield className="h-4 w-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.failures}
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
                    High Risk Events
                  </CardTitle>
                  <Activity className="h-4 w-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.highRisk}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div>
                <CardTitle>System Activity Logs ({filteredLogs.length})</CardTitle>
                <CardDescription>
                  Detailed log of all user actions and system events
                </CardDescription>
              </div>
              
              <div className="flex items-center space-x-4">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="authentication">Authentication</SelectItem>
                    <SelectItem value="model_management">Model Management</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="user_management">User Management</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Outcomes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Outcomes</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failure">Failure</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredLogs}
              searchKey="action"
              placeholder="Search activities..."
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}