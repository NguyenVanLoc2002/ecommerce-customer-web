import { Shield, Sparkles, Truck } from 'lucide-react';

import { Container } from '@/shared/components/layout/Container';

const items = [
  {
    icon: Sparkles,
    title: 'Editorial curation',
    description: 'Discovery pages are designed to feel premium without losing shopping clarity.',
  },
  {
    icon: Shield,
    title: 'Typed implementation',
    description: 'Every phase is built against the documented API and architecture rules.',
  },
  {
    icon: Truck,
    title: 'Roadmap-aware commerce',
    description: 'Cart, checkout, and order lifecycles are already route-aware and ready for the next phases.',
  },
];

export const TrustSection = () => (
  <section className="py-section">
    <Container className="grid gap-6 md:grid-cols-3">
      {items.map((item) => (
        <article className="rounded-card bg-white p-6 shadow-card" key={item.title}>
          <item.icon className="h-5 w-5 text-brand-primary" />
          <h2 className="mt-5 font-display text-2xl">{item.title}</h2>
          <p className="mt-3 text-sm leading-7 text-text-secondary">{item.description}</p>
        </article>
      ))}
    </Container>
  </section>
);

