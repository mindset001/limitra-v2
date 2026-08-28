'use client';
import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { StoreProvider } from '@/components/store/StoreProvider';
import { Splash } from '@/components/store/Splash';
import { SpinGate } from '@/components/store/SpinGate';
import { Header, Footer, MobileBottomNav } from '@/components/chrome/Chrome';
import { Toasts } from '@/components/ui/Shared';
import { EloAI } from '@/components/lucy/EloAI';

import '@/styles/chrome.css';
import '@/styles/pages.css';
import '@/styles/shop.css';
import '@/styles/flows.css';
import '@/styles/affiliate.css';
import '@/styles/careers.css';
import '@/styles/videos.css';
import '@/styles/spin.css';
import '@/styles/channels.css';
import '@/styles/about.css';
import '@/styles/accents.css';
import '@/styles/lucy.css';

function SiteChrome({ children }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  return (
    <>
      <Splash />
      <Header />
      <main className="app-main">{children}</main>
      <Footer />
      <MobileBottomNav />
      {isHome && <EloAI />}
      <SpinGate />
      <Toasts />
    </>
  );
}

export default function SiteLayout({ children }) {
  return (
    <Suspense fallback={null}>
      <StoreProvider>
        <SiteChrome>{children}</SiteChrome>
      </StoreProvider>
    </Suspense>
  );
}
