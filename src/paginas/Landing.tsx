import React from 'react';
import { Header } from '../componentes/Header';
import { Footer } from '../componentes/Footer';

export const Landing: React.FC = () => {
  return (
    <div className="flex justify-center items-center bg-[#0f172a] min-h-screen p-4">
      <svg
        viewBox="0 0 1000 1300"
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-full h-auto shadow-2xl rounded-lg overflow-hidden"
      >
        <defs>
          <linearGradient id="heroGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2F31F5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Fondo Principal */}
        <rect width="1000" height="1300" fill="#0f172a" />
        <rect width="1000" height="600" fill="url(#heroGradient)" />

        <Header />

        {/* Sección Hero */}
        <g id="hero-section">
          <text x="500" y="220" fill="#ffffff" textAnchor="middle" style={{ fontSize: '60px', fontWeight: 900, fontFamily: 'Inter' }}>
            DailySet: <tspan fill="#DBF059">Domina</tspan> tu
          </text>
          <text x="500" y="290" fill="#ffffff" textAnchor="middle" style={{ fontSize: '60px', fontWeight: 900, fontFamily: 'Inter' }}>Progreso.</text>
          <text x="500" y="350" fill="#94a3b8" textAnchor="middle" style={{ fontSize: '20px', fontFamily: 'Inter' }}>
            Olvídate del papel. Diseña tus propias rutinas y registra cada repetición.
          </text>
          
          <rect x="300" y="400" width="190" height="55" rx="27.5" fill="#2F31F5" />
          <text x="395" y="433" fill="#ffffff" textAnchor="middle" style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'Inter' }}>Empezar Gratis</text>
          <rect x="510" y="400" width="190" height="55" rx="27.5" fill="transparent" stroke="#DBF059" strokeWidth="1.5" />
          <text x="605" y="433" fill="#DBF059" textAnchor="middle" style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'Inter' }}>Ver Funciones</text>
        </g>

        {/* Sección Features */}
        <g id="features">
          <text x="500" y="580" fill="#ffffff" textAnchor="middle" style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'Inter' }}>Diseñada para tu entrenamiento</text>
          
          {/* Card Constructor */}
          <g>
            <rect x="50" y="650" width="280" height="320" rx="12" fill="#1e293b" stroke="#2F31F5" strokeWidth="0.5" />
            <text x="92" y="715" style={{ fontSize: '24px' }}>📋</text>
            <text x="80" y="770" fill="#DBF059" style={{ fontSize: '20px', fontWeight: 'bold' ,fontFamily: 'Inter'}}>Constructor</text>
            <text x="80" y="810" fill="#94a3b8" style={{ fontSize: '14px', fontFamily: 'Inter' }}>Crea planes personalizados</text>
          </g>

          {/* Card Modo Live */}
          <g>
            <rect x="360" y="650" width="280" height="320" rx="12" fill="#1e293b" stroke="#2F31F5" strokeWidth="0.5" />
            <text x="402" y="715" style={{ fontSize: '24px' }}>⏱️</text>
            <text x="390" y="770" fill="#DBF059" style={{ fontSize: '20px', fontWeight: 'bold',fontFamily: 'Inter' }}>Modo Live</text>
            <text x="390" y="810" fill="#94a3b8" style={{ fontSize: '14px', fontFamily: 'Inter' }}>Registro táctil y timer </text>
          </g>

          {/* Card Analítica */}
          <g>
            <rect x="670" y="650" width="280" height="320" rx="12" fill="#1e293b" stroke="#2F31F5" strokeWidth="0.5" />
            <text x="712" y="715" style={{ fontSize: '24px' }}>📈</text>
            <text x="700" y="770" fill="#DBF059" style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'Inter' }}>Analítica</text>
            <text x="700" y="810" fill="#94a3b8" style={{ fontSize: '14px', fontFamily: 'Inter' }}>Gráficas de progreso </text>
          </g>
        </g>

        <Footer />
      </svg>
    </div>
  );
};