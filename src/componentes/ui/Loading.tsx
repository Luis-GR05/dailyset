export default function Loading() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-center animate-fade-in">
        {/* Logo animado */}
        <div className="w-20 h-20 bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
          <span className="text-white font-display font-bold text-3xl">DS</span>
        </div>

        {/* Texto */}
        <h2 className="text-white font-display font-bold text-2xl mb-2">DailySet</h2>
        <p className="text-neutral-300">Login</p>

        {/* Spinner */}
        <div className="mt-8">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
