import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, AlertTriangle, Users, BarChart3, Zap } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/stores/authStore';
import { useDashboardStore } from '@/stores/dashboardStore';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { 
    securityMetrics, 
    systemMetrics, 
    isLoadingSecurityMetrics, 
    isLoadingSystemMetrics,
    fetchSecurityMetrics,
    fetchSystemMetrics,
    refreshDashboard
  } = useDashboardStore();

  useEffect(() => {
    // Fetch initial dashboard data
    refreshDashboard();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  OmnisecAI Dashboard
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Welcome back, {user?.firstName}!
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="border-slate-200 dark:border-slate-600"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Security Dashboard
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Monitor your AI models, detect threats, and maintain security across your organization.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
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
                    {isLoadingSecurityMetrics ? '...' : securityMetrics?.threats?.active || 0}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {securityMetrics?.threats?.detections_24h || 0} detected today
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      AI Models
                    </CardTitle>
                    <Zap className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isLoadingSecurityMetrics ? '...' : securityMetrics?.models?.active || 0}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {securityMetrics?.models?.total || 0} total models
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      CPU Usage
                    </CardTitle>
                    <Activity className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isLoadingSystemMetrics ? '...' : `${Math.round(systemMetrics?.cpu?.usage_percent || 0)}%`}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {systemMetrics?.cpu?.count || 0} cores available
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
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
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {systemMetrics?.memory?.available_gb?.toFixed(1) || 0}GB available
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">AI Model Protection</CardTitle>
                  </div>
                  <CardDescription>
                    Secure your AI models with advanced threat detection and monitoring.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    View Models
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <CardTitle className="text-lg">Threat Intelligence</CardTitle>
                  </div>
                  <CardDescription>
                    Real-time threat detection and response for your AI infrastructure.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    View Threats
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">Analytics</CardTitle>
                  </div>
                  <CardDescription>
                    Comprehensive security analytics and reporting dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Coming Soon Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center p-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              🚧 Dashboard Under Construction
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We're building an amazing security dashboard with real-time monitoring, 
              AI model protection, threat intelligence, and comprehensive analytics. 
              Stay tuned for more features!
            </p>
            
            <div className="mt-6 flex justify-center space-x-4">
              <Button 
                onClick={refreshDashboard}
                disabled={isLoadingSecurityMetrics || isLoadingSystemMetrics}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoadingSecurityMetrics || isLoadingSystemMetrics ? 'Refreshing...' : 'Refresh Data'}
              </Button>
              
              <Button variant="outline" className="border-slate-200 dark:border-slate-600">
                View Roadmap
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}