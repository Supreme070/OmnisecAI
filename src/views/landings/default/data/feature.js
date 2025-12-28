// @project
import branding from '@/branding.json';
import { IconType } from '@/enum';

export const feature2 = {
  heading: 'Security-First Culture',
  caption: 'Join a team of security experts dedicated to protecting AI systems at scale.',
  features: [
    {
      icon: { name: 'tabler-shield-check', type: IconType.STROKE, color: 'grey.900', stroke: 1 },
      title: 'Expert Team',
      content: 'Security researchers and AI experts with decades of combined experience.'
    },
    {
      icon: { name: 'tabler-lock', type: IconType.STROKE, color: 'grey.900', stroke: 1 },
      title: 'Zero Trust',
      content: 'Every request verified, every model protected, every threat neutralized.'
    },
    {
      icon: { name: 'tabler-chart-line', type: IconType.STROKE, color: 'grey.900', stroke: 1 },
      title: 'Continuous Improvement',
      content: 'Our threat intelligence evolves daily with new attack patterns and defenses.'
    }
  ]
};

export const feature5 = {
  heading: 'Enterprise Security Benefits',
  caption: 'Comprehensive protection that scales with your organization.',
  image1: '/assets/images/graphics/ai/security-dashboard.svg',
  image2: '/assets/images/graphics/ai/threat-map.svg',
  features: [
    {
      icon: 'tabler-clock-24',
      title: '24/7 Monitoring',
      content: 'Round-the-clock security operations center watching your AI infrastructure.'
    },
    {
      icon: 'tabler-shield-heart',
      title: 'Incident Response',
      content: 'Dedicated response team with 15-minute SLA for critical threats.'
    }
  ],
  features2: [
    {
      icon: 'tabler-file-certificate',
      title: 'Compliance Ready',
      content: 'Pre-built compliance reports for SOC 2, GDPR, HIPAA, and more.'
    },
    {
      icon: 'tabler-users-group',
      title: 'Dedicated Support',
      content: 'Named security advisor for Enterprise customers.'
    }
  ],
  profileGroups: {
    avatarGroups: [
      { avatar: '/assets/images/user/ciso1.png' },
      { avatar: '/assets/images/user/ciso2.png' },
      { avatar: '/assets/images/user/ciso3.png' },
      { avatar: '/assets/images/user/ciso4.png' },
      { avatar: '/assets/images/user/ciso5.png' }
    ],
    review: '500+ Enterprise CISOs Trust Us'
  },
  content: 'Protect your entire AI lifecycle from development to production.',
  actionBtn: { children: 'Explore Security Features', href: '/features' }
};

export const feature20 = {
  heading: 'Enterprise-Grade AI Protection',
  caption: 'Ready to secure every AI model in your organization? Get 360-degree protection.',
  actionBtn: { children: 'Start Free Assessment', href: '/assessment' },
  secondaryBtn: {
    children: 'View Security Features',
    href: '/features',
    sx: {
      color: 'secondary.main',
      borderColor: 'secondary.main',
      '&:hover': {
        borderColor: 'secondary.dark',
        bgcolor: 'secondary.lighter'
      }
    }
  },
  features: [
    {
      icon: 'tabler-shield-lock',
      title: 'LLM Threat Detection',
      content: 'Block prompt injections, jailbreaks, and data exfiltration with 99.97% accuracy.'
    },
    {
      icon: 'tabler-radar',
      title: 'Real-Time Monitoring',
      content: '24/7 threat intelligence with sub-second detection across all AI endpoints.'
    },
    {
      icon: 'tabler-file-certificate',
      title: 'Automated Compliance',
      content: 'Generate SOC 2, GDPR, and HIPAA reports in minutes, not weeks.'
    },
    {
      icon: 'tabler-chart-line',
      title: 'AI Risk Scoring',
      content: 'Quantify and prioritize AI vulnerabilities with predictive threat modeling.'
    },
    {
      icon: 'tabler-api',
      title: 'Zero-Code Integration',
      content: 'Deploy in minutes with native connectors for AWS, Azure, GCP, and OpenAI.'
    },
    {
      icon: 'tabler-users-group',
      title: 'Dedicated Security Team',
      content: 'Enterprise customers get 24/7 access to AI security experts and incident response.'
    }
  ]
};

export const feature21 = {
  heading: `AI Threat Intelligence That Learns`,
  caption: 'Powered by machine learning trained on millions of AI attack patterns.',
  mockupType: 'threat-intelligence',
  primaryBtn: { children: 'See Threat Database', href: '/threat-intelligence' },
  secondaryBtn: {
    children: 'Request Threat Report',
    href: '/report',
    sx: {
      color: 'secondary.main',
      borderColor: 'secondary.main',
      '&:hover': {
        borderColor: 'secondary.dark',
        bgcolor: 'secondary.lighter'
      }
    }
  },
  features: [
    {
      animationDelay: 0.1,
      icon: 'tabler-brain',
      title: 'ML-Powered Detection'
    },
    {
      animationDelay: 0.2,
      icon: 'tabler-refresh',
      title: 'Continuous Learning'
    },
    {
      animationDelay: 0.3,
      icon: 'tabler-world',
      title: 'Global Threat Network'
    },
    {
      animationDelay: 0.4,
      icon: 'tabler-shield-check',
      title: 'Zero-Day Protection'
    },
    {
      animationDelay: 0.1,
      icon: 'tabler-chart-arrows',
      title: 'Predictive Analytics'
    },
    {
      animationDelay: 0.2,
      icon: 'tabler-share',
      title: 'Threat Sharing'
    },
    {
      animationDelay: 0.3,
      icon: 'tabler-database',
      title: 'Attack Pattern Library'
    },
    {
      animationDelay: 0.4,
      icon: 'tabler-bell',
      title: 'Targeted Alerts'
    }
  ]
};

