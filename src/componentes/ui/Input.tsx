interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  className?: string;
}

export default function Input({
  label,
  type = "text",
  placeholder = "Value",
  className = ""
}: InputProps) {
  return (
    <>
      <div className="w-full">
        {label && (
          <label className="block text-neutral-400 text-sm font-medium mb-2">
            {label}
          </label>
        )}
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent ${className}`}
        />
      </div>
    </>
  );
}

// Grupo de inputs para login
export function InputLogin() {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-neutral-400 text-sm font-medium mb-2">Email</label>
        <input
          type="text"
          className="input"
          placeholder="Value"
        />
      </div>
      <div>
        <label className="block text-neutral-400 text-sm font-medium mb-2">Password</label>
        <input
          type="password"
          className="input"
          placeholder="Value"
        />
      </div>
    </div>
  );
}
