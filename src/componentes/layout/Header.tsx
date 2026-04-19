import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../shared/Logo';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import flagEs from '../../assets/flags/es.svg';
import flagEn from '../../assets/flags/en.svg';

interface HeaderProps {
  onAbrirMenu: () => void;
}

export default function Header({ onAbrirMenu }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b px-4 py-3 md:px-6"
      style={{ backgroundColor: 'var(--color-neutral-700)', borderColor: 'var(--color-neutral-800)' }}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">

        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={onAbrirMenu}
            aria-label={locale === 'es' ? 'Abrir menú' : 'Open menu'}
            className="transition-colors"
            style={{ color: 'var(--color-neutral-3000)' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Logo size="sm" />
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">

          {/* Language toggle */}
          <button
            onClick={setLocale}
            title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full text-xs sm:text-sm font-bold transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'var(--color-neutral-800)',
              border: '1px solid var(--color-neutral-900)',
              color: 'var(--color-neutral-3000)',
            }}
          >
            <img
              src={locale === 'es' ? flagEs : flagEn}
              alt={locale === 'es' ? 'Español' : 'English'}
              className="w-4 h-4 rounded-sm"
              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.12)' }}
            />
            <span>{locale === 'es' ? 'ES' : 'EN'}</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark'
              ? (locale === 'es' ? 'Activar modo claro' : 'Enable light mode')
              : (locale === 'es' ? 'Activar modo oscuro' : 'Enable dark mode')}
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
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-neutral-800)',
              border: '1px solid var(--color-neutral-900)',
              color: 'var(--color-neutral-3000)',
            }}
            disabled={loggingOut}
          >
            <span className="hidden sm:inline">
              {loggingOut ? (locale === 'es' ? 'Saliendo...' : 'Logging out...') : t.nav.logout}
            </span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