export const feature = {
  heading: `What's Protected by ${branding.brandName}`,
  features: [
    {
      image: '/assets/images/shared/openai.svg',
      title: 'OpenAI & GPT Models',
      content: 'Protect ChatGPT, GPT-4, and custom fine-tuned models from prompt attacks.'
    },
    {
      image: '/assets/images/shared/anthropic.svg',
      title: 'Anthropic Claude',
      content: 'Secure Claude deployments with real-time threat monitoring.'
    },
    {
      image: '/assets/images/shared/aws.svg',
      title: 'AWS Bedrock',
      content: 'Native integration with Amazon Bedrock foundation models.'
    },
    {
      image: '/assets/images/shared/azure.svg',
      title: 'Azure OpenAI',
      content: 'Enterprise protection for Microsoft Azure AI deployments.'
    },
    {
      image: '/assets/images/shared/gcp.svg',
      title: 'Google Vertex AI',
      content: 'Comprehensive security for Google Cloud AI workloads.'
    },
    {
      title: 'Custom & Open Source Models',
      content: 'Protect Llama, Mistral, and any custom-trained models.',
      actionBtn: { children: 'See All Integrations', href: '/integrations' }
    }
  ]
};

export const feature7 = {
  heading: 'Real-Time Security Insights',
  caption: 'Complete visibility into your AI security posture.',
  testimonials: [
    {
      image: '/assets/images/graphics/ai/threat-dashboard.svg',
      features: [
        {
          icon: 'tabler-chart-pie',
          title: 'Risk Analytics',
          content: 'Visualize threat trends and security metrics across your AI infrastructure.'
        }
      ]
    },
    {
      image: '/assets/images/graphics/ai/multi-cloud.svg',
      features: [
        {
          icon: 'tabler-cloud',
          title: 'Multi-Cloud Visibility',
          content: 'Unified security view across AWS, Azure, GCP, and on-premise deployments.'
        }
      ]
    },
    {
      image: '/assets/images/graphics/ai/compliance-dashboard.svg',
      features: [
        {
          icon: 'tabler-file-check',
          title: 'Compliance Tracking',
          content: 'Real-time compliance status and automated audit trail documentation.'
        }
      ]
    }
  ],
  breadcrumbs: [{ title: 'Risk Analytics' }, { title: 'Multi-Cloud' }, { title: 'Compliance' }]
};

export const feature23 = {
  heading: 'Built for Security Teams',
  caption: 'Designed by security professionals, for security professionals. Streamline your AI security operations.',
  heading2: 'Scale With Confidence',
  caption2: 'From startup to enterprise, our platform grows with your security needs.',
  image: '/assets/images/graphics/default/security-team.png',
  primaryBtn: { children: 'Talk to Security Expert', href: '/contact' },

  features: [
    {
      icon: 'tabler-users',
      title: 'SOC Integration',
      content: 'Native integration with your existing security operations center tools.'
    },
    {
      icon: 'tabler-automation',
      title: 'Automated Playbooks',
      content: 'Pre-built response playbooks for common AI security incidents.'
    }
  ]
};

export const feature18 = {
  heading: 'Your AI Security Command Center',
  caption: 'Manage threats, monitor compliance, and respond to incidents from one powerful interface.',
  topics: [
    {
      icon: 'tabler-dashboard',
      title: 'Unified Dashboard',
      title2: 'Complete AI Security Visibility',
      description: 'See every AI model, threat, and compliance status in real-time.',
      mockupType: 'dashboard',
      list: [
        { primary: 'Real-time threat map' },
        { primary: 'AI model inventory' },
        { primary: 'Risk score trending' },
        { primary: 'Compliance status at-a-glance' }
      ],
      actionBtn: { children: 'View Demo', href: '/demo' },
      actionBtn2: { children: 'Documentation', href: '/docs' }
    },
    {
      icon: 'tabler-shield-check',
      title: 'Threat Detection',
      title2: 'AI-Powered Threat Analysis',
      description: 'Detect prompt injections, jailbreaks, and data exfiltration in real-time.',
      mockupType: 'threat-detection',
      list: [
        { primary: 'Prompt injection blocking' },
        { primary: 'Jailbreak prevention' },
        { primary: 'Data exfiltration alerts' },
        { primary: 'Anomaly detection' }
      ],
      actionBtn: { children: 'View Demo', href: '/demo' },
      actionBtn2: { children: 'Documentation', href: '/docs' }
    },
    {
      icon: 'tabler-report',
      title: 'Compliance Automation',
      title2: 'One-Click Compliance Reports',
      description: 'Generate audit-ready reports for SOC 2, GDPR, HIPAA, and more.',
      mockupType: 'compliance',
      list: [
        { primary: 'Automated evidence collection' },
        { primary: 'Continuous compliance monitoring' },
        { primary: 'Audit trail documentation' },
        { primary: 'Policy enforcement' }
      ],
      actionBtn: { children: 'View Demo', href: '/demo' },
      actionBtn2: { children: 'Documentation', href: '/docs' }
    },
    {
      icon: 'tabler-bolt',
      title: 'Incident Response',
      title2: 'Rapid Threat Remediation',
      description: 'Automated playbooks and expert support when you need it most.',
      mockupType: 'incident-response',
      list: [
        { primary: 'Automated response playbooks' },
        { primary: '24/7 expert support' },
        { primary: 'Forensic analysis tools' },
        { primary: 'Post-incident reporting' }
      ],
      actionBtn: { children: 'View Demo', href: '/demo' },
      actionBtn2: { children: 'Documentation', href: '/docs' }
    }
  ]
};
