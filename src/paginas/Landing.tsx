import React from 'react';
import { Header } from '../componentes/Header';
import { Footer } from '../componentes/Footer';

export const Landing: React.FC = () => {
  return (
    <div className="flex justify-center items-center bg-[#0f172a] min-h-screen p-4">
      <svg
        viewBox="0 0 1000 2300" 
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-full h-auto shadow-2xl rounded-lg overflow-hidden"
      >
        <defs>
          <linearGradient id="heroGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2F31F5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <rect width="1000" height="2300" fill="#0f172a" />
        <rect width="1000" height="800" fill="url(#heroGradient)" />

        <Header />

        {/* --- SECCIÓN HERO--- */}
        <g id="hero-section" transform="translate(0, 50)">
          <g transform="translate(500, 150)" filter="url(#glow)">
            <circle r="80" fill="none" stroke="#2F31F5" strokeWidth="2" strokeDasharray="10 5" opacity="0.6" />
            <circle r="100" fill="none" stroke="#DBF059" strokeWidth="3" strokeDasharray="180 360" />
            <circle r="115" fill="none" stroke="#2F31F5" strokeWidth="2" strokeDasharray="250 150" opacity="0.8" />
            <circle r="130" fill="none" stroke="#94a3b8" strokeWidth="1" opacity="0.3" />
            <circle cx="90" cy="-40" r="3" fill="#DBF059" />
            <circle cx="-110" cy="20" r="2" fill="#ffffff" />
            <circle cx="50" cy="110" r="2" fill="#2F31F5" />
          </g>

          <text x="500" y="380" fill="#ffffff" textAnchor="middle" style={{ fontSize: '60px', fontWeight: 900, fontFamily: 'Inter' }}>
            DailySet: <tspan fill="#DBF059">Domina</tspan> tu
          </text>
          <text x="500" y="450" fill="#ffffff" textAnchor="middle" style={{ fontSize: '60px', fontWeight: 900, fontFamily: 'Inter' }}>Progreso.</text>
          <text x="500" y="510" fill="#94a3b8" textAnchor="middle" style={{ fontSize: '20px', fontFamily: 'Inter' }}>
            Olvídate del papel. Diseña tus propias rutinas y registra cada repetición.
          </text>
          
          <rect x="300" y="560" width="190" height="55" rx="27.5" fill="#2F31F5" />
          <text x="395" y="593" fill="#ffffff" textAnchor="middle" style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'Inter' }}>Empezar Gratis</text>
          <rect x="510" y="560" width="190" height="55" rx="27.5" fill="transparent" stroke="#DBF059" strokeWidth="1.5" />
          <text x="605" y="593" fill="#DBF059" textAnchor="middle" style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'Inter' }}>Ver Funciones</text>
        </g>

        {/* --- SECCIÓN FEATURES--- */}
        <g id="features" transform="translate(0, 800)">
          <text x="500" y="0" fill="#ffffff" textAnchor="middle" style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'Inter' }}>
            Todo lo que necesitas para tu Prime
          </text>
          
          <g transform="translate(50, 70)">
            <rect width="280" height="340" rx="16" fill="#1e293b" stroke="#2F31F5" strokeWidth="1" />
            <circle cx="50" cy="50" r="25" fill="#2F31F5" fillOpacity="0.2" />
            <text x="40" y="58" style={{ fontSize: '24px' }}>📋</text>
            <text x="30" y="110" fill="#DBF059" style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'Inter' }}>Constructor</text>
            <text x="30" y="145" fill="#94a3b8" style={{ fontSize: '14px', fontFamily: 'Inter' }}>
              <tspan x="30" dy="0">Diseña rutinas personalizadas</tspan>
              <tspan x="30" dy="20">con más de 300 ejercicios.</tspan>
            </text>
          </g>

          <g transform="translate(360, 70)">
            <rect width="280" height="340" rx="16" fill="#1e293b" stroke="#2F31F5" strokeWidth="1" />
            <circle cx="50" cy="50" r="25" fill="#2F31F5" fillOpacity="0.2" />
            <text x="40" y="58" style={{ fontSize: '24px' }}>⏱️</text>
            <text x="30" y="110" fill="#DBF059" style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'Inter' }}>Modo Live</text>
            <text x="30" y="145" fill="#94a3b8" style={{ fontSize: '14px', fontFamily: 'Inter' }}>
              <tspan x="30" dy="0">Entrena sin distracciones.</tspan>
              <tspan x="30" dy="20">Registro táctil instantáneo.</tspan>
            </text>
          </g>

          <g transform="translate(670, 70)">
            <rect width="280" height="340" rx="16" fill="#1e293b" stroke="#2F31F5" strokeWidth="1" />
            <circle cx="50" cy="50" r="25" fill="#2F31F5" fillOpacity="0.2" />
            <text x="40" y="58" style={{ fontSize: '24px' }}>📈</text>
            <text x="30" y="110" fill="#DBF059" style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'Inter' }}>Analítica</text>
            <text x="30" y="145" fill="#94a3b8" style={{ fontSize: '14px', fontFamily: 'Inter' }}>
              <tspan x="30" dy="0">Visualiza tu sobrecarga</tspan>
              <tspan x="30" dy="20">progresiva con gráficas.</tspan>
            </text>
          </g>
        </g>

        {/* --- BOTÓN DE REGISTRO --- */}
        <g id="cta-button" transform="translate(400, 1300)">
          <rect width="200" height="60" rx="30" fill="#DBF059" filter="url(#glow)" opacity="0.3" />
          <rect width="200" height="60" rx="30" fill="#DBF059" />
          <text x="100" y="37" fill="#0f172a" textAnchor="middle" style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'Inter' }}>
            REGISTRARSE
          </text>
        </g>

        <g id="footer-wrap" transform="translate(0, 350)">
          <Footer />
        </g>
      </svg>
    </div>
  );
};