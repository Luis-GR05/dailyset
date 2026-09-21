import React from 'react';

export interface MarcoAvatarNivelProps {
  nivel: number; // 1 a 7
  size?: 'sm' | 'md' | 'lg' | 'xl';
  avatarUrl?: string | null;
  iniciales?: string;
  nombre?: string;
  className?: string;
  onClick?: () => void;
  title?: string;
  mostrarInsignia?: boolean;
  mostrarBrillo?: boolean;
  children?: React.ReactNode;
}

const SIZE_CONFIGS = {
  sm: {
    containerSize: 'w-14 h-14',
    avatarSize: 'w-9 h-9',
    textSize: 'text-xs',
  },
  md: {
    containerSize: 'w-24 h-24',
    avatarSize: 'w-16 h-16',
    textSize: 'text-lg',
  },
  lg: {
    containerSize: 'w-36 h-36',
    avatarSize: 'w-24 h-24',
    textSize: 'text-2xl',
  },
  xl: {
    containerSize: 'w-48 h-48',
    avatarSize: 'w-32 h-32',
    textSize: 'text-3xl',
  },
};

export default function MarcoAvatarNivel({
  nivel,
  size = 'lg',
  avatarUrl,
  iniciales = 'U',
  nombre = 'Atleta',
  className = '',
  onClick,
  title,
  mostrarInsignia = true,
  mostrarBrillo = true,
  children,
}: MarcoAvatarNivelProps) {
  const lvl = Math.min(Math.max(nivel || 1, 1), 7);
  const cfg = SIZE_CONFIGS[size] || SIZE_CONFIGS.lg;

  // ── SVGs DE ALTA DEFINICIÓN POR CADA NIVEL (ViewBox 0 0 200 200) ──────────
  // El avatar circular se ubica exactamente en el centro (cx=100, cy=100, r=58)

  // 1. CHISPA INICIAL: Marco eléctrico amarillo/oro con rayos, chispas y plasma
  const renderChispaSvg = () => (
    <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
      <defs>
        <radialGradient id="chispaAura" cx="50%" cy="50%" r="50%">
          <stop offset="65%" stopColor="#FACC15" stopOpacity="0" />
          <stop offset="85%" stopColor="#FDE047" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#CA8A04" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="chispaRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="25%" stopColor="#FACC15" />
          <stop offset="50%" stopColor="#CA8A04" />
          <stop offset="75%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>
        <filter id="chispaGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Aura de plasma brillante */}
      {mostrarBrillo && (
        <circle cx="100" cy="100" r="82" fill="url(#chispaAura)" className="animate-pulse" />
      )}

      {/* Anillo de energía exterior punteado en rotación */}
      <circle
        cx="100"
        cy="100"
        r="74"
        fill="none"
        stroke="#FDE047"
        strokeWidth="2"
        strokeDasharray="10 8"
        opacity="0.8"
        className="animate-[spin_12s_linear_infinite]"
        style={{ transformOrigin: 'center' }}
      />

      {/* Anillo principal grueso de chispa dorada */}
      <circle
        cx="100"
        cy="100"
        r="66"
        fill="none"
        stroke="url(#chispaRing)"
        strokeWidth="6"
        filter="url(#chispaGlow)"
      />
      <circle cx="100" cy="100" r="61" fill="none" stroke="#FEF08A" strokeWidth="1.5" opacity="0.9" />

      {/* 4 Nodos capacitores de energía en cruz */}
      {/* Nodo Superior */}
      <g transform="translate(100, 30)">
        <polygon points="0,-8 7,0 0,8 -7,0" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" filter="drop-shadow(0 0 4px #FACC15)" />
        <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
      </g>
      {/* Nodo Inferior */}
      <g transform="translate(100, 170)">
        <polygon points="0,-8 7,0 0,8 -7,0" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" filter="drop-shadow(0 0 4px #FACC15)" />
        <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
      </g>
      {/* Nodo Izquierdo */}
      <g transform="translate(30, 100)">
        <polygon points="0,-8 7,0 0,8 -7,0" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" filter="drop-shadow(0 0 4px #FACC15)" />
        <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
      </g>
      {/* Nodo Derecho */}
      <g transform="translate(170, 100)">
        <polygon points="0,-8 7,0 0,8 -7,0" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" filter="drop-shadow(0 0 4px #FACC15)" />
        <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
      </g>

      {/* Rayos eléctricos en zigzag saliendo de los bordes */}
      <g stroke="#FEF08A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 0 5px #FACC15)">
        {/* Rayo superior derecho */}
        <path d="M 148 52 L 155 42 L 150 42 L 160 30" className="animate-bounce" />
        {/* Rayo inferior izquierdo */}
        <path d="M 52 148 L 45 158 L 50 158 L 40 170" className="animate-pulse" />
        {/* Rayo superior izquierdo */}
        <path d="M 52 52 L 42 45 L 47 45 L 36 36" />
        {/* Rayo inferior derecho */}
        <path d="M 148 148 L 158 155 L 153 155 L 164 164" />
      </g>

      {/* Chispas de 4 puntas flotantes */}
      <g fill="#FFFFFF" filter="drop-shadow(0 0 6px #FDE047)">
        <path d="M 165 65 Q 165 72 172 72 Q 165 72 165 79 Q 165 72 158 72 Q 165 72 165 65 Z" className="animate-pulse" />
        <path d="M 35 135 Q 35 142 42 142 Q 35 142 35 149 Q 35 142 28 142 Q 35 142 35 135 Z" className="animate-ping" style={{ animationDuration: '3s' }} />
        <path d="M 40 70 Q 40 76 46 76 Q 40 76 40 82 Q 40 76 34 76 Q 40 76 40 70 Z" className="animate-pulse" />
      </g>

      {/* Insignia inferior: Rayo eléctrico en medallón */}
      {mostrarInsignia && (
        <g transform="translate(100, 172)" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.8))">
          <circle cx="0" cy="0" r="14" fill="#0A0A0A" stroke="#EAB308" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="11" fill="url(#chispaRing)" />
          {/* Rayo vector centrado */}
          <path d="M 1 -7 L -5 1 L 0 1 L -1 7 L 5 -1 L 0 -1 Z" fill="#000000" stroke="#000000" strokeWidth="0.5" />
        </g>
      )}
    </svg>
  );

  // 2. CONSTANCIA BRONCE: Armadura pesada de bronce forjado con remaches
  const renderBronceSvg = () => (
    <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
      <defs>
        <linearGradient id="bronceMetal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="30%" stopColor="#92400E" />
          <stop offset="60%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <radialGradient id="bronceShine" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#78350F" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Anillo de remaches y placas */}
      <circle cx="100" cy="100" r="76" fill="none" stroke="#78350F" strokeWidth="4" />
      <circle cx="100" cy="100" r="67" fill="none" stroke="url(#bronceMetal)" strokeWidth="10" />
      <circle cx="100" cy="100" r="61" fill="none" stroke="#FDE68A" strokeWidth="1.5" opacity="0.6" />

      {/* 4 Brackets de armadura en las 4 esquinas */}
      {[45, 135, 225, 315].map((angle, idx) => (
        <g key={idx} transform={`rotate(${angle} 100 100)`}>
          <rect x="94" y="20" width="12" height="14" rx="2" fill="#B45309" stroke="#451A03" strokeWidth="1.5" />
          <circle cx="100" cy="27" r="2.5" fill="#FDE68A" stroke="#78350F" strokeWidth="1" />
        </g>
      ))}

      {/* 4 Remaches metálicos cardinales */}
      {[0, 90, 180, 270].map((angle, idx) => (
        <g key={idx} transform={`rotate(${angle} 100 100)`}>
          <circle cx="100" cy="33" r="3" fill="#D97706" stroke="#451A03" strokeWidth="1" />
          <circle cx="99" cy="32" r="1" fill="#FEF3C7" />
        </g>
      ))}

      {/* Insignia inferior: Escudo de bronce */}
      {mostrarInsignia && (
        <g transform="translate(100, 172)" filter="drop-shadow(0 2px 8px rgba(0,0,0,0.85))">
          <path d="M 0 -13 L 13 -7 L 11 5 C 11 12 0 17 0 17 C 0 17 -11 12 -11 5 L -13 -7 Z" fill="#92400E" stroke="#FDE68A" strokeWidth="2" />
          <path d="M 0 -10 L 10 -5 L 8 4 C 8 10 0 14 0 14 C 0 14 -8 10 -8 4 L -10 -5 Z" fill="#B45309" />
          {/* Estrella de bronce en el escudo */}
          <polygon points="0,-5 1.5,-1 5,-1 2,1 3.5,5 0,2.5 -3.5,5 -2,1 -5,-1 -1.5,-1" fill="#FEF3C7" />
        </g>
      )}
    </svg>
  );

  // 3. RACHA DE HIERRO: Acero templado y plata cepillada con cuchillas laterales
  const renderHierroSvg = () => (
    <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
      <defs>
        <linearGradient id="steelMetal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#CBD5E1" />
          <stop offset="50%" stopColor="#64748B" />
          <stop offset="75%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>

      {/* Alas/Cuchillas de acero templado en ambos lados */}
      <g fill="url(#steelMetal)" stroke="#1E293B" strokeWidth="1.5">
        {/* Ala izquierda */}
        <path d="M 38 60 L 16 90 L 26 100 L 16 110 L 38 140 C 30 115 30 85 38 60 Z" filter="drop-shadow(-2px 0 6px rgba(148,163,184,0.4))" />
        {/* Ala derecha */}
        <path d="M 162 60 L 184 90 L 174 100 L 184 110 L 162 140 C 170 115 170 85 162 60 Z" filter="drop-shadow(2px 0 6px rgba(148,163,184,0.4))" />
      </g>

      {/* Anillo de acero */}
      <circle cx="100" cy="100" r="74" fill="none" stroke="#475569" strokeWidth="3" />
      <circle cx="100" cy="100" r="67" fill="none" stroke="url(#steelMetal)" strokeWidth="8" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="#F8FAFC" strokeWidth="1.5" />

      {/* Remaches de acero cromado */}
      <circle cx="100" cy="28" r="3.5" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1" />
      <circle cx="100" cy="172" r="3.5" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1" />

      {/* Insignia inferior: Chevron de acero vanguardista */}
      {mostrarInsignia && (
        <g transform="translate(100, 172)" filter="drop-shadow(0 2px 8px rgba(0,0,0,0.85))">
          <polygon points="0,-12 14,-4 14,3 0,14 -14,3 -14,-4" fill="#1E293B" stroke="#E2E8F0" strokeWidth="2" />
          <polygon points="0,-8 10,-2 10,2 0,10 -10,2 -10,-2" fill="url(#steelMetal)" />
          {/* Llama plateada forjada */}
          <path d="M 0 -4 C 3 -1 4 2 2 5 C 0 8 -4 5 -3 2 C -3 -1 0 -4 0 -4 Z" fill="#38BDF8" />
        </g>
      )}
    </svg>
  );

  // 4. CONSTANCIA DE ORO: Oro puro 24k con laureles de victoria majestuosos
  const renderOroSvg = () => (
    <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
      <defs>
        <linearGradient id="gold24k" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="25%" stopColor="#FACC15" />
          <stop offset="50%" stopColor="#CA8A04" />
          <stop offset="75%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#A16207" />
        </linearGradient>
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Halo de luz dorada */}
      {mostrarBrillo && (
        <circle cx="100" cy="100" r="86" fill="none" stroke="#FDE047" strokeWidth="3" opacity="0.3" filter="url(#goldGlow)" />
      )}

      {/* Anillo de oro doble con ribetes */}
      <circle cx="100" cy="100" r="74" fill="none" stroke="#CA8A04" strokeWidth="3" />
      <circle cx="100" cy="100" r="67" fill="none" stroke="url(#gold24k)" strokeWidth="8" filter="drop-shadow(0 0 8px rgba(234,179,8,0.7))" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="#FEF9C3" strokeWidth="1.5" />

      {/* RAMAS DE LAUREL DE LA VICTORIA (Lado Izquierdo) */}
      <g fill="url(#gold24k)" stroke="#854D0E" strokeWidth="0.8" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))">
        {/* Hojas izquierdas abrazando el marco */}
        <path d="M 32 150 C 24 135 22 115 28 95 C 32 105 36 125 32 150 Z" />
        <path d="M 22 130 C 14 118 16 100 24 85 C 26 96 28 112 22 130 Z" />
        <path d="M 26 105 C 20 90 24 75 36 62 C 36 74 34 90 26 105 Z" />
        <path d="M 36 80 C 32 65 38 52 52 42 C 50 54 46 68 36 80 Z" />
        <path d="M 52 56 C 50 42 60 32 76 26 C 70 36 64 48 52 56 Z" />
        {/* Hojas derechas abrazando el marco */}
        <path d="M 168 150 C 176 135 178 115 172 95 C 168 105 164 125 168 150 Z" />
        <path d="M 178 130 C 186 118 184 100 176 85 C 174 96 172 112 178 130 Z" />
        <path d="M 174 105 C 180 90 176 75 164 62 C 164 74 166 90 174 105 Z" />
        <path d="M 164 80 C 168 65 162 52 148 42 C 150 54 154 68 164 80 Z" />
        <path d="M 148 56 C 150 42 140 32 124 26 C 130 36 136 48 148 56 Z" />
      </g>

      {/* 4 Destellos de estrella dorada en las esquinas */}
      {[45, 135, 225, 315].map((angle, idx) => (
        <g key={idx} transform={`rotate(${angle} 100 100) translate(100, 24)`}>
          <polygon points="0,-7 2,-2 7,0 2,2 0,7 -2,2 -7,0 -2,-2" fill="#FFFBEB" stroke="#CA8A04" strokeWidth="0.8" filter="drop-shadow(0 0 6px #FACC15)" />
        </g>
      ))}

      {/* Insignia inferior: Medallón de oro y estrella olímpica */}
      {mostrarInsignia && (
        <g transform="translate(100, 172)" filter="drop-shadow(0 3px 10px rgba(0,0,0,0.85))">
          {/* Lazo de victoria en V */}
          <path d="M -14 0 L -8 16 L 0 8 L 8 16 L 14 0 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1" />
          <circle cx="0" cy="0" r="14" fill="#0A0A0A" stroke="#EAB308" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="11" fill="url(#gold24k)" />
          {/* Estrella de oro central */}
          <polygon points="0,-6 1.8,-1.8 6.5,-1.8 2.7,1 4.2,5.5 0,2.8 -4.2,5.5 -2.7,1 -6.5,-1.8 -1.8,-1.8" fill="#FFFFFF" stroke="#854D0E" strokeWidth="0.8" />
        </g>
      )}
    </svg>
  );

  // 5. DISCIPLINA PLATINO: Alas cósmicas iridiscentes y aura holográfica
  const renderPlatinoSvg = () => (
    <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
      <defs>
        <linearGradient id="platinoHolo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="35%" stopColor="#818CF8" />
          <stop offset="70%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
      </defs>

      {/* Alas cósmicas de platino en ambos lados */}
      <g fill="url(#platinoHolo)" stroke="#FFFFFF" strokeWidth="1" opacity="0.95" filter="drop-shadow(0 0 8px #818CF8)">
        {/* Ala Izquierda */}
        <path d="M 40 45 C 10 55 0 85 10 120 C 18 105 28 95 38 85 Z" />
        <path d="M 32 75 C 6 88 0 115 14 140 C 22 125 30 115 36 105 Z" />
        {/* Ala Derecha */}
        <path d="M 160 45 C 190 55 200 85 190 120 C 182 105 172 95 162 85 Z" />
        <path d="M 168 75 C 194 88 200 115 186 140 C 178 125 170 115 164 105 Z" />
      </g>

      {/* Anillo platino holográfico */}
      <circle cx="100" cy="100" r="76" fill="none" stroke="#C084FC" strokeWidth="2" strokeDasharray="12 6" className="animate-[spin_20s_linear_infinite]" style={{ transformOrigin: 'center' }} />
      <circle cx="100" cy="100" r="67" fill="none" stroke="url(#platinoHolo)" strokeWidth="8" filter="drop-shadow(0 0 10px #38BDF8)" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="#FFFFFF" strokeWidth="2" />

      {/* Insignia inferior: Emblema cósmico de platino */}
      {mostrarInsignia && (
        <g transform="translate(100, 172)" filter="drop-shadow(0 2px 10px rgba(129,140,248,0.9))">
          <circle cx="0" cy="0" r="13" fill="#0A0A0A" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="0" cy="0" r="10" fill="url(#platinoHolo)" />
          {/* Cruz celestial */}
          <polygon points="0,-7 2,-2 7,0 2,2 0,7 -2,2 -7,0 -2,-2" fill="#FFFFFF" />
        </g>
      )}
    </svg>
  );

  // 6. TITÁN DIAMANTE: Prismas y cristales facetados de hielo diamante
  const renderDiamanteSvg = () => (
    <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
      <defs>
        <linearGradient id="diamondCyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#67E8F9" />
          <stop offset="70%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      {/* Prismas facetados en 8 puntos exteriores */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
        <g key={idx} transform={`rotate(${angle} 100 100)`}>
          <polygon points="100,16 107,32 100,38 93,32" fill="url(#diamondCyan)" stroke="#FFFFFF" strokeWidth="1.2" filter="drop-shadow(0 0 6px #22D3EE)" />
          <line x1="100" y1="16" x2="100" y2="38" stroke="#FFFFFF" strokeWidth="1" />
        </g>
      ))}

      {/* Anillo de diamante facetado */}
      <circle cx="100" cy="100" r="76" fill="none" stroke="#67E8F9" strokeWidth="2" opacity="0.6" />
      <circle cx="100" cy="100" r="67" fill="none" stroke="url(#diamondCyan)" strokeWidth="8" filter="drop-shadow(0 0 12px rgba(6,182,212,0.8))" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="#FFFFFF" strokeWidth="2" />

      {/* Destellos de prisma diamante */}
      <g fill="#FFFFFF" filter="drop-shadow(0 0 8px #A5F3FC)">
        <polygon points="152,48 155,42 158,48 164,51 158,54 155,60 152,54 146,51" className="animate-pulse" />
        <polygon points="48,152 51,146 54,152 60,155 54,158 51,164 48,158 42,155" className="animate-pulse" style={{ animationDelay: '1s' }} />
      </g>

      {/* Insignia inferior: Gema de diamante tallada */}
      {mostrarInsignia && (
        <g transform="translate(100, 172)" filter="drop-shadow(0 2px 10px rgba(6,182,212,0.9))">
          <circle cx="0" cy="0" r="14" fill="#0A0A0A" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M -7 -4 L 7 -4 L 11 0 L 0 10 L -11 0 Z" fill="url(#diamondCyan)" stroke="#FFFFFF" strokeWidth="1" />
          <polygon points="-7,-4 7,-4 4,0 -4,0" fill="#FFFFFF" opacity="0.8" />
          <polygon points="0,10 -4,0 4,0" fill="#0891B2" />
        </g>
      )}
    </svg>
  );

  // 7. CORONA DE LA DISCIPLINA: LA CORONA REAL SUPREMA (3D IMPERIAL GOLDEN CROWN)
  // "el de corona es una corona"
  const renderCoronaSvg = () => (
    <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible">
      <defs>
        <linearGradient id="crownGold3D" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="25%" stopColor="#FDE047" />
          <stop offset="55%" stopColor="#F59E0B" />
          <stop offset="85%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <radialGradient id="rubyGlow" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFA4A4" />
          <stop offset="40%" stopColor="#EF4444" />
          <stop offset="80%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#450A0A" />
        </radialGradient>
        <radialGradient id="emeraldGlow" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#064E3B" />
        </radialGradient>
        <filter id="crownDivineGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Halo divino celestial irradiando detrás de la corona */}
      {mostrarBrillo && (
        <g opacity="0.65" filter="url(#crownDivineGlow)">
          <path d="M 100 50 L 60 -10 M 100 50 L 80 -15 M 100 50 L 100 -20 M 100 50 L 120 -15 M 100 50 L 140 -10" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {/* Laureles imperiales abrazando la parte inferior */}
      <g fill="url(#crownGold3D)" stroke="#78350F" strokeWidth="0.8" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.7))">
        {/* Laureles inferiores */}
        <path d="M 40 145 C 30 135 32 115 42 105 C 43 115 44 130 40 145 Z" />
        <path d="M 45 160 C 35 150 40 132 52 124 C 51 135 50 148 45 160 Z" />
        <path d="M 160 145 C 170 135 168 115 158 105 C 157 115 156 130 160 145 Z" />
        <path d="M 155 160 C 165 150 160 132 148 124 C 149 135 150 148 155 160 Z" />
      </g>

      {/* Anillo de oro real con piedras */}
      <circle cx="100" cy="100" r="74" fill="none" stroke="#B45309" strokeWidth="3" />
      <circle cx="100" cy="100" r="67" fill="none" stroke="url(#crownGold3D)" strokeWidth="8" filter="drop-shadow(0 0 15px rgba(245,158,11,0.85))" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="#FFFBEB" strokeWidth="2" />

      {/* ══════════════════════════════════════════════════════════════════════
          👑 LA CORONA REAL MAJESTUOSA POSADA EN LA CIMA DEL AVATAR 👑
          ══════════════════════════════════════════════════════════════════════ */}
      <g transform="translate(0, -6)" filter="drop-shadow(0 6px 14px rgba(0,0,0,0.85))">
        {/* Terciopelo carmesí interior de la corona */}
        <path
          d="M 52 50 Q 100 28 148 50 Q 100 40 52 50 Z"
          fill="#991B1B"
          stroke="#7F1D1D"
          strokeWidth="1"
        />

        {/* Arco de fondo de la corona (Oro) */}
        <path
          d="M 46 50 L 52 24 L 76 38 L 100 6 L 124 38 L 148 24 L 154 50 Q 100 60 46 50 Z"
          fill="url(#crownGold3D)"
          stroke="#78350F"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Ribetes de relieve 3D en las 5 puntas de la corona */}
        <g stroke="#FFFBEB" strokeWidth="1.2" strokeLinecap="round" opacity="0.8">
          <line x1="100" y1="9" x2="100" y2="48" />
          <line x1="76" y1="40" x2="84" y2="49" />
          <line x1="124" y1="40" x2="116" y2="49" />
          <line x1="52" y1="26" x2="60" y2="49" />
          <line x1="148" y1="26" x2="140" y2="49" />
        </g>

        {/* Banda base de la corona con filigrana dorada */}
        <path
          d="M 46 48 Q 100 58 154 48 L 156 56 Q 100 66 44 56 Z"
          fill="url(#crownGold3D)"
          stroke="#451A03"
          strokeWidth="1.5"
        />

        {/* Perlas en las puntas laterales */}
        <circle cx="52" cy="24" r="3.5" fill="#FFFFFF" stroke="#CA8A04" strokeWidth="1" />
        <circle cx="76" cy="38" r="3" fill="#FFFFFF" stroke="#CA8A04" strokeWidth="1" />
        <circle cx="124" cy="38" r="3" fill="#FFFFFF" stroke="#CA8A04" strokeWidth="1" />
        <circle cx="148" cy="24" r="3.5" fill="#FFFFFF" stroke="#CA8A04" strokeWidth="1" />

        {/* 💎 JOYAS REALES INCRUSTADAS EN LA CORONA */}
        {/* Esmeraldas y Zafiros en la banda base */}
        <circle cx="62" cy="52" r="3" fill="url(#emeraldGlow)" stroke="#064E3B" strokeWidth="0.8" />
        <circle cx="80" cy="54" r="3" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="0.8" />
        <circle cx="100" cy="55" r="4.5" fill="url(#rubyGlow)" stroke="#7F1D1D" strokeWidth="1" />
        <circle cx="120" cy="54" r="3" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="0.8" />
        <circle cx="138" cy="52" r="3" fill="url(#emeraldGlow)" stroke="#064E3B" strokeWidth="0.8" />

        {/* 👑 EL GRAN RUBÍ SUPREMO DE LA PUNTA CENTRAL 👑 */}
        <g transform="translate(100, 6)" filter="drop-shadow(0 0 8px rgba(239,68,68,0.9))">
          {/* Montura de oro del rubí */}
          <circle cx="0" cy="0" r="7.5" fill="#78350F" />
          <circle cx="0" cy="0" r="6.5" fill="url(#crownGold3D)" />
          {/* Rubí facetado */}
          <circle cx="0" cy="0" r="5.2" fill="url(#rubyGlow)" stroke="#FEF2F2" strokeWidth="0.8" />
          {/* Destello blanco en el rubí */}
          <circle cx="-1.8" cy="-1.8" r="1.5" fill="#FFFFFF" />
        </g>
      </g>

      {/* Cinta Real Inferior "LEYENDA" */}
      {mostrarInsignia && (
        <g transform="translate(100, 174)" filter="drop-shadow(0 3px 10px rgba(0,0,0,0.9))">
          {/* Extremos de la cinta doblada */}
          <path d="M -38 -2 L -48 -6 L -44 5 L -48 14 L -36 10 Z" fill="#92400E" stroke="#78350F" strokeWidth="1" />
          <path d="M 38 -2 L 48 -6 L 44 5 L 48 14 L 36 10 Z" fill="#92400E" stroke="#78350F" strokeWidth="1" />
          {/* Cuerpo principal de la cinta dorada */}
          <path
            d="M -36 -4 Q 0 4 36 -4 L 38 10 Q 0 18 -38 10 Z"
            fill="url(#crownGold3D)"
            stroke="#451A03"
            strokeWidth="1.5"
          />
          {/* Texto LEYENDA tallado */}
          <text
            x="0"
            y="7"
            textAnchor="middle"
            fill="#1E1B4B"
            fontSize="8"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
            letterSpacing="0.2em"
          >
            LEYENDA
          </text>
        </g>
      )}
    </svg>
  );

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${cfg.containerSize} ${className}`}
      onClick={onClick}
      title={title}
    >
      {/* ── Capa de marco vectorial artesanal según el nivel ── */}
      {lvl === 1 && renderChispaSvg()}
      {lvl === 2 && renderBronceSvg()}
      {lvl === 3 && renderHierroSvg()}
      {lvl === 4 && renderOroSvg()}
      {lvl === 5 && renderPlatinoSvg()}
      {lvl === 6 && renderDiamanteSvg()}
      {lvl === 7 && renderCoronaSvg()}

      {/* ── Contenedor circular del avatar en el centro (cx=100, cy=100) ── */}
      <div
        className={`relative ${cfg.avatarSize} rounded-full overflow-hidden bg-neutral-900 flex items-center justify-center z-10 shadow-inner`}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center">
            <span className={`font-black text-white italic tracking-tighter uppercase ${cfg.textSize}`}>
              {iniciales}
            </span>
          </div>
        )}

        {/* Contenido adicional incrustado (ej. overlay hover para cambiar foto) */}
        {children}
      </div>
    </div>
  );
}
