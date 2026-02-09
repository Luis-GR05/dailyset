import Input from "../ui/Input";
import Boton from "../ui/Boton";

export default function LoginForm() {
  return (
    <form className="space-y-4 w-full max-w-sm" onSubmit={(e) => e.preventDefault()}>
      <Input label="Email" type="email" placeholder="nombre@ejemplo.com" />
      <Input label="Contraseña" type="password" placeholder="••••••••" />
      <Boton variant="primary" className="w-full mt-2">
        Entrar a DailySet
      </Boton>
    </form>
  );
}