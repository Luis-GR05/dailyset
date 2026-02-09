interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-neutral-400 text-sm font-medium mb-2 ml-1">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`input ${className}`}
        />
    </div>
  );
}