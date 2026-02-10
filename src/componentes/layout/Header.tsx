import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-neutral-800 px-6 py-3">
      <div className="flex items-center justify-end max-w-7xl mx-auto">
        <Link to="/login">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 transition-all text-sm">
            <span>Logout</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </Link>
      </div>
    </header>
  );
}
