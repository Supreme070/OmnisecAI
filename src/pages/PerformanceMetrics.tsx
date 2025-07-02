import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Server,
  Database,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data for performance metrics
const systemPerformanceData = [
  { time: '00:00', cpu: 45, memory: 62, disk: 78, network: 234 },
  { time: '04:00', cpu: 52, memory: 58, disk: 81, network: 198 },
  { time: '08:00', cpu: 78, memory: 75, disk: 85, network: 445 },
  { time: '12:00', cpu: 85, memory: 82, disk: 88, network: 567 },
  { time: '16:00', cpu: 72, memory: 69, disk: 82, network: 412 },
  { time: '20:00', cpu: 58, memory: 64, disk: 79, network: 289 },
];

const responseTimeData = [
  { time: '00:00', api: 145, websocket: 23, database: 67 },
  { time: '04:00', api: 132, websocket: 19, database: 54 },
  { time: '08:00', api: 198, websocket: 45, database: 89 },
  { time: '12:00', api: 234, websocket: 67, database: 123 },
  { time: '16:00', api: 189, websocket: 52, database: 98 },
  { time: '20:00', api: 156, websocket: 34, database: 76 },
];

const throughputData = [
  { time: '00:00', requests: 1250, models: 45, scans: 12 },
  { time: '04:00', requests: 892, models: 23, scans: 8 },
  { time: '08:00', requests: 2340, models: 78, scans: 34 },
  { time: '12:00', requests: 3450, models: 123, scans: 56 },
  { time: '16:00', requests: 2890, models: 98, scans: 43 },
  { time: '20:00', requests: 1560, models: 56, scans: 23 },
];

const errorRateData = [
  { time: '00:00', rate: 0.2, count: 5 },
  { time: '04:00', rate: 0.1, count: 2 },
  { time: '08:00', rate: 0.8, count: 18 },
  { time: '12:00', rate: 1.2, count: 42 },
  { time: '16:00', rate: 0.6, count: 17 },
  { time: '20:00', rate: 0.3, count: 8 },
];

export default function PerformanceMetrics() {
  const [timeRange, setTimeRange] = useState('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value}${entry.unit || ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const currentMetrics = {
    cpu: 72,
    memory: 68,
    disk: 82,
    network: 412,
    uptime: 99.8,
    responseTime: 189,
    throughput: 2890,
    errorRate: 0.6
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Performance Metrics
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Real-time system performance and resource utilization
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last 1h</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Current Status Cards */}
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
                    CPU Usage
                  </CardTitle>
                  <Cpu className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {currentMetrics.cpu}%
                </div>
                <Progress value={currentMetrics.cpu} className="mt-2 h-2" />
                <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>Optimal range</span>
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
                    Memory Usage
                  </CardTitle>
                  <HardDrive className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {currentMetrics.memory}%
                </div>
                <Progress value={currentMetrics.memory} className="mt-2 h-2" />
                <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>4.2GB available</span>
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
                    Response Time
                  </CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {currentMetrics.responseTime}ms
                </div>
                <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span>+15ms from avg</span>
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
                    Uptime
                  </CardTitle>
                  <Server className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {currentMetrics.uptime}%
                </div>
                <Badge variant="default" className="mt-2">
                  15d 4h 23m
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  System Resources
                </CardTitle>
                <CardDescription>
                  CPU, Memory, and Disk utilization over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={systemPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="cpu" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="CPU (%)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="memory" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Memory (%)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="disk" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        name="Disk (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Response Times */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Response Times
                </CardTitle>
                <CardDescription>
                  API, WebSocket, and Database response times
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={responseTimeData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="database" 
                        stackId="1"
                        stroke="#8b5cf6" 
                        fill="#8b5cf6" 
                        fillOpacity={0.6}
                        name="Database (ms)"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="api" 
                        stackId="2"
                        stroke="#ef4444" 
                        fill="#ef4444" 
                        fillOpacity={0.6}
                        name="API (ms)"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="websocket" 
                        stackId="3"
                        stroke="#06b6d4" 
                        fill="#06b6d4" 
                        fillOpacity={0.8}
                        name="WebSocket (ms)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Throughput Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Throughput Metrics
                </CardTitle>
                <CardDescription>
                  Requests, model operations, and security scans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={throughputData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        yAxisId="left"
                        dataKey="requests" 
                        fill="#3b82f6" 
                        name="API Requests"
                        radius={[2, 2, 0, 0]}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="models" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        name="Model Operations"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="scans" 
                        stroke="#f59e0b" 
                        strokeWidth={3}
                        name="Security Scans"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Error Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingDown className="h-5 w-5 mr-2" />
                  Error Rate
                </CardTitle>
                <CardDescription>
                  System error rate and error count over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={errorRateData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="rate" 
                        stroke="#ef4444" 
                        fill="#ef4444" 
                        fillOpacity={0.3}
                        name="Error Rate (%)"
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="count" 
                        fill="#f59e0b" 
                        name="Error Count"
                        radius={[2, 2, 0, 0]}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Performance Summary
              </CardTitle>
              <CardDescription>
                Key performance indicators and system health status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900 dark:text-white">System Health</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Overall Status</span>
                      <Badge variant="default" className="bg-green-500">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Service Availability</span>
                      <span className="text-sm font-medium">99.8%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Active Connections</span>
                      <span className="text-sm font-medium">247</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900 dark:text-white">Performance</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Avg Response Time</span>
                      <span className="text-sm font-medium">189ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Requests/min</span>
                      <span className="text-sm font-medium">2,890</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Cache Hit Rate</span>
                      <span className="text-sm font-medium">94.2%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900 dark:text-white">Alerts</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Active Alerts</span>
                      <Badge variant="secondary">2</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Critical Issues</span>
                      <Badge variant="default">0</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Last Incident</span>
                      <span className="text-sm font-medium">3d ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}