interface BotonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "outline";
}

export default function Boton({
    children,
    variant = "primary",
    className = "",
    ...props
}: BotonProps) {
    const variants = {
        primary: "btn-primary",
        secondary: "btn-secondary",
        outline: "border-2 border-white/10 text-white hover:bg-white/5",
    };

    return (
        <button
            className={`btn ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export function BotonPrimario(props: BotonProps) {
    return <Boton {...props} variant="primary" />;
}

export function BotonSecundario(props: BotonProps) {
    return <Boton {...props} variant="secondary" />;
}
