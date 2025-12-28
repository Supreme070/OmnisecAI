// @next
import NextLink from 'next/link';

// @mui
import branding from '@/branding.json';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

export const cta4 = {
  headLine: 'Why Global Enterprises Trust OmnisecAI',
  primaryBtn: {
    children: 'Read Customer Stories',
    href: '/customers'
  },
  profileGroups: {
    avatarGroups: [
      { avatar: '/assets/images/user/ciso1.png' },
      { avatar: '/assets/images/user/ciso2.png' },
      { avatar: '/assets/images/user/ciso3.png' },
      { avatar: '/assets/images/user/ciso4.png' },
      { avatar: '/assets/images/user/ciso5.png' }
    ],
    review: '500+ Security Reviews (4.8 out of 5)'
  },
  list: [
    { primary: 'Gartner Cool Vendor 2024' },
    { primary: '500+ Enterprise Customers' },
    { primary: 'Zero Breaches Since Launch' },
    { primary: '15-Minute Onboarding' },
    { primary: '24/7 Expert Support' },
    { primary: 'SOC 2 Type II Certified' }
  ],
  clientContent: 'See Case Studies'
};

function DescriptionLine() {
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      Weekly threat briefings, exclusive research, and peer networking.{' '}
      <Link component={NextLink} variant="caption2" color="primary" href="/community" underline="hover">
        Learn more
      </Link>
    </Typography>
  );
}

export const cta5 = {
  label: 'Join the Movement',
  heading: 'The AI Security Community',
  caption: 'Connect with CISOs, security researchers, and AI engineers.',
  primaryBtn: {
    children: 'Join Our Slack Community',
    href: branding.company.socialLink.slack,
    target: '_blank',
    rel: 'noopener noreferrer'
  },
  description: <DescriptionLine />,
  saleData: { count: 2, defaultUnit: 'k+', caption: 'Security professionals in our community' },
  profileGroups: {
    avatarGroups: [
      { avatar: '/assets/images/user/ciso1.png' },
      { avatar: '/assets/images/user/ciso2.png' },
      { avatar: '/assets/images/user/ciso3.png' },
      { avatar: '/assets/images/user/ciso4.png' },
      { avatar: '/assets/images/user/ciso5.png' }
    ],
    review: '2k+ Security Professionals'
  }
};

export const cta10 = {
  heading: "Ready to secure your AI infrastructure?",
  caption: 'Get a personalized security assessment from our AI security experts. No commitment required.',
  primaryBtn: { children: 'Schedule Assessment', href: '/demo' },
  secondaryBtn: {
    children: 'Contact Sales',
    href: '/contact',
    sx: {
      color: 'secondary.main',
      borderColor: 'secondary.main',
      '&:hover': {
        borderColor: 'secondary.dark',
        bgcolor: 'secondary.lighter'
      }
    }
  },
  image: '/assets/images/graphics/ai/security-assessment.svg',
  profileGroups: {
    avatarGroups: [
      { avatar: '/assets/images/user/ciso1.png' },
      { avatar: '/assets/images/user/ciso2.png' },
      { avatar: '/assets/images/user/ciso3.png' },
      { avatar: '/assets/images/user/ciso4.png' },
      { avatar: '/assets/images/user/ciso5.png' }
    ],
    review: '500+ Enterprises Protected'
  }
};
