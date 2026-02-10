import { Link } from 'react-router-dom';
import Logo from './shared/Logo';
import { BotonSecundario } from './ui/Boton';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-6">
      <Logo size="md" />
      <Link to="/login">
        <BotonSecundario>Empezar</BotonSecundario>
      </Link>
    </header>
  );
}