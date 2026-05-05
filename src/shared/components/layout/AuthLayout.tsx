import { Outlet } from 'react-router-dom';

export const AuthLayout = () => (
  <div className="auth-shell-bg relative min-h-screen overflow-hidden">
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span className="auth-hero-wordmark font-display text-[20vw] leading-none">AURA</span>
    </div>
    <div className="pointer-events-none absolute left-8 top-12 hidden h-80 w-64 overflow-hidden grayscale opacity-40 lg:block">
      <img
        alt=""
        className="h-full w-full object-cover"
        height={640}
        loading="lazy"
        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80"
        width={512}
      />
    </div>
    <div className="pointer-events-none absolute bottom-12 right-8 hidden h-96 w-72 overflow-hidden grayscale opacity-40 lg:block">
      <img
        alt=""
        className="h-full w-full object-cover"
        height={768}
        loading="lazy"
        src="https://images.unsplash.com/photo-1506629905607-d9c297d14d6a?auto=format&fit=crop&w=600&q=80"
        width={576}
      />
    </div>
    <main className="relative z-10 flex min-h-screen items-center justify-center px-page py-12">
      <section className="w-full max-w-md bg-white px-8 py-10 editorial-shadow md:px-12 md:py-12">
        <Outlet />
      </section>
    </main>
    <footer className="relative z-10 border-t border-black/5 px-page py-8">
      <div className="mx-auto flex max-w-layout flex-col items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary md:flex-row">
        <span>(c) 2024 Aura Editorial. All rights reserved.</span>
        <div className="flex gap-8">
          <span>Privacy</span>
          <span>Terms</span>
        </div>
      </div>
    </footer>
  </div>
);
