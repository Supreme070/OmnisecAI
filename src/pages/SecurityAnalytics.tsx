import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  Clock,
  Target,
  Zap,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
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

// Mock data for charts
const threatTrendsData = [
  { name: 'Jan', threats: 12, blocked: 45, detected: 28 },
  { name: 'Feb', threats: 19, blocked: 52, detected: 35 },
  { name: 'Mar', threats: 8, blocked: 38, detected: 22 },
  { name: 'Apr', threats: 25, blocked: 67, detected: 41 },
  { name: 'May', threats: 15, blocked: 43, detected: 29 },
  { name: 'Jun', threats: 32, blocked: 78, detected: 56 },
];

const vulnerabilityDistribution = [
  { name: 'High', value: 15, color: '#ef4444' },
  { name: 'Medium', value: 28, color: '#f59e0b' },
  { name: 'Low', value: 42, color: '#10b981' },
  { name: 'Info', value: 18, color: '#6b7280' },
];

const modelSecurityScores = [
  { name: 'GPT-4 Model', score: 95, category: 'LLM' },
  { name: 'BERT Classifier', score: 88, category: 'NLP' },
  { name: 'ResNet Vision', score: 92, category: 'Vision' },
  { name: 'Custom Transformer', score: 78, category: 'Custom' },
  { name: 'Sentiment Analyzer', score: 85, category: 'NLP' },
  { name: 'Object Detection', score: 90, category: 'Vision' },
];

const attackTypeData = [
  { name: 'Prompt Injection', value: 35, fill: '#ef4444' },
  { name: 'Data Extraction', value: 28, fill: '#f59e0b' },
  { name: 'Model Evasion', value: 22, fill: '#8b5cf6' },
  { name: 'Adversarial Input', value: 15, fill: '#06b6d4' },
];

const hourlyActivityData = [
  { hour: '00', activity: 12, threats: 2 },
  { hour: '04', activity: 8, threats: 1 },
  { hour: '08', activity: 45, threats: 8 },
  { hour: '12', activity: 78, threats: 12 },
  { hour: '16', activity: 65, threats: 9 },
  { hour: '20', activity: 32, threats: 4 },
];

const performanceMetrics = [
  { name: 'Response Time', value: 85, target: 90 },
  { name: 'Accuracy', value: 94, target: 95 },
  { name: 'Throughput', value: 78, target: 80 },
  { name: 'Availability', value: 99, target: 99.9 },
];

export default function SecurityAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Security Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Comprehensive security metrics and threat analysis
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
            
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
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
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">127</div>
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>+12% from last week</span>
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
                    Threats Blocked
                  </CardTitle>
                  <Shield className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">342</div>
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
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Avg Response Time
                  </CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">245ms</div>
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                  <span>-5% from last week</span>
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
                    Security Score
                  </CardTitle>
                  <Target className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">92%</div>
                <Progress value={92} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Threat Trends Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Threat Trends
                </CardTitle>
                <CardDescription>
                  Security threats detected and blocked over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={threatTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="name" 
                        className="text-slate-600 dark:text-slate-400"
                      />
                      <YAxis className="text-slate-600 dark:text-slate-400" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="threats" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                        name="Active Threats"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="blocked" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        name="Blocked Attempts"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="detected" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                        name="Detected Issues"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vulnerability Distribution Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Vulnerability Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of vulnerabilities by severity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={vulnerabilityDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {vulnerabilityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Model Security Scores Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Model Security Scores
                </CardTitle>
                <CardDescription>
                  Security assessment scores for protected models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={modelSecurityScores} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="score" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Attack Types Radial Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Attack Types
                </CardTitle>
                <CardDescription>
                  Distribution of different attack types detected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={attackTypeData}>
                      <RadialBar 
                        minAngle={15} 
                        label={{ position: 'insideStart', fill: '#fff' }} 
                        background 
                        clockWise 
                        dataKey="value" 
                      />
                      <Legend 
                        iconSize={10} 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                      />
                      <Tooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Hourly Activity & Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hourly Activity Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  24-Hour Activity Pattern
                </CardTitle>
                <CardDescription>
                  System activity and threat detection by hour
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlyActivityData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="activity" 
                        stackId="1"
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.6}
                        name="System Activity"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="threats" 
                        stackId="2"
                        stroke="#ef4444" 
                        fill="#ef4444" 
                        fillOpacity={0.8}
                        name="Threats Detected"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Current vs target performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{metric.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-600 dark:text-slate-400">
                            {metric.value}%
                          </span>
                          <Badge 
                            variant={metric.value >= metric.target ? "default" : "destructive"}
                            className="text-xs"
                          >
                            Target: {metric.target}%
                          </Badge>
                        </div>
                      </div>
                      <Progress 
                        value={metric.value} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}