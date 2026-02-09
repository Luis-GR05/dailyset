export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-neutral-700/80 backdrop-blur-md border-b border-neutral-800 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-700 to-primary-900 rounded-xl flex items-center justify-center">
            <span className="text-white font-display font-bold text-lg">DS</span>
          </div>
          <h1 className="text-white font-display font-bold text-2xl">DailySet</h1>
        </div>

        {/* Acciones */}
        <button className="btn-pill flex items-center gap-2">
          <span className="text-sm font-medium">Logout</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}
