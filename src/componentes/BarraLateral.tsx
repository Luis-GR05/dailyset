import Logo from "./Logo";

const BarraLateral = () => {
    const links = [
        { name: "Rutinas", href: "#" },
        { name: "Historial", href: "#" },
        { name: "Ejercicios", href: "#" },
        { name: "Estadísticas", href: "#" },
        { name: "Perfil", href: "#" },
    ];

    return (
        <aside className="bg-black flex flex-col w- h-screen px-6 py-8 border-r border-gray-900 flex-shrink-0 sticky top-0">
            <div className="mb-12 px-2">
                <Logo />
            </div>

            <nav className="flex flex-col gap-2">
                {links.map((link) => (
                    <a 
                        key={link.name}
                        href={link.href} 
                        className="
                            text-gray-400 
                            hover:text-brand-yellow 
                            hover:bg-white/5 
                            px-4 py-3 
                            rounded-xl 
                            transition-all duration-200 
                            font-medium text-sm
                            flex items-center
                        "
                    >
                        {link.name}
                    </a>
                ))}
            </nav>
        </aside>
    );
};

export default BarraLateral;