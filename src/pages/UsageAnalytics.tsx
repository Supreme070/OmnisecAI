import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Activity, 
  Cpu, 
  Clock,
  TrendingUp,
  Calendar,
  RefreshCw,
  BarChart3,
  Download
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock usage data
const dailyUsageData = [
  { day: 'Mon', users: 145, sessions: 267, models: 45, scans: 23 },
  { day: 'Tue', users: 178, sessions: 324, models: 52, scans: 31 },
  { day: 'Wed', users: 156, sessions: 289, models: 38, scans: 19 },
  { day: 'Thu', users: 203, sessions: 398, models: 67, scans: 42 },
  { day: 'Fri', users: 189, sessions: 356, models: 59, scans: 38 },
  { day: 'Sat', users: 98, sessions: 167, models: 23, scans: 12 },
  { day: 'Sun', users: 87, sessions: 145, models: 18, scans: 8 },
];

const userEngagementData = [
  { time: '00:00', active: 23, peak: 45 },
  { time: '06:00', active: 12, peak: 28 },
  { time: '12:00', active: 89, peak: 134 },
  { time: '18:00', active: 67, peak: 98 },
];

const featureUsageData = [
  { feature: 'Model Upload', usage: 234, growth: 12 },
  { feature: 'Security Scans', usage: 456, growth: 8 },
  { feature: 'Threat Detection', usage: 123, growth: 15 },
  { feature: 'Analytics', usage: 89, growth: -3 },
  { feature: 'User Management', usage: 67, growth: 5 },
];

export default function UsageAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
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
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const totalUsers = dailyUsageData.reduce((sum, day) => sum + day.users, 0);
  const totalSessions = dailyUsageData.reduce((sum, day) => sum + day.sessions, 0);
  const avgSessionDuration = '12m 34s';
  const activeUsers = 156;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Usage Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              User engagement and platform utilization metrics
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Usage Statistics */}
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
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalUsers.toLocaleString()}
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>+15% from last week</span>
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
                    Active Users
                  </CardTitle>
                  <Activity className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {activeUsers}
                </div>
                <Badge variant="default" className="mt-1">
                  Currently online
                </Badge>
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
                    Total Sessions
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalSessions.toLocaleString()}
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>+8% from last week</span>
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
                    Avg Session Duration
                  </CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {avgSessionDuration}
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>+2% from last week</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Usage Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Daily Usage Trends
                </CardTitle>
                <CardDescription>
                  User activity and feature usage over the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dailyUsageData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="day" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        yAxisId="left"
                        dataKey="users" 
                        fill="#3b82f6" 
                        name="Active Users"
                        radius={[2, 2, 0, 0]}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="sessions" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        name="Sessions"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="models" 
                        stroke="#f59e0b" 
                        strokeWidth={3}
                        name="Model Operations"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Engagement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  User Engagement
                </CardTitle>
                <CardDescription>
                  Active user patterns throughout the day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userEngagementData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="peak" 
                        stackId="1"
                        stroke="#e5e7eb" 
                        fill="#e5e7eb" 
                        fillOpacity={0.4}
                        name="Peak Capacity"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="active" 
                        stackId="2"
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.8}
                        name="Active Users"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Feature Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cpu className="h-5 w-5 mr-2" />
                Feature Usage Statistics
              </CardTitle>
              <CardDescription>
                Most used features and their growth trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureUsageData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" />
                    <YAxis dataKey="feature" type="category" width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="usage" 
                      fill="#8b5cf6" 
                      radius={[0, 4, 4, 0]}
                      name="Usage Count"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                {featureUsageData.map((feature, index) => (
                  <div key={index} className="text-center">
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {feature.usage}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      {feature.feature}
                    </div>
                    <Badge 
                      variant={feature.growth >= 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {feature.growth >= 0 ? '+' : ''}{feature.growth}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}