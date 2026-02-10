import { Input, Boton } from '../';

export default function FormularioRegistro() {
    return (
        <>
            <form className="space-y-6">
                <div>
                    <Input label="Nombre" type="text" placeholder="Tu nombre" />
                </div>
                <div>
                    <Input label="Email" type="email" placeholder="Tu email" />
                </div>
                <div>
                    <Input label="Password" type="password" placeholder="Tu contraseña" />
                </div>
                <div>
                    <Input label="Confirmar Password" type="password" placeholder="Repite tu contraseña" />
                </div>
                <Boton variant="primary" className="w-full">
                    Registrarse
                </Boton>
            </form>
        </>
    );
}
