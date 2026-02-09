export default function LoginForm() {
  return (
    <form className="space-y-6">
      <div>
        <label className="block text-neutral-400 text-sm mb-2">Email</label>
        <input type="email" className="input w-full" placeholder="Tu email" />
      </div>
      <div>
        <label className="block text-neutral-400 text-sm mb-2">Password</label>
        <input type="password" className="input w-full" placeholder="Tu contraseña" />
      </div>
      <button type="submit" className="btn btn-primary w-full">
        Iniciar Sesión
      </button>
    </form>
  );
}