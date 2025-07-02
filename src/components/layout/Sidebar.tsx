import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  Shield,
  Zap,
  Brain,
  AlertTriangle,
  BarChart3,
  FileText,
  Users,
  Key,
  Settings,
  Book,
  ChevronDown,
  ChevronRight,
  X,
  Cpu,
  Lock,
  Search,
  Monitor,
  UserCheck,
  HelpCircle,
  ExternalLink,
  Upload,
  Bell
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/stores/authStore';
import OmnisecLogo from '@/components/OmnisecLogo';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  description?: string;
  children?: NavigationItem[];
  requiredRole?: 'admin' | 'security_analyst' | 'developer' | 'viewer';
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['overview']);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard Overview',
      href: '/dashboard',
      icon: Home,
      description: 'Security overview and key metrics'
    },
    {
      name: 'AI Model Protection',
      href: '/dashboard/models',
      icon: Shield,
      badge: '12',
      description: 'Secure and monitor your AI models',
      children: [
        { name: 'Model Inventory', href: '/dashboard/models/inventory', icon: Cpu },
        { name: 'Upload Models', href: '/dashboard/models/upload', icon: Upload },
        { name: 'Security Scans', href: '/dashboard/models/scans', icon: Search },
        { name: 'Version Control', href: '/dashboard/models/versions', icon: FileText },
      ]
    },
    {
      name: 'Runtime Protection',
      href: '/dashboard/runtime',
      icon: Zap,
      badge: 'Active',
      description: 'Real-time threat detection and response',
      children: [
        { name: 'Input Validation', href: '/dashboard/runtime/validation', icon: UserCheck },
        { name: 'Rate Limiting', href: '/dashboard/runtime/limits', icon: Monitor },
        { name: 'Anomaly Detection', href: '/dashboard/runtime/anomalies', icon: AlertTriangle },
        { name: 'Response Rules', href: '/dashboard/runtime/rules', icon: Settings },
      ]
    },
    {
      name: 'LLM Security Testing',
      href: '/dashboard/llm',
      icon: Brain,
      description: 'Advanced testing for language models',
      children: [
        { name: 'Prompt Injection Tests', href: '/dashboard/llm/prompt-injection', icon: Lock },
        { name: 'Data Extraction Tests', href: '/dashboard/llm/data-extraction', icon: Search },
        { name: 'Jailbreak Detection', href: '/dashboard/llm/jailbreak', icon: AlertTriangle },
        { name: 'Test Results', href: '/dashboard/llm/results', icon: BarChart3 },
      ]
    },
    {
      name: 'Threat Intelligence',
      href: '/dashboard/threats',
      icon: AlertTriangle,
      badge: '3',
      description: 'Monitor and respond to security threats',
      children: [
        { name: 'Active Threats', href: '/dashboard/threats/active', icon: AlertTriangle },
        { name: 'Threat Feed', href: '/dashboard/threats/feed', icon: Monitor },
        { name: 'Incident Response', href: '/dashboard/threats/incidents', icon: Zap },
        { name: 'Threat Intelligence', href: '/dashboard/threats/intelligence', icon: Brain },
      ]
    },
    {
      name: 'Monitoring & Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      description: 'Comprehensive security analytics',
      children: [
        { name: 'Security Dashboard', href: '/dashboard/analytics/security', icon: Shield },
        { name: 'Performance Metrics', href: '/dashboard/analytics/performance', icon: BarChart3 },
        { name: 'Usage Analytics', href: '/dashboard/analytics/usage', icon: Monitor },
        { name: 'Custom Reports', href: '/dashboard/analytics/reports', icon: FileText },
      ]
    },
    {
      name: 'Compliance & Reporting',
      href: '/dashboard/compliance',
      icon: FileText,
      description: 'Compliance monitoring and reporting',
      requiredRole: 'security_analyst',
      children: [
        { name: 'Compliance Dashboard', href: '/dashboard/compliance/overview', icon: FileText },
        { name: 'Audit Logs', href: '/dashboard/compliance/audit', icon: Book },
        { name: 'Security Reports', href: '/dashboard/compliance/reports', icon: BarChart3 },
        { name: 'Policy Management', href: '/dashboard/compliance/policies', icon: Settings },
      ]
    },
    {
      name: 'Access Control',
      href: '/dashboard/access',
      icon: Lock,
      description: 'User and permission management',
      requiredRole: 'admin',
      children: [
        { name: 'User Management', href: '/dashboard/access/users', icon: Users },
        { name: 'Role Management', href: '/dashboard/access/roles', icon: UserCheck },
        { name: 'Permissions', href: '/dashboard/access/permissions', icon: Key },
        { name: 'API Keys', href: '/dashboard/access/api-keys', icon: Key },
      ]
    },
    {
      name: 'Settings & Configuration',
      href: '/dashboard/settings',
      icon: Settings,
      description: 'Platform settings and configuration',
      children: [
        { name: 'General Settings', href: '/dashboard/settings/general', icon: Settings },
        { name: 'Security Settings', href: '/dashboard/settings/security', icon: Shield },
        { name: 'Notifications', href: '/dashboard/settings/notifications', icon: Bell },
        { name: 'Integrations', href: '/dashboard/settings/integrations', icon: ExternalLink },
      ]
    },
    {
      name: 'User Management',
      href: '/dashboard/users',
      icon: Users,
      badge: '24',
      description: 'Manage organization users',
      requiredRole: 'admin'
    },
    {
      name: 'API Documentation',
      href: '/dashboard/docs',
      icon: Book,
      description: 'API reference and documentation',
      children: [
        { name: 'Getting Started', href: '/dashboard/docs/getting-started', icon: HelpCircle },
        { name: 'API Reference', href: '/dashboard/docs/api', icon: Book },
        { name: 'SDKs & Libraries', href: '/dashboard/docs/sdks', icon: ExternalLink },
        { name: 'Examples', href: '/dashboard/docs/examples', icon: FileText },
      ]
    }
  ];

  // Filter navigation items based on user role
  const filteredNavigationItems = navigationItems.filter(item => {
    if (!item.requiredRole) return true;
    if (!user) return false;
    
    const roleHierarchy = { viewer: 0, developer: 1, security_analyst: 2, admin: 3 };
    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[item.requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  });

  const isCurrentPath = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const hasActiveChild = (item: NavigationItem) => {
    if (!item.children) return false;
    return item.children.some(child => isCurrentPath(child.href));
  };

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-80">
          <div className="flex flex-col flex-grow bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <OmnisecLogo size="md" showText={true} animated={true} />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2">
              {filteredNavigationItems.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  isActive={isCurrentPath(item.href)}
                  hasActiveChild={hasActiveChild(item)}
                  expanded={expandedItems.includes(item.name)}
                  onToggleExpanded={toggleExpanded}
                />
              ))}
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <p>OmnisecAI Security v1.0.0</p>
                <p className="mt-1">© 2025 OmnisecAI. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <OmnisecLogo size="md" showText={true} animated={true} />
                <Button variant="outline" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {filteredNavigationItems.map((item) => (
                  <NavItem
                    key={item.name}
                    item={item}
                    isActive={isCurrentPath(item.href)}
                    hasActiveChild={hasActiveChild(item)}
                    expanded={expandedItems.includes(item.name)}
                    onToggleExpanded={toggleExpanded}
                    onItemClick={onClose}
                  />
                ))}
              </nav>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <p>OmnisecAI Security v1.0.0</p>
                  <p className="mt-1">© 2025 OmnisecAI</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Navigation item component
