import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden relative">
    <div className="absolute top-0 right-0 w-125 h-125 bg-brand-primary/10 blur-[150px] -z-10" />
    <div className="absolute bottom-0 left-0 w-75 h-75 bg-brand-accent/5 blur-[120px] -z-10" />
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}