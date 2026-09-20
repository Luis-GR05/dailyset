

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Logo({ size = 'md', className = "" }: LogoProps) {
  const sizes = {
    sm: { text: 'text-2xl' },
    md: { text: 'text-4xl' },
    lg: { text: 'text-5xl' },
    xl: { text: 'text-8xl' },
  };

  const s = sizes[size];

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
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
          className="italic ml-1"
          style={{
            color: 'var(--color-primary)',
            transform: 'skewX(-5deg)',
            textShadow: '3px 3px 0px rgba(0,0,0,0.2)'
          }}
        >
          SET
        </span>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
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