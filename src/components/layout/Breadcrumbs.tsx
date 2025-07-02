import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  models: 'AI Model Protection',
  inventory: 'Model Inventory',
  upload: 'Upload Models',
  scans: 'Security Scans',
  versions: 'Version Control',
  runtime: 'Runtime Protection',
  validation: 'Input Validation',
  limits: 'Rate Limiting',
  anomalies: 'Anomaly Detection',
  rules: 'Response Rules',
  llm: 'LLM Security Testing',
  'prompt-injection': 'Prompt Injection Tests',
  'data-extraction': 'Data Extraction Tests',
  jailbreak: 'Jailbreak Detection',
  results: 'Test Results',
  threats: 'Threat Intelligence',
  active: 'Active Threats',
  feed: 'Threat Feed',
  incidents: 'Incident Response',
  intelligence: 'Threat Intelligence',
  analytics: 'Monitoring & Analytics',
  security: 'Security Dashboard',
  performance: 'Performance Metrics',
  usage: 'Usage Analytics',
  reports: 'Custom Reports',
  compliance: 'Compliance & Reporting',
  overview: 'Compliance Dashboard',
  audit: 'Audit Logs',
  policies: 'Policy Management',
  access: 'Access Control',
  users: 'User Management',
  roles: 'Role Management',
  permissions: 'Permissions',
  'api-keys': 'API Keys',
  settings: 'Settings & Configuration',
  general: 'General Settings',
  notifications: 'Notifications',
  integrations: 'Integrations',
  docs: 'API Documentation',
  'getting-started': 'Getting Started',
  api: 'API Reference',
  sdks: 'SDKs & Libraries',
  examples: 'Examples',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Generate breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [];

  // Add home/dashboard as first item
  breadcrumbItems.push({
    label: 'Dashboard',
    href: '/dashboard',
    current: pathSegments.length === 1
  });

  // Add subsequent path segments
  for (let i = 1; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    const href = '/' + pathSegments.slice(0, i + 1).join('/');
    const isLast = i === pathSegments.length - 1;
    
    breadcrumbItems.push({
      label: routeLabels[segment] || segment.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      href: isLast ? undefined : href,
      current: isLast
    });
  }

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-slate-400 mx-2" />
            )}
            
            {item.current ? (
              <span 
                className="font-medium text-slate-900 dark:text-white"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href || '#'}
                className={cn(
                  "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors",
                  index === 0 && "flex items-center"
                )}
              >
                {index === 0 && <Home className="h-4 w-4 mr-1" />}
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}