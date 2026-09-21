interface DiamanteIconProps {
  size?: number;
  className?: string;
}

export default function DiamanteIcon({ size = 16, className = "" }: DiamanteIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 3h12l4 6-10 12L2 9z" />
      <path d="M11 3 8 9l4 12 4-12-3-6" />
      <path d="M2 9h20" />
    </svg>
  );
}
