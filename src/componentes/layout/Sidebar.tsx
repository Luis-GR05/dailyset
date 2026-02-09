export default function Sidebar() {
    return (
        <>
            <aside className="w-64 bg-neutral-800 border-r border-neutral-700 p-6">
                <h2 className="text-white font-display font-bold text-xl mb-6">DailySet</h2>
                <nav className="space-y-2">
                    <a href="#" className="block py-2 px-4 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-lg">Dashboard</a>
                    <a href="#" className="block py-2 px-4 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-lg">Ejercicios</a>
                    <a href="#" className="block py-2 px-4 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-lg">Rutinas</a>
                    <a href="#" className="block py-2 px-4 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-lg">Progreso</a>
                    <a href="#" className="block py-2 px-4 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-lg">Perfil</a>
                </nav>
            </aside>
        </>
    );
}
