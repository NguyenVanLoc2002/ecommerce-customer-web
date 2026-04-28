import { useState } from 'react';

import { Container } from '@/shared/components/layout/Container';
import { Button } from '@/shared/components/ui/Button';
import { useUiStore } from '@/shared/stores/uiStore';

export const NewsletterSection = () => {
  const addToast = useUiStore((state) => state.addToast);
  const [email, setEmail] = useState('');

  return (
    <section className="mb-section bg-promo-dark py-24 text-center md:py-32">
      <Container className="max-w-3xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/40">Newsletter</p>
        <h2 className="mt-4 font-display text-[3rem] leading-none text-white md:text-[3.5rem]">Join the Editorial Circle</h2>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/55">
          Receive exclusive access to private collection previews, atelier journals, and invitations to international exhibitions.
        </p>
        <form
          className="mx-auto mt-12 flex max-w-xl flex-col border-b border-white/10 md:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            addToast({
              tone: 'success',
              title: 'Preview signup captured',
              description: email ? `${email} was added to the editorial preview list.` : 'Add an email to continue.',
            });
          }}
        >
          <input
            className="h-16 flex-1 border-0 bg-transparent px-0 text-[11px] font-bold uppercase tracking-[0.22em] text-white placeholder:text-white/20 focus:outline-none focus:ring-0"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email address"
            type="email"
            value={email}
          />
          <Button className="bg-white text-brand-primary hover:bg-white/85" size="lg" type="submit">
            Subscribe
          </Button>
        </form>
      </Container>
    </section>
  );
};
