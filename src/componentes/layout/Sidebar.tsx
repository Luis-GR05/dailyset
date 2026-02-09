import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Ejercicios', path: '/ejercicios' },
        { name: 'Progreso', path: '/progreso' },
        { name: 'Perfil', path: '/perfil' },
    ];

    return (
        <aside className="w-64 bg-black border-r border-white/5 p-6 flex flex-col h-full">
            <div className="mb-10 px-4">
                <span className="text-xl font-black uppercase tracking-tighter italic">DailySet</span>
            </div>
            
            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`block py-3 px-4 rounded-xl font-bold transition-all ${
                            location.pathname === item.path 
                            ? 'bg-accent text-black shadow-[0_0_15px_rgba(212,248,70,0.2)]' 
                            : 'text-neutral-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}