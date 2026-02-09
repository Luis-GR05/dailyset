interface BotonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
}

export default function Boton({
    children,
    variant = 'primary',
    className = '',
    ...props
}: BotonProps) {
    const variantClass = variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : 'btn-outline';

    return (
        <button className={`btn ${variantClass} ${className}`} {...props}>
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