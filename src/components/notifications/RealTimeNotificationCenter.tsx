import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  X, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  Settings,
  Trash2,
  Shield,
  VolumeOff,
  Volume2,
  Wifi,
  WifiOff
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useRealTimeNotifications, RealTimeNotification } from '@/hooks/useRealTimeNotifications';

export default function RealTimeNotificationCenter() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    soundEnabled,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    setSoundEnabled,
    getFilteredNotifications,
    stats
  } = useRealTimeNotifications();

  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'security':
        return <Shield className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getFilteredNotificationsList = () => {
    switch (selectedTab) {
      case 'unread':
        return getFilteredNotifications({ unreadOnly: true });
      case 'security':
        return getFilteredNotifications({ type: 'security' });
      case 'critical':
        return getFilteredNotifications({ priority: 'critical' });
      default:
        return notifications;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const handleNotificationClick = (notification: RealTimeNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 h-9 w-9"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          {unreadCount > 0 || !isConnected ? (
            <BellRing className={`h-4 w-4 ${!isConnected ? 'text-yellow-500' : ''}`} />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          {!isConnected && (
            <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-yellow-500 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 text-green-500" />
                  <Badge variant="outline" className="text-xs text-green-600">
                    Live
                  </Badge>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-yellow-500" />
                  <Badge variant="outline" className="text-xs text-yellow-600">
                    Offline
                  </Badge>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Disable sound' : 'Enable sound'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeOff className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 p-1 m-1">
            <TabsTrigger value="all" className="text-xs">
              All
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs">
              Security
              {stats.byType.security > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {stats.byType.security}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="critical" className="text-xs">
              Critical
              {stats.byPriority.critical > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {stats.byPriority.critical}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="m-0">
            <ScrollArea className="h-96">
              <div className="p-2">
                {isLoading ? (
                  <div className="text-center text-slate-500 py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm">Loading notifications...</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {getFilteredNotificationsList().length === 0 ? (
                      <div className="text-center text-slate-500 py-8">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                        {selectedTab !== 'all' && (
                          <p className="text-xs mt-1">No {selectedTab} notifications found</p>
                        )}
                      </div>
                    ) : (
                      getFilteredNotificationsList().map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`p-3 rounded-lg border-l-4 mb-2 transition-all cursor-pointer hover:shadow-sm ${
                            notification.read
                              ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                              : `bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm ${getPriorityColor(notification.priority)}`
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              {getIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className={`text-sm font-medium ${
                                    notification.read 
                                      ? 'text-slate-600 dark:text-slate-400' 
                                      : 'text-slate-900 dark:text-white'
                                  }`}>
                                    {notification.title}
                                  </p>
                                  <div className="flex items-center space-x-1">
                                    {notification.priority === 'critical' && (
                                      <Badge variant="destructive" className="text-xs">
                                        Critical
                                      </Badge>
                                    )}
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                    )}
                                  </div>
                                </div>
                                <p className={`text-xs mt-1 ${
                                  notification.read 
                                    ? 'text-slate-500 dark:text-slate-500' 
                                    : 'text-slate-600 dark:text-slate-300'
                                }`}>
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-slate-400">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                  {notification.requiresAction && (
                                    <Badge variant="outline" className="text-xs">
                                      Action Required
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Sound notifications</span>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                  size="sm"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="w-full text-xs text-slate-500 hover:text-slate-700"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}