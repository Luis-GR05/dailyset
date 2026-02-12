interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <span className={`font-display font-bold ${sizeClasses[size]}`}>
      <span className="text-[#DBF059]">Daily</span>
      <span className="text-[#4361EE]">Set</span>
    </span>
  );
}