interface NavItemProps {
  item: NavigationItem;
  isActive: boolean;
  hasActiveChild: boolean;
  expanded: boolean;
  onToggleExpanded: (itemName: string) => void;
  onItemClick?: () => void;
}

function NavItem({ 
  item, 
  isActive, 
  hasActiveChild, 
  expanded, 
  onToggleExpanded, 
  onItemClick 
}: NavItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const showExpanded = expanded && hasChildren;

  return (
    <div>
      <div
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
          isActive || hasActiveChild
            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
        )}
      >
        {hasChildren ? (
          <button
            onClick={() => onToggleExpanded(item.name)}
            className="flex items-center w-full text-left"
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <Badge 
                variant={isActive ? "default" : "secondary"} 
                className="ml-2 text-xs"
              >
                {item.badge}
              </Badge>
            )}
            {expanded ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ChevronRight className="ml-2 h-4 w-4" />
            )}
          </button>
        ) : (
          <Link
            to={item.href}
            onClick={onItemClick}
            className="flex items-center w-full"
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <Badge 
                variant={isActive ? "default" : "secondary"} 
                className="ml-2 text-xs"
              >
                {item.badge}
              </Badge>
            )}
          </Link>
        )}
      </div>

      {/* Children */}
      <AnimatePresence>
        {showExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-6 mt-1 space-y-1 overflow-hidden"
          >
            {item.children?.map((child) => (
              <Link
                key={child.name}
                to={child.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
                  useLocation().pathname === child.href
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                <child.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                <span>{child.name}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}