import { useState } from 'react';

import { Container } from '@/shared/components/layout/Container';
import { Button } from '@/shared/components/ui/Button';
import { useUiStore } from '@/shared/stores/uiStore';

export const NewsletterSection = () => {
  const addToast = useUiStore((state) => state.addToast);
  const [email, setEmail] = useState('');
  const newsletterButtonClassName =
    'w-full !border-white !bg-white !text-text-primary hover:!border-text-primary hover:!bg-text-primary hover:!text-white focus-visible:!outline-white focus-visible:outline-offset-4 md:w-auto';

  return (
    <section className="mb-section bg-promo-dark py-24 text-center md:py-32">
      <Container className="max-w-3xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/40">Newsletter</p>
        <h2 className="mt-4 font-display text-[3rem] leading-none text-white md:text-[3.5rem]">Join the Editorial Circle</h2>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/55">
          Receive exclusive access to private collection previews, atelier journals, and invitations to international exhibitions.
        </p>
        <form
          className="mx-auto mt-12 flex max-w-xl flex-col gap-4 border-b border-white/10 pb-4 md:flex-row md:items-end md:gap-0 md:pb-0"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmedEmail = email.trim();

            if (!trimmedEmail) {
              addToast({
                tone: 'info',
                title: 'Add your email address',
                description: 'Enter your email address to join the editorial preview list.',
              });
              return;
            }

            addToast({
              tone: 'success',
              title: 'Preview signup captured',
              description: `${trimmedEmail} was added to the editorial preview list.`,
            });
            setEmail('');
          }}
        >
          <input
            aria-label="Email address"
            className="h-16 flex-1 border-0 bg-transparent px-0 text-[11px] font-bold uppercase tracking-[0.22em] text-white placeholder:text-white/45 focus:outline-none focus:ring-0"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ENTER YOUR EMAIL ADDRESS"
            type="email"
            value={email}
          />
          <Button aria-label="Subscribe to the newsletter" className={newsletterButtonClassName} size="lg" type="submit" variant="ghost">
            Subscribe
          </Button>
        </form>
      </Container>
    </section>
  );
};
