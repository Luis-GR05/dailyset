import React from 'react';

export const Footer: React.FC = () => (
  <g id="footer">
    {/* Línea divisoria */}
    <line x1="50" y1="1100" x2="950" y2="1100" stroke="#2F31F5" strokeOpacity="0.3" strokeWidth="1" />

    {/* Columna 1: Branding y Copyright */}
    <g transform="translate(50, 1150)">
      <text fill="#DBF059" style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'Inter' }}>DailySet</text>
      <text y="30" fill="#94a3b8" style={{ fontSize: '12px', fontFamily: 'Inter' }}>
        Potenciando tu rendimiento diario.
      </text>
      <text y="55" fill="#475569" style={{ fontSize: '11px', fontFamily: 'Inter' }}>
        © 2026 DailySet. Todos los derechos reservados.
      </text>
    </g>

    {/* Columna 2: Contacto */}
    <g transform="translate(400, 1150)">
      <text fill="#ffffff" style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'Inter' }}>Contacto</text>
      <text y="25" fill="#94a3b8" style={{ fontSize: '13px', fontFamily: 'Inter' }}>soporte@dailyset.com</text>
      <text y="45" fill="#94a3b8" style={{ fontSize: '13px', fontFamily: 'Inter' }}>Madrid, España</text>
    </g>

    {/* Columna 3: Redes Sociales */}
    <g transform="translate(750, 1150)">
      <text fill="#ffffff" style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'Inter' }}>Síguenos</text>
      
      {/* Botón Instagram */}
      <g transform="translate(0, 15)">
        <rect width="100" height="30" rx="15" fill="#1e293b" stroke="#2F31F5" strokeWidth="0.5" />
        <text x="50" y="19" fill="#94a3b8" textAnchor="middle" style={{ fontSize: '12px', fontFamily: 'Inter' }}>Instagram</text>
      </g>

      {/* Botón Facebook */}
      <g transform="translate(0, 55)">
        <rect width="100" height="30" rx="15" fill="#1e293b" stroke="#2F31F5" strokeWidth="0.5" />
        <text x="50" y="19" fill="#94a3b8" textAnchor="middle" style={{ fontSize: '12px', fontFamily: 'Inter' }}>Facebook</text>
      </g>
    </g>
  </g>
);