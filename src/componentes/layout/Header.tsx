import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../shared/Logo';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import type { Locale } from '../../context/I18nContext';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onAbrirMenu: () => void;
}

export default function Header({ onAbrirMenu }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const otherLocale: Locale = locale === 'es' ? 'en' : 'es';
  const localeLabel = locale === 'es' ? 'EN' : 'ES';

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b px-4 py-3 md:px-6"
      style={{ backgroundColor: 'var(--color-neutral-700)', borderColor: 'var(--color-neutral-800)' }}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">

        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={onAbrirMenu}
            className="transition-colors"
            style={{ color: 'var(--color-neutral-3000)' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Logo size="sm" />
        </div>

        <div className="ml-auto flex items-center gap-2">

          {/* Language toggle */}
          <button
            onClick={() => setLocale(otherLocale)}
            title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold transition-all"
            style={{
              backgroundColor: 'var(--color-neutral-800)',
              border: '1px solid var(--color-neutral-900)',
              color: 'var(--color-neutral-3000)',
            }}
          >
            <span className="text-xs">{locale === 'es' ? '🇪🇸' : '🇬🇧'}</span>
            <span>{localeLabel}</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark'
              ? (locale === 'es' ? 'Activar modo claro' : 'Enable light mode')
              : (locale === 'es' ? 'Activar modo oscuro' : 'Enable dark mode')}
            className="flex items-center justify-center w-9 h-9 rounded-full transition-all"
            style={{
              backgroundColor: 'var(--color-neutral-800)',
              border: '1px solid var(--color-neutral-900)',
              color: theme === 'dark' ? '#DBF059' : '#4361EE',
            }}
          >
            {theme === 'dark'
              ? <Sun className="w-4 h-4" />
              : <Moon className="w-4 h-4" />
            }
          </button>

          {/* Logout */}
          <button
            onClick={async () => {
              if (loggingOut) return;
              setLoggingOut(true);
              try {
                await logout();
                navigate('/login');
              } finally {
                setLoggingOut(false);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-neutral-800)',
              border: '1px solid var(--color-neutral-900)',
              color: 'var(--color-neutral-3000)',
            }}
            disabled={loggingOut}
          >
            <span className="hidden sm:inline">
              {loggingOut ? t.nav.loggingOut ?? t.nav.logout : t.nav.logout}
            </span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
