/***************************  HERO - OMNISECAI PREMIUM  ***************************/

export const hero = {
  chip: {
    label: '🛡️ AI Security That Never Sleeps'
  },
  headLine: 'Stop AI Threats Before They Start',
  captionLine: 'Protect your AI models, LLMs, and cloud infrastructure with 100% threat detection and zero false positives. Join 500+ enterprises securing their AI lifecycle.',
  primaryBtn: { children: 'Get Your Security Assessment', href: '/demo' },
  secondaryBtn: {
    children: 'Watch Demo',
    href: '/demo-video',
    sx: {
      color: 'secondary.main',
      borderColor: 'secondary.main',
      '&:hover': {
        borderColor: 'secondary.dark',
        bgcolor: 'secondary.lighter'
      }
    }
  },
  listData: [
    { title: 'SOC 2 Type II' },
    { title: 'GDPR Compliant' },
    { title: 'ISO 27001' },
    { title: 'MITRE ATLAS' },
    { title: 'OWASP LLM Top 10' },
    { title: 'FedRAMP Ready' }
  ]
};
