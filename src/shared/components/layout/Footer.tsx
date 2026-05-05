import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { Container } from '@/shared/components/layout/Container';
import { SORT_OPTIONS } from '@/shared/types/enums';

const shopLinks = [
  { label: 'New Arrivals', href: `${routes.products}?sort=${SORT_OPTIONS.NEWEST}` },
  { label: 'Womenswear', href: `${routes.products}?category=womenswear` },
  { label: 'Accessories', href: `${routes.products}?category=accessories` },
];

const accountLinks = [
  { label: 'Orders', href: routes.orders },
  { label: 'Address Book', href: routes.profileAddresses },
  { label: 'Notifications', href: routes.notifications },
];

const accessLinks = [
  { label: 'Login', href: routes.login },
  { label: 'Register', href: routes.register },
  { label: 'Profile', href: routes.profile },
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
  <footer className="border-t border-border bg-canvas pt-20 print:hidden md:pt-24">
    <Container className="grid gap-14 pb-20 md:grid-cols-12 md:gap-x-12">
      <div className="md:col-span-4">
        <span className="block font-display text-3xl uppercase tracking-[0.2em] text-text-primary">AURA EDITORIAL</span>
        <p className="mt-8 max-w-xs text-sm leading-7 text-text-secondary">
          Redefining luxury through the lens of quiet elegance and architectural precision. Based in Milan, available globally.
        </p>
      </div>
      <div className="md:col-span-2">{renderLinkGroup('Shop', shopLinks)}</div>
      <div className="md:col-span-2">{renderLinkGroup('Account', accountLinks)}</div>
      <div className="md:col-span-4 md:text-right">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">Access</h4>
        <div className="mt-5 space-y-4 md:ml-auto md:max-w-[180px]">
          {accessLinks.map((link) => (
            <Link className="block text-sm text-text-secondary transition-colors hover:text-text-primary" key={link.label} to={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </Container>
    <Container className="flex flex-col gap-5 border-t border-border py-8 text-xs uppercase tracking-[0.18em] text-outline md:flex-row md:items-center md:justify-between">
      <p>(c) {new Date().getFullYear()} Aura Editorial. All rights reserved.</p>
      <div className="flex gap-10">
        <span>ENG</span>
        <span>EUR</span>
      </div>
    </Container>
  </footer>
);
