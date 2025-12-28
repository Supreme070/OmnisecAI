// @project
import SvgIcon from '@/components/SvgIcon';

/***************************  OMNISECAI - NAVBAR  ***************************/

const linkProps = { target: '_blank', rel: 'noopener noreferrer' };

export const navbar = {
  customization: false,
  secondaryBtn: {
    children: <SvgIcon name="tabler-brand-github" color="secondary.main" size={20} stroke={1.5} />,
    href: 'https://github.com/omnisecai',
    ...linkProps,
    sx: {
      minWidth: 40,
      width: 40,
      height: 40,
      p: 0,
      borderColor: 'grey.400',
      '&:hover': {
        borderColor: 'primary.main',
        bgcolor: 'primary.lighter'
      }
    }
  },
  primaryBtn: {
    children: 'Get Started',
    href: '/demo',
    sx: {
      bgcolor: 'primary.main',
      color: 'secondary.main',
      fontWeight: 600,
      '&:hover': {
        bgcolor: 'primary.dark'
      }
    }
  },
  navItems: [
    { id: 'home', title: 'Home', link: '/' },
    { id: 'features', title: 'Features', link: '/features' },
    { id: 'pricing', title: 'Pricing', link: '/pricing' },
    { id: 'docs', title: 'Documentation', link: 'https://docs.omnisecai.com', ...linkProps }
  ]
};
