export const pricing = {
  heading: 'Predictable Security Investment',
  caption: 'Transparent pricing. No hidden fees. No surprises.',
  features: [
    { id: 1, label: 'AI Model Protection (up to 10)' },
    { id: 2, label: 'AI Model Protection (unlimited)' },
    { id: 3, label: 'Basic Threat Detection' },
    { id: 4, label: 'Advanced LLM Red Teaming' },
    { id: 5, label: 'Standard Compliance Reports' },
    { id: 6, label: 'Automated Compliance Suite' },
    { id: 7, label: 'Email Support (48h)' },
    { id: 8, label: '24/7 Priority Support' },
    { id: 9, label: 'Dedicated Security Team' },
    { id: 10, label: 'Custom SLA & Onboarding' }
  ],
  plans: [
    {
      title: 'Starter',
      price: 499,
      active: false,
      featureTitle: 'Includes',
      content: 'Perfect for teams starting their AI security journey.',
      exploreLink: { children: 'Start 14-Day Free Trial', href: '/trial' },
      featuresID: [1, 3, 5, 7]
    },
    {
      title: 'Enterprise',
      active: true,
      price: 'Custom',
      featureTitle: 'Everything in Starter, plus',
      content: 'For organizations with critical AI infrastructure.',
      exploreLink: { children: 'Talk to Sales', href: '/enterprise' },
      featuresID: [2, 4, 6, 8, 9, 10]
    }
  ]
};
