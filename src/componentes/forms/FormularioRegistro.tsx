export const FormularioRegistro = () => {
    return (
        <form className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="ejemplo@email.com"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#2F31F5] focus:border-[#2F31F5]"
                />
            </div>

            <div>
                <label htmlFor="contraseña" className="block text-gray-700 text-sm font-medium mb-1">
                    Contraseña
                </label>
                <input
                    type="password"
                    id="contraseña"
                    name="contraseña"
                    required
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#2F31F5] focus:border-[#2F31F5]"
                />
            </div>

            <div className="flex items-center">
                <input
                    id="recordar"
                    type="checkbox"
                    className="h-4 w-4 text-[#2F31F5] focus:ring-[#2F31F5] border-gray-300 rounded"
                />
                <label htmlFor="recordar" className="ml-2 text-sm text-gray-600">
                    Recordar mi sesión
                </label>
            </div>
        </form>
    );
};

// hacer de nuevo
