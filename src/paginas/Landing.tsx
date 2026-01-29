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

        {/* Sección Features Mejorada */}
        <g id="features">
          <text x="500" y="580" fill="#ffffff" textAnchor="middle" style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'Inter' }}>
            Todo lo que necesitas para tu Prime
          </text>
          
          {/* Card Constructor */}
          <g transform="translate(50, 650)">
            <rect width="280" height="340" rx="16" fill="#1e293b" stroke="#2F31F5" strokeWidth="1" />
            <circle cx="50" cy="50" r="25" fill="#2F31F5" fillOpacity="0.2" />
            <text x="40" y="58" style={{ fontSize: '24px' }}>📋</text>
            <text x="30" y="110" fill="#DBF059" style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'Inter' }}>Constructor</text>
            <text x="30" y="145" fill="#94a3b8" style={{ fontSize: '14px', fontFamily: 'Inter' }}>
              <tspan x="30" dy="0">Diseña rutinas personalizadas</tspan>
              <tspan x="30" dy="20">con más de 300 ejercicios.</tspan>
              <tspan x="30" dy="20">Ajusta series, reps y RPE</tspan>
              <tspan x="30" dy="20">según tus objetivos.</tspan>
            </text>
          </g>

          {/* Card Modo Live */}
          <g transform="translate(360, 650)">
            <rect width="280" height="340" rx="16" fill="#1e293b" stroke="#2F31F5" strokeWidth="1" />
            <circle cx="50" cy="50" r="25" fill="#2F31F5" fillOpacity="0.2" />
            <text x="40" y="58" style={{ fontSize: '24px' }}>⏱️</text>
            <text x="30" y="110" fill="#DBF059" style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'Inter' }}>Modo Live</text>
            <text x="30" y="145" fill="#94a3b8" style={{ fontSize: '14px', fontFamily: 'Inter' }}>
              <tspan x="30" dy="0">Entrena sin distracciones.</tspan>
              <tspan x="30" dy="20">Registro táctil instantáneo,</tspan>
              <tspan x="30" dy="20">timers de descanso auto y</tspan>
              <tspan x="30" dy="20">calculadora de carga.</tspan>
            </text>
          </g>

          {/* Card Analítica */}
          <g transform="translate(670, 650)">
            <rect width="280" height="340" rx="16" fill="#1e293b" stroke="#2F31F5" strokeWidth="1" />
            <circle cx="50" cy="50" r="25" fill="#2F31F5" fillOpacity="0.2" />
            <text x="40" y="58" style={{ fontSize: '24px' }}>📈</text>
            <text x="30" y="110" fill="#DBF059" style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'Inter' }}>Analítica</text>
            <text x="30" y="145" fill="#94a3b8" style={{ fontSize: '14px', fontFamily: 'Inter' }}>
              <tspan x="30" dy="0">Visualiza tu sobrecarga</tspan>
              <tspan x="30" dy="20">progresiva. Gráficas de 1RM,</tspan>
              <tspan x="30" dy="20">volumen semanal y récords</tspan>
              <tspan x="30" dy="20">históricos detallados.</tspan>
            </text>
          </g>
        </g>

        <Footer />
      </svg>
    </div>
  );
};