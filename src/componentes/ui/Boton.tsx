export default function Boton() {
    return (
        <>
            <button className="btn btn-primary">
                Click me
            </button>
        </>
    );
}

export function BotonPrimario() {
    return (
        <>
            <button className="btn btn-primary font-display font-bold text-black">
                Registrar
            </button>
        </>
    );
}

export function BotonSecundario() {
    return (
        <>
            <button className="btn btn-secondary font-medium text-white">
                Sign In
            </button>
        </>
    );
}
