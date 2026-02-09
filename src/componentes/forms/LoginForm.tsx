import Input from "../ui/Input";
import Boton from "../ui/Boton";

export default function LoginForm() {
  return (
    <form className="space-y-5 w-full" onSubmit={(e) => e.preventDefault()}>
      <Input 
        label="Email" 
        type="email" 
        placeholder="ejemplo@dailyset.com" 
        className="input"
      />
      <div className="space-y-1">
        <Input 
          label="Contraseña" 
          type="password" 
          placeholder="••••••••" 
          className="input"
        />
        <div className="flex justify-end">
          <button type="button" className="text-xs text-neutral-500 hover:text-white transition-colors">
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>
      <Boton variant="primary" className="w-full mt-2">
        Iniciar Sesión
      </Boton>
    </form>
  );
}