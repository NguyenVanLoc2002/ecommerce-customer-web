import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { Container } from '@/shared/components/layout/Container';

const customerLinks = [
  { label: 'Shipping & Returns', href: routes.products },
  { label: 'Store Locator', href: routes.products },
  { label: 'Contact Us', href: routes.products },
];

const legalLinks = [
  { label: 'Sustainability', href: routes.products },
  { label: 'Privacy Policy', href: routes.products },
  { label: 'Terms of Service', href: routes.products },
];

const socialLinks = [
  { label: 'Instagram', href: routes.products },
  { label: 'Pinterest', href: routes.products },
  { label: 'LinkedIn', href: routes.products },
];

const renderLinkGroup = (title: string, links: Array<{ label: string; href: string }>) => (
  <div className="space-y-5">
    <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">{title}</h4>
    <div className="space-y-4">
      {links.map((link) => (
        <Link className="block text-sm text-text-secondary transition-colors hover:text-text-primary" key={link.label} to={link.href}>
          {link.label}
        </Link>
      ))}
    </div>
  </div>
);

export const Footer = () => (
  <footer className="border-t border-border bg-canvas pt-20 md:pt-24">
    <Container className="grid gap-14 pb-20 md:grid-cols-12 md:gap-x-12">
      <div className="md:col-span-4">
        <span className="block font-display text-3xl uppercase tracking-[0.2em] text-text-primary">MAISON</span>
        <p className="mt-8 max-w-xs text-sm leading-7 text-text-secondary">
          Redefining luxury through the lens of quiet elegance and architectural precision. Based in Milan, available globally.
        </p>
      </div>
      <div className="md:col-span-2">{renderLinkGroup('Customer Care', customerLinks)}</div>
      <div className="md:col-span-2">{renderLinkGroup('Legal', legalLinks)}</div>
      <div className="md:col-span-4 md:text-right">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">Social</h4>
        <div className="mt-5 space-y-4 md:ml-auto md:max-w-[180px]">
          {socialLinks.map((link) => (
            <Link className="block text-sm text-text-secondary transition-colors hover:text-text-primary" key={link.label} to={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </Container>
    <Container className="flex flex-col gap-5 border-t border-border py-8 text-xs uppercase tracking-[0.18em] text-outline md:flex-row md:items-center md:justify-between">
      <p>(c) 2024 Aura Editorial. All rights reserved.</p>
      <div className="flex gap-10">
        <span>ENG</span>
        <span>EUR</span>
      </div>
    </Container>
  </footer>
);
