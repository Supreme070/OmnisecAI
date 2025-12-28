// @assets
const imagePrefix = '/assets/images/platform';

export const other = {
  heading: `Complete AI Security Platform`,
  description: 'Everything you need to discover, protect, detect, and respond to AI threats - in one unified platform.',
  primaryBtn: { children: 'Explore Platform', href: '/platform' },
  sections: [
    {
      animationDelay: 0.2,
      title: 'AI Asset Discovery',
      subTitle: 'Find Every AI Model',
      image: `${imagePrefix}/discovery.svg`,
      link: '/platform/discovery'
    },
    {
      animationDelay: 0.3,
      title: 'LLM Red Teaming',
      subTitle: 'Proactive Testing',
      image: `${imagePrefix}/redteam.svg`,
      link: '/platform/red-teaming'
    },
    {
      animationDelay: 0.4,
      title: 'Threat Intelligence',
      subTitle: 'Real-Time Insights',
      image: `${imagePrefix}/threat-intel.svg`,
      link: '/platform/threat-intelligence'
    },
    {
      animationDelay: 0.2,
      title: 'Incident Response',
      subTitle: 'Automated Remediation',
      image: `${imagePrefix}/incident.svg`,
      link: '/platform/incident-response'
    },
    {
      animationDelay: 0.3,
      title: 'Compliance Hub',
      subTitle: 'Automated Reports',
      image: `${imagePrefix}/compliance.svg`,
      link: '/platform/compliance'
    },
    {
      animationDelay: 0.4,
      title: 'Security Dashboard',
      subTitle: 'Unified Visibility',
      image: `${imagePrefix}/dashboard.svg`,
      link: '/platform/dashboard'
    }
  ]
};

export const other3 = {
  heading: 'Join Our Security Team',
  caption: 'Help us protect the future of AI. We are building the most advanced AI security platform.',
  other: [
    {
      title: 'Security Researcher',
      description: 'Research and develop new AI threat detection techniques.',
      chips: [
        {
          icon: 'tabler-map-pin',
          name: 'Remote'
        },
        {
          icon: 'tabler-history',
          name: 'Full-Time'
        }
      ],
      btn: { children: 'View Job', href: '/careers' }
    },
    {
      title: 'ML Engineer',
      description: 'Build ML models for threat detection and anomaly analysis.',
      chips: [
        {
          icon: 'tabler-map-pin',
          name: 'Remote'
        },
        {
          icon: 'tabler-history',
          name: 'Full-Time'
        }
      ],
      btn: { children: 'View Job', href: '/careers' }
    },
    {
      title: 'Backend Engineer',
      description: 'Scale our multi-tenant security platform to millions of requests.',
      chips: [
        {
          icon: 'tabler-map-pin',
          name: 'Remote'
        },
        {
          icon: 'tabler-history',
          name: 'Full-Time'
        }
      ],
      btn: { children: 'View Job', href: '/careers' }
    },
    {
      title: 'Security Sales Engineer',
      description: 'Help enterprise customers secure their AI infrastructure.',
      chips: [
        {
          icon: 'tabler-map-pin',
          name: 'Remote'
        },
        {
          icon: 'tabler-history',
          name: 'Full-Time'
        }
      ],
      btn: { children: 'View Job', href: '/careers' }
    }
  ]
};
