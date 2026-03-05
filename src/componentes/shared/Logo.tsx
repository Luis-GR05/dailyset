import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Logo({ size = 'md', className = "" }: LogoProps) {
  const sizes = {
    sm: { text: 'text-2xl', icon: 'w-5 h-7', gap: 'gap-2' },
    md: { text: 'text-4xl', icon: 'w-8 h-10', gap: 'gap-2' },
    lg: { text: 'text-6xl', icon: 'w-14 h-18', gap: 'gap-3' },
    xl: { text: 'text-8xl', icon: 'w-20 h-24', gap: 'gap-4' },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center select-none ${s.gap} ${className}`}>
      
      <div className={`${s.icon} flex-shrink-0`}>
        <svg viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_15px_rgba(219,240,89,0.5)]">
          <path 
            d="M21 2L3 18H11L7 30L22 13H14L21 2Z" 
            fill="#DBF059" 
            className="animate-pulse-slow"
          />
        </svg>
      </div>

      <div 
        className={`flex items-baseline leading-[0.8] font-black ${s.text} tracking-tighter`}
        style={{ 
          fontFamily: "'Big Shoulders Display', 'Bebas Neue', 'Impact', sans-serif",
          textTransform: 'uppercase'
        }}
      >
        <span className="text-white">
          DAILY
        </span>
        
        <span 
          className="text-[#DBF059] italic ml-1"
          style={{ 
            transform: 'skewX(-5deg)',
            textShadow: '3px 3px 0px rgba(0,0,0,0.2)'
          }}
        >
          SET
        </span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@900&family=Bebas+Neue&display=swap');
        
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}} />
    </div>
  );
}