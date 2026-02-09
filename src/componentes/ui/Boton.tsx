interface BotonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    className?: string;
}

export default function Boton({
    children,
    variant = 'primary',
    className = ''
}: BotonProps) {
    const baseClasses = "px-6 py-3 rounded-lg font-medium transition-all";

    const variantClasses = {
        primary: "bg-accent text-black hover:bg-accent-hover",
        secondary: "bg-primary-700 text-white hover:bg-primary-800",
        outline: "border-2 border-gray-700 text-white hover:bg-gray-800"
    };

    return (
        <>
            <button className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
                {children}
            </button>
        </>
    );
}

export function BotonPrimario({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return <Boton variant="primary" className={className}>{children}</Boton>;
}

export function BotonSecundario({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return <Boton variant="secondary" className={className}>{children}</Boton>;
}
