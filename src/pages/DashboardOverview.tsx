import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Users, 
  BarChart3, 
  Zap, 
  Cpu, 
  Clock, 
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Upload,
  Wifi,
  WifiOff
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useAuth } from '@/stores/authStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useRealTimeThreats } from '@/hooks/useRealTimeThreats';
import { useRealTimeScans } from '@/hooks/useRealTimeScans';

export default function DashboardOverview() {
  const { user } = useAuth();
  const { 
    securityMetrics, 
    systemMetrics, 
    isLoadingSecurityMetrics, 
    isLoadingSystemMetrics,
    refreshDashboard,
    lastRefresh
  } = useDashboardStore();

  // Initialize WebSocket connection for real-time updates
  const { 
    isConnected, 
    connectionStatus, 
    isConnecting,
    hasError 
  } = useWebSocket({
    autoConnect: true,
    reconnectAttempts: 5,
    reconnectInterval: 2000
  });

  // Real-time threat monitoring
  const {
    activeThreatCount,
    recentThreats,
    isLoading: threatsLoading,
    stats: threatStats
  } = useRealTimeThreats();

  // Real-time scan monitoring
  const {
    activeScans,
    completedScans,
    stats: scanStats
  } = useRealTimeScans();

  useEffect(() => {
    // Fetch initial dashboard data
    refreshDashboard();
    
    // Set up auto-refresh every 30 seconds (fallback for when WebSocket is not connected)
    const interval = setInterval(() => {
      if (!isConnected) {
        refreshDashboard();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isConnected, refreshDashboard]);

  const quickActions = [
    {
      title: 'Upload AI Model',
      description: 'Add a new AI model for security monitoring',
      href: '/dashboard/models/upload',
      icon: Upload,
      color: 'bg-blue-500'
    },
    {
      title: 'Run Security Scan',
      description: 'Perform comprehensive security analysis',
      href: '/dashboard/models/scans',
      icon: Shield,
      color: 'bg-green-500'
    },
    {
      title: 'View Threats',
      description: 'Monitor active security threats',
      href: '/dashboard/threats/active',
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      title: 'Analytics Report',
      description: 'Generate security analytics report',
      href: '/dashboard/analytics/reports',
      icon: BarChart3,
      color: 'bg-purple-500'
    }
  ];

  // Generate real-time activity feed
  const recentActivity = React.useMemo(() => {
    const activities = [];
    
    // Add recent threats
    recentThreats.slice(0, 3).forEach(threat => {
      activities.push({
        id: `threat_${threat.id}`,
        type: 'threat_detected',
        title: `${threat.threat_type} threat detected`,
        time: formatTimeAgo(new Date(threat.created_at)),
        status: threat.severity === 'critical' || threat.severity === 'high' ? 'warning' : 'info',
        severity: threat.severity
      });
    });
    
    // Add recent scans
    [...activeScans.slice(0, 2), ...completedScans.slice(0, 2)].forEach(scan => {
      activities.push({
        id: `scan_${scan.id}`,
        type: scan.status === 'completed' ? 'scan_completed' : 'scan_running',
        title: `Security scan ${scan.status} for ${scan.model_name}`,
        time: formatTimeAgo(new Date(scan.created_at)),
        status: scan.status === 'completed' ? 'success' : 
               scan.status === 'failed' ? 'error' : 'info',
        progress: scan.progress
      });
    });
    
    // Sort by timestamp and take latest 4
    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 4);
  }, [recentThreats, activeScans, completedScans]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Here's what's happening with your AI security today.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Real-time connection status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <Badge variant="default" className="bg-green-500">
                  Live
                </Badge>
              </>
            ) : isConnecting ? (
              <>
                <Wifi className="h-4 w-4 text-yellow-500 animate-pulse" />
                <Badge variant="secondary" className="bg-yellow-500">
                  Connecting
                </Badge>
              </>
            ) : hasError ? (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <Badge variant="destructive">
                  Offline
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-slate-400" />
                <Badge variant="secondary">
                  Disconnected
                </Badge>
              </>
            )}
          </div>
          
          <div className="text-right text-sm text-slate-500 dark:text-slate-400">
            {lastRefresh && (
              <p>Last updated: {lastRefresh.toLocaleTimeString()}</p>
            )}
          </div>
          <Button 
            onClick={refreshDashboard}
            disabled={isLoadingSecurityMetrics || isLoadingSystemMetrics}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingSecurityMetrics || isLoadingSystemMetrics ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Active Threats
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {threatsLoading ? '...' : activeThreatCount}
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>{threatStats.critical + threatStats.high} high-priority today</span>
              </div>
              {threatStats.critical > 0 && (
                <div className="mt-2">
                  <Badge variant="destructive" className="text-xs">
                    {threatStats.critical} Critical
                  </Badge>
                </div>
              )}
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
                  Protected Models
                </CardTitle>
                <Shield className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {isLoadingSecurityMetrics ? '...' : securityMetrics?.models?.active || 0}
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <Cpu className="h-3 w-3 text-blue-500" />
                <span>{securityMetrics?.models?.total || 0} total models</span>
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
                  System Health
                </CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {isLoadingSystemMetrics ? '...' : `${Math.round(systemMetrics?.cpu?.usage_percent || 0)}%`}
              </div>
              <div className="mt-2">
                <Progress 
                  value={systemMetrics?.cpu?.usage_percent || 0} 
                  className="h-2"
                />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                CPU Usage
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
                  Memory Usage
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {isLoadingSystemMetrics ? '...' : `${Math.round(systemMetrics?.memory?.used_percent || 0)}%`}
              </div>
              <div className="mt-2">
                <Progress 
                  value={systemMetrics?.memory?.used_percent || 0} 
                  className="h-2"
                />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {systemMetrics?.memory?.available_gb?.toFixed(1) || 0}GB available
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks to manage your AI security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.href}
                  className="flex items-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {action.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Latest security events and system activity
                  </CardDescription>
                </div>
                <Link to="/dashboard/analytics/security">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'warning' ? 'bg-yellow-500' :
                      activity.status === 'error' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {activity.time}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        activity.status === 'success' ? 'default' :
                        activity.status === 'warning' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Security Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Status Overview
            </CardTitle>
            <CardDescription>
              Current security posture and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">98%</div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Security Score</p>
                <Progress value={98} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24/7</div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Monitoring Active</p>
                <Badge variant="default" className="mt-2">Online</Badge>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">12</div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Models Protected</p>
                <Badge variant="secondary" className="mt-2">All Secure</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}