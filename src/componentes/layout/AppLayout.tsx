import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-100 focus:m-4 focus:px-4 focus:py-2 focus:rounded-lg"
        style={{ backgroundColor: 'var(--color-neutral-800)', color: 'var(--color-white)', border: '1px solid rgba(255,255,255,0.12)' }}
      >
        Skip to content
      </a>
      <div
        className="flex min-h-dvh w-full relative"
        style={{ backgroundColor: 'var(--color-black)', color: 'var(--color-white)', overflowX: 'hidden' }}
      >
        <div className="absolute top-0 right-0 w-125 h-125 bg-brand-primary/10 blur-[150px] -z-10" />
        <div className="absolute bottom-0 left-0 w-75 h-75 bg-brand-accent/5 blur-[120px] -z-10" />

        <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <Header onAbrirMenu={() => setMenuAbierto(true)} />
          <main
            id="main"
            role="main"
            className="flex-1 p-4 md:p-8"
          >
            <div className="max-w-5xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}