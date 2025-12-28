export const faq = {
  heading: 'Frequently Asked Questions',
  caption: `Everything you need to know about securing your AI infrastructure.`,
  defaultExpanded: 'Security',
  faqList: [
    {
      question: 'What types of AI threats does OmnisecAI protect against?',
      answer:
        'OmnisecAI protects against all major AI and LLM attack vectors including prompt injections, jailbreaks, data exfiltration, model manipulation, adversarial attacks, and supply chain compromises. Our threat database covers the OWASP Top 10 for LLM Applications and MITRE ATLAS framework.',
      category: 'Security'
    },
    {
      question: 'How quickly can OmnisecAI be deployed?',
      answer:
        'Most customers are fully deployed within 15 minutes. Our zero-code integration connects directly to your AI infrastructure through native connectors for AWS, Azure, GCP, OpenAI, Anthropic, and more. Enterprise deployments with custom requirements typically take 1-2 weeks.',
      category: 'Getting Started'
    },
    {
      question: 'Does OmnisecAI work with custom or fine-tuned models?',
      answer:
        'Yes. OmnisecAI protects any AI model regardless of where it runs or how it was trained. This includes custom models, fine-tuned models, open-source models like Llama, and proprietary models from major providers. Our agent-based approach provides visibility into all AI activity.',
      category: 'Security'
    },
    {
      question: 'What compliance frameworks does OmnisecAI support?',
      answer: {
        content: 'OmnisecAI provides automated compliance reporting and continuous monitoring for all major frameworks:',
        type: 'list',
        data: [
          { primary: 'SOC 2 Type I & Type II' },
          { primary: 'GDPR & CCPA' },
          { primary: 'HIPAA' },
          { primary: 'ISO 27001' },
          { primary: 'NIST AI RMF' },
          { primary: 'EU AI Act' }
        ]
      },
      category: 'Compliance'
    },
    {
      question: 'How does OmnisecAI pricing work?',
      answer:
        'OmnisecAI offers predictable, usage-based pricing. Starter plans at $499/month are ideal for teams with up to 10 AI models. Enterprise plans include unlimited models, advanced features, dedicated support, and custom SLAs. Contact our sales team for a custom quote based on your specific needs.',
      category: 'Pricing'
    },
    {
      question: 'What support options are available?',
      answer: {
        content: 'Support varies by plan:',
        type: 'list',
        data: [
          { primary: 'Starter: Email support with 48-hour response SLA' },
          { primary: 'Enterprise: 24/7 priority support with 4-hour response SLA' },
          { primary: 'Enterprise+: Dedicated security team and incident response' }
        ]
      },
      category: 'Support'
    },
    {
      question: 'Is there a free trial available?',
      answer:
        'Yes, we offer a 14-day free trial of our Starter plan with no credit card required. Enterprise customers can request a custom proof-of-concept with their specific AI infrastructure and threat scenarios.',
      category: 'Getting Started'
    },
    {
      question: 'How does OmnisecAI handle data privacy?',
      answer:
        'OmnisecAI is designed with privacy-first architecture. We never store or train on your data or AI model outputs. All analysis happens in real-time with no data retention. We are SOC 2 Type II certified and GDPR compliant with data processing agreements available.',
      category: 'Security'
    },
    {
      question: 'Can OmnisecAI integrate with our existing security tools?',
      answer: {
        content: 'Yes, OmnisecAI integrates with your existing security stack:',
        type: 'list',
        data: [
          { primary: 'SIEM: Splunk, Datadog, Sumo Logic' },
          { primary: 'SOAR: Palo Alto XSOAR, Swimlane' },
          { primary: 'Ticketing: Jira, ServiceNow, PagerDuty' },
          { primary: 'Communication: Slack, Microsoft Teams, Email' }
        ]
      },
      category: 'Getting Started'
    },
    {
      question: 'Does OmnisecAI support multi-tenant deployments?',
      answer:
        'Yes, OmnisecAI is built from the ground up for multi-tenant enterprise deployments. Each tenant has isolated data, separate access controls, and dedicated compliance reporting. This makes it ideal for MSPs, enterprises with multiple business units, and SaaS providers.',
      category: 'Security'
    }
  ],
  getInTouch: {
    link: { children: 'Contact Security Team', href: '/contact', target: '_blank', rel: 'noopener noreferrer' }
  },
  categories: ['Security', 'Getting Started', 'Compliance', 'Pricing', 'Support'],
  activeCategory: 'Security'
};
