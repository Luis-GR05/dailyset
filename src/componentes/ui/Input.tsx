export default function Input() {
  return (
    <div className="w-full">
      <label className="block text-neutral-400 text-sm font-medium mb-2">Email</label>
      <input 
        type="text" 
        className="input"
        placeholder="Value"
      />
    </div>
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